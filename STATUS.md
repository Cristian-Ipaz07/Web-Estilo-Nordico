# ESTADO EN VIVO: NODO TIENDA WEB (ESTILO NÓRDICO)
> Última actualización: 2026-10-20 | Integración Catálogo Completo Camisetas Streetwear + Regla de Retiro Automático de Prendas Vendidas (Stock <= 0)

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

## 🚀 HITOS RECIENTES (SESIÓN 20 OCTUBRE 2026)
### 1. Regla de Inventario Estricta: Retiro Automático de Prendas Vendidas (Stock <= 0)
- **Principio**: En Estilo Nórdico, las únicas prendas perennes de inventario continuo son las Chaquetas 5080 y 5081 (que admiten sobrepedido de fábrica).
- **Prendas Únicas de Confección (Camisetas, Busos, Conjuntos, etc.)**: En cuanto su stock llega a 0, desaparecen automáticamente del catálogo (`/chaquetas`), de los filtros y de los selectores de modelos para evitar mostrar piezas no disponibles.
- **Página 404 CRO Personalizada**: Si un usuario accede a un enlace histórico o compartido de una pieza ya vendida, la página le explica amablemente que la prenda exclusiva ya fue vendida y le ofrece accesos directos al catálogo disponible y asesoría por WhatsApp.

### 2. Integración de Camisetas Streetwear Multimarca
- **50 variantes reales cargadas**: Americanino, Chevignon, Dolce & Gabbana, Lacoste, Boss, Diesel, Moncler, Clemont, Essentials, Monastery, Superdry, IBK Oversize, Karl y Nike.
- **Nomenclatura Limpia**: Títulos formateados automáticamente como `Camiseta · [Marca] [Color]` con talla exacta.
- **Paginación Automática de la API ERP**: Lectura fluida de todos los productos del backend sin corte de límite.
### 1. Integración de Busos Oversize Izan (Ref 3708)
- **Extracción Automática desde el ERP Cloud**: 6 variantes reales (Awesome Blanco M, Deadly Blanco L/M, King Negro M, PureSoul Negro S/M) con fotos en alta definición en Supabase Storage, precio de $140.000 COP y stock de 1 unidad por variante.
- **Nomenclatura Limpia**: Eliminación de nombres hardcodeados. El nombre respeta la colección del producto padre (`Buso Izan · Awesome Blanco`, `Buso Izan · Deadly Blanco`, etc.).
- **Aliases de Acceso Directo y Redirección**: Rutas `/chaquetas/buso-3708`, `/chaquetas/3708`, `/chaquetas/buso-izan` redirigen a la ficha con HTTP 200 sin riesgo de 404.
- **Selector de Diseños de la Colección**: Dentro de la ficha de producto se despliegan en miniatura todas las piezas hermanas de la misma colección para alternar diseño y talla con 1 clic.

## 🚀 HITOS ANTERIORES (SESIÓN 19 OCTUBRE 2026)
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

### 4. Separación Estricta de Departamentos (Hombre vs Mujer — Auditoría Arquitectónica)
- **Desacople Visual y Filtros por Género**: Se erradicó la mezcla de prendas masculinas y femeninas en el catálogo `/chaquetas`.
- **Tabs y Selectores Dinámicos**: Pestañas de acceso rápido (`👔 Colección Hombre`, `👗 Colección Mujer`) y selector desplegable que filtra en milisegundos en el DOM y sincroniza con el Hero Banner y meta-etiquetas.
- **Enrutamiento Limpio y Enlaces de Campaña**: Parámetros `?genero=mujer` y `?genero=hombre` adaptan el título, subtítulo e inventario visible en tiempo real.
- **Segmentación de Chaquetas**: Ref 5080 (Hombre: The North Face / Columbia) vs Ref 5081 (Mujer: Columbia y The North Face en 8 tonos femeninos: Azul, Beige, Blanco, Lila Pastel, Negro, Palo de Rosa, Verde Menta, Rojo).

### 5. Piezas Únicas de Confección & Busos Mónaco (Ref 30861)
- **Modelado Unitario**: Cada variante de buso representa una prenda exclusiva con stock unitario (`stock: 1`).
- **Foto Real y Talla Exacta**: Cada pieza se renderiza como producto independiente con su fotografía real de confección, marca (Nike, Puma, Tommy, Calvin Klein, Paris Atelier, Redefine, etc.) y talla real (M, L, XL, XXL).

### 6. Despliegue de Conjuntos Importados (Ref 1326 — 20 Octubre)
- **Lanzamiento Exclusivo Online**: Integración de 4 conjuntos importados de alta gama (Chaqueta con cremallera + Pantalón/Sudadera a $170.000 COP) desglosados en el ERP y publicados en la web:
  - *Conjunto Importado · Dsquared2 Gris* (Talla L, 3 fotos Supabase Storage)
  - *Conjunto Importado · Louis Vuitton Blanco* (Talla XL, 3 fotos Supabase Storage)
  - *Conjunto Importado · Under Armour Azul* (Talla XL, 3 fotos Supabase Storage)
  - *Conjunto Importado · Under Armour Negro Rojo* (Talla M, 3 fotos Supabase Storage)
- **Chip Táctil Móvil**: Agregado `🏃 Conjuntos` (`/chaquetas?tipo=conjunto`) en `CategoryChips.astro`.
- **Filtros y URLs Compatibles**: Selector de tipo incluye `Conjuntos Importados`. Rutas y aliases creados en Astro: `/chaquetas/conjuntos`, `/chaquetas/1326`, `/chaquetas/conjunto-1326`.
- **Ficha de Producto Adaptada**: `ProductPage.astro` detecta `isConjunto` para ajustar unidades ("Conjunto" / "Conjuntos"), especificaciones de chaqueta + pantalón y garantía directa en Pasto.

### 7. Compilación Estática Masiva & Despliegue Vercel
- **Build SSG**: Compilación de **108 páginas estáticas** completada en 2m 46s con 0 errores.
- **Sincronización Git**: Commit `03ef409` subido a `origin/main` en GitHub, disparando auto-deploy en Vercel (`web-estilo-nordico.vercel.app`).
- **Conexión con Catálogo de Asesores**: Totalmente compatible con los links generados desde `AdvisorCatalog.jsx` del ERP.

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
