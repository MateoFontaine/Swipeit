# Fase 07 — Lógica de votación

**Objetivo:** Persistir votos, obligar a votar todas las opciones, permitir undo durante sesión activa, y cerrar encuesta automáticamente.

**Prerequisitos:** Fases 01–06 completadas.

---

## Entregables

- [ ] Al completar swipe de todas las opciones → guardar votos en `votes` (round = 1)
- [ ] Un voto por opción por participante (unique constraint)
- [ ] **No cambiar voto** una vez enviados (batch al final del swipe)
- [ ] **Undo:** durante el swipe, antes de terminar todas, poder volver atrás 1 card
- [ ] Marcar participante como "votó" cuando completó todas
- [ ] Auto-cierre: cuando `count(votaron) = count(participants)` → trigger cierre
- [ ] Auto-cierre por tiempo: job/cron o check en cada request si `now() > closes_at`
- [ ] Pantalla "Esperando que voten los demás..." si el participante ya terminó

---

## Flujo de votación

```
Swipe opción 1 → swipe 2 → ... → swipe N
  → Confirmar votos (batch insert)
  → Si todos votaron OR tiempo cumplido → calcular resultados (fase 08)
```

---

## Server Actions

- `submitVotes(participantId, votes[])` — insert batch, validar todas las opciones presentes
- `checkPollClosure(pollId)` — verificar si debe cerrarse
- `getParticipantProgress(participantId)` — opciones ya votadas (solo durante swipe, en memoria)

---

## Reglas

| Regla | Implementación |
|-------|----------------|
| Todas las opciones | Rechazar submit si falta alguna |
| Sin cambio post-submit | No UPDATE en votes; UI bloqueada |
| Undo pre-submit | Stack local de respuestas; botón "Deshacer" |
| Entrada tardía | Nuevo participante puede unirse y votar mientras status = votando |

---

## Cierre por tiempo

Opciones:
1. **Supabase Edge Function** con cron (overkill para MVP)
2. **Check on read:** cada vez que alguien carga el poll, verificar `closes_at`
3. **Vercel Cron** (1 request/min)

**MVP recomendado:** check on read + al submit de votos.

---

## Verificación

- [ ] Votos guardados correctamente en DB
- [ ] No se puede votar dos veces
- [ ] Undo funciona antes de confirmar
- [ ] Encuesta no cierra hasta que todos voten (si no hay time limit)

---

## Checklist de aceptación

- [ ] Flujo completo: unirse → swipe todas → votos guardados
- [ ] Participante que terminó ve pantalla de espera
- [ ] Errores en español

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 07 (docs/fases/FASE-07-votacion.md).

Conecta la UI swipe con la base de datos: guardar votos en batch al completar todas las opciones, validar que votó cada una, undo durante el swipe antes de confirmar, sin cambios post-submit. Implementa auto-cierre cuando todos votaron o se cumple time_limit. Pantalla de espera para quien ya votó. Server Actions con validación server-side.
```
