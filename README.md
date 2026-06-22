# Swipeit

Decisiones en grupo con swipe estilo Tinder.

**Stack:** Next.js · Tailwind CSS · Supabase · Vercel

## Setup local

**Requisitos:** Node.js 18+, cuenta en [Supabase](https://supabase.com).

1. Clonar el repo e instalar dependencias:

```bash
npm install
```

2. Copiar variables de entorno y completar con tu proyecto Supabase:

```bash
cp .env.local.example .env.local
```

En el dashboard de Supabase: **Project Settings → API** → copiar `URL` y `anon` key.

   Para imágenes automáticas en las opciones, crear una API key en
   [Pexels](https://www.pexels.com/api/) y agregar `PEXELS_API_KEY` en
   `.env.local`. Sin esa key, las opciones usan un placeholder con gradiente.

3. En Authentication → Providers, habilitar **Email** (login con contraseña).
   En **Authentication → Sign In / Providers → Email**, desactivá
   **Confirm email** en desarrollo para entrar al instante tras registrarte.

4. Aplicar migraciones SQL en Supabase (ver [supabase/README.md](./supabase/README.md)):
   - [`20250608000000_profiles.sql`](./supabase/migrations/20250608000000_profiles.sql) — perfiles y auth (Fase 02)
   - [`20250608100000_polls.sql`](./supabase/migrations/20250608100000_polls.sql) — encuestas, opciones, participantes, votos y RLS (Fase 03)

5. En Authentication → URL Configuration, agregar redirect URL:
   - `http://localhost:3000/auth/callback` (desarrollo)
   - Tu dominio de producción + `/auth/callback` (deploy)

6. Arrancar el servidor de desarrollo:

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |

## Documentación

- [Especificación del producto](./docs/SPEC.md)
- [Fases de desarrollo](./docs/fases/)

| Fase | Descripción |
|------|-------------|
| [01](./docs/fases/FASE-01-setup.md) | Setup Next.js + Tailwind + Supabase |
| [02](./docs/fases/FASE-02-auth.md) | Auth host (email + magic link) |
| [03](./docs/fases/FASE-03-database.md) | Schema y RLS |
| [04](./docs/fases/FASE-04-crear-encuesta.md) | Crear encuesta |
| [05](./docs/fases/FASE-05-unirse.md) | Unirse por link |
| [06](./docs/fases/FASE-06-swipe-ui.md) | UI swipe |
| [07](./docs/fases/FASE-07-votacion.md) | Lógica de votación |
| [08](./docs/fases/FASE-08-resultados.md) | Resultados y ballotage |
| [09](./docs/fases/FASE-09-historial.md) | Historial |
| [10](./docs/fases/FASE-10-imagenes-deploy.md) | Imágenes + deploy |

Ejecutar fases en orden. Cada archivo de fase incluye un **prompt** al final para correrla con el agente.

## Estructura

```
app/           # Rutas (App Router)
components/    # UI reutilizable
lib/supabase/  # Cliente Supabase (browser, server, middleware)
types/         # Tipos compartidos
```
