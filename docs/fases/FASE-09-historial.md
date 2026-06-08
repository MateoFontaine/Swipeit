# Fase 09 — Historial y ghost → cuenta

**Objetivo:** Usuarios con cuenta ven sus encuestas pasadas. Un participante ghost puede hacer login y vincular su participación.

**Prerequisitos:** Fases 01–08 completadas.

---

## Entregables

- [ ] `/dashboard` — sección "Mis encuestas" (como host) + "Participé en" (como voter)
- [ ] Listado: título, fecha, estado, ganador (si cerrada)
- [ ] Click → detalle con resultados históricos (read-only)
- [ ] **Ghost → cuenta:** en `/poll/[token]`, botón "Iniciar sesión para guardar historial"
  - Tras login: `UPDATE participants SET user_id = auth.uid() WHERE id = participant_id`
- [ ] Evitar duplicar participante si el user ya está en el poll

---

## Queries

```sql
-- Encuestas como host
SELECT * FROM polls WHERE host_id = auth.uid() ORDER BY created_at DESC;

-- Encuestas como participante
SELECT p.* FROM polls p
JOIN participants pt ON pt.poll_id = p.id
WHERE pt.user_id = auth.uid() ORDER BY p.created_at DESC;
```

---

## UX ghost → cuenta

```
Participante ghost votando o en espera
  → "¿Querés guardar tu historial? Iniciá sesión"
  → Login / magic link
  → Vincular participant existente
  → Toast: "Cuenta vinculada"
```

---

## Reglas

- Solo vincular si `participant.user_id IS NULL`
- Si nickname ya existe para otro user_id → no permitir merge
- Historial read-only: no re-votar encuestas cerradas

---

## Verificación

- [ ] Host ve todas sus encuestas creadas
- [ ] Usuario ve encuestas donde participó
- [ ] Ghost que hace login conserva votos y nickname
- [ ] Encuestas cerradas muestran resultado final

---

## Checklist de aceptación

- [ ] Dashboard con ambas listas
- [ ] Vinculación ghost funciona sin perder datos
- [ ] UI en español, mobile friendly

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 09 (docs/fases/FASE-09-historial.md).

Implementa historial en dashboard: encuestas creadas como host y encuestas donde participó. Detalle read-only de resultados pasados. Flujo ghost → cuenta: login y vincular participant existente sin perder votos. Validar que no se dupliquen participantes.
```
