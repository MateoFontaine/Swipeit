# Migraciones Supabase — Swipeit

Las migraciones SQL viven en `supabase/migrations/` y deben aplicarse **en orden** sobre tu proyecto de Supabase.

## Archivos

| Archivo | Contenido |
|---------|-----------|
| `20250608000000_profiles.sql` | Tabla `profiles`, RLS y trigger de registro (Fase 02) |
| `20250608100000_polls.sql` | Tablas `polls`, `poll_options`, `participants`, `votes`, RLS y validación de `max_participants` (Fase 03) |

## Opción A — SQL Editor (recomendado sin CLI)

1. Abrí tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Andá a **SQL Editor** → **New query**.
3. Copiá y ejecutá el contenido completo de cada archivo de migración, **en este orden**:
   - `20250608000000_profiles.sql` (si aún no lo aplicaste)
   - `20250608100000_polls.sql`
4. Verificá en **Table Editor** que existan las tablas: `profiles`, `polls`, `poll_options`, `participants`, `votes`.
5. En **Authentication → Policies**, confirmá que RLS esté habilitado en todas las tablas públicas.

### Verificación rápida en SQL Editor

```sql
-- Tablas creadas
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'polls', 'poll_options', 'participants', 'votes');

-- RLS activo
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('polls', 'poll_options', 'participants', 'votes');

-- Trigger de max_participants
select tgname
from pg_trigger
where tgname = 'enforce_max_participants';
```

### Probar max_participants

```sql
-- Crear encuesta de prueba (reemplazá HOST_UUID por un auth.users.id real)
insert into public.polls (host_id, title, max_participants)
values ('HOST_UUID', 'Test max', 2);

-- Unir 2 participantes → OK
insert into public.participants (poll_id, nickname)
select id, 'user1' from public.polls where title = 'Test max';
insert into public.participants (poll_id, nickname)
select id, 'user2' from public.polls where title = 'Test max';

-- Tercer participante → debe fallar
insert into public.participants (poll_id, nickname)
select id, 'user3' from public.polls where title = 'Test max';
-- ERROR: Se alcanzó el máximo de participantes (2)
```

## Opción B — Supabase CLI

Si tenés la [Supabase CLI](https://supabase.com/docs/guides/cli) instalada y el proyecto vinculado:

```bash
# Vincular proyecto (una vez)
supabase link --project-ref TU_PROJECT_REF

# Aplicar migraciones pendientes
supabase db push
```

Para desarrollo local con Supabase local:

```bash
supabase start
supabase db reset   # aplica todas las migraciones desde cero
```

## Funciones auxiliares (acceso por link)

Las políticas RLS no exponen todas las encuestas al público. Para leer una encuesta por su link, usá las funciones RPC:

```typescript
// Obtener encuesta por token del link
const { data: poll } = await supabase.rpc("get_poll_by_share_token", {
  p_token: token,
});

// Obtener opciones de la encuesta
const { data: options } = await supabase.rpc("get_poll_options_by_share_token", {
  p_token: token,
});
```

## Regenerar tipos TypeScript (opcional)

Con la CLI vinculada al proyecto remoto:

```bash
supabase gen types typescript --linked > types/database.generated.ts
```

Los tipos manuales en `types/database.ts` ya reflejan el schema actual; regenerá solo si cambiás el schema y querés sincronizar automáticamente.
