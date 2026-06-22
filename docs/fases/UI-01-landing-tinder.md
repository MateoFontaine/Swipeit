# UI-01 — Landing Tinder-style (oscuro + violeta)

**Objetivo:** Reemplazar la home actual por una landing profesional, animada, estilo Tinder: fondo oscuro, acentos violeta/rosa, y un mockup de teléfono que muestre cómo funciona el swipe sin registrarse.

**Prerequisitos:** Fases 01–09 completadas. Pexels integrado (Fase 10 parcial).

**Alcance de esta fase:** Solo landing (`/`) + tokens de diseño base en `globals.css`. **No** rediseñar auth, dashboard ni flujo de votación todavía (eso es UI-02+).

---

## Quick path

1. Definir tokens oscuros + violeta en `globals.css`.
2. Crear componentes de landing en `components/landing/`.
3. Reemplazar `app/page.tsx` con la nueva landing.
4. Incluir mockup de teléfono con demo animada del swipe (loop).
5. Verificar mobile + desktop, `npm run build` sin errores.

---

## Dirección visual

| Tema | Decisión |
|------|----------|
| Estilo | Tinder-like: bold, inmersivo, mobile-first |
| Modo | **Oscuro** por defecto en la landing |
| Acento principal | Violeta (`#8B5CF6` / violet-500) con gradientes hacia rosa (`#EC4899`) |
| Fondo | Negro profundo o zinc-950 con gradientes sutiles / glow violeta |
| Tipografía | Mantener Geist; títulos grandes y bold |
| Cards | Bordes suaves, glassmorphism ligero (`bg-white/5`, `backdrop-blur`) |
| CTAs | Gradiente violeta→rosa, sombra glow, hover con scale sutil |
| Sí / No en demo | Verde esmeralda (sí) · rojo/rosa (no) — coherente con `SwipeCard` existente |

### Paleta sugerida (tokens CSS)

```css
:root {
  --background: #09090b;        /* zinc-950 */
  --foreground: #fafafa;
  --primary: #7c3aed;             /* violet-600 */
  --primary-dark: #6d28d9;        /* violet-700 */
  --accent: #a78bfa;              /* violet-400 */
  --accent-pink: #ec4899;         /* pink-500 */
  --muted: #18181b;               /* zinc-900 */
  --muted-foreground: #a1a1aa;    /* zinc-400 */
  --border: #27272a;              /* zinc-800 */
  --card: #18181b;
  --glow: rgba(139, 92, 246, 0.35);
}
```

> **Nota:** La landing puede usar clases Tailwind directas (`bg-zinc-950`, `from-violet-600`, etc.) además de tokens. Actualizar `globals.css` para que el resto de la app herede la base cuando llegue UI-02.

---

## Estructura de la landing

```
┌─────────────────────────────────────────────────────────┐
│  NAV: Logo Swipeit          [Iniciar sesión] [Crear →]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   HERO (2 columnas en desktop, stack en mobile)         │
│   ┌─────────────────────┐   ┌──────────────────┐        │
│   │ Headline + sub +    │   │  📱 Phone mockup │        │
│   │ CTAs                │   │  (demo animada)  │        │
│   └─────────────────────┘   └──────────────────┘        │
│                                                         │
│   CÓMO FUNCIONA — 3 pasos con iconos animados           │
│                                                         │
│   CASOS DE USO — grid de chips/cards                    │
│   (comida, planes, deporte, trabajo…)                   │
│                                                         │
│   CTA FINAL — "Creá tu primera encuesta"                │
│                                                         │
│   FOOTER — links mínimos, © Swipeit                     │
└─────────────────────────────────────────────────────────┘
```

### Secciones detalladas

#### 1. Nav (sticky o fija)
- Logo "Swipeit" (texto bold o wordmark simple)
- Links: "Cómo funciona" (anchor `#como-funciona`), "Iniciar sesión" → `/login`
- CTA primario: "Crear encuesta" → `/register`
- Fondo con blur al hacer scroll (opcional)

#### 2. Hero
- **Headline:** algo como *"Decisiones en grupo, sin drama"* — con palabra clave en gradiente violeta→rosa
- **Subtítulo:** 1–2 líneas explicando swipe + ranking + ballotage
- **CTAs:** botón primario gradiente + secundario outline "Ver cómo funciona" (scroll al mockup o a `#como-funciona`)
- **Fondo:** gradiente radial violeta difuso, partículas o blobs animados (CSS o framer-motion, liviano)

#### 3. Phone mockup — demo animada (pieza central)

Componente `PhoneDemo` o `LandingPhoneMockup` en `components/landing/`:

- Marco de teléfono (SVG o div con border-radius, notch opcional)
- **Dentro:** mini réplica del flujo swipe — **no** conectar a Supabase; datos hardcodeados
- 3–4 opciones de ejemplo con imágenes reales (URLs de Pexels estáticas o placeholders con gradiente)
  - Ej: "Pizza", "Sushi", "Hamburguesa", "Tacos"
- **Animación en loop** (framer-motion, ya instalado):
  1. Card visible con imagen + texto
  2. Swipe automático a la derecha (sí) — stamp "SÍ" verde
  3. Card sale volando, aparece la siguiente
  4. Alternar ocasionalmente swipe izquierda (no)
  5. Al terminar las opciones, fade y reiniciar
- Progress: "Opción 2 de 4" arriba de la card
- Botones ❌ / ✅ abajo (decorativos o que pulsen en sync con la animación)
- **Duración del loop:** ~12–18 s, transiciones suaves

Reutilizar lógica visual de `components/poll/swipe-card.tsx` solo si simplifica; puede ser un componente más liviano solo para marketing (menos gestos, solo animación programática).

#### 4. Cómo funciona (3 pasos)
| Paso | Título | Descripción |
|------|--------|-------------|
| 1 | Creá | Armá tu encuesta con las opciones que quieras |
| 2 | Compartí | Mandá el link; cada uno entra con su nickname |
| 3 | Swipeá | Votan deslizando; al cerrar, ranking y ballotage si hay empate |

- Entrada animada al scroll (`whileInView` de framer-motion)
- Números o iconos con glow violeta

#### 5. Casos de uso
Grid de 4–6 cards pequeñas:
- "¿Qué comemos?"
- "¿Qué deporte jugamos?"
- "¿Dónde vamos el finde?"
- "Elegir película"
- etc.

Solo decorativas; refuerzan que sirve para cualquier decisión grupal.

#### 6. CTA final
- Card ancha con gradiente de fondo
- "Listo para decidir en grupo?"
- Botón → `/register`

#### 7. Footer
- Logo + © 2026 Swipeit
- Links: Iniciar sesión, Crear cuenta
- Sin páginas legales por ahora (MVP)

---

## Animaciones y efectos

| Elemento | Efecto | Librería |
|----------|--------|----------|
| Hero headline | Fade + slide up al mount | framer-motion |
| Phone mockup | Float sutil (y: -8px ↔ 8px, loop) | framer-motion |
| Cards en demo | Swipe programático, rotate, fly out | framer-motion |
| Blobs de fondo | Movimiento lento, blur | CSS `@keyframes` o motion |
| Secciones | Fade in on scroll | `whileInView` |
| CTAs | `hover:scale-[1.02]`, shadow glow | Tailwind |
| Stamps SÍ/NO | Opacity + scale como `SwipeCard` | framer-motion |

**Performance:** preferir `transform` y `opacity`. Evitar librerías pesadas nuevas. Respetar `prefers-reduced-motion` (desactivar animaciones largas).

---

## Archivos a crear / modificar

### Crear
```
components/landing/
  landing-nav.tsx
  landing-hero.tsx
  landing-phone-demo.tsx      # mockup + animación swipe
  landing-how-it-works.tsx
  landing-use-cases.tsx
  landing-cta.tsx
  landing-footer.tsx
  index.ts                    # re-exports opcional
```

### Modificar
```
app/page.tsx                  # componer las secciones
app/globals.css               # tokens oscuros + violeta (base)
app/layout.tsx                # metadata OG si falta; lang="es" ya está
```

### No tocar en esta fase
- `app/(auth)/*`
- `app/(host)/*`
- `app/poll/*`
- Lógica de negocio / API / Supabase

---

## Metadata y SEO (mínimo)

En `app/layout.tsx` o `app/page.tsx`:
- `title`: "Swipeit — Decisiones en grupo con swipe"
- `description`: clara, en español
- `openGraph`: title, description, type `website`
- OG image: opcional en esta fase (placeholder o screenshot del phone mockup)

---

## Responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| Mobile (<768px) | Hero en columna; teléfono centrado debajo del copy; nav compacta |
| Desktop (≥768px) | Hero 2 columnas; teléfono a la derecha, más grande |
| iPhone SE (320px) | Verificar que el mockup no desborde; texto legible |

---

## Checklist de aceptación

- [ ] `/` muestra landing oscura con acentos violeta/rosa
- [ ] Mockup de teléfono con demo de swipe en loop automático
- [ ] Se ven stamps SÍ (verde) y NO (rojo) durante la demo
- [ ] Secciones: hero, cómo funciona, casos de uso, CTA, footer
- [ ] CTAs llevan a `/register` y `/login` correctamente
- [ ] Animaciones suaves; `prefers-reduced-motion` respetado
- [ ] Responsive mobile + desktop
- [ ] `npm run build` pasa sin errores
- [ ] No se rompió ningún otro flujo de la app

---

## Fases siguientes (fuera de alcance)

| Fase | Entregable |
|------|------------|
| UI-02 | Auth + dashboard con el mismo design system |
| UI-03 | Lobby + swipe en producción con tema oscuro |
| UI-04 | Resultados, historial, errores 404 |
| UI-05 | Deploy Vercel + OG image final |

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta UI-01 (docs/fases/UI-01-landing-tinder.md).

Reemplazá la landing actual (app/page.tsx) por una landing profesional estilo Tinder: fondo oscuro, acentos violeta y rosa, animaciones con framer-motion. Incluí un mockup de teléfono con demo animada en loop del swipe (cards hardcodeadas, sin Supabase). Creá componentes en components/landing/. Actualizá tokens en globals.css. Solo la home; no rediseñes auth, dashboard ni poll. Español. Mobile first. npm run build debe pasar.
```
