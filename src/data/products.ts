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

// ─── PERFUMES (datos estáticos) ──────────────────────────
// El usuario llenará estos datos con sus productos reales.
// Por ahora contienen datos de ejemplo.

export const perfumes: Product[] = [
  {
    id: 'perf-01',
    slug: 'temptation-yanbal',
    name: 'Temptation',
    brand: 'Yanbal',
    category: 'perfumes',
    tags: ['yanbal', 'elegante', 'amaderado', 'original', 'más-vendido'],
    price: 75000,
    anchorPrice: 110000,
    image: '/assets/products/perfume-yanbal.png',
    description: 'Fragancia masculina elegante y sofisticada. Notas amaderadas con un toque cítrico irresistible.',
    features: [
      'Fragancia amaderada con notas cítricas',
      '100% original de catálogo Yanbal',
      'Presentación de 75ml',
      'Larga duración',
    ],
    featured: true,
    source: 'static',
  },
  {
    id: 'perf-02',
    slug: 'leyenda-esika',
    name: 'Leyenda',
    brand: 'Ésika',
    category: 'perfumes',
    tags: ['ésika', 'fresco', 'acuático', 'original'],
    price: 65000,
    anchorPrice: 95000,
    image: '/assets/products/perfume-esika.png',
    description: 'Aroma fresco y acuático para el hombre moderno. Perfecto para el día a día con presencia.',
    features: [
      'Fragancia fresca y acuática',
      '100% original de catálogo Ésika',
      'Ideal para uso diario',
      'Aroma de larga duración',
    ],
    featured: true,
    source: 'static',
  },
  {
    id: 'perf-03',
    slug: '300kmh-avon',
    name: '300 Km/h',
    brand: 'Avon',
    category: 'perfumes',
    tags: ['avon', 'deportivo', 'enérgico', 'original'],
    price: 45000,
    anchorPrice: 65000,
    image: '/assets/products/perfume-avon.png',
    description: 'Fragancia deportiva y enérgica. Ideal para quienes viven la vida al máximo.',
    features: [
      'Fragancia deportiva y enérgica',
      '100% original de catálogo Avon',
      'Diseño dinámico y moderno',
      'Perfecto para el día a día activo',
    ],
    featured: false,
    source: 'static',
  },
];

// ─── RELOJES (datos estáticos) ───────────────────────────

export const relojes: Product[] = [
  {
    id: 'rel-01',
    slug: 'nordic-casual',
    name: 'Nordic Casual',
    brand: 'Estilo Nórdico',
    category: 'relojes',
    tags: ['casual', 'minimalista', 'cuero', 'nórdico'],
    price: 55000,
    anchorPrice: 85000,
    image: '/assets/products/reloj-casual.png',
    description: 'Reloj casual con diseño minimalista nórdico. Correa de cuero genuino y esfera limpia.',
    features: [
      'Diseño minimalista nórdico',
      'Correa de cuero genuino',
      'Esfera blanca limpia',
      'Resistente al agua',
    ],
    featured: true,
    source: 'static',
  },
  {
    id: 'rel-02',
    slug: 'nordic-elegance',
    name: 'Nordic Elegance',
    brand: 'Estilo Nórdico',
    category: 'relojes',
    tags: ['elegante', 'acero', 'formal', 'premium'],
    price: 70000,
    anchorPrice: 110000,
    image: '/assets/products/reloj-elegante.png',
    description: 'Reloj elegante en acero inoxidable con esfera azul profundo. Para ocasiones especiales.',
    features: [
      'Acero inoxidable pulido',
      'Esfera azul profundo',
      'Mecanismo de cuarzo',
      'Resistente al agua',
    ],
    featured: true,
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
