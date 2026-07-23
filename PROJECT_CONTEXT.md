# 📋 PROJECT_CONTEXT.md — Estilo Nórdico

> **⚠️ LEE ESTO PRIMERO**: Este archivo contiene el contexto maestro del proyecto. Debe leerse al inicio de cada sesión de desarrollo para mantener la continuidad y no estropear avances.

## Identidad del Negocio

- **Nombre**: Estilo Nórdico
- **Ubicación**: San Juan de Pasto, Nariño, Colombia
- **Modelo actual**: Tienda física local con ropa y accesorios
- **Visión**: Convertirse en un centro comercial digital — el e-commerce del siglo XXI
- **Propietario**: Desarrollador con conocimientos en programación, web dev y Shopify (estudiante UNAD)

## Modelo de Conversión

- **Canal de cierre**: WhatsApp (`+573218888046`)
- **Flujo**: El usuario navega productos estáticos → clic "Pedir por WhatsApp" → se abre WhatsApp con mensaje pre-llenado → cierre manual del pedido → entrega contraentrega (COD) en Pasto
- **NO hay carrito de compras tradicional** en esta fase
- **NO hay pasarela de pago** en esta fase

## Productos Actuales

### Producto Gancho
- **Chaqueta Impermeable** — $90.000 COP (ancla $150.000)
- Combo chaqueta + perfume Yanbal: $130.000 COP con envío gratis en Pasto

### Categorías
1. **Chaquetas** — Producto estrella (impermeables, cortavientos, bombers). Inventario gestionado desde **Notion**
2. **Perfumes** — Cross-selling (catálogo Ésika, Yanbal, Avon, Cyzone, Natura). Datos estáticos en `products.ts`
3. **Relojes** — Multiplicador de ticket (~5 modelos). Datos estáticos en `products.ts`

## Ecosistema de Proyectos Existentes

| Proyecto | Ubicación | Rol |
|---|---|---|
| **Web-Estilo-Nordico** | `/proyectos/Web-Estilo-Nordico` | Tienda e-commerce (Astro + Tailwind) — **ESTE PROYECTO** |
| **nordic-style-catalog** | `/Legion-OS/proyectos/estilo-nordico/nordic-style-catalog` | Catálogo interno de chaquetas (TanStack + React + Notion) |
| **estilo-nordico-app** | `/proyectos/estilo-nordico-app` | POS interno (FastAPI + React + PostgreSQL) |

### Conexión con Notion
- **Base de datos**: "Inventario de Chaquetas" (ID: `396bbb90-088e-815d-bc1f-c6894f88bf9f`)
- **Propiedades**: Código/Referencia, Color (8 colores), Talla (M/L/XL/XXL), Stock Disponible (fórmula), Estado (fórmula)
- **32 referencias**, ~21 disponibles
- **Token de Notion**: Configurar en `.env` como `NOTION_TOKEN`
- El propietario actualiza inventario desde Notion (celular/web)

## Stack Técnico (Fase 1)

| Tecnología | Versión | Rol |
|---|---|---|
| Astro | 5.x / 7.x | Framework SSG (Static Site Generator) |
| Tailwind CSS | 4.x | Utilidades de estilo |
| TypeScript | 5.x | Tipado de datos y componentes |
| Notion API | v2022-06-28 | Fuente de datos para chaquetas (build-time) |
| Vercel/Netlify | - | Hosting gratuito (deploy futuro) |

## Configuración Clave

- **WhatsApp**: `573218888046` (sin +, sin espacios)
- **Píxel de Meta**: `TU_PIXEL_ID_REAL` (placeholder — actualizar cuando se obtenga)
- **Notion Token**: En `.env` (no commitear)
- **Notion DB ID**: En `.env`

## Reglas de Desarrollo

1. **Performance first**: Apuntar a 100/100 en Lighthouse
2. **Mobile-first**: Los usuarios de Pasto acceden desde datos móviles
3. **Español colombiano**: Todo el contenido en español, jerga natural de Pasto/Colombia
4. **Sin JS innecesario**: Aprovechar la arquitectura de islas de Astro
5. **Chaquetas desde Notion**: Se consultan en build-time, se generan como HTML estático
6. **Perfumes y relojes estáticos**: Se definen en `src/data/products.ts`
7. **Configuración centralizada**: Todo en `src/config/store.ts`
8. **Product pages**: Los productos publicitados deben tener página individual con URL propia

## Archivos de Contexto

| Archivo | Propósito |
|---|---|
| `PROJECT_CONTEXT.md` | **Este archivo** — Contexto maestro |
| `ROADMAP.md` | Hoja de ruta de 3 fases |
| `PHASE_1_STATUS.md` | Estado y progreso de la fase actual |

## Imágenes de Productos

- **Chaquetas**: Fotos reales por color (azul, beige, gris claro, gris ratón, negro, rojo, verde) — migrar desde `nordic-style-catalog/public/`
- **Perfumes y Relojes**: Imágenes generadas por IA como placeholder. El propietario tiene PNGs reales en fondo blanco
- Para reemplazar: colocar en `public/assets/products/`, actualizar rutas en `products.ts`, rebuild
