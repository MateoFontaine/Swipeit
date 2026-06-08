# Fase 03 — Base de datos y RLS

**Objetivo:** Schema completo en Supabase con políticas de seguridad para encuestas, opciones, participantes y votos.

**Prerequisitos:** Fases 01 y 02 completadas.

---

## Entregables

- [ ] Migración SQL (`supabase/migrations/001_initial.sql`)
- [ ] Tablas: `polls`, `poll_options`, `participants`, `votes`
- [ ] RLS habilitado en todas las tablas
- [ ] Tipos TypeScript generados o manuales en `types/database.ts`
- [ ] Función/trigger para validar `max_participants`

---

## Schema

### `polls`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| host_id | uuid | FK → auth.users |
| title | text | NOT NULL |
| description | text | nullable |
| max_participants | int | NOT NULL, default 20, check > 0 AND <= 100 |
| time_limit_minutes | int | nullable |
| status | text | enum: esperando, votando, ballotage, resultados, cerrado |
| share_token | text | UNIQUE, para el link |
| created_at | timestamptz | |
| started_at | timestamptz | nullable |
| closes_at | timestamptz | nullable |

### `poll_options`
| Columna | Tipo |
|---------|------|
| id | uuid PK |
| poll_id | uuid FK |
| text | text NOT NULL |
| image_url | text nullable |
| sort_order | int |

### `participants`
| Columna | Tipo |
|---------|------|
| id | uuid PK |
| poll_id | uuid FK |
| user_id | uuid FK nullable (ghost = null) |
| nickname | text NOT NULL |
| joined_at | timestamptz |

Unique: `(poll_id, nickname)` — no dos nicknames iguales en la misma encuesta.

### `votes`
| Columna | Tipo |
|---------|------|
| id | uuid PK |
| poll_id | uuid FK |
| participant_id | uuid FK |
| option_id | uuid FK |
| value | boolean (true = sí, false = no) |
| round | int (1 = normal, 2 = ballotage) |
| created_at | timestamptz |

Unique: `(participant_id, option_id, round)`

---

## RLS (resumen)

| Tabla | Regla |
|-------|-------|
| polls | Host CRUD sus polls; cualquiera lee poll por share_token (vía función o policy con token) |
| poll_options | Host inserta; participantes leen si pertenecen al poll |
| participants | Cualquiera inserta si poll abierto y bajo max; lee los del mismo poll |
| votes | Participante inserta sus votos; host lee todos los del poll |

---

## Validaciones server-side

- `max_participants`: rechazar join si `count(participants) >= max_participants`
- `share_token`: generar con `nanoid` o `crypto.randomUUID()` truncado (8-12 chars legibles)

---

## Verificación

```bash
# Aplicar migración en Supabase SQL Editor o CLI
supabase db push
```

---

## Checklist de aceptación

- [ ] Todas las tablas creadas
- [ ] RLS activo y probado con usuario anónimo vs autenticado
- [ ] Tipos TS disponibles en el proyecto
- [ ] No se puede superar max_participants

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 03 (docs/fases/FASE-03-database.md).

Crea la migración SQL completa para polls, poll_options, participants y votes. Implementa RLS según el spec. Agrega validación de max_participants. Genera o escribe tipos TypeScript en types/database.ts. Documenta cómo aplicar la migración en Supabase.
```
