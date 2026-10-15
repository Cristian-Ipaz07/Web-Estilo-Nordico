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
  'https://estilo-nordico-app.onrender.com'
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
  subcategory?: string;
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
  if (filters.subcategory) params.set('subcategory', filters.subcategory);
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

    // Mapear variantes existentes a ProductVariant (ignorando registros padre sin talla)
    const brand = variants[0]?.brand || 'The North Face';
    const existingMap = new Map<string, ProductVariant>();
    variants.forEach(v => {
      const s = (v.size || '').toUpperCase().trim();
      if (!s || s === 'ÚNICA' || s === 'UNICA' || s === 'NONE' || s === 'NULL') {
        return; // Ignorar el registro base padre
      }
      existingMap.set(s, {
        id: String(v.id),
        talla: s,
        color: colorName,
        stock: v.stock || 0,
        status: (v.stock || 0) > 0 ? 'disponible' : 'agotado',
        referencia: v.ref,
      });
    });

    // Para la Chaqueta 5080, las tallas válidas son estrictamente M, L, XL, XXL
    const STANDARD_SIZES = ['M', 'L', 'XL', 'XXL'];
    const productVariants: ProductVariant[] = [];

    STANDARD_SIZES.forEach(sz => {
      if (existingMap.has(sz)) {
        productVariants.push(existingMap.get(sz)!);
      } else {
        productVariants.push({
          id: `erp-5080-${normKey}-${sz.toLowerCase()}-sp`,
          talla: sz,
          color: colorName,
          stock: 0,
          status: 'agotado',
          referencia: `5080-${brand.toUpperCase().replace(/\s+/g, '-')}-${normKey.toUpperCase()}-${sz}`,
        });
      }
    });

    // Añadir talla XXXL únicamente si está explícitamente en la base de datos
    if (existingMap.has('XXXL')) {
      productVariants.push(existingMap.get('XXXL')!);
    }

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

// ─── Navegación Dinámica según Inventario Activo del ERP ───

export interface NavigationSubcategory {
  name: string;
  code: string;
  product_count: number;
  total_stock: number;
}

export interface NavigationResponse {
  departments: Record<string, NavigationSubcategory[]>;
  active_subcategories: string[];
}

export async function fetchNavigationFromERP(): Promise<NavigationResponse> {
  try {
    const res = await fetch(`${ERP_API_BASE_URL}/api/public/navigation`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (_) {
    return {
      departments: {
        'HOMBRE': [{ name: 'Chaqueta', code: 'CHAQUETA', product_count: 17, total_stock: 33 }]
      },
      active_subcategories: ['CHAQUETA']
    };
  }
}

// ─── Fallback Estático en Caso de Desconexión ────────────────

function getFallbackJackets(): Product[] {
  const SIZES = ['M', 'L', 'XL', 'XXL'];
  const baseColors = [
    { name: 'Negro', slug: 'chaqueta-impermeable-negro', hex: '#1a1a1a', img: '5080-the-north-face-negro.webp', brand: 'The North Face', stockMap: { 'M': { id: '304', stock: 1, ref: '5080-THE-NORTH-FACE-NEGRO-M' }, 'L': { id: '305', stock: 3, ref: '5080-THE-NORTH-FACE-NEGRO-L' }, 'XL': { id: '306', stock: 2, ref: '5080-THE-NORTH-FACE-NEGRO-XL' }, 'XXL': { id: '307', stock: 1, ref: '5080-THE-NORTH-FACE-NEGRO-XXL' } } },
    { name: 'Azul', slug: 'chaqueta-impermeable-azul', hex: '#2b5aa7', img: '5080-the-north-face-azul.webp', brand: 'The North Face', stockMap: { 'M': { id: '308', stock: 2, ref: '5080-THE-NORTH-FACE-AZUL-M' }, 'XL': { id: '309', stock: 1, ref: '5080-THE-NORTH-FACE-AZUL-XL' } } },
    { name: 'Azul Cobalto', slug: 'chaqueta-impermeable-azul-cobalto', hex: '#0047ab', img: '5080-the-north-face-azul-cobalto.webp', brand: 'The North Face', stockMap: { 'XL': { id: '310', stock: 1, ref: '5080-THE-NORTH-FACE-AZUL-COBALTO-XL' } } },
    { name: 'Beige', slug: 'chaqueta-impermeable-beige', hex: '#cbb894', img: '5080-the-north-face-beige.webp', brand: 'The North Face', stockMap: { 'XXL': { id: '311', stock: 1, ref: '5080-THE-NORTH-FACE-BEIGE-XXL' } } },
    { name: 'Gris Claro', slug: 'chaqueta-impermeable-gris-claro', hex: '#b0b3b8', img: '5080-the-north-face-gris-claro.webp', brand: 'The North Face', stockMap: { 'M': { id: '319', stock: 1, ref: '5080-GRIS-CLARO-M' }, 'XXL': { id: '312', stock: 1, ref: '5080-THE-NORTH-FACE-GRIS-CLARO-XXL' } } },
    { name: 'Gris Raton', slug: 'chaqueta-impermeable-gris-raton', hex: '#6e6e6e', img: '5080-the-north-face-gris-raton.webp', brand: 'The North Face', stockMap: { 'M': { id: '313', stock: 1, ref: '5080-THE-NORTH-FACE-GRIS-RATON-M' }, 'XXL': { id: '314', stock: 1, ref: '5080-THE-NORTH-FACE-GRIS-RATON-XXL' } } },
    { name: 'Rojo', slug: 'chaqueta-impermeable-rojo', hex: '#b3282d', img: '5080-the-north-face-rojo.webp', brand: 'The North Face', stockMap: { 'XXL': { id: '315', stock: 1, ref: '5080-THE-NORTH-FACE-ROJO-XXL' } } },
    { name: 'Rojo Franja', slug: 'chaqueta-impermeable-rojo-franja', hex: '#991b1e', img: '5080-the-north-face-rojo-franja.webp', brand: 'The North Face', stockMap: { 'M': { id: '316', stock: 1, ref: '5080-THE-NORTH-FACE-ROJO-FRANJA-M' }, 'L': { id: '318', stock: 1, ref: '5080-COLUMBIA-ROJO-FRANJA-L' }, 'XL': { id: '317', stock: 1, ref: '5080-THE-NORTH-FACE-ROJO-FRANJA-XL' } } },
  ];

  return baseColors.map(c => {
    const vars: ProductVariant[] = SIZES.map(sz => {
      const entry = (c.stockMap as Record<string, any>)[sz];
      if (entry) {
        return {
          id: entry.id,
          talla: sz,
          color: c.name,
          stock: entry.stock,
          status: 'disponible' as const,
          referencia: entry.ref,
        };
      }
      return {
        id: `fb-5080-${c.slug}-${sz.toLowerCase()}-sp`,
        talla: sz,
        color: c.name,
        stock: 0,
        status: 'agotado' as const,
        referencia: `5080-${c.brand.toUpperCase().replace(/\s+/g, '-')}-${sz}`,
      };
    });

    const totalStock = vars.reduce((sum, v) => sum + v.stock, 0);
    return {
      id: `erp-5080-${c.name.toLowerCase().replace(/\s+/g, '-')}`,
      slug: c.slug,
      name: `Chaqueta Impermeable ${c.name}`,
      brand: c.brand,
      category: 'chaquetas' as const,
      subcategory: 'Chaqueta Impermeable Térmica',
      gender: 'hombre' as const,
      tags: ['impermeable', 'urbana', 'térmica', c.name.toLowerCase()],
      price: 90000,
      anchorPrice: 120000,
      image: `/assets/products/5080/${c.img}`,
      images: [`/assets/products/5080/${c.img}`],
      description: `Chaqueta impermeable térmica premium color ${c.name} (${c.brand}). Confección nacional de alta resistencia con forro térmico acolchado, gorro extraíble y protección cortaviento ideal para Pasto y clima frío.`,
      features: [
        'Acolchado térmico (retiene calor corporal)',
        'Gorro / Capucha extraíble con ajuste',
        'Forro térmico interno protector',
        'Tela cortaviento semi-impermeable (soporta llovizna)',
        `Marca destacada: ${c.brand}`,
        `Color: ${c.name}`,
      ],
      variants: vars,
      stock: totalStock,
      status: totalStock > 0 ? ('disponible' as const) : ('agotado' as const),
      featured: true,
      hook: c.name === 'Negro' || c.name === 'Azul',
      source: 'erp' as const,
      colorHex: c.hex,
    };
  });
}
