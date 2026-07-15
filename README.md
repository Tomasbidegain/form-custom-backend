# Form Custom Backend

Backend para una plataforma de creación de formularios personalizados. Permite a los usuarios crear, publicar y gestionar formularios con campos personalizables, recibir respuestas en tiempo real y visualizar resultados.

## Stack

- **Runtime**: Node.js 22
- **Framework**: Express 5
- **Lenguaje**: TypeScript 7
- **Base de datos**: PostgreSQL
- **ORM**: Prisma 7
- **Autenticación**: JWT + Passport.js (Google OAuth)
- **Emails**: Resend
- **Validación**: Zod

## Características

- Registro y login con email/contraseña
- Verificación de email obligatoria
- Login con Google OAuth
- Vinculación de cuentas (email + Google)
- Creación de formularios con campos personalizables
- Layout de campos con grid de 12 columnas
- Respuestas públicas (sin login obligatorio)
- Límites por fecha de expiración o cantidad de respuestas
- Restricción de respuestas por email
- CAPTCHA anti-spam
- Notificaciones en tiempo real con WebSockets

## Requisitos

- Node.js 22+
- PostgreSQL 13+
- pnpm 11+

## Instalación

```bash
pnpm install
```

## Configuración

Copiar `.env.example` a `.env` y completar las variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/form_custom_db?schema=public"
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
RESEND_API_KEY=re_xxx
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

## Desarrollo

```bash
# Iniciar servidor con hot reload
pnpm dev

# Generar cliente de Prisma
pnpm prisma:generate

# Aplicar migraciones
pnpm prisma:migrate

# Abrir Prisma Studio (UI de base de datos)
pnpm prisma:studio
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo con hot reload |
| `pnpm build` | Compilar TypeScript a JavaScript |
| `pnpm start` | Ejecutar código compilado (producción) |
| `pnpm prisma:generate` | Generar cliente de Prisma |
| `pnpm prisma:migrate` | Aplicar migraciones de base de datos |
| `pnpm prisma:studio` | Abrir UI de base de datos |

## Estructura

```
src/
├── config/          # Configuración (DB, Passport)
├── controllers/     # Lógica de rutas
├── middlewares/     # Auth, validación, errores
├── routes/          # Definición de endpoints
├── services/        # Lógica de negocio
├── types/           # Interfaces y DTOs
── utils/           # Helpers (JWT, email, validadores)
├── app.ts           # Configuración de Express
└── server.ts        # Punto de entrada
```

## API

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro con email |
| POST | `/api/auth/verify-email` | Confirmar email |
| POST | `/api/auth/login` | Login con email |
| GET | `/api/auth/google` | Iniciar OAuth con Google |
| GET | `/api/auth/google/callback` | Callback de Google |
| GET | `/api/auth/me` | Usuario actual (protegido) |

## Licencia

MIT
