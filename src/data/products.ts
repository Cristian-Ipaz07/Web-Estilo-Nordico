/**
 * Catálogo de productos de Estilo Nórdico.
 * 
 * ESTRUCTURA ESCALABLE:
 * - Chaquetas: se cargan desde Notion (ver src/lib/notion.ts)
 * - Perfumes: datos estáticos aquí (llenados por el usuario)
 * - Relojes: datos estáticos aquí (llenados por el usuario)
 * 
 * Para actualizar perfumes/relojes: edita este archivo.
 * Para actualizar chaquetas: edita en Notion y haz rebuild.
 */

// ─── INTERFACES ──────────────────────────────────────────

export interface Product {
  // Identificación
  id: string;
  slug: string;
  name: string;
  brand: string;
  
  // Clasificación
  category: 'chaquetas' | 'perfumes' | 'relojes';
  subcategory?: string;
  gender?: 'hombre' | 'mujer' | 'unisex';
  tags: string[];
  
  // Precios
  price: number;
  anchorPrice: number;
  
  // Media
  image: string;
  images?: string[];
  
  // Contenido
  description: string;
  features?: string[];
  
  // Variantes (tallas/colores para chaquetas)
  variants?: ProductVariant[];
  
  // Estado
  stock?: number;
  status?: 'disponible' | 'agotado';
  
  // Visual
  colorHex?: string;
  
  // Flags
  featured?: boolean;
  hook?: boolean;
  
  // Fuente de datos
  source?: 'static' | 'notion';
}

export interface ProductVariant {
  id: string;
  talla: string;
  color: string;
  stock: number;
  status: 'disponible' | 'agotado';
  referencia: string;
}

// ─── PERFUMES (datos estáticos reales) ───────────────────

export const perfumes: Product[] = [
  // --- YANBAL ---
  {
    id: 'perf-ohm',
    slug: 'ohm-parfum-yanbal',
    name: 'Ohm Parfum',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['yanbal', 'herbal', 'cítrico', 'hombre', 'más-vendido'],
    price: 85000,
    anchorPrice: 160000,
    image: '/assets/products/perfumes/Ohm Perfume.jpg',
    description: 'Aroma herbal cítrico muy intenso con notas de toronja rosada, salvia y elegante cuero.',
    features: ['Marca: Yanbal', 'Género: Hombre', 'Tipo: Parfum de alta concentración', 'Notas: Toronja rosada, salvia, cuero'],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-solo',
    slug: 'solo-parfum-yanbal',
    name: 'Solo Parfum',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['yanbal', 'maderoso', 'cítrico', 'hombre'],
    price: 85000,
    anchorPrice: 155000,
    image: '/assets/products/perfumes/Solo Colonia.jpg',
    description: 'Fragancia maderosa cítrica con acordes impactantes de cáscara de mandarina, jengibe y cuero.',
    features: ['Marca: Yanbal', 'Género: Hombre', 'Tipo: Parfum premium', 'Notas: Mandarina, jengibre, cuero'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-zentro',
    slug: 'zentro-yanbal',
    name: 'Zentro',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['yanbal', 'oriental', 'amaderado', 'hombre'],
    price: 82000,
    anchorPrice: 150000,
    image: '/assets/products/perfumes/Zentro.jpg',
    description: 'Fragancia oriental amaderada con notas vibrantes de yuzu, cedro y ámbar.',
    features: ['Marca: Yanbal', 'Género: Hombre', 'Tipo: Eau de Parfum', 'Notas: Yuzu, cedro, ámbar'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-adrenaline-man',
    slug: 'adrenaline-man-yanbal',
    name: 'Adrenaline Man',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['yanbal', 'fresco', 'cítrico', 'hombre'],
    price: 60000,
    anchorPrice: 110000,
    image: '/assets/products/perfumes/Adrenaline men.jpg',
    description: 'Aroma fresco cítrico con notas energizantes de jugo de toronja y vetiver.',
    features: ['Marca: Yanbal', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Toronja, vetiver'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-xool',
    slug: 'xool-yanbal',
    name: 'Xool',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['yanbal', 'fresco', 'herbal', 'hombre'],
    price: 60000,
    anchorPrice: 105000,
    image: '/assets/products/perfumes/Xol Eau De Toilette.jpg',
    description: 'Fragancia fresca y juvenil con matices herbales de salvia, jengibre y bergamota.',
    features: ['Marca: Yanbal', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Salvia, jengibre, bergamota'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-arom-absolute',
    slug: 'arom-absolute-yanbal',
    name: 'Arom Absolute',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['yanbal', 'maderoso', 'especiado', 'hombre'],
    price: 85000,
    anchorPrice: 160000,
    image: '/assets/products/perfumes/Arom Absolute.jpg',
    description: 'Aroma maderoso especiado sobrio y sofisticado con notas de limón kaffir, cardamomo y cedro rojo.',
    features: ['Marca: Yanbal', 'Género: Hombre', 'Tipo: Parfum concentrado', 'Notas: Limón kaffir, cardamomo, cedro rojo'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-ccori-rubi',
    slug: 'ccori-rubi-parfum-yanbal',
    name: 'Ccori Rubí Parfum',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['yanbal', 'ambarado', 'floral', 'mujer'],
    price: 89900,
    anchorPrice: 170000,
    image: '/assets/products/perfumes/CCORI Rubi.webp',
    description: 'Fragancia ambarada floral intensa con delicados nardos, calidez de ámbar y vainilla.',
    features: ['Marca: Yanbal', 'Género: Mujer', 'Tipo: Parfum de alta gama', 'Notas: Nardos, ámbar, vainilla'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-gaia',
    slug: 'gaia-yanbal',
    name: 'Gaïa',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['yanbal', 'floral', 'mujer'],
    price: 80000,
    anchorPrice: 150000,
    image: '/assets/products/perfumes/Gaia Perfume.jpg',
    description: 'Aroma floral misterioso que combina la orquídea de Cusco, flor de jacinto y jazmín.',
    features: ['Marca: Yanbal', 'Género: Mujer', 'Tipo: Eau de Parfum', 'Notas: Orquídea de Cusco, jacinto, jazmín'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-osadia-dama',
    slug: 'osadia-dama-yanbal',
    name: 'Osadía Dama',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['yanbal', 'frutal', 'floral', 'mujer'],
    price: 70000,
    anchorPrice: 135000,
    image: '/assets/products/perfumes/Osadia mujer.jpg',
    description: 'Aroma frutal floral provocativo con chispeante maracuyá, granada y flor de mimosa.',
    features: ['Marca: Yanbal', 'Género: Mujer', 'Tipo: Eau de Parfum', 'Notas: Maracuyá, granada, flor de mimosa'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-dulce-vanidad',
    slug: 'dulce-vanidad-yanbal',
    name: 'Dulce Vanidad',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['yanbal', 'oriental', 'dulce', 'mujer'],
    price: 60000,
    anchorPrice: 115000,
    image: '/assets/products/perfumes/Dulce Vanidad.jpg',
    description: 'Fragancia oriental dulce con cálidas notas de vainilla, nectarina y jazmín star.',
    features: ['Marca: Yanbal', 'Género: Mujer', 'Tipo: Eau de Toilette', 'Notas: Vainilla, nectarina, jazmín star'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-dulce-amistad',
    slug: 'dulce-amistad-yanbal',
    name: 'Dulce Amistad',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['yanbal', 'frutal', 'floral', 'mujer'],
    price: 58000,
    anchorPrice: 110000,
    image: '/assets/products/perfumes/DULCE AMISTAD.jpg',
    description: 'Aroma frutal floral dulce y femenino con toques de frambuesa y flores blancas.',
    features: ['Marca: Yanbal', 'Género: Mujer', 'Tipo: Eau de Toilette', 'Notas: Frambuesa, flores blancas'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-xiss',
    slug: 'xiss-yanbal',
    name: 'Xiss',
    brand: 'Yanbal',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['yanbal', 'floral', 'frutal', 'mujer'],
    price: 60000,
    anchorPrice: 105000,
    image: '/assets/products/perfumes/Xiis.jpg',
    description: 'Fragancia floral frutal juvenil con notas vibrantes de naranja, fressia y sándalo.',
    features: ['Marca: Yanbal', 'Género: Mujer', 'Tipo: Eau de Toilette', 'Notas: Naranja, freesia, sándalo'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },

  // --- ÉSIKA ---
  {
    id: 'perf-leyenda',
    slug: 'leyenda-esika',
    name: 'Leyenda',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['ésika', 'amaderado', 'especiado', 'hombre'],
    price: 55000,
    anchorPrice: 100000,
    image: '/assets/products/perfumes/Leyenda Absolute Perfume.jpg',
    description: 'Aroma amaderado especiado de alta fijación con notas de cítricos, cardamomo y fondo de ámbar.',
    features: ['Marca: Ésika', 'Género: Hombre', 'Tipo: Eau de Parfum', 'Notas: Cítricos, cardamomo, ámbar'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-pulso',
    slug: 'pulso-esika',
    name: 'Pulso',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['ésika', 'oriental', 'seductor', 'hombre', 'más-vendido'],
    price: 55000,
    anchorPrice: 100000,
    image: '/assets/products/perfumes/Pulso Absolute Colonia.jpg',
    description: 'Fragancia oriental seductora con notas cálidas de tabaco, cardamomo y maderas rojas.',
    features: ['Marca: Ésika', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Tabaco, cardamomo, maderas rojas'],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-dorsay',
    slug: 'dorsay-esika',
    name: 'Dorsay',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['ésika', 'amaderado', 'elegante', 'hombre', 'más-vendido'],
    price: 52000,
    anchorPrice: 95000,
    image: '/assets/products/perfumes/Dorsay Perfume.jpg',
    description: 'Aroma amaderado elegante con mezcla de verbena fresca, roble y verbena fina.',
    features: ['Marca: Ésika', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Verbena, roble'],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-vanilla-man',
    slug: 'vanilla-man-esika',
    name: 'Vanilla Man',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['ésika', 'oriental', 'especiado', 'hombre'],
    price: 45000,
    anchorPrice: 85000,
    image: '/assets/products/perfumes/Vanilla For Men Fragancia.jpg',
    description: 'Aroma oriental especiado con toques dulces de vainilla negra y madera suave.',
    features: ['Marca: Ésika', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Vainilla negra, maderas suaves'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-winner-sport',
    slug: 'winner-sport-esika',
    name: 'Winner Sport',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['ésika', 'fresco', 'deportivo', 'hombre', 'más-vendido'],
    price: 44000,
    anchorPrice: 80000,
    image: '/assets/products/perfumes/Winner Sport Perfume.jpg',
    description: 'Fragancia fresca tónica y revitalizante con menta verde y notas marinas.',
    features: ['Marca: Ésika', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Menta verde, notas marinas'],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-magnat-select',
    slug: 'magnat-select-esika',
    name: 'Magnat Select',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['ésika', 'elegante', 'maderoso', 'hombre'],
    price: 55000,
    anchorPrice: 100000,
    image: '/assets/products/perfumes/Magnat Select.webp',
    description: 'Fragancia sofisticada con acordes de jengibre de Madagascar y maderas ambaradas.',
    features: ['Marca: Ésika', 'Género: Hombre', 'Tipo: Eau de Parfum', 'Notas: Jengibre, maderas ambaradas'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-vibranza',
    slug: 'vibranza-esika',
    name: 'Vibranza',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['ésika', 'oriental', 'dulce', 'mujer'],
    price: 48000,
    anchorPrice: 90000,
    image: '/assets/products/perfumes/Vibranza.webp',
    description: 'Aroma oriental dulce irresistible con notas de orquídea de vainilla y flor de café.',
    features: ['Marca: Ésika', 'Género: Mujer', 'Tipo: Eau de Parfum', 'Notas: Orquídea de vainilla, flor de café'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-limage',
    slug: 'limage-esika',
    name: "L'Image",
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['ésika', 'floral', 'elegante', 'mujer'],
    price: 48000,
    anchorPrice: 90000,
    image: '/assets/products/perfumes/Limage Perfume.jpg',
    description: 'Elegante fragancia floral con elegantes acordes de ylang-ylang, jazmín y sándalo.',
    features: ['Marca: Ésika', 'Género: Mujer', 'Tipo: Eau de Parfum', 'Notas: Ylang-ylang, jazmín, sándalo'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-mia',
    slug: 'mia-esika',
    name: 'Mía',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['ésika', 'floral', 'sensual', 'mujer'],
    price: 43000,
    anchorPrice: 80000,
    image: '/assets/products/perfumes/Mia Perfume.jpg',
    description: 'Fragancia floral sensual con notas de pimienta rosa and gardenia dorada.',
    features: ['Marca: Ésika', 'Género: Mujer', 'Tipo: Eau de Parfum', 'Notas: Pimienta rosa, gardenia dorada'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-you',
    slug: 'you-esika',
    name: 'You',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'unisex',
    tags: ['ésika', 'fresco', 'cítrico', 'unisex'],
    price: 35000,
    anchorPrice: 65000,
    image: '/assets/products/perfumes/Its You Perfume.jpg',
    description: 'Fragancia fresca cítrica y relajante con notas de limón, bergamota y té verde.',
    features: ['Marca: Ésika', 'Género: Unisex', 'Tipo: Colonia fresca', 'Notas: Limón, bergamota, té verde'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-expression',
    slug: 'expression-esika',
    name: 'Expressión',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['ésika', 'floral', 'fresco', 'mujer'],
    price: 33000,
    anchorPrice: 60000,
    image: '/assets/products/perfumes/Expression Perfume.jpg',
    description: 'Aroma floral con chispeantes acordes de mimosa, jazmín y flores blancas.',
    features: ['Marca: Ésika', 'Género: Mujer', 'Tipo: Eau de Toilette', 'Notas: Mimosa, jazmín, flores blancas'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-vanilla-dama',
    slug: 'vanilla-dama-esika',
    name: 'Vanilla Dama',
    brand: 'Ésika',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['ésika', 'cálido', 'dulce', 'mujer'],
    price: 45000,
    anchorPrice: 80000,
    image: '/assets/products/perfumes/Vanilla Scent Fragancia.jpeg',
    description: 'Fragancia cálida y envuelta en notas dulces de vainilla y flor de naranjo.',
    features: ['Marca: Ésika', 'Género: Mujer', 'Tipo: Eau de Toilette', 'Notas: Vainilla dulce, flor de naranjo'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },

  // --- CYZONE ---
  {
    id: 'perf-nitro-air',
    slug: 'nitro-air-cyzone',
    name: 'Nitro Air',
    brand: 'Cyzone',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['cyzone', 'fresco', 'acuático', 'hombre'],
    price: 34000,
    anchorPrice: 65000,
    image: '/assets/products/perfumes/Nitro Air Perfume.jpg',
    description: 'Fragancia ultra fresca con acordes de lavanda, brisa marina y menta.',
    features: ['Marca: Cyzone', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Lavanda, brisa marina, menta'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-nitro-clasica',
    slug: 'nitro-clasica-cyzone',
    name: 'Nitro Clásica',
    brand: 'Cyzone',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['cyzone', 'herbal', 'fresco', 'hombre', 'más-vendido'],
    price: 32000,
    anchorPrice: 60000,
    image: '/assets/products/perfumes/Nitro Perfume.jpg',
    description: 'Aroma herbal fresco con envolventes notas de hojas de té verde y maderas.',
    features: ['Marca: Cyzone', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Hojas de té verde, maderas suaves'],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-all-black',
    slug: 'all-black-cyzone',
    name: 'All Black',
    brand: 'Cyzone',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['cyzone', 'amaderado', 'especiado', 'hombre'],
    price: 34000,
    anchorPrice: 65000,
    image: '/assets/products/perfumes/All Black.jpg',
    description: 'Fragancia amaderada misteriosa con toques de pimienta negra y especias.',
    features: ['Marca: Cyzone', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Pimienta negra, maderas, especias'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-blue-in-blue',
    slug: 'blue-in-blue-cyzone',
    name: 'Blue in Blue',
    brand: 'Cyzone',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['cyzone', 'acuático', 'cítrico', 'hombre'],
    price: 29000,
    anchorPrice: 55000,
    image: '/assets/products/perfumes/Blue  Blue Perfume.jpg',
    description: 'Aroma acuático revitalizante con acordes marinos y cítricos.',
    features: ['Marca: Cyzone', 'Género: Hombre', 'Tipo: Colonia fresca', 'Notas: Acordes marinos, cítricos refrescantes'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-dancing-night',
    slug: 'dancing-night-cyzone',
    name: 'Dancing Night',
    brand: 'Cyzone',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['cyzone', 'oriental', 'dulce', 'mujer', 'más-vendido'],
    price: 32000,
    anchorPrice: 60000,
    image: '/assets/products/perfumes/Dancing Night Perfume.jpg',
    description: 'Fragancia oriental dulce con chispeantes toques de ciruela y vainilla.',
    features: ['Marca: Cyzone', 'Género: Mujer', 'Tipo: Eau de Toilette', 'Notas: Ciruela dulce, vainilla'],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-in-love',
    slug: 'in-love-cyzone',
    name: 'In Love',
    brand: 'Cyzone',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['cyzone', 'floral', 'delicado', 'mujer'],
    price: 31000,
    anchorPrice: 58000,
    image: '/assets/products/perfumes/In love.webp',
    description: 'Aroma floral delicado con notas de durazno dulce y pétalos de rosa.',
    features: ['Marca: Cyzone', 'Género: Mujer', 'Tipo: Eau de Toilette', 'Notas: Durazno dulce, pétalos de rosa'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-sweet-black',
    slug: 'sweet-black-cyzone',
    name: 'Sweet Black',
    brand: 'Cyzone',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['cyzone', 'oriental', 'dulce', 'mujer'],
    price: 30000,
    anchorPrice: 55000,
    image: '/assets/products/perfumes/Sweet Black Perfume.jpg',
    description: 'Aroma oriental dulce muy adictivo con notas de pink pomelo y sándalo.',
    features: ['Marca: Cyzone', 'Género: Mujer', 'Tipo: Eau de Toilette', 'Notas: Pink pomelo, sándalo dulce'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-prints',
    slug: 'prints-cyzone',
    name: 'Prints',
    brand: 'Cyzone',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['cyzone', 'floral', 'frutal', 'mujer', 'más-vendido'],
    price: 24000,
    anchorPrice: 45000,
    image: '/assets/products/perfumes/Prints.jpg',
    description: 'Aroma floral frutal divertido y juvenil con acordes de manzana y durazno.',
    features: ['Marca: Cyzone', 'Género: Mujer', 'Tipo: Colonia juvenil', 'Notas: Manzana verde, durazno dulce'],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-prints-adventure',
    slug: 'prints-adventure-cyzone',
    name: 'Prints Adventure',
    brand: 'Cyzone',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['cyzone', 'fresco', 'frutal', 'mujer'],
    price: 24000,
    anchorPrice: 45000,
    image: '/assets/products/perfumes/Prints Adventure.jpg',
    description: 'Fragancia fresca y vibrante con notas de freesia verde y frutos rojos.',
    features: ['Marca: Cyzone', 'Género: Mujer', 'Tipo: Colonia juvenil', 'Notas: Freesia verde, frutos rojos'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },

  // --- AVON / L'BEL ---
  {
    id: 'perf-300km-max-turbo',
    slug: '300km-max-turbo-avon',
    name: '300km Max Turbo',
    brand: 'Avon',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['avon', 'herbal', 'deportivo', 'hombre'],
    price: 36000,
    anchorPrice: 65000,
    image: '/assets/products/perfumes/300 Kmh Max Turbo Colonia.jpg',
    description: 'Fragancia ultra herbal con acordes de adrenalina pura, bergamota y cuero.',
    features: ['Marca: Avon', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Adrenalina, bergamota, cuero'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-musk-marine',
    slug: 'musk-marine-avon',
    name: 'Musk Marine',
    brand: 'Avon',
    category: 'perfumes',
    gender: 'hombre',
    tags: ['avon', 'fresco', 'acuático', 'hombre'],
    price: 30000,
    anchorPrice: 55000,
    image: '/assets/products/perfumes/Avon Musk Marine Perfume.jpg',
    description: 'Aroma fougère acuático fresco con toques de menta, lavanda y roble.',
    features: ['Marca: Avon', 'Género: Hombre', 'Tipo: Eau de Cologne', 'Notas: Menta fresca, lavanda, roble'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-soft-musk',
    slug: 'soft-musk-avon',
    name: 'Soft Musk',
    brand: 'Avon',
    category: 'perfumes',
    gender: 'mujer',
    tags: ['avon', 'suave', 'floral', 'mujer', 'más-vendido'],
    price: 30000,
    anchorPrice: 55000,
    image: '/assets/products/perfumes/Soft Musk Fragancia.jpeg',
    description: 'Fragancia suave y envolvente con acordes de almizcle blanco, jazmín y rosa.',
    features: ['Marca: Avon', 'Género: Mujer', 'Tipo: Eau de Toilette', 'Notas: Almizcle blanco, jazmín, rosa'],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-mithyka',
    slug: 'mithyka-lbel',
    name: 'Mithyka',
    brand: "L'Bel",
    category: 'perfumes',
    gender: 'mujer',
    tags: ['lbel', 'floral', 'premium', 'mujer'],
    price: 45000,
    anchorPrice: 90000,
    image: '/assets/products/perfumes/Mithyka Perfume.jpg',
    description: 'Fragancia floral de alta perfumería con notas de jazmín de Sambac y tuberosa.',
    features: ['Marca: L\'Bel', 'Género: Mujer', 'Tipo: Parfum de alta gama', 'Notas: Jazmín de Sambac, tuberosa'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'perf-bleu-intense',
    slug: 'bleu-intense-lbel',
    name: 'Bleu Intense',
    brand: "L'Bel",
    category: 'perfumes',
    gender: 'hombre',
    tags: ['lbel', 'herbal', 'acuático', 'hombre'],
    price: 55000,
    anchorPrice: 100000,
    image: '/assets/products/perfumes/bleu.webp',
    description: 'Aroma herbal acuático profundo con tecnología viva de tecnología francesa.',
    features: ['Marca: L\'Bel', 'Género: Hombre', 'Tipo: Eau de Toilette', 'Notas: Acordes acuáticos, tecnología francesa'],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
];

// ─── RELOJES (datos estáticos) ───────────────────────────

export const relojes: Product[] = [
  {
    id: 'rel-01',
    slug: 'curren-chronograph-verde',
    name: 'Curren Chronograph Verde',
    brand: 'Curren',
    category: 'relojes',
    tags: ['curren', 'cronógrafo', 'acero', 'más-vendido'],
    price: 165000,
    anchorPrice: 220000,
    image: '/assets/products/relojes/rel-01.png',
    description: 'Reloj ejecutivo con tablero verde esmeralda, cronógrafo funcional y envío gratis.',
    features: [
      'Pulso en acero inoxidable',
      'Fechador y cronógrafo funcional',
      'Incluye domicilio / envío gratis',
    ],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'rel-02',
    slug: 'curren-chronograph-blanco',
    name: 'Curren Chronograph Blanco',
    brand: 'Curren',
    category: 'relojes',
    tags: ['curren', 'cronógrafo', 'acero'],
    price: 165000,
    anchorPrice: 220000,
    image: '/assets/products/relojes/rel-02.png',
    description: 'Reloj ejecutivo con tablero blanco marfil, pulso plateado y envío gratis.',
    features: [
      'Pulso en acero inoxidable',
      'Fechador y cronógrafo funcional',
      'Incluye domicilio / envío gratis',
    ],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'rel-03',
    slug: 'skmei-square-minimalist',
    name: 'SKMEI Square Minimalist',
    brand: 'SKMEI',
    category: 'relojes',
    tags: ['skmei', 'cuadrado', 'minimalista', 'acero'],
    price: 105000,
    anchorPrice: 150000,
    image: '/assets/products/relojes/rel-03.png',
    description: 'Diseño geométrico moderno con caja cuadrada y acabado ultra pulido.',
    features: [
      'Caja cuadrada de aleación premium',
      'Pulso en acero inoxidable plateado',
      'Tablero negro de alta elegancia',
    ],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'rel-04',
    slug: 'skmei-diamond-black',
    name: 'SKMEI Diamond Luxury Black',
    brand: 'SKMEI',
    category: 'relojes',
    tags: ['skmei', 'negro', 'diamantes', 'más-vendido'],
    price: 130000,
    anchorPrice: 180000,
    image: '/assets/products/relojes/rel-04.png',
    description: 'Edición especial con incrustaciones tipo diamante en el bisel y pulso negro azabache.',
    features: [
      'Bisel con incrustaciones de alto brillo',
      'Pulso en acero negro inoxidable',
      'Detalles internos en tono cobre/rosa',
    ],
    featured: true,
    status: 'disponible',
    source: 'static',
  },
  {
    id: 'rel-05',
    slug: 'ristos-pirate-edition',
    name: 'RISTOS Skull Pirate Edition',
    brand: 'RISTOS',
    category: 'relojes',
    tags: ['ristos', 'cuero', 'urbano', 'pirata'],
    price: 125000,
    anchorPrice: 170000,
    image: '/assets/products/relojes/rel-05.png',
    description: 'Reloj urbano de edición pirata con caja temática de colección y correa de cuero reforzada.',
    features: [
      'Diseño exclusivo con dial de calavera',
      'Correa reforzada estilo militar/urbano',
      'Incluye caja de colección RISTOS',
    ],
    featured: false,
    status: 'disponible',
    source: 'static',
  },
];

// ─── HELPERS ─────────────────────────────────────────────

/**
 * Formatear precio en COP colombiano
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Calcular porcentaje de descuento
 */
export function getDiscount(price: number, anchorPrice: number): number {
  return Math.round(((anchorPrice - price) / anchorPrice) * 100);
}

/**
 * Obtener marcas únicas de una lista de productos
 */
export function getUniqueBrands(products: Product[]): string[] {
  return [...new Set(products.map(p => p.brand))].sort();
}

/**
 * Encontrar producto por slug
 */
export function findBySlug(products: Product[], slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

/**
 * Obtener colores únicos de variantes
 */
export function getUniqueColors(products: Product[]): string[] {
  const colors = new Set<string>();
  for (const p of products) {
    if (p.variants) {
      for (const v of p.variants) colors.add(v.color);
    }
  }
  return [...colors].sort();
}

/**
 * Obtener tallas únicas de variantes
 */
export function getUniqueSizes(products: Product[]): string[] {
  const sizes = new Set<string>();
  for (const p of products) {
    if (p.variants) {
      for (const v of p.variants) sizes.add(v.talla);
    }
  }
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  return [...sizes].sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
}
