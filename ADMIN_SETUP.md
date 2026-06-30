# Panel /admin — Puesta en marcha

Panel interno de LumarSoft: dashboard + Clientes, Proyectos, Cobros, Futuros, Roadmap, Backlog y Datos relevantes. Login con Google (Firebase Auth), datos en Firestore en tiempo real. Acceso en `/admin`.

## 1. Instalar dependencias

```bash
pnpm install   # firebase ya está agregado en package.json
```

## 2. Crear el proyecto en Firebase

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable.**
3. **Build → Firestore Database → Create database** (modo _production_).
4. **Project settings → General → Your apps → Web (`</>`)** → registrá la app y copiá el objeto `firebaseConfig`.

## 3. Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá con los valores del paso anterior:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

(Estos valores son públicos por diseño — la seguridad real está en las reglas + allowlist.)

## 4. Allowlist de los 3 mails — EDITAR EN 2 LUGARES

Hoy está con placeholders. Reemplazá por los mails reales de Marcelo y Mateo en:

- `lib/admin/allowlist.ts` → array `ADMIN_ALLOWLIST` (guard del cliente)
- `firestore.rules` → función `isAdmin()` (seguridad real de la base)

**Tienen que coincidir.** El guard del cliente es solo UX; la base es la que de verdad rechaza a cualquiera fuera de la lista.

## 5. Deployar las reglas de Firestore

Opción A (CLI):

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules   # usa firestore.rules
```

Opción B (consola): Firestore → **Rules** → pegá el contenido de `firestore.rules` → Publish.

## 6. Dominios autorizados

En **Authentication → Settings → Authorized domains** agregá tu dominio de producción (ej. `lumarsoft.com`). `localhost` ya viene habilitado para desarrollo.

## 7. Probar

```bash
pnpm dev
```

Entrá a `http://localhost:3000/admin` → **Entrar con Google** con un mail del allowlist. Las colecciones (`clientes`, `proyectos`, `cobros`, `futuros`, `roadmap`, `backlog`, `datos_relevantes`) se crean solas al cargar el primer registro.

## Cómo lo usan los 3

Cada socio entra a `/admin` con su Google (los 3 mails en el allowlist). Es tiempo real: lo que carga uno, los otros lo ven al instante. No hay que configurar nada por persona más que estar en el allowlist.

## Notas de seguridad

- La sección **Datos relevantes** guarda valores sensibles en texto plano en Firestore. Solo los ven los mails del allowlist, pero tené presente que un admin logueado los ve completos. Si en algún momento querés subir el nivel, el próximo paso es cifrado del lado cliente con una passphrase del equipo.
- `.env*` está en `.gitignore`: no se sube. No commitees claves reales.
- El panel no se indexa (`robots: noindex`) y no se prerenderiza.

## Arquitectura (para extender)

- `lib/firebase/client.ts` — init del SDK.
- `lib/admin/allowlist.ts` — mails permitidos.
- `lib/admin/auth-context.tsx` — sesión + guard.
- `lib/admin/use-collection.ts` — CRUD en tiempo real sobre cualquier colección.
- `lib/admin/schemas.ts` — **definición de cada sección** (campos, tipos, opciones). Agregar una columna o sección nueva es editar acá.
- `components/admin/crud-section.tsx` — tabla + alta/edición/borrado genéricos.
- `app/admin/*` — una página por sección, cada una renderiza `<CrudSection schema={...} />`.
