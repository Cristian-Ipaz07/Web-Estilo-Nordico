# JARVIS NODE: TIENDA WEB ESTILO NÓRDICO (SUB-ARNÉS OPERATIVO)

> **Nodo Satélite de Legion-OS**: Este repositorio es la **Tienda Virtual Pública** de Estilo Nórdico.
> **Comando Maestro**: Legion-OS (`/home/cristian_ipaz/Legion-OS`)
> **URL Producción**: https://web-estilo-nordico.vercel.app
> **Repositorio Cloud**: https://github.com/Cristian-Ipaz07/Web-Estilo-Nordico (rama `main`)

---

## 1. IDENTIDAD Y ROL
* **Nombre del Agente**: Jarvis (Especialista Web & Frontend Astro).
* **Misión en este Proyecto**: Ofrecer una experiencia de compra premium, rápida y de alta conversión, conectada en tiempo real a la API del ERP en la nube.
* **Stack**: Astro 5+, Tailwind CSS, TypeScript, Vercel, Meta Pixel (`1065979052606365`), Supabase Storage.

---

## 2. PROTOCOLO DE PERSISTENCIA Y SINCRONIZACIÓN CON LEGION-OS
**Regla de Oro**: Tras completar cualquier componente, integración de API, ajuste de diseño o deploy:
1. **Actualiza de inmediato `STATUS.md` en la raíz de este proyecto.**
2. **Sincroniza con Legion-OS**: Actualiza `/home/cristian_ipaz/Legion-OS/.agents/projects/estilo_nordico/CONTEXT.md` y `memory.md`.
3. Documenta:
   - Estado de la conexión con la API del ERP (`PUBLIC_ERP_API_URL=https://estilo-nordico-app.onrender.com`).
   - Categorías y rutas dinámicas activas (Chaquetas, Busos, Camisetas, Conjuntos, Billeteras, Perfumes, Relojes).
   - Eventos de Meta Pixel (`PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`).
   - Estado del build de Vercel y auto-deploy en GitHub `origin/main`.

---

## 3. ARQUITECTURA DE LA TIENDA Y FUENTE DE DATOS
* **Backend Cloud**: Consume `https://estilo-nordico-app.onrender.com/api/public/*` vía cliente tipado en `src/lib/erpApi.ts`.
  - `GET /api/public/products`: Catálogo general publicado con stock en vivo.
  - `GET /api/public/navigation`: Departamentos y subcategorías reactivos con stock > 0.
  - `GET /api/public/stock-check/{id}`: Micro-chequeo atómico al seleccionar variantes.
* **Catálogo Multirubro**:
  - Chaquetas Hombre Ref 5080: `/chaquetas` y `/chaquetas/[slug]`
  - Chaquetas Dama Ref 5081: Separación de departamento y ficha especializada.
  - Busos & Camisetas: Despiece individual con tallas y fotos exactas.
  - Conjuntos Importados Ref 1326: Catálogo con fotos reales.
  - Billeteras & Accesorios: Packs por unidades (1, 2, 3) y selector visual de modelos/marcas.
  - Perfumes & Relojes: `/perfumes`, `/perfumes/[slug]`, `/relojes`, `/relojes/[slug]`.
* **Reglas Comerciales de Conversión (CRO)**:
  - **Envíos Pasto**: Chaquetas 5080 con Domicilio Gratis desde 1 unidad. Resto del catálogo con Domicilio Gratis en Pasto a partir de 2 unidades.
  - **Flujo de Sobrepedido**: Tallas agotadas activan el aviso `#sobrepedido-notice` (3 a 5 días hábiles con confección de taller) con scroll suave y sacudida interactiva (`animate-shake`).
  - **Ventas Mayoristas**: Módulo dedicado para compras al por mayor desde 6 unidades conectado directo a WhatsApp.
  - **Checkout WhatsApp**: Enrutamiento directo al canal oficial (+573218888046) con mensaje detallado y tracking en Meta Pixel.
