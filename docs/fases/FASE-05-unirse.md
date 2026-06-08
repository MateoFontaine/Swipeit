# Fase 05 — Unirse a la encuesta

**Objetivo:** Cualquier persona puede entrar al link `/poll/[token]`, ingresar su nickname y unirse como participante (ghost o con cuenta).

**Prerequisitos:** Fases 01–04 completadas.

---

## Entregables

- [ ] Página `/poll/[token]` — landing de la encuesta
- [ ] Muestra: título, descripción, estado, cantidad de participantes
- [ ] Si no es participante: formulario nickname + botón "Unirme"
- [ ] Si ya es participante (cookie/localStorage): skip al flujo de votación
- [ ] Validación: nickname único en el poll, poll no cerrado, bajo max_participants
- [ ] Usuario logueado: pre-fill nickname desde profile, vincular `user_id`
- [ ] Estado `esperando`: mensaje "Esperando que el host inicie"
- [ ] Estado `votando`: redirect a pantalla de swipe (placeholder OK si fase 06 no está)

---

## Persistencia de sesión participante

Guardar `participant_id` en cookie o localStorage para no pedir nickname de nuevo al recargar.

```
swipeit_participant_[poll_id] = participant_id
```

---

## Flujos

### Ghost
1. Abre link → ve info de encuesta
2. Ingresa nickname → "Unirme"
3. Crea row en `participants` (user_id = null)
4. Espera o entra a votar según status

### Con cuenta
1. Mismo flujo pero con `user_id` del auth
2. Si ya participó con esa cuenta, reconectar sesión

---

## Validaciones

- Nickname: 2–30 chars, sin espacios raros
- Rechazar si `participants.count >= max_participants`
- Rechazar si status = `cerrado` o `resultados` (solo lectura de resultados)

---

## Verificación

- [ ] Link inválido → página 404 amigable
- [ ] Dos personas con distinto nickname pueden unirse
- [ ] Mismo nickname en mismo poll → error
- [ ] Recargar página mantiene sesión de participante

---

## Checklist de aceptación

- [ ] Unirse funciona sin cuenta (ghost)
- [ ] Unirse funciona con cuenta logueada
- [ ] Mensajes en español
- [ ] UI mobile first

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 05 (docs/fases/FASE-05-unirse.md).

Implementa la página /poll/[token]: muestra info de la encuesta, formulario de nickname para unirse, validaciones (nickname único, max participantes, estado). Persiste participant_id en cookie/localStorage. Soporta ghost y usuario logueado. Maneja estados esperando y votando. UI en español, mobile first.
```
