/**
 * Catálogo de productos de Estilo Nórdico.
 * 
 * Los productos se definen estáticamente aquí.
 * Para actualizar precios o agregar productos, solo edita este archivo.
 * Las imágenes deben estar en public/assets/products/
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'chaquetas' | 'perfumes' | 'relojes';
  price: number;
  anchorPrice: number;
  image: string;
  description: string;
  tags: string[];
  featured?: boolean;
  hook?: boolean; // Producto gancho
}

// ─── CHAQUETAS ───────────────────────────────────────────────────

export const chaquetas: Product[] = [
  {
    id: 'chaq-01',
    name: 'Chaqueta Impermeable Urban',
    brand: 'Estilo Nórdico',
    category: 'chaquetas',
    price: 90000,
    anchorPrice: 150000,
    image: '/assets/products/chaqueta-impermeable.png',
    description: 'Chaqueta impermeable premium con diseño urbano. Protección total contra lluvia y viento, ideal para el clima de Pasto.',
    tags: ['impermeable', 'urbana', 'premium', 'lluvia'],
    featured: true,
    hook: true,
  },
  {
    id: 'chaq-02',
    name: 'Cortaviento Sport',
    brand: 'Estilo Nórdico',
    category: 'chaquetas',
    price: 75000,
    anchorPrice: 120000,
    image: '/assets/products/chaqueta-cortaviento.png',
    description: 'Cortaviento ligero y deportivo. Perfecto para actividades al aire libre con estilo.',
    tags: ['cortaviento', 'deportiva', 'ligera'],
    featured: true,
  },
  {
    id: 'chaq-03',
    name: 'Bomber Classic',
    brand: 'Estilo Nórdico',
    category: 'chaquetas',
    price: 85000,
    anchorPrice: 135000,
    image: '/assets/products/chaqueta-bomber.png',
    description: 'Bomber clásica con un toque moderno. Estilo casual urbano con acabados premium.',
    tags: ['bomber', 'casual', 'clásica', 'urbana'],
    featured: false,
  },
];

// ─── PERFUMES ────────────────────────────────────────────────────

export const perfumes: Product[] = [
  {
    id: 'perf-01',
    name: 'Temptation',
    brand: 'Yanbal',
    category: 'perfumes',
    price: 75000,
    anchorPrice: 110000,
    image: '/assets/products/perfume-yanbal.png',
    description: 'Fragancia masculina elegante y sofisticada. Notas amaderadas con un toque cítrico irresistible.',
    tags: ['yanbal', 'elegante', 'amaderado', 'original'],
    featured: true,
  },
  {
    id: 'perf-02',
    name: 'Leyenda',
    brand: 'Ésika',
    category: 'perfumes',
    price: 65000,
    anchorPrice: 95000,
    image: '/assets/products/perfume-esika.png',
    description: 'Aroma fresco y acuático para el hombre moderno. Perfecto para el día a día con presencia.',
    tags: ['ésika', 'fresco', 'acuático', 'original'],
    featured: true,
  },
  {
    id: 'perf-03',
    name: '300 Km/h',
    brand: 'Avon',
    category: 'perfumes',
    price: 45000,
    anchorPrice: 65000,
    image: '/assets/products/perfume-avon.png',
    description: 'Fragancia deportiva y enérgica. Ideal para quienes viven la vida al máximo.',
    tags: ['avon', 'deportivo', 'enérgico', 'original'],
    featured: false,
  },
];

// ─── RELOJES ─────────────────────────────────────────────────────

export const relojes: Product[] = [
  {
    id: 'rel-01',
    name: 'Nordic Casual',
    brand: 'Estilo Nórdico',
    category: 'relojes',
    price: 55000,
    anchorPrice: 85000,
    image: '/assets/products/reloj-casual.png',
    description: 'Reloj casual con diseño minimalista nórdico. Correa de cuero genuino y esfera limpia.',
    tags: ['casual', 'minimalista', 'cuero', 'nórdico'],
    featured: true,
  },
  {
    id: 'rel-02',
    name: 'Nordic Elegance',
    brand: 'Estilo Nórdico',
    category: 'relojes',
    price: 70000,
    anchorPrice: 110000,
    image: '/assets/products/reloj-elegante.png',
    description: 'Reloj elegante en acero inoxidable con esfera azul profundo. Para ocasiones especiales.',
    tags: ['elegante', 'acero', 'formal', 'premium'],
    featured: true,
  },
];

// ─── EXPORTS COMBINADOS ─────────────────────────────────────────

export const allProducts: Product[] = [...chaquetas, ...perfumes, ...relojes];

export const featuredProducts: Product[] = allProducts.filter(p => p.featured);

export const hookProduct: Product | undefined = allProducts.find(p => p.hook);

/**
 * Obtener productos por categoría
 */
export function getProductsByCategory(category: Product['category']): Product[] {
  return allProducts.filter(p => p.category === category);
}

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
