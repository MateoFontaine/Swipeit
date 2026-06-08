# Fase 10 — API de imágenes y deploy

**Objetivo:** Imágenes automáticas por texto de opción y app desplegada en Vercel con Supabase en producción.

**Prerequisitos:** Fases 01–09 completadas.

---

## Entregables

- [ ] Integración API de imágenes (Unsplash o Pexels)
- [ ] Al crear opción: buscar imagen por keyword del texto → guardar `image_url`
- [ ] Fallback: imagen genérica por categoría o gradiente con inicial
- [ ] Cache de URLs en `poll_options.image_url` (no llamar API en cada render)
- [ ] Deploy en Vercel con env vars de producción
- [ ] Supabase redirect URLs configuradas para prod
- [ ] Smoke test del flujo completo en producción

---

## API de imágenes

### Flujo
```
texto "Pizza napolitana"
  → extraer keyword principal ("pizza")
  → GET /search/photos?query=pizza
  → guardar urls.regular en poll_options.image_url
```

### Implementación
- Server Action o API Route `/api/image` para no exponer API key en cliente
- Env: `UNSPLASH_ACCESS_KEY` o `PEXELS_API_KEY`
- Rate limit: cache agresivo, solo al crear encuesta

### Fallback
```tsx
// Si API falla: gradiente + emoji o inicial
<div className="bg-gradient-to-br from-pink-500 to-orange-400">
  {text[0].toUpperCase()}
</div>
```

---

## Deploy Vercel

1. Push repo a GitHub
2. Import en Vercel
3. Env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `UNSPLASH_ACCESS_KEY` (server only)
4. Supabase → Authentication → URL Configuration:
   - Site URL: `https://tu-app.vercel.app`
   - Redirect URLs: `https://tu-app.vercel.app/**`

---

## Pulido final

- [ ] Favicon y metadata (title, description, OG image)
- [ ] Loading states y skeletons
- [ ] Error boundaries amigables
- [ ] 404 y páginas de error en español
- [ ] Revisión responsive final (iPhone SE + desktop)

---

## Verificación producción

- [ ] Crear encuesta → opciones tienen imagen
- [ ] Compartir link → otro dispositivo puede unirse y votar
- [ ] Magic link funciona con URL de producción
- [ ] Resultados y ballotage OK en prod

---

## Checklist de aceptación

- [ ] App live en Vercel
- [ ] Imágenes automáticas funcionando
- [ ] Fallback si API falla
- [ ] Flujo E2E completo en producción

---

## Prompt para ejecutar esta fase

```
Estamos desarrollando Swipeit. Lee docs/SPEC.md y ejecuta la Fase 10 (docs/fases/FASE-10-imagenes-deploy.md).

Integra API de imágenes (Unsplash o Pexels) para asignar image_url automáticamente al crear opciones. API route server-side con fallback visual. Deploy en Vercel con variables de entorno. Configura Supabase auth URLs para producción. Pulido final: favicon, metadata, loading states, errores en español. Verifica flujo E2E en producción.
```
