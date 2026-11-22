export function normalizeWhatsApp(value: string): string { return value.replace(/[^0-9]/g, ''); }
export function whatsappUrl(number: string, message: string): string { return `https://wa.me/${normalizeWhatsApp(number)}?text=${encodeURIComponent(message)}`; }
