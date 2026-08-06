# Facturas — Puesta en marcha (ARCA)

Emisión de Factura C (monotributo) desde `/admin/facturas`. Pedís el CAE, se genera
el PDF con QR y se descarga. Opcionalmente se manda por mail al cliente.

> **Empezá siempre en homologación.** En producción cada factura es real y la única
> forma de revertirla es una nota de crédito.

## 1. Instalar dependencias

```bash
pnpm install
```

Agrega `@ramiidv/arca-facturacion` (WSAA + WSFEv1, todo local — el certificado
nunca sale de tu servidor), `@react-pdf/renderer`, `qrcode` y `server-only`.

## 2. Generar el certificado

```bash
mkdir -p ~/arca-lumar && cd ~/arca-lumar

openssl genrsa -out lumar.key 2048

openssl req -new -key lumar.key -subj \
  "/C=AR/O=TU_RAZON_SOCIAL/CN=lumarsoft-facturacion/serialNumber=CUIT 20XXXXXXXXX" \
  -out lumar.csr
```

La `.key` **nunca** se commitea ni se comparte. Está cubierta por `.gitignore`
solo si la dejás fuera del repo — guardala en `~/arca-lumar`.

## 3. Dar de alta el certificado

**Homologación:** ARCA con clave fiscal → servicio **WSASS** (habilitalo desde
"Administrador de Relaciones de Clave Fiscal" si no aparece).

1. Crear DN y certificado → pegá el contenido de `lumar.csr` → guardá lo que te
   devuelve como `lumar.crt`
2. En el mismo WSASS: **crear autorización** de ese DN al servicio `wsfe`

**Producción:** mismo flujo pero por "Administración de Certificados Digitales"
y "Administrador de Relaciones de Clave Fiscal". Son certificados distintos.

## 4. Punto de venta

ARCA → Comprobantes en línea → **A/B/M/C Puntos de Venta** → alta con modalidad
**"Web Services"**. No sirve reusar el que usás en el portal: ARCA lleva
numeración separada por punto de venta y mezclarlos rompe la correlatividad.

## 5. Variables de entorno

Convertí el certificado y la clave a base64 (una sola línea):

```bash
base64 -i ~/arca-lumar/lumar.crt | tr -d '\n' | pbcopy   # → ARCA_CERT_BASE64
base64 -i ~/arca-lumar/lumar.key | tr -d '\n' | pbcopy   # → ARCA_KEY_BASE64
```

En `.env.local` (y en Vercel → Settings → Environment Variables):

Ya están cargadas en `.env` con tus datos; falta completar dos:

```
# false = homologación (pruebas). Poner true recién cuando esté todo probado.
ARCA_PRODUCCION=false

ARCA_CUIT=20447652839

# NÚMERO del punto de venta (1, 2, 3…), no el domicilio. ← FALTA
ARCA_PTO_VTA=

ARCA_CERT_BASE64=   # ← FALTA
ARCA_KEY_BASE64=    # ← FALTA

# Encabezado del PDF
ARCA_RAZON_SOCIAL=Lucas Quaroni
ARCA_DOMICILIO=Alvear 12, Rosario, Santa Fe
ARCA_INICIO_ACTIVIDADES=01/2023
```

`RESEND_API_KEY` y `RESEND_FROM` ya están configuradas para las notificaciones;
el envío de facturas por mail las reusa.

> Ojo con `RESEND_FROM`: para mandarle facturas a clientes reales necesitás un
> dominio verificado en Resend. `onboarding@resend.dev` solo entrega a tu propia
> casilla.

## 6. Probar la conexión (antes de emitir nada)

`/admin/facturas` → botón **"Probar conexión con ARCA"**. Es de solo lectura, no
emite ningún comprobante. Chequea en orden:

1. Que el `.env` esté completo y bien formado
2. Que los servidores de ARCA respondan
3. Que el certificado sea válido y WSAA devuelva un ticket
4. **Qué puntos de venta tenés habilitados, con su número** — de acá sacás el
   valor de `ARCA_PTO_VTA` sin tener que buscarlo en el portal
5. Cuál fue el último comprobante emitido y con qué número sigue el próximo

Si algo falla, el paso queda en rojo con el mensaje crudo de ARCA.

## 7. Emitir la primera de prueba

1. `/admin/clientes` → completá **CUIT**, **condición IVA** y **email de
   facturación** del cliente
2. `/admin/facturas` → Nueva → concepto, importe, cliente
3. **Emitir** → revisá el resumen → confirmá

En homologación el CAE es válido pero el comprobante no tiene efecto fiscal, y el
PDF sale con una banda amarilla que lo aclara.

## 8. Pasar a producción

El certificado de homologación **no sirve** en producción: lo firma la CA
"Computadores Test" y ARCA lo rechaza. Hay que sacar uno nuevo. Todo se hace
desde **Administrador de Relaciones de Clave Fiscal** (clave fiscal nivel 3).

**A. Habilitar la app de certificados** (solo si no la tenés en Mis Servicios)

> Administrador de Relaciones → **Adherir Servicio** →
> `ARCA > Servicios interactivos > Administración de Certificados Digitales`

**B. Crear el certificado**

Entrar a "Administración de Certificados Digitales" → crear un alias (ej.
`lumar-prod`) → pegar el mismo `lumar.csr` → descargar el `.crt`.
Ese alias es lo que ARCA llama **Computador Fiscal**.

**C. Delegar el webservice al certificado**

> Administrador de Relaciones → **Nueva Relación** → Buscar servicio →
> agrupación **Webservices** → **Facturación Electrónica** →
> en "Representante" elegir el **computador fiscal** del desplegable → Confirmar

Ojo: acá NO es "Servicios interactivos" ni el Facturador en línea. La agrupación
correcta es **Webservices**.

**D. Cargar y activar**

```bash
node scripts/arca-env.mjs ~/arca-lumar/lumar-prod.crt ~/arca-lumar/lumar.key
```

La clave privada es la misma; solo cambia el certificado. Después:

1. `ARCA_PRODUCCION=true` en `.env`
2. Reiniciar y correr **"Probar conexión con ARCA"**: el paso del certificado
   debe decir `tipo: producción` y quedar en verde. Si sigue diciendo
   "Computadores Test", el certificado cargado es el de pruebas.
3. Cargar todas las variables `ARCA_*` en **Vercel → Settings → Environment
   Variables**

Con un solo computador fiscal alcanza para todos los webservices; no hace falta
uno por servicio.

En homologación el CAE es válido pero el comprobante no tiene efecto fiscal, y el
PDF sale con una banda amarilla que lo aclara.

## Cómo está armado

| Archivo | Qué hace |
|---|---|
| `lib/arca/config.ts` | Lee el certificado y mapea nuestros labels a códigos de ARCA |
| `lib/arca/ticket.ts` | Ticket de acceso WSAA persistido en Firestore |
| `lib/arca/emitir.ts` | Arma el comprobante y pide el CAE |
| `lib/facturas/pdf.tsx` | Render del PDF con QR |
| `lib/server/require-admin.ts` | Guard de los endpoints |
| `app/api/facturas/emitir/route.ts` | Orquesta: valida, emite, guarda, manda mail |
| `app/admin/facturas/page.tsx` | La UI |

### Dos decisiones que conviene entender

**El ticket de WSAA vive en Firestore, no en memoria.** Dura 12 horas y ARCA
rechaza pedir uno nuevo mientras el anterior siga vigente. En Vercel cada
invocación puede ser un proceso nuevo, así que un cache en memoria pediría un
ticket por cold start y la emisión empezaría a fallar sola. La colección
`arca_auth` lo comparte entre todas las instancias, con un lock para que dos
requests simultáneas no se logueen a la vez.

**Los endpoints validan el ID token de Firebase.** Las reglas de Firestore no
protegen una API route: esta corre con el service account, que es admin. Sin
`requireAdmin` cualquiera podría hacer POST y emitir comprobantes con tu CUIT.

### Fechas de las recurrentes

Si dejás los campos de fecha vacíos, una recurrente se completa sola:

| Campo | Valor por defecto |
|---|---|
| Fecha de emisión | Primer día hábil del mes del período |
| Servicio desde / hasta | Primer y último día del período |
| Vencimiento de pago | 5 días hábiles después de la emisión |

Cualquiera se puede pisar a mano en el formulario antes de emitir.

"Día hábil" excluye fines de semana y feriados nacionales. `lib/admin/feriados.ts`
calcula los de la Ley 27.399: los inamovibles, los trasladables al tercer lunes
(San Martín, Diversidad Cultural, Soberanía) y los atados a Pascua (Carnaval y
Viernes Santo, vía algoritmo de Meeus). Ejemplo: enero 2027 emite el lunes 4,
salteando el feriado del viernes 1 y el fin de semana.

> **No cubre los "puentes" turísticos**, porque el Ejecutivo los fija por decreto
> cada año sin regla fija. Si uno te cae justo, corregí la fecha a mano.

ARCA acepta la fecha del comprobante dentro de ±10 días corridos respecto del
día de envío (±5 sería para productos; nosotros siempre emitimos servicios). Si
te pasás, la validación previa lo corta antes de llegar a ARCA.

### Recuperación de errores

- **Rechazo de ARCA:** la fila queda en Borrador, se puede corregir y reintentar.
- **CAE obtenido pero falla el PDF o el mail:** la factura se marca Emitida igual
  (el CAE ya existe en ARCA) y el problema se avisa en un toast aparte.
- **Doble click:** la colección `arca_emisiones` tiene un candado por
  `facturaId + período`. Emitir dos veces el mismo mes obligaría a una nota de
  crédito, así que se corta antes de llegar a ARCA.
