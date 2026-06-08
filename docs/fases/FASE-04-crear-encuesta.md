# Fase 04 — Crear encuesta (host)

**Objetivo:** El host autenticado puede crear una encuesta con opciones custom y obtener un link para compartir.

**Prerequisitos:** Fases 01–03 completadas.

---

## Entregables

- [ ] `/dashboard` — lista de encuestas del host (activas y pasadas)
- [ ] `/dashboard/nueva` — formulario crear encuesta
- [ ] Campos: título, descripción (opcional), límite de tiempo (opcional), máx. participantes, opciones (mín. 2)
- [ ] Agregar/quitar opciones dinámicamente en el formulario
- [ ] Al guardar: crea poll en estado `esperando` + opciones + genera `share_token`
- [ ] Pantalla de confirmación con link copiable: `https://dominio/poll/[token]`
- [ ] Botón "Iniciar votación" (cambia status a `votando`, setea `started_at` y `closes_at` si hay time limit)

---

## Flujo UX

```
Dashboard → "Nueva encuesta" → Formulario → Guardar
  → Pantalla con link + botón copiar
  → "Iniciar votación" cuando esté listo
```

---

## Validaciones

| Campo | Regla |
|-------|-------|
| Título | Requerido, 3–100 chars |
| Opciones | Mínimo 2, máximo 20 |
| Texto opción | Requerido, 1–200 chars |
| Max participantes | 2–100 |
| Time limit | 5–1440 minutos o vacío |

---

## API / Server Actions

- `createPoll(data)` — insert poll + options, return share_token
- `startPoll(pollId)` — solo host, status → votando
- `getHostPolls()` — lista para dashboard

---

## Verificación

- [ ] Host crea encuesta y ve el link
- [ ] Link tiene formato `/poll/[token]`
- [ ] Solo el host puede iniciar votación
- [ ] Encuesta aparece en dashboard

---

## Checklist de aceptación

- [ ] Formulario funciona en mobile
- [ ] Copiar link al portapapeles
- [ ] Errores de validación en español
- [ ] Poll guardada en Supabase correctamente

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 04 (docs/fases/FASE-04-crear-encuesta.md).

Implementa el dashboard del host y el flujo para crear encuestas: formulario con título, descripción opcional, límite de tiempo, máximo de participantes y opciones dinámicas (mín. 2). Al guardar, genera share_token y muestra link copiable. Agrega botón para iniciar votación (status → votando). UI en español, mobile first, estilo moderno.
```
