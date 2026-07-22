# 🗺️ ROADMAP.md — Estilo Nórdico: Hoja de Ruta de Escalabilidad

> Extraído del documento "Arquitectura de Comercio Electrónico de Conversión Directa en WhatsApp"

## Vista General

```
Fase 1: MVP Estático ──────► Fase 2: Backend & Automatización ──────► Fase 3: Headless & Omnicanal
    (ACTUAL)                      (+15 ventas/día)                       (Centro comercial digital)
```

---

## ✅ Fase 1: MVP Estático y Redirección Directa (FASE ACTUAL)

**Estado**: 🟢 En desarrollo

### Objetivos
- Lanzamiento ágil con costo mensual CERO
- Hosting gratuito en Vercel/Netlify
- Validación comercial del modelo de conversión WhatsApp

### Stack
- Astro + Tailwind CSS (sitio 100% estático)
- Píxel de Meta con CAPI de un solo clic
- Enrutamiento por subdirectorios (/chaquetas, /perfumes, /relojes)

### Operación
- Recepción de mensajes parametrizados en WhatsApp
- Cierre manual del pedido por chat
- Generación manual de guías en DrEnvío/Servientrega

### Criterio para avanzar a Fase 2
- Superar **15 transacciones diarias confirmadas**
- El procesamiento manual de chats se convierte en cuello de botella
- Ingresos consistentes que justifiquen inversión en infraestructura

---

## 🔮 Fase 2: Backend & Automatización Conversacional

**Estado**: ⏳ Planeada

### Objetivos
- Registrar información de pedidos antes del abandono
- Automatizar respuesta conversacional inicial
- Recuperar carritos abandonados

### Stack planificado
- Astro con endpoints de API (`src/pages/api/`)
- Base de datos: SQLite (better-sqlite3) o Supabase
- Bot conversacional: whatsapp-web.js o Baileys
- Cron-jobs para carritos abandonados (cada 10-20 min)

### Funcionalidades nuevas
- Captura previa de datos del cliente
- Bot no oficial (Baileys/OpenWA) para respuestas automáticas
- Formulario de dirección antes de WhatsApp
- Dashboard básico de pedidos

---

## 🚀 Fase 3: Arquitectura Headless Unificada (Shopify + Omnicanal)

**Estado**: ⏳ Visión a futuro

### Objetivos
- Delegar control de negocio/stock a Shopify
- Pasarela de pago integrada
- Catálogo nativo en WhatsApp
- "Centro comercial digital" con múltiples categorías

### Stack planificado
- Astro + Shopify Storefront API (headless)
- WhatsApp Business Cloud API (COEX)
- CRM Conversacional: Kommo o Zoko
- n8n como motor de orquestación (Docker)
- Bot con validación de inventario vía GraphQL

### Funcionalidades nuevas
- Checkout autónomo (enlace de pago desde WhatsApp)
- Sincronización de inventario en tiempo real
- Calificación automática de leads (Caliente/Cálido/Frío)
- Alertas prioritarias por Telegram al admin
- Prevención de alucinaciones de stock por IA

### Operadores logísticos evaluados
| Operador | Cobertura | Entrega |
|---|---|---|
| DrEnvío | Pasto urbano + cabeceras | Same/Next Day |
| Servientrega | 98% nacional | 24h urbano |
| Coordinadora | Nariño regional | 24-48h |
| Envia.com | Sur de Colombia directo | Same/Next Day |

---

## Métricas Clave del Negocio

- **AOV** (Average Order Value): Mide impacto de empaquetar ofertas en chat
- **CACc** (Costo de Adquisición Conversacional): Eficiencia de pauta Meta → WhatsApp
- **Combo gancho**: Chaqueta ($90k) + Perfume Yanbal = $130k COP envío gratis Pasto
