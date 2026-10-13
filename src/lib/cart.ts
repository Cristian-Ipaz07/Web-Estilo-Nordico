/**
 * Gestor del Carrito de Compras Multi-Producto de Estilo Nórdico.
 * 
 * - Persistencia automática en localStorage
 * - Emisión de eventos del DOM para sincronizar UI (badges, drawer, botones)
 * - Generador de mensaje consolidado y link de checkout para WhatsApp
 * - Disparo de evento Meta Pixel: InitiateCheckout
 */

export interface CartItem {
  id: string; // ID único (ej: "5080-THE-NORTH-FACE-NEGRO-L" o "perf-ohm")
  productId: string;
  variantId?: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

const STORAGE_KEY = 'estilo_nordico_cart_v1';

// ─── Helpers de Almacenamiento ──────────────────────────────

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error leyendo carrito de localStorage:', e);
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    notifyCartChange(cart);
  } catch (e) {
    console.error('Error guardando carrito en localStorage:', e);
  }
}

function notifyCartChange(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('cart:updated', {
    detail: {
      items: cart,
      count: getCartCount(cart),
      total: getCartTotal(cart),
    },
  });
  window.dispatchEvent(event);
}

// ─── Operaciones del Carrito ────────────────────────────────

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => i.id === item.id);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += (item.quantity || 1);
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }

  saveCart(cart);
  openCartDrawer();
}

export function removeFromCart(id: string): void {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}

export function updateQuantity(id: string, delta: number): void {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart(cart);
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartTotal(items?: CartItem[]): number {
  const cart = items || getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function getCartCount(items?: CartItem[]): number {
  const cart = items || getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ─── Control de UI (Drawer) ─────────────────────────────────

export function openCartDrawer(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cart:open'));
}

export function closeCartDrawer(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cart:close'));
}

export function toggleCartDrawer(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cart:toggle'));
}

// ─── Checkout con WhatsApp ──────────────────────────────────

export function formatCOP(val: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(val);
}

export interface CheckoutOptions {
  city?: string;
  notes?: string;
  phone?: string;
}

export function buildWhatsAppCheckoutUrl(options: CheckoutOptions = {}): string {
  const cart = getCart();
  if (cart.length === 0) return '';

  const phone = options.phone || '573218888046';
  const city = options.city?.trim() || 'Pasto';
  const total = getCartTotal(cart);

  // Formato pedido multi-producto
  const lines: string[] = [
    '¡Hola Estilo Nórdico! Quiero hacer este pedido:',
  ];

  for (const item of cart) {
    let detail = `${item.quantity}x ${item.name}`;
    if (item.size) detail += ` (Talla ${item.size})`;
    detail += ` - $${formatCOP(item.price * item.quantity)}`;
    lines.push(`- ${detail}`);
  }

  lines.push(`Total: $${formatCOP(total)}`);
  lines.push(`Ciudad: ${city}`);
  
  if (options.notes && options.notes.trim()) {
    lines.push(`Detalles/Dirección: ${options.notes.trim()}`);
  }

  if (city.toLowerCase().includes('pasto')) {
    lines.push('¿Tienen disponible para envío a domicilio y pago contraentrega hoy?');
  } else {
    lines.push('¿Tienen disponible para despacho nacional contraentrega?');
  }

  const messageText = lines.join('\n');

  // Disparar evento de Meta Pixel InitiateCheckout
  if (typeof window !== 'undefined' && (window as any).fbq) {
    try {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_ids: cart.map(i => i.id),
        contents: cart.map(i => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
        num_items: getCartCount(cart),
        value: total,
        currency: 'COP',
      }, { eventID: `cart-checkout-${Date.now()}` });
    } catch (err) {
      console.warn('Error disparando Meta Pixel:', err);
    }
  }

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(messageText)}`;
}
