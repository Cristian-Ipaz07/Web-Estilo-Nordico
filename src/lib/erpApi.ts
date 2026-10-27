import type { Product, ProductVariant } from '../data/products';

// URL base del backend ERP (FastAPI en producción)
export const ERP_API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta?.env && (import.meta.env.PUBLIC_ERP_API_URL || import.meta.env.VITE_API_URL)) || 
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
  'verde': '5080-the-north-face-verde-militar.webp',
};

const COLOR_HEX_MAP: Record<string, string> = {
  'negro': '#1a1a1a',
  'azul': '#2563eb',
  'azul cobalto': '#1e3a8a',
  'beige': '#d2b48c',
  'gris claro': '#cbd5e1',
  'gris raton': '#475569',
  'rojo': '#dc2626',
  'rojo franja': '#831843',
  'verde': '#15803d',
  'verde militar': '#15803d',
  'verde menta': '#6ee7b7',
  'lila pastel': '#d8b4e2',
  'palo de rosa': '#f4a7bb',
  'camel': '#c19a6b',
  'amarillo': '#f4d03f',
  'blanco': '#ffffff',
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


function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
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
  // 1. Si es un CDN en la nube de producción (Supabase Storage, Cloudinary, etc.) y NO es localhost
  if (backendImg && backendImg.startsWith('https://') && !backendImg.includes('localhost') && !backendImg.includes('127.0.0.1')) {
    return backendImg;
  }

  // 2. Si viene una ruta local o de localhost (común en importación ERP), extraer el nombre del archivo
  if (backendImg) {
    const filenameMatch = backendImg.match(/([^\/\\]+\.webp)/i);
    if (filenameMatch) {
      let filename = filenameMatch[1];
      if (filename === '5080-the-north-face-verde.webp') {
        filename = '5080-the-north-face-verde-militar.webp';
      }
      return `/assets/products/5080/${filename}`;
    }
  }

  // 3. Fallback al mapa por nombre normalizado de color
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
    const allItems: ERPProductPublic[] = [];
    const pageSize = 100;
    let currentOffset = params?.offset || 0;
    const maxRequested = params?.limit;

    while (true) {
      const url = new URL(`${ERP_API_BASE_URL}/api/public/products`);
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && key !== 'offset' && key !== 'limit') {
            url.searchParams.append(key, String(val));
          }
        });
      }
      url.searchParams.append('limit', String(pageSize));
      url.searchParams.append('offset', String(currentOffset));

      let res: Response | null = null;
      let attempt = 0;
      while (attempt < 2) {
        attempt++;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 35000);
          res = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (res.ok) break;
        } catch (fetchErr) {
          if (attempt >= 2) throw fetchErr;
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      if (!res) throw new Error("No response received from ERP");

      if (!res.ok) {
        console.warn(`[ERP API] Fallo al consultar productos: HTTP ${res.status}`);
        break;
      }

      const data: ERPProductPublic[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        break;
      }

      allItems.push(...data);

      if (maxRequested && allItems.length >= maxRequested) {
        return allItems.slice(0, maxRequested);
      }

      if (data.length < pageSize) {
        break;
      }

      currentOffset += pageSize;
    }

    return allItems;
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

    // Verificar si las variantes son prendas con tallas reales de confección (S, M, L, XL, XXL, etc.)
    const hasSizedVariants = effectiveVariants.some(v => {
      const sz = (v.size || '').trim().toUpperCase();
      return sz && !['ÚNICA', 'UNICA', 'NONE', 'NULL', ''].includes(sz);
    });

    // Detectar si son prendas con piezas únicas de catálogo (busos, conjuntos, lotes de confección donde cada variante tiene foto, marca y talla única)
    const isUniqueClothingGroup = hasSizedVariants && (
      (parentItem.product_type || '').toUpperCase() === 'ROPA' ||
      (parentItem.subcategory || '').toUpperCase().includes('BUSO') ||
      (parentItem.subcategory || '').toUpperCase().includes('CONJUNTO') ||
      (parentItem.subcategory || '').toUpperCase().includes('CAMISETA') ||
      (parentItem.subcategory || '').toUpperCase().includes('BERMUDA') ||
      (parentItem.name || '').toUpperCase().includes('BUSO') ||
      (parentItem.name || '').toUpperCase().includes('CONJUNTO') ||
      effectiveVariants.some(v => v.stock === 1)
    );

    // Si son piezas únicas (ej: Busos 30861, Camisetas 7647, etc.), cada variante es un PRODUCTO INDIVIDUAL con su foto real y su talla exacta
    if (isUniqueClothingGroup) {
      for (const v of effectiveVariants) {
        const vStock = v.stock || 0;

        // REGLA FUNDAMENTAL DE INVENTARIO:
        // Las prendas únicas de catálogo (camisetas, busos, conjuntos, etc.) que se vendan (stock <= 0)
        // DEBEN DESAPARECER POR COMPLETO de la web.
        if (vStock <= 0) {
          continue;
        }

        const vBrand = (v.brand && v.brand !== 'Estilo Nórdico' ? v.brand : parentItem.brand) || 'Estilo Nórdico';
        const vColor = capitalizeWords((v.color || 'Unicolor').trim());
        const vTalla = (v.size || 'ÚNICA').trim().toUpperCase();
        const isAvailable = true;

        const vImg = (Array.isArray(v.images) && v.images.length > 0 && v.images[0])
          ? v.images[0]
          : (allImages[0] || '/assets/logo estilo nordico.png');

        const vAllImages = Array.isArray(v.images) && v.images.length > 0
          ? v.images
          : [vImg];

        const subcat = (v.subcategory || parentItem.subcategory || 'PRENDA').trim();
        const cleanSubcat = capitalizeWords(subcat);
        const isConjunto = cleanSubcat.toUpperCase() === 'CONJUNTO';
        const isBuso = cleanSubcat.toUpperCase() === 'BUSO';
        const isCamiseta = cleanSubcat.toUpperCase() === 'CAMISETA';

        // Detectar si el grupo padre tiene un nombre específico de colección (ej: "IZAN", "Mónaco")
        const parentNameClean = (parentItem.name || '').trim();
        const isGenericName = (name: string) => {
          const upper = name.toUpperCase();
          return upper.includes('CAMISETA') || 
                 upper.includes('BUSO') || 
                 upper.includes('CONJUNTO') || 
                 upper.includes('ROPA') || 
                 upper.includes('PRENDA') || 
                 upper.includes('TELA') || 
                 upper.includes('1.1') || 
                 upper === refBase;
        };
        const collectionName = (parentNameClean && !isGenericName(parentNameClean))
          ? capitalizeWords(parentNameClean)
          : (refBase === '30861' ? 'Mónaco' : (refBase === '3708' ? 'Izan' : ''));

        // Nombre exacto y vendedor: "Conjunto Importado · Dsquared2 Gris", "Buso Izan · Awesome Blanco" o "Camiseta · Nike Gris Cenizo"
        const displayName = isConjunto
          ? `Conjunto Importado · ${capitalizeWords(vBrand)} ${vColor}`
          : (isBuso
            ? `${cleanSubcat} ${collectionName ? collectionName + ' · ' : ''}${capitalizeWords(vBrand)} ${vColor}`
            : (isCamiseta
              ? `${cleanSubcat} · ${capitalizeWords(vBrand)} ${vColor}`
              : `${cleanSubcat} · ${capitalizeWords(vBrand)} ${vColor}`));

        let vSlug = `${subcat.toLowerCase().replace(/\s+/g, '-')}-${refBase.toLowerCase()}-${slugify(vBrand)}-${slugify(vColor)}-${slugify(vTalla)}`;
        let finalDisplayName = displayName;

        // Desambiguar si existen dos prendas con misma marca, color y talla (ej: Americanino Established vs Italy)
        if (products.some(p => p.slug === vSlug)) {
          const refParts = v.ref.split('-').map(p => slugify(p)).filter(Boolean);
          const diffPart = refParts.find(rp => !vSlug.includes(rp) && rp !== refBase.toLowerCase());
          if (diffPart) {
            vSlug = `${vSlug}-${diffPart}`;
            finalDisplayName = isCamiseta
              ? `${cleanSubcat} · ${capitalizeWords(vBrand)} ${capitalizeWords(diffPart)} ${vColor}`
              : `${displayName} (${capitalizeWords(diffPart)})`;
          } else {
            vSlug = `${vSlug}-${v.id}`;
          }
        }

        const price = v.price_sale || parentItem.price_sale || (isConjunto ? 170000 : 60000);
        const anchorPrice = v.compare_price || parentItem.compare_price || Math.round(price * 1.4);

        const vProductVariants: ProductVariant[] = [{
          id: String(v.id),
          talla: vTalla,
          color: vColor,
          stock: vStock,
          status: 'disponible',
          referencia: v.ref,
          image: vImg,
          brand: vBrand,
        }];

        const refDisplayName = (parentItem.name && parentItem.name.trim() !== refBase)
          ? `${cleanSubcat} · ${capitalizeWords(parentItem.name.trim())} (${refBase})`
          : `${cleanSubcat} · Ref. ${refBase}`;

        products.push({
          id: `erp-${v.ref.toLowerCase().replace(/\s+/g, '-')}`,
          slug: vSlug,
          name: finalDisplayName,
          brand: vBrand,
          reference: refBase,
          referenceName: refDisplayName,
          category: 'chaquetas',
          subcategory: subcat,
          gender: (v.category?.toLowerCase() || parentItem.category?.toLowerCase() || 'hombre') as any,
          tags: [
            subcat.toLowerCase(),
            vBrand.toLowerCase(),
            vColor.toLowerCase(),
            vTalla.toLowerCase(),
            refBase.toLowerCase(),
            collectionName.toLowerCase(),
            isConjunto ? 'conjunto' : (isBuso ? 'buso' : 'camiseta'),
            isConjunto ? 'deportivo' : 'urbano',
            'streetwear',
            'oversize'
          ].filter(Boolean),
          price,
          anchorPrice,
          image: vImg,
          images: vAllImages,
          description: v.description || (isConjunto
            ? `Conjunto urbano y deportivo importado de alta gama (Chaqueta con cremallera + Pantalón/Sudadera). Modelo exclusivo ${capitalizeWords(vBrand)} color ${vColor} en Talla ${vTalla}. Tela suave y resistente de alta calidad, acabados premium y ajuste cómodo. Garantía directa en punto físico Pasto (Manzana G3 Casa 14, Nueva Aranda) y envíos nacionales.`
            : (isBuso
              ? `${cleanSubcat} ${collectionName ? collectionName + ' ' : ''}de confección seleccionada, alta resistencia y diseño moderno. Modelo exclusivo ${capitalizeWords(vBrand)} color ${vColor} en Talla ${vTalla}. Garantía directa en punto físico Pasto (Manzana G3 Casa 14, Nueva Aranda) y envíos nacionales.`
              : `${cleanSubcat} urbana y streetwear de confección premium, tacto suave y máxima frescura. Modelo exclusivo ${capitalizeWords(vBrand)} color ${vColor} en Talla ${vTalla}. Garantía directa en punto físico Pasto (Manzana G3 Casa 14, Nueva Aranda) y envíos nacionales.`)),
          features: isConjunto
            ? [
              `Conjunto completo: Chaqueta con cremallera + Pantalón/Sudadera`,
              `Pieza exclusiva disponible en Talla ${vTalla}`,
              `Diseño y marca: ${capitalizeWords(vBrand)} (${vColor})`,
              'Material importado de alta durabilidad, confort y excelente confección',
              `Referencia exacta: ${v.ref}`,
              'Garantía directa en punto físico Pasto (Manzana G3 Casa 14, Nueva Aranda)',
            ]
            : [
              `Pieza única disponible en Talla ${vTalla}`,
              `Diseño y marca: ${capitalizeWords(vBrand)} (${vColor})`,
              'Materiales de alta durabilidad y excelente confección',
              `Referencia exacta: ${v.ref}`,
              'Garantía directa en punto físico Pasto (Manzana G3 Casa 14, Nueva Aranda)',
            ],
          variants: vProductVariants,
          stock: vStock,
          status: isAvailable ? 'disponible' : 'agotado',
          featured: true,
          source: 'erp',
          colorHex: COLOR_HEX_MAP[normalizeColorKey(v.color || '')] || '#333333',
        });
      }
      continue;
    }

    // Si es un producto multi-diseño sin tallas (ej: Billeteras 8270), se agrupa con selector de modelos
    const subcat = (parentItem.subcategory || groupItems[0].subcategory || 'Prenda').trim();
    const cleanSubcat = capitalizeWords(subcat);
    const brand = (parentItem.brand && parentItem.brand !== 'Estilo Nórdico' ? parentItem.brand : groupItems[0].brand) || 'Estilo Nórdico';

    let baseName = parentItem.name || groupItems[0].name || cleanSubcat;
    baseName = baseName.replace(new RegExp(`^${refBase}\\s*[-_]?\\s*`, 'i'), '').trim();
    if (!baseName.toUpperCase().includes(subcat.toUpperCase())) {
      baseName = `${cleanSubcat} ${baseName}`;
    }

    const totalStock = effectiveVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const hasAvailable = effectiveVariants.some(v => (v.stock || 0) > 0);

    // Si todo el producto multi-diseño está agotado (stock total <= 0), no se muestra en la web
    if (!hasAvailable || totalStock <= 0) {
      continue;
    }

    const availableVariants = effectiveVariants.filter(v => (v.stock || 0) > 0);
    const productVariants: ProductVariant[] = availableVariants.map(v => {
      const vColor = capitalizeWords((v.color || 'Unicolor').trim());
      const vTalla = (v.size || '').trim().toUpperCase();
      const vImage = (Array.isArray(v.images) && v.images[0]) ? v.images[0] : allImages[0] || '';
      return {
        id: String(v.id),
        talla: (!vTalla || ['ÚNICA', 'UNICA', 'NONE', 'NULL', ''].includes(vTalla)) ? 'ÚNICA' : vTalla,
        color: vColor,
        stock: v.stock || 0,
        status: 'disponible',
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

    const refDisplayName = (parentItem.name && parentItem.name.trim() !== refBase)
      ? `${cleanSubcat} · ${capitalizeWords(parentItem.name.trim())} (${refBase})`
      : `${cleanSubcat} · Ref. ${refBase}`;

    products.push({
      id: `erp-${refBase.toLowerCase()}`,
      slug,
      name: capitalizeWords(baseName),
      brand,
      reference: refBase,
      referenceName: refDisplayName,
      category: 'chaquetas',
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
        'Garantía directa en punto físico Pasto (Manzana G3 Casa 14, Nueva Aranda)',
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

    // 1. Chaquetas Hombre (Ref 5080 y categoría HOMBRE)
    const menJacketItems = rawProducts.filter(p => {
      const ref = (p.ref || '').trim();
      const cat = (p.category || '').toUpperCase().trim();
      const sub = (p.subcategory || '').toUpperCase().trim();
      const ptype = (p.product_type || '').toUpperCase().trim();
      if (ref.startsWith('5081') || cat === 'MUJER') return false;
      return ref.startsWith('5080') || ((sub === 'CHAQUETA' || ptype === 'CHAQUETA') && cat !== 'MUJER');
    });

    // 2. Chaquetas Mujer (Ref 5081 y categoría MUJER)
    const womenJacketItems = rawProducts.filter(p => {
      const ref = (p.ref || '').trim();
      const cat = (p.category || '').toUpperCase().trim();
      const sub = (p.subcategory || '').toUpperCase().trim();
      const ptype = (p.product_type || '').toUpperCase().trim();
      return ref.startsWith('5081') || (cat === 'MUJER' && (sub === 'CHAQUETA' || ptype === 'CHAQUETA'));
    });

    // 3. Otras prendas de ropa publicadas (Busos, Camisetas, Conjuntos, Bermudas, etc. EXCLUYENDO accesorios no textiles)
    const otherClothing = rawProducts.filter(p => {
      const ref = (p.ref || '').trim();
      const sub = (p.subcategory || '').toUpperCase().trim();
      const ptype = (p.product_type || '').toUpperCase().trim();
      const cat = (p.category || '').toUpperCase().trim();
      const isJacket = ref.startsWith('5080') || ref.startsWith('5081') || sub === 'CHAQUETA' || ptype === 'CHAQUETA';
      const isAccessory = sub === 'BILLETERA' || ptype === 'BILLETERA' || sub.includes('ACCESORIO') || cat === 'ACCESORIOS';
      return !isJacket && !isAccessory;
    });

    const menJacketsList = menJacketItems.length > 0 ? groupERPMenJackets(menJacketItems) : getFallbackJackets();
    const womenJacketsList = womenJacketItems.length > 0 ? groupERPWomenJackets(womenJacketItems) : [];
    const otherList = otherClothing.length > 0 ? groupERPClothing(otherClothing) : [];

    const allApparel = [...menJacketsList, ...womenJacketsList, ...otherList];

    if (subcategoryFilter) {
      const targetSub = subcategoryFilter.toUpperCase().trim();
      return allApparel.filter(p => 
        p.subcategory?.toUpperCase().trim() === targetSub ||
        (targetSub === 'CONJUNTO' && (p.name.toUpperCase().includes('CONJUNTO') || p.subcategory?.toUpperCase().includes('CONJUNTO'))) ||
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
 * Consulta y procesa todas las camisetas y prendas de streetwear publicadas en el ERP.
 * Agrupa las referencias por modelo/diseño manteniendo disponibles las fotos WebP de Supabase
 * y las variantes de talla con su stock real.
 */
export async function fetchTShirtsFromERP(): Promise<Product[]> {
  try {
    const rawProducts = await getProducts({ limit: 200 });
    const tshirtItems = rawProducts.filter(p => {
      const sub = (p.subcategory || '').toUpperCase().trim();
      const ref = (p.ref || '').toUpperCase().trim();
      const ptype = (p.product_type || '').toUpperCase().trim();
      const name = (p.name || '').toUpperCase().trim();
      if (ref.startsWith('5080') || ref.startsWith('5081')) return false;
      if (sub === 'CHAQUETA' || ptype === 'CHAQUETA' || sub === 'BILLETERA') return false;
      return sub === 'CAMISETA' || name.includes('CAMISETA') || name.includes('POLO') || 
        ref.startsWith('7652') || ref.startsWith('6539') || ref.startsWith('7651') || 
        ref.startsWith('7647') || ref.startsWith('8942') || ref.startsWith('1536') || 
        ref.startsWith('1535') || ref.startsWith('4978') || ref.startsWith('9362');
    });

    if (tshirtItems.length > 0) {
      return groupERPTShirts(tshirtItems);
    }
    return getFallbackTShirts();
  } catch (error) {
    console.error('❌ Error conectando al ERP para camisetas, usando fallback local:', error);
    return getFallbackTShirts();
  }
}

/**
 * Agrupa las camisetas del ERP por referencia base + marca + color/diseño.
 * Mapea las variantes de talla reales (S, M, L, XL, XXL) para tarjetas de alta conversión.
 */
export function groupERPTShirts(items: ERPProductPublic[]): Product[] {
  const groups = new Map<string, { refBase: string; brand: string; color: string; items: ERPProductPublic[] }>();
  const parentMap = new Map<string, ERPProductPublic>();

  for (const p of items) {
    const ref = (p.ref || '').trim();
    const refBase = ref.split('-')[0].trim().toUpperCase();
    if (ref.toUpperCase() === refBase) {
      parentMap.set(refBase, p);
      continue;
    }

    let brand = (p.brand || '').trim();
    let color = (p.color || '').trim();
    const parts = ref.split('-');
    if ((!brand || brand.toUpperCase() === 'ESTILO NÓRDICO' || brand.toUpperCase() === 'ESTILO NORDICO') && parts.length >= 2) {
      brand = parts[1];
    }
    if (!color && parts.length >= 3) {
      color = parts[2];
    }

    brand = brand || 'Estilo Nórdico';
    color = color || 'Unicolor';

    const key = `${refBase}_${brand.toUpperCase()}_${color.toUpperCase()}`;
    const g = groups.get(key) || { refBase, brand, color, items: [] };
    g.items.push(p);
    groups.set(key, g);
  }

  const products: Product[] = [];
  const slugsSeen = new Set<string>();

  for (const [, g] of groups) {
    const { refBase, brand, color, items: groupItems } = g;
    const parent = parentMap.get(refBase);

    // Recolectar todas las imágenes WebP disponibles
    const allImages: string[] = [];
    groupItems.forEach(item => {
      if (Array.isArray(item.images)) {
        item.images.forEach(img => {
          if (img && typeof img === 'string' && !allImages.includes(img.trim())) {
            allImages.push(img.trim());
          }
        });
      }
    });

    if (allImages.length === 0 && parent && Array.isArray(parent.images)) {
      parent.images.forEach(img => {
        if (img && typeof img === 'string' && !allImages.includes(img.trim())) {
          allImages.push(img.trim());
        }
      });
    }

    const primaryImg = allImages[0] || '/assets/logo-nordico.png';

    const price = groupItems[0].price_sale || parent?.price_sale || 55000;
    const anchorPrice = groupItems[0].compare_price || parent?.compare_price || Math.round(price * 1.4);

    const parentName = parent?.name?.trim() || '';
    const isPolo = refBase.includes('1535') || refBase.includes('1536') || (parentName && parentName.toUpperCase().includes('POLO')) || (groupItems[0].name || '').toUpperCase().includes('POLO');
    const isOversize = refBase.includes('8942') || (parentName && parentName.toUpperCase().includes('OVERSIZE')) || brand.toUpperCase().includes('OVERSIZE');

    const prefix = isPolo ? 'Camiseta Polo' : (isOversize ? 'Camiseta Oversize' : 'Camiseta');
    const cleanBrand = capitalizeWords(brand);
    const cleanColor = capitalizeWords(color);
    const name = `${prefix} · ${cleanBrand} ${cleanColor}`;

    let slug = `camiseta-${refBase.toLowerCase()}-${slugify(brand)}-${slugify(color)}`;
    if (slugsSeen.has(slug)) {
      slug = `${slug}-${groupItems[0].id}`;
    }
    slugsSeen.add(slug);

    const totalStock = groupItems.reduce((sum, i) => sum + (i.stock || 0), 0);
    const hasAvailable = groupItems.some(i => (i.stock || 0) > 0);

    const productVariants: ProductVariant[] = groupItems.map(i => {
      const sz = (i.size || '').trim().toUpperCase() || 'ÚNICA';
      const stk = i.stock || 0;
      return {
        id: String(i.id),
        talla: sz,
        color: cleanColor,
        stock: stk,
        status: stk > 0 ? 'disponible' : 'agotado',
        referencia: i.ref,
        image: (Array.isArray(i.images) && i.images[0]) || primaryImg,
        brand: cleanBrand,
      };
    });

    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    productVariants.sort((a, b) => {
      const idxA = sizeOrder.indexOf(a.talla);
      const idxB = sizeOrder.indexOf(b.talla);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.talla.localeCompare(b.talla);
    });

    const collectionTitle = parentName ? capitalizeWords(parentName) : `Ref. ${refBase}`;
    const refDisplayName = `Camiseta · ${collectionTitle} (${refBase})`;

    products.push({
      id: `erp-camiseta-${refBase.toLowerCase()}-${slugify(brand)}-${slugify(color)}`,
      slug,
      name,
      brand: cleanBrand,
      reference: refBase,
      referenceName: refDisplayName,
      category: 'camisetas',
      subcategory: 'CAMISETA',
      gender: 'hombre',
      tags: ['camiseta', 'streetwear', 'moda urbana', cleanBrand.toLowerCase(), cleanColor.toLowerCase(), refBase.toLowerCase()],
      price,
      anchorPrice,
      image: primaryImg,
      images: allImages.length > 0 ? allImages : [primaryImg],
      description: `Camiseta urbana streetwear de confección premium. Modelo exclusivo ${cleanBrand} color ${cleanColor}. Tela fresca, suave al tacto y de alta resistencia con calce moderno ideal para el clima de Pasto y uso diario. Garantía directa en punto físico Pasto y envíos nacionales.`,
      features: [
        `Diseño y confección: ${cleanBrand}`,
        `Color y modelo: ${cleanColor}`,
        `Colección: ${collectionTitle} (${refBase})`,
        'Tela de alta durabilidad, suavidad y tacto frío',
        'Garantía directa en punto físico Pasto (Manzana G3 Casa 14, Nueva Aranda)',
        'Entrega inmediata en Pasto con opción de pago contraentrega'
      ],
      variants: productVariants,
      stock: totalStock,
      status: hasAvailable ? 'disponible' : 'agotado',
      featured: refBase === '7652' || refBase === '6539' || refBase === '7647',
      source: 'erp',
      colorHex: COLOR_HEX_MAP[normalizeColorKey(color)] || '#333333',
    });
  }

  // Ordenar: primero colecciones destacadas (7652, 6539), luego disponibles, luego alfabético
  products.sort((a, b) => {
    const isNewA = a.reference === '7652' || a.reference === '6539';
    const isNewB = b.reference === '7652' || b.reference === '6539';
    if (isNewA && !isNewB) return -1;
    if (!isNewA && isNewB) return 1;

    if (a.status !== b.status) return a.status === 'disponible' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return products;
}

/**
 * Agrupa las variantes de chaquetas de HOMBRE (Ref 5080) por color.
 * Mantiene compatibilidad total con los slugs existentes.
 */
function groupERPMenJackets(items: ERPProductPublic[]): Product[] {
  const colorGroups = new Map<string, ERPProductPublic[]>();

  for (const item of items) {
    if ((item.ref || '').trim().toUpperCase() === '5080') continue;

    let colorName = (item.color || '').trim();
    if (!colorName) {
      const parts = item.ref.split('-');
      if (parts.length >= 3) {
        colorName = parts[parts.length - 2];
      }
    }
    const normKey = normalizeColorKey(colorName);
    if (!normKey) continue;

    const group = colorGroups.get(normKey) || [];
    group.push(item);
    colorGroups.set(normKey, group);
  }

  const products: Product[] = [];

  for (const [normKey, variants] of colorGroups) {
    const colorName = COLOR_MAP[normKey] || capitalizeWords(variants[0].color) || 'Unicolor';
    const slug = `chaqueta-impermeable-${normKey.replace(/\s+/g, '-')}`;
    const brand = variants.find(v => v.brand && v.brand.toUpperCase().includes('NORTH'))?.brand || variants[0]?.brand || 'The North Face';
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
      reference: '5080',
      referenceName: 'Chaqueta · Impermeable Hombre (5080)',
      category: 'chaquetas',
      subcategory: 'Chaqueta Impermeable Térmica',
      gender: 'hombre',
      tags: ['impermeable', 'hombre', 'urbana', 'térmica', normKey, brand.toLowerCase()],
      price,
      anchorPrice,
      image: resolvedImage,
      images: allImages,
      description: `Chaqueta impermeable térmica para hombre color ${colorName} (${brand}). Confección nacional de alta resistencia con forro térmico acolchado, gorro extraíble y protección cortaviento ideal para Pasto y clima frío.`,
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

/**
 * Agrupa las variantes de chaquetas de MUJER (Ref 5081) por marca y color.
 * Separa Columbia y The North Face, asignando género femenino y fotos reales desde Supabase.
 */
function groupERPWomenJackets(items: ERPProductPublic[]): Product[] {
  const groups = new Map<string, ERPProductPublic[]>();

  for (const item of items) {
    if ((item.ref || '').trim().toUpperCase() === '5081') continue;

    let colorName = (item.color || '').trim();
    if (!colorName) {
      const parts = item.ref.split('-');
      if (parts.length >= 3) {
        colorName = parts[parts.length - 2];
      }
    }
    const normColor = normalizeColorKey(colorName);
    if (!normColor) continue;

    const brand = (item.brand || (normColor === 'rojo' ? 'The North Face' : 'Columbia')).trim();
    const groupKey = `${slugify(brand)}__${normColor}`;

    const group = groups.get(groupKey) || [];
    group.push(item);
    groups.set(groupKey, group);
  }

  const products: Product[] = [];
  const WOMEN_SIZES = ['S', 'M', 'L', 'XL'];

  for (const [groupKey, variants] of groups) {
    const [brandSlug, normColor] = groupKey.split('__');
    const brand = variants[0]?.brand || (brandSlug === 'columbia' ? 'Columbia' : 'The North Face');
    const colorName = COLOR_MAP[normColor] || capitalizeWords(variants[0].color) || 'Unicolor';
    const slug = `chaqueta-impermeable-dama-${brandSlug}-${normColor.replace(/\s+/g, '-')}`;
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

    WOMEN_SIZES.forEach(sz => {
      if (existingMap.has(sz)) {
        productVariants.push(existingMap.get(sz)!);
      } else {
        productVariants.push({
          id: `erp-5081-${brandSlug}-${normColor}-${sz.toLowerCase()}-sp`,
          talla: sz,
          color: colorName,
          stock: 0,
          status: 'agotado',
          referencia: `5081-${brand.toUpperCase().replace(/\s+/g, '-')}-${normColor.toUpperCase()}-${sz}`,
        });
      }
    });

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
      id: `erp-5081-${brandSlug}-${normColor.replace(/\s+/g, '-')}`,
      slug,
      name: `Chaqueta Impermeable Dama ${brand} ${colorName}`,
      brand,
      reference: '5081',
      referenceName: 'Chaqueta · Impermeable Dama (5081)',
      category: 'chaquetas',
      subcategory: 'Chaqueta Impermeable Dama',
      gender: 'mujer',
      tags: ['impermeable', 'mujer', 'dama', 'urbana', 'térmica', normColor, brand.toLowerCase()],
      price,
      anchorPrice,
      image: resolvedImage,
      images: allImages,
      description: `Chaqueta impermeable térmica para dama ${brand} color ${colorName}. Confección liviana y abrigada con forro térmico acolchado, silueta ergonómica, capucha ajustable y protección cortaviento ideal para Pasto y clima frío.`,
      features: [
        `Silueta y corte exclusivo para dama (${brand})`,
        'Forro térmico acolchado que retiene calor corporal',
        'Capucha / Gorro con ajuste y cordón',
        'Tela cortaviento semi-impermeable (soporta llovizna)',
        `Color disponible: ${colorName}`,
        'Garantía directa en punto físico Pasto (Manzana G3 Casa 14, Nueva Aranda)',
      ],
      variants: productVariants,
      stock: totalStock,
      status: hasAvailable ? 'disponible' : 'agotado',
      featured: ['Verde Menta', 'Palo de Rosa', 'Lila Pastel', 'Negro', 'Blanco'].includes(colorName),
      hook: colorName === 'Verde Menta' || colorName === 'Palo de Rosa',
      source: 'erp',
      colorHex: COLOR_HEX_MAP[normColor] || '#e8a598',
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
    { name: 'Negro', slug: 'chaqueta-impermeable-negro', hex: '#1a1a1a', img: '5080-the-north-face-negro.webp', brand: 'The North Face', stockMap: { 'L': { id: '305', stock: 1, ref: '5080-THE-NORTH-FACE-NEGRO-L' }, 'XL': { id: '306', stock: 2, ref: '5080-THE-NORTH-FACE-NEGRO-XL' }, 'XXL': { id: '307', stock: 1, ref: '5080-THE-NORTH-FACE-NEGRO-XXL' } } },
    { name: 'Azul', slug: 'chaqueta-impermeable-azul', hex: '#2b5aa7', img: '5080-the-north-face-azul.webp', brand: 'The North Face', stockMap: { 'M': { id: '308', stock: 1, ref: '5080-THE-NORTH-FACE-AZUL-M' }, 'XXL': { id: '320', stock: 1, ref: '5080-THE-NORTH-FACE-AZUL-XXL' } } },
    { name: 'Azul Cobalto', slug: 'chaqueta-impermeable-azul-cobalto', hex: '#0047ab', img: '5080-the-north-face-azul-cobalto.webp', brand: 'The North Face', stockMap: { 'L': { id: '310', stock: 1, ref: '5080-THE-NORTH-FACE-AZUL-COBALTO-L' }, 'XL': { id: '311', stock: 1, ref: '5080-THE-NORTH-FACE-AZUL-COBALTO-XL' } } },
    { name: 'Beige', slug: 'chaqueta-impermeable-beige', hex: '#cbb894', img: '5080-the-north-face-beige.webp', brand: 'The North Face', stockMap: { 'M': { id: '312', stock: 1, ref: '5080-THE-NORTH-FACE-BEIGE-M' }, 'XXL': { id: '313', stock: 1, ref: '5080-THE-NORTH-FACE-BEIGE-XXL' } } },
    { name: 'Gris Claro', slug: 'chaqueta-impermeable-gris-claro', hex: '#b0b3b8', img: '5080-the-north-face-gris-claro.webp', brand: 'The North Face', stockMap: { 'M': { id: '314', stock: 1, ref: '5080-THE-NORTH-FACE-GRIS-CLARO-M' }, 'XL': { id: '315', stock: 1, ref: '5080-THE-NORTH-FACE-GRIS-CLARO-XL' }, 'XXL': { id: '316', stock: 1, ref: '5080-THE-NORTH-FACE-GRIS-CLARO-XXL' } } },
    { name: 'Gris Raton', slug: 'chaqueta-impermeable-gris-raton', hex: '#6e6e6e', img: '5080-the-north-face-gris-raton.webp', brand: 'The North Face', stockMap: { 'L': { id: '317', stock: 1, ref: '5080-THE-NORTH-FACE-GRIS-RATON-L' }, 'M': { id: '318', stock: 1, ref: '5080-THE-NORTH-FACE-GRIS-RATON-M' }, 'XL': { id: '319', stock: 1, ref: '5080-THE-NORTH-FACE-GRIS-RATON-XL' } } },
    { name: 'Rojo', slug: 'chaqueta-impermeable-rojo', hex: '#b3282d', img: '5080-the-north-face-rojo.webp', brand: 'The North Face', stockMap: { 'XXL': { id: '321', stock: 1, ref: '5080-THE-NORTH-FACE-ROJO-XXL' } } },
    { name: 'Rojo Franja', slug: 'chaqueta-impermeable-rojo-franja', hex: '#991b1e', img: '5080-the-north-face-rojo-franja.webp', brand: 'The North Face', stockMap: { 'L': { id: '322', stock: 1, ref: '5080-THE-NORTH-FACE-ROJO-FRANJA-L' } } },
    { name: 'Verde', slug: 'chaqueta-impermeable-verde', hex: '#15803d', img: '5080-the-north-face-verde-militar.webp', brand: 'The North Face', stockMap: { 'L': { id: '323', stock: 1, ref: '5080-THE-NORTH-FACE-VERDE-L' }, 'M': { id: '324', stock: 1, ref: '5080-THE-NORTH-FACE-VERDE-M' }, 'XL': { id: '325', stock: 1, ref: '5080-THE-NORTH-FACE-VERDE-XL' }, 'XXL': { id: '326', stock: 1, ref: '5080-THE-NORTH-FACE-VERDE-XXL' } } },
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

function getFallbackTShirts(): Product[] {
  const fallbackItems: ERPProductPublic[] = [
    {
      id: 446,
      ref: '7652',
      name: 'TELA MULTIMARCA',
      brand: 'Estilo Nórdico',
      category: 'Hombre',
      subcategory: 'CAMISETA',
      price_sale: 55000,
      compare_price: 77000,
      stock: 7,
      is_published: true,
      images: [
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_amco_blanco_2dbcfb.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_chevignon_blanco_22e3c2.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_diesel_azul_38be1a.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_diesel_blanco_23a90f.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_diesel_cafe_8b5fbe.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_superdry_blanco_106e8d.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_superdry_cafe_8d4ba0.webp',
      ],
    },
    { id: 452, ref: '7652-AMERICANINO-BLANCO-HUESO-M', name: 'TELA MULTIMARCA AMERICANINO BLANCO HUESO M', brand: 'AMERICANINO', color: 'BLANCO HUESO', size: 'M', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_amco_blanco_2dbcfb.webp'] },
    { id: 451, ref: '7652-CHEVIGNON-BLANCO-HUESO-M', name: 'TELA MULTIMARCA CHEVIGNON BLANCO HUESO M', brand: 'CHEVIGNON', color: 'BLANCO HUESO', size: 'M', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_chevignon_blanco_22e3c2.webp'] },
    { id: 453, ref: '7652-DIESEL-AZUL-CELESTE-M', name: 'TELA MULTIMARCA DIESEL AZUL CELESTE M', brand: 'DIESEL', color: 'AZUL CELESTE', size: 'M', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_diesel_azul_38be1a.webp'] },
    { id: 447, ref: '7652-DIESEL-BLANCO-HUESO-XL', name: 'TELA MULTIMARCA DIESEL BLANCO HUESO XL', brand: 'DIESEL', color: 'BLANCO HUESO', size: 'XL', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_diesel_blanco_23a90f.webp'] },
    { id: 449, ref: '7652-DIESEL-CAFE-L', name: 'TELA MULTIMARCA DIESEL CAFE L', brand: 'DIESEL', color: 'CAFE', size: 'L', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_diesel_cafe_8b5fbe.webp'] },
    { id: 454, ref: '7652-DIESEL-CAFE-M', name: 'TELA MULTIMARCA DIESEL CAFE M', brand: 'DIESEL', color: 'CAFE', size: 'M', stock: 0, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_diesel_cafe_8b5fbe.webp'] },
    { id: 448, ref: '7652-SUPERDRY-BLANCO-HUESO-L', name: 'TELA MULTIMARCA SUPERDRY BLANCO HUESO L', brand: 'SUPERDRY', color: 'BLANCO HUESO', size: 'L', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_superdry_blanco_106e8d.webp'] },
    { id: 450, ref: '7652-SUPERDRY-CAFE-L', name: 'TELA MULTIMARCA SUPERDRY CAFE L', brand: 'SUPERDRY', color: 'CAFE', size: 'L', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/7652_superdry_cafe_8d4ba0.webp'] },
    {
      id: 439,
      ref: '6539',
      name: 'TELA FRIA ESTAMPADA',
      brand: 'Estilo Nórdico',
      category: 'Hombre',
      subcategory: 'CAMISETA',
      price_sale: 55000,
      compare_price: 77000,
      stock: 6,
      is_published: true,
      images: [
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_clemont_angeles_ad_2d556d.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_clemont_negro_ad_ae1866.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_nike_ad_2bbc96.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_jordan_ad_fa47f9.webp',
        'https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_undergold_ad_6e0b43.webp',
      ],
    },
    { id: 441, ref: '6539-CLEMONT-ANGELES-NEGRO-M', name: 'TELA FRIA ESTAMPADA CLEMONT ANGELES NEGRO M', brand: 'CLEMONT', color: 'NEGRO', size: 'M', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_clemont_angeles_ad_2d556d.webp'] },
    { id: 442, ref: '6539-CLEMONT-CM-NEGRO-L', name: 'TELA FRIA ESTAMPADA CLEMONT CM NEGRO L', brand: 'CLEMONT', color: 'NEGRO', size: 'L', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_clemont_negro_ad_ae1866.webp'] },
    { id: 443, ref: '6539-CLEMONT-CM-NEGRO-XL', name: 'TELA FRIA ESTAMPADA CLEMONT CM NEGRO XL', brand: 'CLEMONT', color: 'NEGRO', size: 'XL', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_clemont_negro_ad_ae1866.webp'] },
    { id: 444, ref: '6539-NIKE-AIR-CREMA-M', name: 'TELA FRIA ESTAMPADA NIKE AIR CREMA M', brand: 'NIKE', color: 'CREMA', size: 'M', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_nike_ad_2bbc96.webp'] },
    { id: 445, ref: '6539-NIKE-JORDAN-CREMA-L', name: 'TELA FRIA ESTAMPADA NIKE JORDAN CREMA L', brand: 'NIKE', color: 'CREMA', size: 'L', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_jordan_ad_fa47f9.webp'] },
    { id: 440, ref: '6539-UNDERGOLD-VENDA-NEGRO-M', name: 'TELA FRIA ESTAMPADA UNDERGOLD VENDA NEGRO M', brand: 'UNDERGOLD', color: 'NEGRO', size: 'M', stock: 1, price_sale: 55000, is_published: true, images: ['https://rnlvzrelpvqjamcfvoga.supabase.co/storage/v1/object/public/products/6539_undergold_ad_6e0b43.webp'] },
  ];

  return groupERPTShirts(fallbackItems);
}
