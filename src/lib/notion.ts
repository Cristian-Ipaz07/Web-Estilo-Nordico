/**
 * Notion integration for Estilo Nórdico.
 * 
 * Fetches jacket inventory from Notion at BUILD TIME.
 * This means the data is baked into static HTML — no runtime API calls.
 * To update: change data in Notion → rebuild/redeploy.
 */

import type { Product, ProductVariant } from '../data/products';

// ─── Color → Image mapping (real jacket photos) ─────────

const COLOR_IMAGE: Record<string, string> = {
  'Azul': '/assets/products/jacket-azul.jpeg',
  'Azul Cobalto': '/assets/products/jacket-azul.jpeg',
  'Beige': '/assets/products/jacket-beige.jpeg',
  'Gris Claro': '/assets/products/jacket-gris-claro.jpeg',
  'Gris Ratón': '/assets/products/jacket-gris-raton.jpeg',
  'Negro': '/assets/products/jacket-negro.jpeg',
  'Rojo': '/assets/products/jacket-rojo.jpeg',
  'Verde': '/assets/products/jacket-verde.jpeg',
};

const COLOR_HEX: Record<string, string> = {
  'Azul': '#2b5aa7',
  'Azul Cobalto': '#0047ab',
  'Beige': '#cbb894',
  'Gris Claro': '#b0b3b8',
  'Gris Ratón': '#6e6e6e',
  'Negro': '#1a1a1a',
  'Rojo': '#b3282d',
  'Verde': '#3d6b4f',
};

const DEFAULT_JACKET_PRICE = 90000;
const DEFAULT_JACKET_ANCHOR_PRICE = 120000;

// ─── Notion helpers ──────────────────────────────────────

function getTextProperty(page: any, propName: string): string {
  const prop = page.properties[propName];
  if (!prop) return '';
  
  switch (prop.type) {
    case 'title':
      return prop.title?.map((t: any) => t.plain_text).join('') ?? '';
    case 'rich_text':
      return prop.rich_text?.map((t: any) => t.plain_text).join('') ?? '';
    case 'select':
      return prop.select?.name ?? '';
    case 'status':
      return prop.status?.name ?? '';
    case 'formula':
      if (prop.formula?.type === 'string') return prop.formula.string ?? '';
      return '';
    default:
      return '';
  }
}

function getNumberProperty(page: any, propName: string): number {
  const prop = page.properties[propName];
  if (!prop) return 0;
  
  switch (prop.type) {
    case 'number':
      return prop.number ?? 0;
    case 'formula':
      if (prop.formula?.type === 'number') return prop.formula.number ?? 0;
      return 0;
    default:
      return 0;
  }
}

// ─── Native Node https fetch to avoid WSL ETIMEDOUT DNS issues ───

async function fetchNotionRaw(databaseId: string, token: string, nextCursor?: string): Promise<any> {
  const dns = await import('node:dns');
  const https = await import('node:https');

  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }

  return new Promise((resolve, reject) => {
    const bodyData = JSON.stringify({
      page_size: 100,
      ...(nextCursor ? { start_cursor: nextCursor } : {})
    });

    const options = {
      hostname: 'api.notion.com',
      port: 443,
      path: `/v1/databases/${databaseId}/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyData)
      },
      family: 4 as const // Force IPv4
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: string) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e: Error) => reject(e));
    req.write(bodyData);
    req.end();
  });
}

// ─── Main fetch function ─────────────────────────────────

interface NotionJacketVariant {
  id: string;
  referencia: string;
  color: string;
  talla: string;
  stock: number;
  estado: 'disponible' | 'agotado';
}

export async function fetchJacketsFromNotion(): Promise<Product[]> {
  const token = process.env.NOTION_TOKEN || import.meta.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID || import.meta.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    console.warn('⚠️ Notion credentials not found in env. Using fallback jacket data.');
    return getFallbackJackets();
  }

  try {
    const allVariants: NotionJacketVariant[] = [];
    let hasMore = true;
    let nextCursor: string | undefined = undefined;

    while (hasMore) {
      const data = await fetchNotionRaw(databaseId, token, nextCursor);

      for (const page of data.results) {
        const referencia = getTextProperty(page, 'Código/Referencia');
        const color = getTextProperty(page, 'Color');
        const talla = getTextProperty(page, 'Talla');
        const stock = getNumberProperty(page, 'Stock Disponible');
        const estadoRaw = getTextProperty(page, 'Estado').toUpperCase();
        const agotado = estadoRaw.includes('AGOTADO') || stock <= 0;

        allVariants.push({
          id: page.id,
          referencia: referencia || 'SIN-REF',
          color: color || 'Sin color',
          talla: talla || 'Única',
          stock,
          estado: agotado ? 'agotado' : 'disponible',
        });
      }

      hasMore = data.has_more;
      nextCursor = data.next_cursor ?? undefined;
    }

    return groupVariantsIntoProducts(allVariants);
  } catch (error) {
    console.error('❌ Error fetching from Notion:', error);
    return getFallbackJackets();
  }
}

function groupVariantsIntoProducts(variants: NotionJacketVariant[]): Product[] {
  const colorGroups = new Map<string, NotionJacketVariant[]>();

  for (const variant of variants) {
    const group = colorGroups.get(variant.color) || [];
    group.push(variant);
    colorGroups.set(variant.color, group);
  }

  const products: Product[] = [];

  for (const [color, colorVariants] of colorGroups) {
    const slug = `chaqueta-impermeable-${color.toLowerCase().replace(/\s+/g, '-')}`;
    const totalStock = colorVariants.reduce((sum, v) => sum + v.stock, 0);
    const hasAvailable = colorVariants.some(v => v.estado === 'disponible');
    
    const productVariants: ProductVariant[] = colorVariants.map(v => ({
      id: v.id,
      talla: v.talla,
      color: v.color,
      stock: v.stock,
      status: v.estado,
      referencia: v.referencia,
    }));

    const sizeOrder = ['M', 'L', 'XL', 'XXL'];
    productVariants.sort((a, b) => sizeOrder.indexOf(a.talla) - sizeOrder.indexOf(b.talla));

    products.push({
      id: `notion-chaq-${color.toLowerCase().replace(/\s+/g, '-')}`,
      slug,
      name: `Chaqueta Impermeable ${color}`,
      brand: 'Estilo Nórdico',
      category: 'chaquetas',
      tags: ['impermeable', 'urbana', color.toLowerCase()],
      price: DEFAULT_JACKET_PRICE,
      anchorPrice: DEFAULT_JACKET_ANCHOR_PRICE,
      image: COLOR_IMAGE[color] || '/assets/products/chaqueta-impermeable.png',
      description: `Chaqueta impermeable premium color ${color}. Protección total contra lluvia y viento, ideal para el clima de Pasto. Disponible en tallas M, L, XL y XXL.`,
      features: [
        'Acolchado térmico (retiene calor corporal)',
        'Gorro / Capucha extraíble',
        'Forro térmico interno protector',
        'Tela cortaviento ultra resistente',
        'Exterior semi-impermeable (soporta llovizna)',
        `Color: ${color}`,
      ],
      variants: productVariants,
      stock: totalStock,
      status: hasAvailable ? 'disponible' : 'agotado',
      featured: ['Azul', 'Negro', 'Rojo'].includes(color),
      hook: color === 'Negro' || color === 'Azul',
      source: 'notion',
      colorHex: COLOR_HEX[color],
    });
  }

  products.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'disponible' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return products;
}

function getFallbackJackets(): Product[] {
  return [
    {
      id: 'chaq-fallback-01',
      slug: 'chaqueta-impermeable-azul',
      name: 'Chaqueta Impermeable Azul',
      brand: 'Estilo Nórdico',
      category: 'chaquetas',
      tags: ['impermeable', 'urbana', 'azul'],
      price: 90000,
      anchorPrice: 120000,
      image: '/assets/products/jacket-azul.jpeg',
      description: 'Chaqueta impermeable premium color Azul.',
      features: [
        'Acolchado térmico (retiene calor corporal)',
        'Gorro / Capucha extraíble',
        'Forro térmico interno protector',
        'Tela cortaviento ultra resistente',
        'Exterior semi-impermeable (soporta llovizna)',
        'Color: Azul',
      ],
      variants: [
        { id: 'fb-1', talla: 'M', color: 'Azul', stock: 3, status: 'disponible', referencia: 'AZ-M' },
        { id: 'fb-2', talla: 'L', color: 'Azul', stock: 2, status: 'disponible', referencia: 'AZ-L' },
        { id: 'fb-3', talla: 'XL', color: 'Azul', stock: 1, status: 'disponible', referencia: 'AZ-XL' },
      ],
      stock: 6,
      status: 'disponible',
      featured: true,
      hook: true,
      source: 'static',
    },
    {
      id: 'chaq-fallback-02',
      slug: 'chaqueta-impermeable-negro',
      name: 'Chaqueta Impermeable Negro',
      brand: 'Estilo Nórdico',
      category: 'chaquetas',
      tags: ['impermeable', 'urbana', 'negro'],
      price: 90000,
      anchorPrice: 120000,
      image: '/assets/products/jacket-negro.jpeg',
      description: 'Chaqueta impermeable premium color Negro.',
      features: [
        'Acolchado térmico (retiene calor corporal)',
        'Gorro / Capucha extraíble',
        'Forro térmico interno protector',
        'Tela cortaviento ultra resistente',
        'Exterior semi-impermeable (soporta llovizna)',
        'Color: Negro',
      ],
      variants: [
        { id: 'fb-4', talla: 'M', color: 'Negro', stock: 4, status: 'disponible', referencia: 'NE-M' },
        { id: 'fb-5', talla: 'L', color: 'Negro', stock: 0, status: 'agotado', referencia: 'NE-L' },
        { id: 'fb-6', talla: 'XL', color: 'Negro', stock: 3, status: 'disponible', referencia: 'NE-XL' },
      ],
      stock: 7,
      status: 'disponible',
      featured: true,
      hook: true,
      source: 'static',
    },
  ];
}
