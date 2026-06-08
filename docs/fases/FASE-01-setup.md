# Fase 01 — Setup del proyecto

**Objetivo:** Tener el esqueleto de Swipeit corriendo en local con Next.js, Tailwind y Supabase conectado.

**Prerequisitos:** Node.js 18+, cuenta Supabase (se crea en esta fase), Git.

---

## Entregables

- [ ] Proyecto Next.js (App Router) con TypeScript
- [ ] Tailwind CSS configurado
- [ ] Cliente Supabase (`@supabase/supabase-js` + `@supabase/ssr`)
- [ ] Variables de entorno (`.env.local.example`)
- [ ] Estructura de carpetas base
- [ ] Layout raíz con tipografía y colores base (estilo moderno/Tinder-like)
- [ ] Página landing mínima: "Swipeit" + CTA "Crear encuesta" / "Unirse"

---

## Estructura de carpetas sugerida

```
app/
  (auth)/login/page.tsx
  (auth)/register/page.tsx
  (host)/dashboard/page.tsx
  (poll)/[token]/page.tsx
  layout.tsx
  page.tsx
components/
  ui/
lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
types/
middleware.ts
```

---

## Configuración Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Habilitar Email auth en Authentication → Providers

---

## Diseño base (tokens)

| Token | Valor sugerido |
|-------|----------------|
| Primary | Rosa/coral tipo Tinder `#FE3C72` |
| Background | `#FAFAFA` (light) |
| Card radius | `rounded-2xl` |
| Font | Inter o Geist |

---

## Verificación

```bash
npm run dev
# → http://localhost:3000 muestra landing sin errores
```

---

## Checklist de aceptación

- [ ] `npm run dev` funciona
- [ ] `npm run build` pasa sin errores
- [ ] Supabase client importable desde `lib/supabase`
- [ ] `.env.local` en `.gitignore`
- [ ] README actualizado con instrucciones de setup

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 01 (docs/fases/FASE-01-setup.md).

Crea el proyecto Next.js con App Router, TypeScript y Tailwind. Configura Supabase (client, server, middleware). Arma la estructura de carpetas sugerida. Implementa una landing page mínima en español con estilo moderno tipo Tinder (mobile first). Incluye .env.local.example. Al terminar, verifica que npm run dev y npm run build funcionen.
```
