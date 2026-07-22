/**
 * Utilidades para generación de URLs y mensajes de WhatsApp.
 * 
 * Genera mensajes pre-llenados con datos del producto para
 * el flujo de conversión directa.
 */

import { STORE_CONFIG } from '../config/store';

interface WhatsAppMessageParams {
  productName: string;
  productBrand: string;
  productId: string;
  price: number;
}

/**
 * Genera la URL de WhatsApp con mensaje pre-llenado para un pedido
 */
export function generateWhatsAppOrderUrl(params: WhatsAppMessageParams): string {
  const { productName, productBrand, productId, price } = params;
  
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price);

  const message = 
    `*SOLICITUD DE PEDIDO CONTRAENTREGA (PASTO)*\n\n` +
    `📦 *Producto:* ${productName} (${productBrand})\n` +
    `🆔 *Código:* ${productId}\n` +
    `💰 *Precio Especial:* $${formattedPrice} COP\n\n` +
    `📍 _Por favor, indícame tu nombre y dirección en Pasto para coordinar la entrega hoy mismo._`;

  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${STORE_CONFIG.whatsapp.number}&text=${encodedMessage}`;
}

/**
 * Genera la URL de WhatsApp para consulta general
 */
export function generateWhatsAppGeneralUrl(): string {
  const encodedMessage = encodeURIComponent(STORE_CONFIG.whatsapp.defaultMessage);
  return `https://api.whatsapp.com/send?phone=${STORE_CONFIG.whatsapp.number}&text=${encodedMessage}`;
}
