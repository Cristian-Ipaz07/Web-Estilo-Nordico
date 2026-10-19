/**
 * Configuración centralizada de la tienda Estilo Nórdico.
 * 
 * Este archivo contiene TODOS los datos de configuración del negocio.
 * Cualquier cambio en datos de contacto, branding o integraciones
 * se hace aquí y se propaga automáticamente a todo el sitio.
 */

export const STORE_CONFIG = {
  // Identidad
  name: 'Estilo Nórdico',
  slogan: 'Tu estilo, nuestra pasión',
  description: 'Tienda de moda urbana en Pasto — Chaquetas, perfumes originales y relojes con envío gratis y pago contraentrega.',
  city: 'San Juan de Pasto',
  department: 'Nariño',
  country: 'Colombia',
  address: 'Manzana G3 Casa 14, Nueva Aranda, Pasto',

  // Contacto
  whatsapp: {
    number: '573218888046',
    displayNumber: '+57 321 888 8046',
    defaultMessage: '¡Hola! Me interesa conocer más sobre los productos de Estilo Nórdico. 🛒',
  },

  // Meta Pixel
  metaPixel: {
    id: '1065979052606365',
    enabled: true,
  },

  // Branding / Colores
  colors: {
    primary: '#1B2A4A',      // Azul nórdico profundo
    primaryLight: '#2D4A7A',  // Azul nórdico claro
    accent: '#25D366',        // Verde WhatsApp
    accentHover: '#1DA851',   // Verde WhatsApp hover
    gold: '#C9A962',          // Dorado nórdico premium
    background: '#FAFBFC',    // Blanco nieve
    surface: '#FFFFFF',       // Blanco puro
    text: '#1A1A2E',          // Negro carbón
    textMuted: '#6B7280',     // Gris texto secundario
  },

  // Envío
  shipping: {
    freeCity: 'Pasto',
    method: 'Contraentrega (pago al recibir)',
    freeShippingMinAmount: 0, // Gratis en Pasto sin mínimo
  },

  // SEO
  seo: {
    siteName: 'Estilo Nórdico',
    titleSuffix: ' | Estilo Nórdico — Pasto',
    defaultImage: '/assets/og-image.jpg',
    locale: 'es_CO',
  },

  // Navegación
  navigation: [
    { label: 'Inicio', href: '/' },
    { label: 'Chaquetas', href: '/chaquetas' },
    { label: 'Perfumes', href: '/perfumes' },
    { label: 'Relojes', href: '/relojes' },
  ],
} as const;

export type StoreConfig = typeof STORE_CONFIG;
