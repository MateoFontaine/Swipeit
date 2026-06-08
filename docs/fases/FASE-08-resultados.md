# Fase 08 — Resultados, ballotage y vista host

**Objetivo:** Calcular ganador, mostrar ranking completo, manejar empates con ballotage, y dar al host vista en vivo de la encuesta.

**Prerequisitos:** Fases 01–07 completadas.

---

## Entregables

- [ ] Función `calculateResults(pollId)` — cuenta "sí" por opción (round actual)
- [ ] Pantalla resultados para participantes: ranking con barras o lista numerada
- [ ] **Ballotage:** si hay empate en el máximo de "sí" → status `ballotage`, solo opciones empatadas, round 2
- [ ] Tras ballotage: ganador único o empate final (mostrar empatados)
- [ ] **Vista host en vivo** (`/dashboard/encuesta/[id]`):
  - Participantes conectados / total
  - Quién ya votó (nickname)
  - Conteo parcial de "sí" por opción (solo host)
- [ ] Status final → `resultados` luego `cerrado`

---

## Lógica de ganador

```
1. Contar sí por opción (round 1)
2. max_votes = mayor cantidad
3. winners = opciones con max_votes
4. Si winners.length > 1:
     → status = ballotage
     → participantes votan solo esas opciones (round 2, mismo swipe UI)
5. Si winners.length === 1:
     → mostrar ganador + ranking completo
```

---

## Ranking UI

```
🥇 Pizza — 4 votos
🥈 Sushi — 3 votos
🥉 Ensalada — 1 voto
```

Mostrar nicknames de quien votó "sí" a cada opción (según spec: no anónimo).

---

## Vista host en vivo

| Dato | Visible para host |
|------|-------------------|
| Lista participantes | ✅ |
| Quién votó | ✅ |
| Votos parciales por opción | ✅ |
| Votos individuales (quién votó qué) | ✅ (opcional detalle) |

Participantes **no** ven resultados parciales hasta cierre.

---

## Realtime (opcional)

Si se implementa Supabase Realtime:
- Subscribe a `votes` y `participants` para actualizar vista host sin refresh

Si no: polling cada 5s en vista host.

---

## Verificación

- [ ] Ranking correcto con votos de prueba
- [ ] Empate dispara ballotage
- [ ] Ballotage resuelve ganador
- [ ] Host ve progreso en vivo

---

## Checklist de aceptación

- [ ] Resultados visibles para todos al cerrar
- [ ] Ballotage funciona end-to-end
- [ ] Vista host útil y en español
- [ ] Poll pasa a `cerrado` al finalizar

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 08 (docs/fases/FASE-08-resultados.md).

Implementa cálculo de resultados y ranking completo. Si hay empate en el top, activar ballotage (round 2) con las opciones empatadas. Pantalla de resultados para participantes. Vista host en vivo con participantes, quién votó y conteo parcial. Usar polling o Supabase Realtime. Status resultados → cerrado.
```
