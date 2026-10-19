import type { Product, ProductVariant } from '../data/products';

// URL base del backend ERP (FastAPI en producción)
export const ERP_API_BASE_URL = 
  import.meta.env.PUBLIC_ERP_API_URL || 
  import.meta.env.VITE_API_URL || 
  'https://estilo-nordico-app.onrender.com';

// ─── Tipos del ERP ──────────────────────────────────────────

export interface ERPProductPublic {
  id: number;
  ref: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  color: string;
  size: string;
  product_type: string;
  slug: string;
  description: string;
  images: string[];
  price_sale: number;
  compare_price?: number;
  stock: number;
  is_active: boolean;
  updated_at: string;
}

// ─── Mapeos de Color para la Chaqueta 5080 ──────────────────

const COLOR_MAP: Record<string, string> = {
  'negro': 'Negro',
  'azul': 'Azul',
  'azul cobalto': 'Azul Cobalto',
  'beige': 'Beige',
  'gris claro': 'Gris Claro',
  'gris raton': 'Gris Raton',
  'gris ratón': 'Gris Raton',
  'rojo': 'Rojo',
  'rojo franja': 'Rojo Franja',
  'verde': 'Verde',
};

const COLOR_IMAGE_MAP: Record<string, string> = {
  'negro': '5080-the-north-face-negro.webp',
  'azul': '5080-the-north-face-azul.webp',
  'azul cobalto': '5080-the-north-face-azul-cobalto.webp',
  'beige': '5080-the-north-face-beige.webp',
  'gris claro': '5080-the-north-face-gris-claro.webp',
  'gris raton': '5080-the-north-face-gris-raton.webp',
  'rojo': '5080-the-north-face-rojo.webp',
  'rojo franja': '5080-the-north-face-rojo-franja.webp',
  'verde': '5080-the-north-face-verde.webp',
};

const COLOR_HEX_MAP: Record<string, string> = {
  'negro': '#1a1a1a',
  'azul': '#2b5aa7',
  'azul cobalto': '#0047ab',
  'beige': '#cbb894',
  'gris claro': '#b0b3b8',
  'gris raton': '#6e6e6e',
  'rojo': '#b3282d',
  'rojo franja': '#991b1e',
  'verde': '#2e5a36',
  'camel': '#c19a6b',
  'amarillo': '#f4d03f',
  'blanco': '#f8f9fa',
  'cafe': '#6f4e37',
  'cafe claro': '#a0785a',
  'cafe oscuro': '#4a3525',
  'lila': '#c8a2c8',
  'salmon': '#fa8072',
  'rosado': '#ffb6c1',
};

const CANONICAL_SIZES = ['M', 'L', 'XL', 'XXL'];
const DEFAULT_JACKET_PRICE = 90000;
const DEFAULT_JACKET_ANCHOR = 120000;

function normalizeColorKey(color: string): string {
  if (!color) return '';
  return color
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function resolveImageUrl(backendImg: string | undefined, colorName: string): string {
  if (backendImg && backendImg.startsWith('http')) {
    return backendImg;
  }
  const norm = normalizeColorKey(colorName);
  const localWebp = COLOR_IMAGE_MAP[norm];
  if (localWebp) {
    return `/assets/products/5080/${localWebp}`;
  }
  return '/assets/products/5080/5080-the-north-face-negro.webp';
}

// ─── API Client para el ERP ─────────────────────────────────

export async function getProducts(params?: {
  product_type?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  in_stock?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ERPProductPublic[]> {
  try {
    const url = new URL(`${ERP_API_BASE_URL}/api/public/products`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[ERP API] Fallo al consultar productos: HTTP ${res.status}`);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error('[ERP API] Error de red o conexión al backend:', err);
    return [];
  }
}

// ─── Agrupación y Mapeo al Catálogo de la Web ───────────────

/**
 * Agrupa las prendas del ERP (Busos, Camisetas, Bermudas, Billeteras, Accesorios)
 * de manera unificada por familia de referencia base para la tienda web.
 */
export function groupERPClothing(items: ERPProductPublic[]): Product[] {
  // Agrupar items por referencia base (ej: '8270', '30861', '7647')
  const refGroups = new Map<string, ERPProductPublic[]>();

  for (const item of items) {
    const refBase = (item.ref || '').split('-')[0].trim().toUpperCase();
    if (!refBase) continue;
    const g = refGroups.get(refBase) || [];
    g.push(item);
    refGroups.set(refBase, g);
  }

  const products: Product[] = [];

  for (const [refBase, groupItems] of refGroups) {
    // Recolectar todas las fotos disponibles de la referencia y sus variantes
    const allImages: string[] = [];
    groupItems.forEach(item => {
      if (Array.isArray(item.images)) {
        item.images.forEach(img => {
          if (img && typeof img === 'string' && img.trim() && !allImages.includes(img.trim())) {
            allImages.push(img.trim());
          }
        });
      }
    });

    // Identificar el producto padre (ref exacta sin sufijos) o el primer item
    const parentItem = groupItems.find(i => i.ref.trim().toUpperCase() === refBase) || groupItems[0];
    
    // Variantes reales (excluyendo el item padre si este solo agrupa)
    const rawVariants = groupItems.filter(i => i.ref.trim().toUpperCase() !== refBase);
    const effectiveVariants = rawVariants.length > 0 ? rawVariants : [parentItem];

    const subcat = (parentItem.subcategory || groupItems[0].subcategory || 'Prenda').trim();
    const cleanSubcat = capitalizeWords(subcat);
    const brand = (parentItem.brand && parentItem.brand !== 'Estilo Nórdico' ? parentItem.brand : groupItems[0].brand) || 'Estilo Nórdico';

    // Generar nombre descriptivo de la prenda
    let baseName = parentItem.name || groupItems[0].name || cleanSubcat;
    // Remover la referencia inicial si viene en el nombre (ej: "8270 EC MULTIMARCA" -> "EC MULTIMARCA")
    baseName = baseName.replace(new RegExp(`^${refBase}\\s*[-_]?\\s*`, 'i'), '').trim();
    if (!baseName.toUpperCase().includes(subcat.toUpperCase())) {
      baseName = `${cleanSubcat} ${baseName}`;
    }

    const totalStock = effectiveVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const hasAvailable = effectiveVariants.some(v => (v.stock || 0) > 0);

    // Mapear cada variante con su foto, color, marca y stock
    const productVariants: ProductVariant[] = effectiveVariants.map(v => {
      const vColor = capitalizeWords((v.color || 'Unicolor').trim());
      const vTalla = (v.size || '').trim().toUpperCase();
      const isAvailable = (v.stock || 0) > 0;
      const vImage = (Array.isArray(v.images) && v.images[0]) ? v.images[0] : allImages[0] || '';
      return {
        id: String(v.id),
        talla: (!vTalla || ['ÚNICA', 'UNICA', 'NONE', 'NULL', ''].includes(vTalla)) ? 'ÚNICA' : vTalla,
        color: vColor,
        stock: v.stock || 0,
        status: isAvailable ? 'disponible' : 'agotado',
        referencia: v.ref,
        image: vImage,
        brand: v.brand || brand,
      };
    });

    const primaryImage = allImages[0] || (
      parentItem.product_type === 'CHAQUETA' 
        ? '/assets/products/5080/5080-the-north-face-negro.webp'
        : '/assets/logo estilo nordico.png'
    );

    const slug = `${subcat.toLowerCase().replace(/\s+/g, '-')}-${refBase.toLowerCase()}`;
    const price = parentItem.price_sale || groupItems[0].price_sale || 85000;
    const anchorPrice = parentItem.compare_price || Math.round(price * 1.4);

    products.push({
      id: `erp-${refBase.toLowerCase()}`,
      slug,
      name: capitalizeWords(baseName),
      brand,
      category: 'chaquetas', // Mapeo a layout existente
      subcategory: subcat,
      gender: (parentItem.category?.toLowerCase() || 'hombre') as any,
      tags: [subcat.toLowerCase(), brand.toLowerCase(), refBase.toLowerCase()],
      price,
      anchorPrice,
      image: primaryImage,
      images: allImages.length > 0 ? allImages : [primaryImage],
      description: parentItem.description || `${cleanSubcat} de confección seleccionada, alta resistencia y diseño moderno. Garantía directa en punto físico Pasto y envíos nacionales.`,
      features: [
        'Materiales de alta durabilidad y excelente confección',
        `Referencia de catálogo: ${refBase}`,
        `Marca destacada: ${brand}`,
        'Garantía directa en punto físico Pasto (Calle 18 Centro)',
      ],
      variants: productVariants,
      stock: totalStock,
      status: hasAvailable ? 'disponible' : 'agotado',
      featured: true,
      source: 'erp',
      colorHex: COLOR_HEX_MAP[normalizeColorKey(productVariants[0]?.color || '')] || '#333333',
    });
  }

  products.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'disponible' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return products;
}

export async function fetchJacketsFromERP(subcategoryFilter?: string): Promise<Product[]> {
  try {
    const rawProducts = await getProducts({ limit: 200 });

    // Chaquetas 5080
    const jacketItems = rawProducts.filter(p => 
      p.ref.startsWith('5080') || 
      p.subcategory?.toUpperCase() === 'CHAQUETA' ||
      p.product_type?.toUpperCase() === 'CHAQUETA'
    );

    // Otras prendas publicadas (Busos, Camisetas, Bermudas, Billeteras, etc.)
    const otherClothing = rawProducts.filter(p => 
      !p.ref.startsWith('5080') &&
      p.subcategory?.toUpperCase() !== 'CHAQUETA' &&
      p.product_type?.toUpperCase() !== 'CHAQUETA'
    );

    const jacketsList = jacketItems.length > 0 ? groupERPJacketsByColor(jacketItems) : getFallbackJackets();
    const otherList = otherClothing.length > 0 ? groupERPClothing(otherClothing) : [];

    const allApparel = [...jacketsList, ...otherList];

    if (subcategoryFilter) {
      const targetSub = subcategoryFilter.toUpperCase().trim();
      return allApparel.filter(p => 
        p.subcategory?.toUpperCase().trim() === targetSub ||
        (targetSub === 'BUSO' && (p.name.toUpperCase().includes('BUSO') || p.subcategory?.toUpperCase().includes('BUSO'))) ||
        (targetSub === 'BILLETERA' && (p.name.toUpperCase().includes('BILLETERA') || p.subcategory?.toUpperCase().includes('BILLETERA')))
      );
    }

    return allApparel;
  } catch (error) {
    console.error('❌ Error conectando al ERP, usando fallback local:', error);
    return getFallbackJackets();
  }
}

/**
 * Agrupa las variantes de la BD por color para generar fichas de producto unificadas para chaquetas 5080.
 */
function groupERPJacketsByColor(items: ERPProductPublic[]): Product[] {
  const colorGroups = new Map<string, ERPProductPublic[]>();

  for (const item of items) {
    let colorName = (item.color || '').trim();
    if (!colorName) {
      const parts = item.ref.split('-');
      if (parts.length >= 3) {
        colorName = parts[parts.length - 2];
      }
    }
    const normKey = normalizeColorKey(colorName);
    const resolvedColor = COLOR_MAP[normKey] || capitalizeWords(colorName) || 'Unicolor';

    const group = colorGroups.get(normKey) || [];
    group.push(item);
    colorGroups.set(normKey, group);
  }

  const products: Product[] = [];

  for (const [normKey, variants] of colorGroups) {
    const colorName = COLOR_MAP[normKey] || capitalizeWords(variants[0].color) || 'Unicolor';
    const slug = `chaqueta-impermeable-${normKey.replace(/\s+/g, '-')}`;
    const brand = variants[0]?.brand || 'The North Face';
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const hasAvailable = variants.some(v => (v.stock || 0) > 0);

    const productVariants: ProductVariant[] = [];
    const existingMap = new Map<string, ProductVariant>();

    variants.forEach(v => {
      let sz = (v.size || '').trim().toUpperCase();
      if (!sz) {
        const parts = v.ref.split('-');
        sz = parts[parts.length - 1].toUpperCase();
      }
      if (sz) {
        existingMap.set(sz, {
          id: String(v.id),
          talla: sz,
          color: colorName,
          stock: v.stock || 0,
          status: (v.stock || 0) > 0 ? 'disponible' : 'agotado',
          referencia: v.ref,
        });
      }
    });

    CANONICAL_SIZES.forEach(sz => {
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

    if (existingMap.has('XXXL')) {
      productVariants.push(existingMap.get('XXXL')!);
    }

    const firstImg = variants.find(v => v.images && v.images.length > 0)?.images?.[0];
    const resolvedImage = resolveImageUrl(firstImg, colorName);

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
