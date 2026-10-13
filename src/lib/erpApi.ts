/**
 * Cliente de conexión a la API Pública del ERP de Estilo Nórdico.
 * 
 * Consume datos en tiempo real de http://localhost:8000/api/public/
 * - Sin autenticación (solo lectura de catálogo público)
 * - Sin costos ni datos financieros expuestos
 * - Soporte para SSG con fallback y optimización de WebP
 */

import type { Product, ProductVariant } from '../data/products';

// ─── Configuración de URL Base ──────────────────────────────

export const ERP_API_BASE_URL = (
  (typeof process !== 'undefined' && process.env?.PUBLIC_ERP_API_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_ERP_API_URL) ||
  'http://localhost:8000'
).replace(/\/$/, '');

// ─── Interfaces del Backend ERP ─────────────────────────────

export interface ERPProductPublic {
  id: number;
  ref: string;
  name: string;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  color?: string | null;
  size?: string | null;
  product_type: string; // 'CHAQUETA' | 'PERFUME' | 'RELOJ' | 'ROPA' | 'ACCESORIO'
  slug?: string | null;
  description?: string | null;
  images?: string[] | null;
  price_sale?: number | null;
  compare_price?: number | null;
  stock?: number | null;
  is_active: boolean;
  updated_at?: string | null;
}

export interface GetProductsFilters {
  product_type?: string;
  category?: string;
  brand?: string;
  in_stock?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface StockCheckResult {
  id: number;
  stock: number;
  available: boolean;
}

export interface CategoryCount {
  type: string;
  count: number;
}

// ─── Mapeos de Colores y Recursos WebP Locales ──────────────

export const COLOR_HEX_MAP: Record<string, string> = {
  'negro': '#1a1a1a',
  'azul': '#2b5aa7',
  'azul cobalto': '#0047ab',
  'azul rey': '#1c39bb',
  'beige': '#cbb894',
  'gris claro': '#b0b3b8',
  'gris raton': '#6e6e6e',
  'gris ratón': '#6e6e6e',
  'rojo': '#b3282d',
  'rojo franja': '#991b1e',
  'verde': '#3d6b4f',
  'verde militar': '#3d6b4f',
};

export const COLOR_LOCAL_WEBP: Record<string, string> = {
  'negro': '/assets/products/5080/5080-the-north-face-negro.webp',
  'azul': '/assets/products/5080/5080-the-north-face-azul.webp',
  'azul cobalto': '/assets/products/5080/5080-the-north-face-azul-cobalto.webp',
  'azul rey': '/assets/products/5080/5080-the-north-face-azul-rey.webp',
  'beige': '/assets/products/5080/5080-the-north-face-beige.webp',
  'gris claro': '/assets/products/5080/5080-the-north-face-gris-claro.webp',
  'gris raton': '/assets/products/5080/5080-the-north-face-gris-raton.webp',
  'gris ratón': '/assets/products/5080/5080-the-north-face-gris-raton.webp',
  'rojo': '/assets/products/5080/5080-the-north-face-rojo.webp',
  'rojo franja': '/assets/products/5080/5080-the-north-face-rojo-franja.webp',
  'verde militar': '/assets/products/5080/5080-the-north-face-verde-militar.webp',
};

const DEFAULT_JACKET_PRICE = 90000;
const DEFAULT_JACKET_ANCHOR = 120000;

// ─── Utilidades ─────────────────────────────────────────────

function normalizeColorKey(color?: string | null): string {
  if (!color) return '';
  return color
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Normaliza la URL de una imagen para que funcione tanto en local como en producción SSG.
 * Si la URL apunta a /static/products/5080/..., la mapea a /assets/products/5080/...
 */
export function resolveImageUrl(url?: string | null, fallbackColor?: string): string {
  if (url) {
    // Si viene del backend en /static/products/5080/
    if (url.includes('/static/products/5080/')) {
      const filename = url.split('/').pop();
      return `/assets/products/5080/${filename}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return url;
    }
  }

  if (fallbackColor) {
    const key = normalizeColorKey(fallbackColor);
    if (COLOR_LOCAL_WEBP[key]) {
      return COLOR_LOCAL_WEBP[key];
    }
  }

  return '/assets/products/5080/5080-the-north-face-negro.webp';
}

// ─── Funciones Core de API ──────────────────────────────────

/**
 * Consulta la lista de productos publicados en el ERP.
 */
export async function getProducts(filters: GetProductsFilters = {}): Promise<ERPProductPublic[]> {
  const params = new URLSearchParams();
  if (filters.product_type) params.set('product_type', filters.product_type);
  if (filters.category) params.set('category', filters.category);
  if (filters.brand) params.set('brand', filters.brand);
  if (filters.in_stock !== undefined) params.set('in_stock', String(filters.in_stock));
  if (filters.search) params.set('search', filters.search);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));

  const query = params.toString();
  const url = `${ERP_API_BASE_URL}/api/public/products${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Error en API ERP (${res.status}): ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Consulta un producto por su slug.
 */
export async function getProductBySlug(slug: string): Promise<ERPProductPublic | null> {
  const url = `${ERP_API_BASE_URL}/api/public/products/${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Error al consultar producto por slug (${res.status}): ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Consulta un producto por su ID numérico.
 */
export async function getProductById(id: number): Promise<ERPProductPublic | null> {
  const url = `${ERP_API_BASE_URL}/api/public/products/id/${id}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Error al consultar producto por ID (${res.status}): ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Micro-chequeo de disponibilidad y stock en tiempo real.
 */
export async function checkStock(productId: number): Promise<StockCheckResult> {
  const url = `${ERP_API_BASE_URL}/api/public/stock-check/${productId}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Error al verificar stock (${res.status}): ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Obtiene las categorías de productos disponibles con conteo.
 */
export async function getCategories(): Promise<CategoryCount[]> {
  const url = `${ERP_API_BASE_URL}/api/public/categories`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Error al obtener categorías (${res.status}): ${await res.text()}`);
  }

  return await res.json();
}

// ─── Adaptador: Agrupación de Chaquetas para la Web ─────────

/**
 * Obtiene las chaquetas publicadas en el ERP agrupadas por color y modelo,
 * listas para ser renderizadas por ProductCard, ProductPage y /chaquetas.
 * 
 * Desacopla 100% a Notion y se conecta al inventario real de 20 prendas físicas.
 */
export async function fetchJacketsFromERP(): Promise<Product[]> {
  try {
    const rawProducts = await getProducts({
      limit: 100,
    });

    // Filtrar prendas que son chaquetas (Ref 5080 o subcategoría CHAQUETA)
    const jacketItems = rawProducts.filter(p => 
      p.ref.startsWith('5080') || 
      p.subcategory?.toUpperCase() === 'CHAQUETA' ||
      p.product_type?.toUpperCase() === 'CHAQUETA'
    );

    if (jacketItems.length === 0) {
      console.warn('⚠️ No se encontraron chaquetas publicadas en ERP, usando fallback local.');
      return getFallbackJackets();
    }

    return groupERPJacketsByColor(jacketItems);
  } catch (error) {
    console.error('❌ Error conectando al ERP (http://localhost:8000), usando fallback local:', error);
    return getFallbackJackets();
  }
}

/**
 * Agrupa las variantes de la BD por color para generar fichas de producto unificadas.
 */
function groupERPJacketsByColor(items: ERPProductPublic[]): Product[] {
  // Agrupar por color normalizado
  const colorGroups = new Map<string, ERPProductPublic[]>();

  for (const item of items) {
    const rawColor = item.color || 'Negro';
    const cleanColor = capitalizeWords(rawColor);
    const group = colorGroups.get(cleanColor) || [];
    group.push(item);
    colorGroups.set(cleanColor, group);
  }

  const products: Product[] = [];

  for (const [colorName, variants] of colorGroups) {
    const normKey = normalizeColorKey(colorName);
    const slug = `chaqueta-impermeable-${colorName.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Total de stock sumando todas las tallas
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const hasAvailable = variants.some(v => (v.stock || 0) > 0);

    // Mapear variantes a ProductVariant
    const productVariants: ProductVariant[] = variants.map(v => ({
      id: String(v.id),
      talla: v.size?.toUpperCase() || 'ÚNICA',
      color: colorName,
      stock: v.stock || 0,
      status: (v.stock || 0) > 0 ? 'disponible' : 'agotado',
      referencia: v.ref,
    }));

    // Ordenar tallas estándar M -> L -> XL -> XXL
    const sizeOrder = ['M', 'L', 'XL', 'XXL', 'XXXL'];
    productVariants.sort((a, b) => {
      const idxA = sizeOrder.indexOf(a.talla);
      const idxB = sizeOrder.indexOf(b.talla);
      if (idxA === -1 && idxB === -1) return a.talla.localeCompare(b.talla);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    // Buscar la mejor imagen WebP
    const firstImg = variants.find(v => v.images && v.images.length > 0)?.images?.[0];
    const resolvedImage = resolveImageUrl(firstImg, colorName);

    // Recolectar todas las imágenes secundarias si existen
    const allImages: string[] = [];
    variants.forEach(v => {
      if (v.images) {
        v.images.forEach(img => {
          const res = resolveImageUrl(img, colorName);
          if (!allImages.includes(res)) allImages.push(res);
        });
      }
    });

    if (allImages.length === 0) {
      allImages.push(resolvedImage);
    }

    const price = variants[0]?.price_sale || DEFAULT_JACKET_PRICE;
    const anchorPrice = variants[0]?.compare_price || DEFAULT_JACKET_ANCHOR;
    const brand = variants[0]?.brand || 'The North Face';

    products.push({
      id: `erp-5080-${normKey.replace(/\s+/g, '-')}`,
      slug,
      name: `Chaqueta Impermeable ${colorName}`,
      brand,
      category: 'chaquetas',
      subcategory: 'Chaqueta Impermeable Térmica',
      gender: 'hombre',
      tags: ['impermeable', 'urbana', 'térmica', normKey, brand.toLowerCase()],
      price,
      anchorPrice,
      image: resolvedImage,
      images: allImages,
      description: `Chaqueta impermeable térmica premium color ${colorName} (${brand}). Confección de alta resistencia con forro térmico acolchado, gorro extraíble y protección cortaviento ideal para Pasto y clima frío.`,
      features: [
        'Acolchado térmico (retiene calor corporal)',
        'Gorro / Capucha extraíble con ajuste',
        'Forro térmico interno protector',
        'Tela cortaviento semi-impermeable (soporta llovizna)',
        `Marca destacada: ${brand}`,
        `Color: ${colorName}`,
      ],
      variants: productVariants,
      stock: totalStock,
      status: hasAvailable ? 'disponible' : 'agotado',
      featured: ['Negro', 'Azul', 'Rojo', 'Rojo Franja'].includes(colorName),
      hook: colorName === 'Negro' || colorName === 'Azul',
      source: 'erp',
      colorHex: COLOR_HEX_MAP[normKey] || '#1a1a1a',
    });
  }

  // Ordenar: primero las que tienen stock disponible
  products.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'disponible' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return products;
}

// ─── Fallback Estático en Caso de Desconexión ────────────────

function getFallbackJackets(): Product[] {
  return [
    {
      id: 'erp-fallback-negro',
      slug: 'chaqueta-impermeable-negro',
      name: 'Chaqueta Impermeable Negro',
      brand: 'The North Face',
      category: 'chaquetas',
      tags: ['impermeable', 'urbana', 'negro', 'the north face'],
      price: 85000,
      anchorPrice: 120000,
      image: '/assets/products/5080/5080-the-north-face-negro.webp',
      description: 'Chaqueta impermeable térmica color Negro con logo bordado The North Face.',
      features: [
        'Acolchado térmico (retiene calor corporal)',
        'Gorro / Capucha extraíble',
        'Forro térmico interno protector',
        'Tela cortaviento ultra resistente',
        'Color: Negro',
      ],
      variants: [
        { id: '304', talla: 'M', color: 'Negro', stock: 1, status: 'disponible', referencia: '5080-THE-NORTH-FACE-NEGRO-M' },
        { id: '305', talla: 'L', color: 'Negro', stock: 3, status: 'disponible', referencia: '5080-THE-NORTH-FACE-NEGRO-L' },
        { id: '306', talla: 'XL', color: 'Negro', stock: 2, status: 'disponible', referencia: '5080-THE-NORTH-FACE-NEGRO-XL' },
        { id: '307', talla: 'XXL', color: 'Negro', stock: 1, status: 'disponible', referencia: '5080-THE-NORTH-FACE-NEGRO-XXL' },
      ],
      stock: 7,
      status: 'disponible',
      featured: true,
      hook: true,
      source: 'static',
      colorHex: '#1a1a1a',
    },
    {
      id: 'erp-fallback-azul',
      slug: 'chaqueta-impermeable-azul',
      name: 'Chaqueta Impermeable Azul',
      brand: 'The North Face',
      category: 'chaquetas',
      tags: ['impermeable', 'urbana', 'azul', 'the north face'],
      price: 85000,
      anchorPrice: 120000,
      image: '/assets/products/5080/5080-the-north-face-azul.webp',
      description: 'Chaqueta impermeable térmica color Azul The North Face.',
      features: [
        'Acolchado térmico (retiene calor corporal)',
        'Gorro / Capucha extraíble',
        'Forro térmico interno protector',
        'Tela cortaviento ultra resistente',
        'Color: Azul',
      ],
      variants: [
        { id: '308', talla: 'M', color: 'Azul', stock: 2, status: 'disponible', referencia: '5080-THE-NORTH-FACE-AZUL-M' },
        { id: '309', talla: 'XL', color: 'Azul', stock: 1, status: 'disponible', referencia: '5080-THE-NORTH-FACE-AZUL-XL' },
      ],
      stock: 3,
      status: 'disponible',
      featured: true,
      hook: true,
      source: 'static',
      colorHex: '#2b5aa7',
    },
  ];
}
