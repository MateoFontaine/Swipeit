# Fase 02 — Autenticación del host

**Objetivo:** El host puede registrarse e iniciar sesión con email + magic link. Rutas protegidas para acciones de host.

**Prerequisitos:** Fase 01 completada.

---

## Entregables

- [ ] Página `/login` — email + magic link
- [ ] Página `/register` — registro con email (o mismo flujo que login)
- [ ] Middleware que protege rutas `/dashboard` y crear encuesta
- [ ] Redirect: no autenticado → login; autenticado en login → dashboard
- [ ] Perfil mínimo en tabla `profiles` (trigger en Supabase o insert en signup)
- [ ] UI auth en español, mobile friendly

---

## Flujos

### Magic link
1. Usuario ingresa email
2. Supabase envía link mágico
3. Click en link → sesión activa → redirect a `/dashboard`

### Email + password (opcional si magic link alcanza)
- Si solo magic link: un solo formulario "Ingresá tu email"

---

## Tabla `profiles`

```sql
profiles (
  id uuid PK references auth.users,
  display_name text,
  created_at timestamptz default now()
)
```

RLS: usuario solo lee/escribe su propio perfil.

---

## Rutas

| Ruta | Acceso |
|------|--------|
| `/` | Público |
| `/login` | Público (redirect si ya logueado) |
| `/dashboard` | Solo autenticados |
| `/poll/[token]` | Público (fase posterior) |

---

## Verificación

- [ ] Registro/login funciona con email real
- [ ] Magic link redirige correctamente
- [ ] `/dashboard` bloqueado sin sesión
- [ ] Logout funciona

---

## Checklist de aceptación

- [ ] Host puede crear cuenta e iniciar sesión
- [ ] Sesión persiste al recargar
- [ ] Mensajes de error en español
- [ ] Formularios accesibles en mobile

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 02 (docs/fases/FASE-02-auth.md).

Implementa autenticación con Supabase: login con email y magic link. Crea páginas /login y protege /dashboard con middleware. Crea tabla profiles con RLS. UI en español, estilo moderno mobile first. Verifica flujo completo de registro, magic link, sesión persistente y logout.
```
