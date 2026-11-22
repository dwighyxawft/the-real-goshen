import { db } from './index';
import { categories, faqs, products, siteSettings } from './schema';

const categorySeed = [
  { name: 'Bags', slug: 'bags', sortOrder: 0 },
  { name: 'Shoes', slug: 'shoes', sortOrder: 1 },
  { name: 'Accessories', slug: 'accessories', sortOrder: 2 },
];

const faqSeed = [
  ['How do I pay for the products I am interested in?', 'Payment is arranged directly with us by email or WhatsApp after you submit your interests. Nothing is paid on the website.'],
  ['What is a preorder and how long does it take?', 'We order the item for you from our supplier and it usually arrives in about 4 to 8 weeks after your order is confirmed.'],
  ['Can I get updates while I wait?', 'Yes. We keep you updated through the contact details you share with us.'],
  ['Do you deliver outside Lagos?', 'Send us your location with your interests and we will confirm the available delivery options.'],
  ['Can I return or exchange an item?', 'We will share the applicable details for your item before anything is confirmed.'],
  ['What if an item is unavailable?', 'We will let you know before confirming your interest and suggest alternatives when possible.'],
  ['Can I request a custom piece?', 'Send us a message with what you are looking for and we will let you know what is possible.'],
  ['How do discounts work?', 'Discounts are applied to selected pieces during active events and are reflected in the estimate you see.'],
] as const;

const productSeed = [
  ['Sienna Structured Tote', 'sienna-structured-tote', 'A polished everyday tote with room for your essentials.', 38500, 'bags', 'preorder'],
  ['Muse Pointed Heels', 'muse-pointed-heels', 'Elegant pointed heels designed for entrances and celebrations.', 32000, 'shoes', 'preorder'],
  ['Noir Mini Top Handle', 'noir-mini-top-handle', 'A compact black top-handle bag with gold-toned details.', 29500, 'bags', 'ready_stock'],
  ['Luna Satin Mules', 'luna-satin-mules', 'Slip-on satin mules for effortless day-to-evening styling.', 27500, 'shoes', 'ready_stock'],
  ['Opal Chain Shoulder Bag', 'opal-chain-shoulder-bag', 'A softly luminous shoulder bag finished with a statement chain.', 25000, 'accessories', 'preorder'],
  ['Thea Woven Crossbody', 'thea-woven-crossbody', 'Textured, light, and easy to wear for everyday looks.', 22000, 'bags', 'preorder'],
] as const;

async function seed() {
  const insertedCategories = await db.insert(categories).values(categorySeed).onConflictDoNothing().returning({ id: categories.id, slug: categories.slug });
  const categoryIds = new Map(insertedCategories.map((category) => [category.slug, category.id]));
  const existingCategories = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  for (const category of existingCategories) categoryIds.set(category.slug, category.id);

  await db.insert(faqs).values(faqSeed.map(([question, answer], sortOrder) => ({ question, answer, sortOrder, isPublished: true }))).onConflictDoNothing();
  await db.insert(siteSettings).values({ id: 1, whatsappNumber: '', defaultLeadTimeWeeksMin: 4, defaultLeadTimeWeeksMax: 8, storeEmail: '', heroHeadline: 'Pieces that make an entrance.', heroSubheadline: 'Style. Confidence. You.', aboutBody: '' }).onConflictDoNothing();
  await db.insert(products).values(productSeed.map(([name, slug, description, price, categorySlug, availability]) => ({ name, slug, description, price, categoryId: categoryIds.get(categorySlug), availability, images: [], isPublished: true, isFeatured: true, stockStatus: 'in_stock' as const }))).onConflictDoNothing();
  console.log('Seed complete');
}

seed().catch((error) => { console.error(error); process.exitCode = 1; });
