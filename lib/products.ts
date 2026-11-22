export type Availability = 'preorder' | 'ready_stock';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  availability: Availability;
  leadTime?: string;
  stock?: 'in_stock' | 'limited' | 'out_of_stock';
  description: string;
  accent: string;
}

export const products: Product[] = [
  { id: '1', slug: 'sienna-structured-tote', name: 'Sienna Structured Tote', category: 'Bags', price: 38500, originalPrice: 48000, discount: 20, availability: 'preorder', leadTime: '4 to 8 weeks', description: 'A polished everyday tote with room for your essentials and a confident, structured silhouette.', accent: 'sand' },
  { id: '2', slug: 'muse-pointed-heels', name: 'Muse Pointed Heels', category: 'Shoes', price: 32000, availability: 'preorder', leadTime: '6 to 8 weeks', description: 'Elegant pointed heels designed for entrances, celebrations, and everything in between.', accent: 'rose' },
  { id: '3', slug: 'noir-mini-top-handle', name: 'Noir Mini Top Handle', category: 'Bags', price: 29500, availability: 'ready_stock', stock: 'limited', description: 'A compact black top-handle bag with a softly sculpted profile and gold-toned details.', accent: 'noir' },
  { id: '4', slug: 'luna-satin-mules', name: 'Luna Satin Mules', category: 'Shoes', price: 27500, availability: 'ready_stock', stock: 'in_stock', description: 'Slip-on satin mules with a low sculptural heel for effortless day-to-evening styling.', accent: 'cream' },
  { id: '5', slug: 'opal-chain-shoulder-bag', name: 'Opal Chain Shoulder Bag', category: 'Accessories', price: 25000, originalPrice: 30000, discount: 17, availability: 'preorder', leadTime: '4 to 8 weeks', description: 'A softly luminous shoulder bag finished with a statement chain and a neat magnetic closure.', accent: 'pearl' },
  { id: '6', slug: 'thea-woven-crossbody', name: 'Thea Woven Crossbody', category: 'Bags', price: 22000, availability: 'preorder', leadTime: '4 to 8 weeks', description: 'Textured, light, and easy to wear, Thea brings a relaxed finish to everyday looks.', accent: 'tan' },
  { id: '7', slug: 'celeste-slingback', name: 'Celeste Slingback', category: 'Shoes', price: 35000, availability: 'preorder', leadTime: '6 to 8 weeks', description: 'A refined slingback with a flattering line and just enough shine for special occasions.', accent: 'blush' },
  { id: '8', slug: 'cleo-sculptural-earrings', name: 'Cleo Sculptural Earrings', category: 'Accessories', price: 12500, availability: 'ready_stock', stock: 'in_stock', description: 'Modern gold-tone earrings that make a quiet statement with every outfit.', accent: 'gold' },
];

export const categories = ['Bags', 'Shoes', 'Accessories'];
export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
export const formatNaira = (value: number) => `₦${value.toLocaleString('en-NG')}`;
