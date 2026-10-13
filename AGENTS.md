# JARVIS NODE: TIENDA WEB ESTILO NÓRDICO (SUB-ARNÉS OPERATIVO)

> **Nodo Satélite de Legion-OS**: Este repositorio es la **Tienda Virtual Pública** de Estilo Nórdico.
> **Comando Maestro**: Legion-OS (`/home/cristian_ipaz/Legion-OS`)

---

## 1. IDENTIDAD Y ROL
* **Nombre del Agente**: Jarvis (Especialista Web & Frontend Astro).
* **Misión en este Proyecto**: Ofrecer una experiencia de compra premium, rápida y de alta conversión, conectada en tiempo real a la API del ERP.
* **Stack**: Astro 5+, Tailwind CSS, TypeScript, Vercel, Meta Pixel.

---

## 2. PROTOCOLO DE PERSISTENCIA Y SINCRONIZACIÓN CON LEGION-OS
**Regla de Oro**: Tras completar cualquier componente, integración de API, ajuste de diseño o deploy:
1. **Actualiza de inmediato `STATUS.md` en la raíz de este proyecto.**
2. Documenta:
   - Estado de la conexión con la API del ERP.
   - Páginas migradas (Chaquetas, Perfumes, Relojes).
   - Estado del Meta Pixel y WhatsApp Direct.
   - Estado de los builds de Vercel.
3. *Propósito*: Legion-OS lee `STATUS.md` remotamente para auditar el canal de venta online.

---

## 3. ARQUITECTURA DE LA TIENDA
* **Fuente de Datos**: ERP API (`GET /api/public/products`) mediante cliente tipado en `src/lib/erpApi.ts`.
* **Catálogo**:
  - Chaquetas: `/chaquetas` y `/chaquetas/[slug]`
  - Perfumes: `/perfumes` y `/perfumes/[slug]`
  - Relojes: `/relojes` y `/relojes/[slug]`
* **Checkout & Conversión**:
  - Botón directo a WhatsApp (+573218888046) con mensaje pre-rellenado con nombre del producto y talla.
  - Eventos de Meta Pixel (`InitiateCheckout`, `AddToCart`, `ViewContent`).
