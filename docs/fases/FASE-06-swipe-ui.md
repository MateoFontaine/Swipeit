# Fase 06 — UI Swipe (estilo Tinder)

**Objetivo:** Interfaz de cards swipeables para votar cada opción. Funciona en mobile (gestos) y desktop (drag + botones).

**Prerequisitos:** Fases 01–05 completadas.

---

## Entregables

- [ ] Componente `SwipeCard` con imagen de fondo, texto de opción, overlay gradiente
- [ ] Gestos: drag horizontal (touch + mouse)
- [ ] Swipe derecha → indicador verde "SÍ" · izquierda → rojo "NO"
- [ ] Botones desktop: ❌ No · ✅ Sí (alternativa al drag)
- [ ] Stack de cards (siguiente opción visible detrás)
- [ ] Progress: "Opción 3 de 7"
- [ ] Animación suave al descartar card (fly out)
- [ ] Placeholder de imagen si `image_url` es null (fase 10 la llena)

---

## Librerías sugeridas

| Opción | Uso |
|--------|-----|
| `framer-motion` | Animaciones drag y exit |
| `@use-gesture/react` | Gestos touch (opcional si framer alcanza) |

Evaluar bundle size; preferir solución liviana.

---

## Layout mobile

```
┌─────────────────────┐
│  Opción 2 de 5      │
│                     │
│   ┌─────────────┐   │
│   │   CARD      │   │
│   │  "Pizza"    │   │
│   │  [imagen]   │   │
│   └─────────────┘   │
│                     │
│   [ ✕ ]    [ ✓ ]    │
└─────────────────────┘
```

---

## Layout desktop

- Card centrada, max-width ~400px
- Botones grandes debajo
- Drag con mouse habilitado

---

## Estados visuales

| Estado | UI |
|--------|-----|
| Arrastrando derecha | Borde/overlay verde, opacidad "SÍ" |
| Arrastrando izquierda | Borde/overlay rojo, opacidad "NO" |
| Sin más cards | "¡Listo! Enviando votos..." → fase 07 |

---

## Accesibilidad

- Botones siempre disponibles (no depender solo de gestos)
- `aria-label` en botones Sí/No
- Contraste suficiente sobre imagen (gradiente oscuro abajo)

---

## Verificación

- [ ] Swipe funciona en Chrome mobile (DevTools)
- [ ] Drag funciona con mouse en desktop
- [ ] Botones registran voto igual que swipe
- [ ] Animaciones no lag en mobile mid-range

---

## Checklist de aceptación

- [ ] Estilo Tinder-like, moderno
- [ ] Todavía no persiste votos (eso es fase 07) — o integrar si ya está lista
- [ ] Progress indicator correcto
- [ ] Placeholder visual aceptable sin API de imágenes

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 06 (docs/fases/FASE-06-swipe-ui.md).

Implementa la UI de swipe estilo Tinder: componente SwipeCard con drag touch/mouse, indicadores SÍ/NO, stack de cards, progress "X de Y", botones para desktop. Usa framer-motion o similar. Integra en /poll/[token] cuando status es votando. Mobile first, español. Imagen placeholder si no hay image_url.
```
