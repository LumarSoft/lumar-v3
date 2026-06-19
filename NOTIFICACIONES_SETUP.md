# Avisos por mail de vencimientos (Vercel Cron + Resend)

Una vez al día, Vercel ejecuta `/api/cron/vencimientos`, que lee Firestore y manda un mail a los 3 socios con lo que vence pronto (servidores, gastos internos y cobros de clientes). No requiere plan pago de Firebase.

## 1. Cuenta Resend
1. Creá cuenta gratis en [resend.com](https://resend.com) (3.000 mails/mes gratis).
2. **API Keys → Create** → copiá la key (`re_...`).
3. Remitente: para probar ya podés usar `onboarding@resend.dev`. Para producción, verificá tu dominio en Resend (Domains) y usá algo como `avisos@lumarsoft.com`.

## 2. Service account de Firebase
1. Firebase Console → **Project settings → Service accounts → Generate new private key** → descarga un `.json`.
2. Convertilo a base64 (en tu Mac, en la carpeta donde está el archivo):
   ```bash
   base64 -i serviceAccount.json | tr -d '\n'
   ```
3. Copiá ese string largo: es el valor de `FIREBASE_SERVICE_ACCOUNT_BASE64`.

> El `.json` da acceso total a tu Firebase. No lo subas al repo ni lo compartas. Solo va como variable de entorno en Vercel.

## 3. Variables en Vercel
En **Vercel → tu proyecto → Settings → Environment Variables**, agregá (entorno *Production*):

| Variable | Valor |
|---|---|
| `RESEND_API_KEY` | la key `re_...` |
| `RESEND_FROM` | `onboarding@resend.dev` (o tu dominio verificado) |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | el string base64 del paso 2 |
| `CRON_SECRET` | cualquier string largo random (ej. salida de `openssl rand -hex 32`) |
| `NOTIFY_DAYS` | `7` (opcional: días de anticipación) |

Vercel agrega el header `Authorization: Bearer <CRON_SECRET>` automáticamente al cron, y el endpoint lo valida.

## 4. El cron ya está definido
`vercel.json` corre el aviso **todos los días 12:00 UTC = 09:00 Argentina**:
```json
{ "crons": [ { "path": "/api/cron/vencimientos", "schedule": "0 12 * * *" } ] }
```
Cambiá el horario editando el `schedule` (siempre en UTC; Argentina = UTC-3).

## 5. Deploy y prueba
- Deploy a Vercel (los crons solo corren en producción de Vercel, no en `localhost`).
- Probar a mano: en Vercel → **Deployments → … → Cron Jobs → Run**, o pegando en el navegador `https://TU-DOMINIO/api/cron/vencimientos` con el header de autorización (o sin `CRON_SECRET` seteado para probar).
- Cargá un vencimiento con fecha dentro de los próximos 7 días y corré el cron: te debería llegar el mail a los 3.

## Notas
- El cron usa el **service account** (firebase-admin), así que ignora las reglas de Firestore y lee todo. Por eso esas credenciales son sensibles.
- Si querés más de un aviso (ej. también un resumen semanal), se agrega otra entrada en `vercel.json` apuntando a otra ruta.
