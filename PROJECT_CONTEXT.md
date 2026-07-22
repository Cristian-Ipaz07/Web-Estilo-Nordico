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
1. **Chaquetas** — Producto estrella (impermeables, cortavientos, bombers)
2. **Perfumes** — Cross-selling (catálogo Ésika, Yanbal, Avon)
3. **Relojes** — Multiplicador de ticket

## Stack Técnico (Fase 1)

| Tecnología | Versión | Rol |
|---|---|---|
| Astro | 5.x | Framework SSG (Static Site Generator) |
| Tailwind CSS | 4.x | Utilidades de estilo |
| TypeScript | 5.x | Tipado de datos y componentes |
| Vercel/Netlify | - | Hosting gratuito (deploy futuro) |

## Configuración Clave

- **WhatsApp**: `573218888046` (sin +, sin espacios)
- **Píxel de Meta**: `TU_PIXEL_ID_REAL` (placeholder — actualizar cuando se obtenga)
- **Dominio**: Por definir (deploy en Vercel/Netlify)

## Reglas de Desarrollo

1. **Performance first**: Apuntar a 100/100 en Lighthouse
2. **Mobile-first**: Los usuarios de Pasto acceden desde datos móviles
3. **Español colombiano**: Todo el contenido en español, jerga natural de Pasto/Colombia
4. **Sin JS innecesario**: Aprovechar la arquitectura de islas de Astro
5. **Datos estáticos**: Los productos se definen en `src/data/products.ts`
6. **Configuración centralizada**: Todo en `src/config/store.ts`

## Archivos de Contexto

| Archivo | Propósito |
|---|---|
| `PROJECT_CONTEXT.md` | **Este archivo** — Contexto maestro |
| `ROADMAP.md` | Hoja de ruta de 3 fases |
| `PHASE_1_STATUS.md` | Estado y progreso de la fase actual |

## Imágenes de Productos

Las imágenes actuales son **generadas por IA** como placeholders. El propietario tiene PNGs reales en fondo blanco (de su tienda anterior en Shopify). Para reemplazarlas:

1. Colocar las imágenes en `public/assets/products/`
2. Actualizar las rutas en `src/data/products.ts`
3. Rebuild: `npm run build`
