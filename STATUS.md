# ESTADO EN VIVO: NODO TIENDA WEB (ESTILO NÓRDICO)
> Última actualización: 2026-10-19 | Ficha Universal Omnicanal (Billeteras, Busos, Chaquetas) + Promo Domicilio Gratis (2+ Prendas)

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

## 🚀 HITOS RECIENTES (SESIÓN 19 OCTUBRE 2026)
### 1. Ficha de Producto Universal y Dinámica (`ProductPage.astro`)
- **Adaptabilidad a Toda Prenda o Accesorio**: La plantilla se desacopló del diseño rígido de Chaquetas. Detecta dinámicamente si el producto es Chaqueta, Billetera, Buso, Camiseta, Gorra, Perfume o Reloj.
- **Nomenclatura Dinámica de Unidades y Packs**:
  - `1 Unidad` / `1 Billetera` / `1 Chaqueta` (con precio individual).
  - `2 Unidades` / `2 Billeteras` (Dúo con **¡DOMICILIO GRATIS EN PASTO!**).
  - `3 Unidades` / `3 Billeteras` (Ahorro Máximo + Domicilio Gratis).
- **Selector de Diseños y Modelos**: Para referencias con variantes de marca o diseño (ej. Billetera 8270: Lacoste, Nike, Puma, Tommy, Adidas), el cliente puede seleccionar el diseño directamente en píldoras visuales y la foto principal cambia en tiempo real a la foto exacta del diseño.
- **Limpieza de Tallas para Accesorios**: Productos sin tallas (billeteras, correas, relojes) ya no muestran advertencias de "Horma reducida 😉", tablas de medidas `63x53 cm` ni bloqueos de formulario al agregar al carrito o pedir por WhatsApp.
- **Garantías y Reseñas Reales**: Reseñas verificadas adaptadas a la categoría y respaldo en punto físico de Pasto (Manzana G3 Casa 14, Nueva Aranda).

### 2. Política de Envíos y Domicilio Gratis (Pasto y Nacional)
- **Chaquetas Ref 5080**: Conservan su beneficio exclusivo de Domicilio Gratis en Pasto desde 1 unidad.
- **Demás Productos (Billeteras, Busos, Camisetas, etc.)**: 1 unidad tiene envío estándar contraentrega en Pasto, y a partir de **2 o más unidades se activa automáticamente la promoción de DOMICILIO GRATIS EN PASTO**.
- **Mensaje de WhatsApp Enriquecido**: Especifica con total precisión el producto, modelo elegido, pack seleccionado y el beneficio de envío aplicable.

### 3. Agrupación Inteligente por Referencia (`erpApi.ts`)
- **Unificación de Variantes y Fotos**: Las variantes del ERP se asocian bajo la referencia base (`refBase`), reuniendo todas las fotos subidas a las variantes en una sola galería de alta calidad alojada en Supabase Storage.
- **Alias de Slugs**: Soporte para `/chaquetas/billetera-8270` y retrocompatibilidad con `/chaquetas/billetera-8270-unicolor`.

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

---

## 🚀 FASE 3: OPTIMIZACIÓN CRO, SOBREPEDIDO Y VENTAS AL POR MAYOR (Actualizado 2026-10-15)
- [x] **Selector de Tallas Estándar Ref 5080**: Normalizado estrictamente a `M`, `L`, `XL`, `XXL`. Se filtró el registro padre nulo/vacío eliminando la aparición errónea de "Única Sobrepedido".
- [x] **Flujo Guiado de Sobrepedido (3 a 5 Días)**:
  - Cuando el usuario toca una talla agotada, la interfaz muestra dinámicamente un banner informativo dorado indicando que la confección en taller tarda **de 3 a 5 días hábiles** en llegar a su puerta (con Domicilio Gratis en Pasto o envíos nacionales).
  - La pantalla realiza un desplazamiento suave (`scrollIntoView`) hacia el botón de WhatsApp abajo y ejecuta una animación de movimiento/sacudida (`animate-shake`) para que el cliente entienda de inmediato el cambio de estado.
  - Al seleccionar una talla disponible con stock físico, el aviso desaparece automáticamente.
  - El mensaje predeterminado de WhatsApp detalla el tiempo estimado de 3 a 5 días hábiles y el encargo de fábrica.
- [x] **Módulo de Ventas al Por Mayor (Exclusivo Chaqueta 5080)**:
  - Tarjeta oscura con detalles dorados y badge *"Ventas Mayoristas • Desde 6 unidades"*.
  - Botón CTA directo a WhatsApp con mensaje pre-rellenado para solicitar catálogo mayorista, cantidades mínimas y condiciones de envío para tiendas/revendedores.
- [x] **Sincronización en la Nube (GitHub)**:
  - Repositorio oficial creado y publicado en `https://github.com/Cristian-Ipaz07/Web-Estilo-Nordico`.
  - Rama `main` sincronizada con `origin/main` (340 objetos subidos).
