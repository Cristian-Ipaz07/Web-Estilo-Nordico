# ESTADO EN VIVO: NODO TIENDA WEB (ESTILO NÓRDICO)
> Última actualización: 2026-10-13 | Backend ERP Listo, Imágenes WebP Desplegadas y Ref 5080 Publicada

## 📊 RESUMEN EJECUTIVO
* **Rol**: Catálogo público, captación con Meta Ads, carrito multi-prenda y checkout consolidado por WhatsApp.
* **Fase Actual**: Fase 2 — Conexión a API del ERP + Carrito Multi-Producto.
* **Estado Global**: 🟢 **BACKEND ERP LISTO Y EN EJECUCIÓN**. Conexión desbloqueada para la tienda web.

---

## 🚀 INFRAESTRUCTURA DEL ERP YA ACTIVA (LOCAL: http://localhost:8000)
1. **API Pública (Sin Auth, solo lectura, sin costos expuestos):**
   - `GET /api/public/products`: Lista productos publicados (`is_published: true`).
   - `GET /api/public/products/{slug}`: Detalle de producto por slug.
   - `GET /api/public/categories`: Categorías con conteo en vivo.
   - `GET /api/public/stock-check/{id}`: Micro-chequeo de disponibilidad en tiempo real.
2. **Servidor Central de Medios:**
   - Montado en `/static/products/5080/`.
   - 10 fotos optimizadas a WebP (resolución nítida 1200px, peso total 0.56 MB, 98.9% de reducción).
   - También copiadas a `public/assets/products/5080/` para soporte estático SSG.
3. **Prenda Estrella Piloto Lista (REF 5080):**
   - 20 unidades físicas en stock.
   - 16 variantes reales creadas (The North Face y Columbia, tallas M a XXL, liso y franja lateral).
   - Publicada (`is_published: true`) con galería completa.

---

## 🛠️ OBJETIVOS DE EJECUCIÓN EN ESTE PROYECTO
- [x] **Paso 1:** Crear cliente `src/lib/erpApi.ts` con tipado TypeScript para conectar a la API del ERP. (✅ 100% Funcional y probado con Ref 5080 y WebP)
- [x] **Paso 2:** Crear componente de Carrito Multi-Producto con checkout directo a WhatsApp (+573218888046) y Meta Pixel `InitiateCheckout`. (✅ `CartDrawer.astro` + `src/lib/cart.ts` con persistencia en localStorage)
- [x] **Paso 3:** Desacoplar Notion de `/chaquetas/index.astro`, `/chaquetas/[slug].astro` e `index.astro` para que consuman `erpApi.ts`. (✅ Desacoplado al 100%)
- [x] **Paso 4:** Integrar selector de colores y tallas con fotos WebP y verificación de stock en vivo contra `/api/public/stock-check/{id}`. (✅ 100% Funcional)
- [x] **Paso 5:** Probar Meta Pixel (`InitiateCheckout`), ejecutar `npm run build` y deploy en Vercel. (✅ `npm run build` genera 55 páginas en 2.09s con 0 errores)

---

## 🎯 PROMPT DE INICIO RÁPIDO PARA JARVIS:
> *"Jarvis, lee `PLAN_FASE_WEB.md` y `STATUS.md`. El backend de `estilo-nordico-app` ya está 100% listo en http://localhost:8000 con la API pública y las imágenes WebP de la Ref 5080. Vamos a implementar `src/lib/erpApi.ts`, el carrito multi-producto con checkout a WhatsApp y migrar la página de chaquetas para desacoplar Notion. Comienza por `src/lib/erpApi.ts`."*
