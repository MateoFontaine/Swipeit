# Swipeit — Especificación del producto

Swipeit es una web app para tomar decisiones en grupo con mecánica de swipe estilo Tinder. Un host crea una encuesta, comparte un link, y los participantes votan deslizando cada opción (sí / no). Al cerrar, se muestra el ranking completo; si hay empate, hay ballotage entre las opciones empatadas.

**Usuario principal:** cualquier persona que necesite resolver una decisión en grupo (comida, planes, trabajo, etc.).

**Stack:** Next.js · Tailwind CSS · Supabase · Vercel (free tier)

**Idioma:** español

---

## Quick path (MVP)

1. Host se registra/inicia sesión (email o magic link).
2. Host crea encuesta: nombre, descripción opcional, límite de tiempo, máximo de participantes, opciones custom.
3. Host comparte link único.
4. Participantes entran con nickname (modo ghost) o con cuenta; votan swipeando todas las opciones.
5. La encuesta cierra cuando todos votaron o se cumple el tiempo límite.
6. Se muestra ranking con votos por opción; empate → ballotage.
7. Host ve resultados en vivo; usuarios con cuenta tienen historial.

---

## Decisiones de producto

| Tema | Decisión |
|------|----------|
| Alcance | Multi-uso (cualquier decisión grupal). Una decisión por encuesta. |
| Host | **Requiere cuenta** para crear encuestas. |
| Participantes | Modo ghost con nickname obligatorio, o login (email / magic link). |
| Ghost → cuenta | Puede hacer login después y conservar su participación. |
| Opciones | 100 % custom (texto). Sin plantillas predefinidas. |
| Imágenes | API automática según texto de la opción (ej. "pizza" → foto de pizza). El usuario no sube imágenes. |
| Edición post-creación | **No** en MVP. Future: host edita opciones con gente dentro. |
| Compartir | Link único por encuesta. |
| Swipe | Derecha = sí · Izquierda = no. |
| Ganador | Opción con más "sí". Empate → ballotage solo entre empatadas. |
| Cierre | Cuando todos votaron **o** se cumple el tiempo límite. |
| Cambiar voto | No. Voto definitivo al confirmar. Undo solo **durante** la sesión activa, antes de cerrar. |
| Obligatoriedad | Debe votar **todas** las opciones. |
| Entrada tardía | Permitida mientras la encuesta esté abierta. |
| Resultados | Ranking completo con cantidad de votos por opción. |
| Anonimato | No. Se ve el nickname de quien votó. |
| Host en vivo | Sí, puede ver cómo viene la encuesta. |
| Historial | Sí, para usuarios con cuenta. |
| Participantes máx. | Configurable por encuesta. Validación server-side (no 500 usuarios reales). |
| Realtime | Evaluar Supabase Realtime; no bloqueante para MVP. |
| Moderación | No (uso entre conocidos). |
| Estilo | Tinder-like, moderno, intuitivo. Mobile first + desktop (swipe + botones). |
| Deploy | Vercel + Supabase free tier. |

---

## Estados del lobby

```
esperando → votando → ballotage (si aplica) → resultados → cerrado
```

| Estado | Descripción |
|--------|-------------|
| `esperando` | Encuesta creada; participantes pueden unirse. Host puede iniciar votación. |
| `votando` | Swipe activo. Entrada tardía permitida. |
| `ballotage` | Empate en el top; solo se votan las opciones empatadas. |
| `resultados` | Ranking final visible para todos. |
| `cerrado` | Encuesta finalizada; no se puede modificar nada. |

---

## Modelo de datos (borrador)

```
users (Supabase Auth + profile)
  id, email, display_name, created_at

polls
  id, host_id, title, description?, max_participants, time_limit_minutes?,
  status, share_token (link), created_at, closes_at?, started_at?

poll_options
  id, poll_id, text, image_url?, sort_order

participants
  id, poll_id, user_id? (null = ghost), nickname, joined_at

votes
  id, poll_id, participant_id, option_id, value (yes/no),
  round (1 = normal, 2 = ballotage), created_at

poll_history (o vista derivada)
  poll_id, host_id, title, status, closed_at, winner_option_id?
```

---

## API de imágenes (opciones)

Servicio que recibe el texto de la opción y devuelve URL de imagen de fondo.

| Opción | Pros | Contras |
|--------|------|---------|
| Unsplash API | Gratis con límites, buena calidad | Requiere API key |
| Pexels API | Similar a Unsplash | Requiere API key |
| Fallback local | Sin dependencia externa | Menos "wow" |

**MVP:** buscar imagen por keyword del texto de la opción + placeholder si falla.

---

## Fuera de alcance (MVP)

- Editar opciones después de compartir el link
- Google OAuth (fase posterior)
- Chat / comentarios
- Plantillas predefinidas
- Moderación de contenido
- Multi-idioma

---

## Fases de desarrollo

| Fase | Archivo | Entregable |
|------|---------|------------|
| 01 | [FASE-01-setup.md](./fases/FASE-01-setup.md) | Proyecto Next.js + Tailwind + Supabase configurado |
| 02 | [FASE-02-auth.md](./fases/FASE-02-auth.md) | Login host (email + magic link) |
| 03 | [FASE-03-database.md](./fases/FASE-03-database.md) | Schema Supabase + RLS |
| 04 | [FASE-04-crear-encuesta.md](./fases/FASE-04-crear-encuesta.md) | Flujo host: crear encuesta y opciones |
| 05 | [FASE-05-unirse.md](./fases/FASE-05-unirse.md) | Unirse por link con nickname (ghost) |
| 06 | [FASE-06-swipe-ui.md](./fases/FASE-06-swipe-ui.md) | UI swipe Tinder mobile + desktop |
| 07 | [FASE-07-votacion.md](./fases/FASE-07-votacion.md) | Lógica de votos, cierre, undo en sesión |
| 08 | [FASE-08-resultados.md](./fases/FASE-08-resultados.md) | Ranking, ballotage, vista host en vivo |
| 09 | [FASE-09-historial.md](./fases/FASE-09-historial.md) | Historial + ghost → cuenta |
| 10 | [FASE-10-imagenes-deploy.md](./fases/FASE-10-imagenes-deploy.md) | API imágenes + deploy Vercel |

**Orden:** ejecutar fases en secuencia. Cada fase asume las anteriores completadas.

---

## Criterios de "presentable hoy"

- [ ] App corre en local sin errores
- [ ] Host puede registrarse e iniciar sesión
- [ ] Host crea encuesta con opciones y obtiene link
- [ ] Participante entra con nickname y ve cards swipeables
- [ ] Votos se guardan y se ve un resultado básico
- [ ] UI mobile limpia estilo Tinder
