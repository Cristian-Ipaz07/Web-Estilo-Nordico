# PLAN DE ACCIÓN FASE 2: TIENDA WEB ESTILO NÓRDICO (INTEGRACIÓN ERP & CARRITO WHATSAPP)

> **Rol del Agente en esta ventana**: Arquitecto & Desarrollador Web Astro/Frontend.
> **Misión**: Integrar la tienda web con la API del ERP, agregar carrito de compras multi-producto con checkout por WhatsApp y protección de stock en tiempo real.
> **Stack**: Astro 5+, Tailwind CSS, TypeScript, Vercel.

---

## 1. OBJETIVOS CLAVE DE ESTA FASE
1. **Desacoplar Notion y datos estáticos**: Consumir chaquetas, perfumes y relojes directamente desde `http://localhost:8000/api/public/products`.
2. **Carrito Multi-Producto**: Permitir que el cliente agregue varias prendas/perfumes y cierre su pedido completo en un solo mensaje de WhatsApp.
3. **Protección de Stock en Vivo (SSG Híbrido)**:
   - Mantener la web en SSG (ultrarrápida y sin caídas).
   - Micro-chequeo con `/api/public/stock-check/{id}`: Si una prenda está apartada o en domicilio, mostrar badge *"🟡 En proceso de entrega"* o deshabilitar botón.
4. **Deploy Hooks**: Configurar webhook para que cuando se agregue un producto en el ERP, Vercel haga build automático.

---

## 2. CHECKLIST DE EJECUCIÓN

### [ ] PASO 1: Crear Servicio de API del ERP (`src/lib/erpApi.ts`)
- Configurar variable de entorno `PUBLIC_ERP_API_URL`.
- Métodos tipados para:
  - `getProducts({ product_type, in_stock })`
  - `getProductBySlug(slug)`
  - `checkStock(productId)`

### [ ] PASO 2: Carrito de Compras Multi-Producto con WhatsApp Checkout
- Crear componente interactivo (isla de Astro o React):
  - Botón flotante de carrito con contador de artículos.
  - Modal o drawer lateral con lista de productos elegidos, tallas, precios y subtotal.
  - Botón principal: **"Comprar pedido por WhatsApp"**.
  - Formato del mensaje de WhatsApp generado:
    ```
    ¡Hola Estilo Nórdico! Quiero hacer este pedido:
    - 1x Chaqueta Rompevientos (Talla L) - $130.000
    - 1x Perfume Asad Lattafa (100ml) - $150.000
    Total: $280.000
    Ciudad: Pasto
    ¿Tienen disponible para envío a domicilio?
    ```
  - Disparar evento de Meta Pixel: `InitiateCheckout` con el total del carrito.

### [ ] PASO 3: Migrar Páginas de Categorías
- Actualizar `src/pages/chaquetas/index.astro`, `perfumes/index.astro`, `relojes/index.astro` para consumir del ERP.
- Retirar completamente las dependencias de Notion API y `src/data/products.ts`.

### [ ] PASO 4: Micro-Chequeo de Stock en Tiempo Real
- En las páginas de detalle (`[slug].astro`):
  - Consultar en tiempo real si el producto está disponible o apartado.
  - Si el stock es 0 o está apartado, mostrar aviso visual claro *"🟡 Reservado / En proceso de entrega"* para evitar falsas expectativas al cliente.

### [ ] PASO 5: Build y Validación en Vercel
- Ejecutar `npm run build` para asegurar cero errores de TypeScript y empaquetado perfecto.

---

## 3. PROMPT DE INICIO EN ESTA VENTANA:
> *"Jarvis, lee `PLAN_FASE_WEB.md` y `AGENTS.md`. Vamos a implementar el carrito multi-producto con checkout a WhatsApp y conectar el catálogo a la API pública del ERP. Comienza por `src/lib/erpApi.ts` y el componente de carrito."*
