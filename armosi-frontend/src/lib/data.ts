import { Product, CustomItem } from './types';

export const D: Record<string, Product[]> = {
  trending: [
    { id: 1, name: 'Pastel Gel Pen Set', price: 299, mrp: 499, emoji: '🖊️', bg: '#FFF0F9' },
    { id: 2, name: 'Kraft Hardcover Journal', price: 449, mrp: 699, emoji: '📔', bg: '#FFF8EC' },
    { id: 3, name: 'Washi Tape Bundle', price: 199, mrp: 349, emoji: '🎀', bg: '#F0FFF4' },
    { id: 4, name: 'Calligraphy Kit', price: 649, mrp: 999, emoji: '✒️', bg: '#F0EBFF' },
    { id: 5, name: 'Glitter Brush Markers', price: 379, mrp: 599, emoji: '🖌️', bg: '#FFF0F9' },
  ],
  pens: [
    { id: 6, name: 'Pilot G-2 Pro 5pk', price: 249, mrp: 349, emoji: '🖊️', bg: '#F0EBFF' },
    { id: 7, name: 'Zebra Mildliner Set', price: 599, mrp: 849, emoji: '🖋️', bg: '#FFF8EC' },
    { id: 8, name: 'Staedtler Triplus', price: 349, mrp: 499, emoji: '✏️', bg: '#F0FFF4' },
    { id: 9, name: 'Pentel EnerGel', price: 199, mrp: 299, emoji: '🖊️', bg: '#FFF0F9' },
    { id: 20, name: 'Sakura Micron Set', price: 449, mrp: 649, emoji: '🖊️', bg: '#F0EBFF' },
  ],
  notebooks: [
    { id: 10, name: 'A5 Dotted Notebook', price: 349, mrp: 499, emoji: '📓', bg: '#F0EBFF' },
    { id: 11, name: 'Spiral Planner 2025', price: 499, mrp: 699, emoji: '📅', bg: '#FFF8EC' },
    { id: 12, name: 'Recycled Kraft Journal', price: 399, mrp: 599, emoji: '📔', bg: '#F0FFF4' },
    { id: 13, name: 'Pocket Memo Set', price: 199, mrp: 299, emoji: '📝', bg: '#FFF0F9' },
  ],
  geo: [
    { id: 30, name: 'Camlin Geometry Box', price: 149, mrp: 249, emoji: '📐', bg: '#FFF8EC' },
    { id: 31, name: 'Steel Scale 30cm', price: 79, mrp: 129, emoji: '📏', bg: '#F0EBFF' },
    { id: 32, name: 'Protractor Set', price: 99, mrp: 179, emoji: '🔭', bg: '#F0FFF4' },
    { id: 33, name: 'Compass Premium', price: 249, mrp: 399, emoji: '🧭', bg: '#FFF0F9' },
  ],
  eraser: [
    { id: 34, name: 'Apsara Eraser Pack', price: 49, mrp: 79, emoji: '⬜', bg: '#F0EBFF' },
    { id: 35, name: 'Nataraj Sharpener', price: 39, mrp: 69, emoji: '🔩', bg: '#FFF8EC' },
    { id: 36, name: 'Art Kneaded Eraser', price: 129, mrp: 199, emoji: '🧹', bg: '#F0FFF4' },
  ],
  art: [
    { id: 14, name: 'Winsor Color Pencils', price: 849, mrp: 1199, emoji: '🎨', bg: '#FFF0F9' },
    { id: 15, name: 'Watercolor Travel Set', price: 699, mrp: 999, emoji: '🖼️', bg: '#F0EBFF' },
    { id: 16, name: 'Fine Liner Pack (10)', price: 449, mrp: 649, emoji: '🖌️', bg: '#FFF8EC' },
    { id: 17, name: 'Posca Paint Markers', price: 749, mrp: 1099, emoji: '✨', bg: '#F0FFF4' },
  ],
  washi: [
    { id: 40, name: 'Floral Washi Bundle', price: 199, mrp: 349, emoji: '🌸', bg: '#FFF0F9' },
    { id: 41, name: 'Pastel Washi 5pc', price: 249, mrp: 399, emoji: '🎀', bg: '#F0FFF4' },
    { id: 42, name: 'Gold Foil Washi', price: 299, mrp: 499, emoji: '✨', bg: '#FFF8EC' },
  ],
  calli: [
    { id: 43, name: 'Calligraphy Starter Kit', price: 649, mrp: 999, emoji: '✒️', bg: '#F0EBFF' },
    { id: 44, name: 'Brush Pen Set (6)', price: 399, mrp: 599, emoji: '🖋️', bg: '#FFF0F9' },
    { id: 45, name: 'Ink Dip Nib Set', price: 499, mrp: 749, emoji: '🪶', bg: '#F0FFF4' },
  ],
  sticker: [
    { id: 46, name: 'Aesthetic Sticker Set', price: 149, mrp: 249, emoji: '⭐', bg: '#FFF8EC' },
    { id: 47, name: 'Study Planner Stickers', price: 199, mrp: 299, emoji: '📌', bg: '#F0EBFF' },
    { id: 48, name: 'Holographic Stars', price: 179, mrp: 279, emoji: '🌟', bg: '#FFF0F9' },
  ],
  chart: [
    { id: 50, name: 'Chart Paper Pack (12)', price: 99, mrp: 149, emoji: '📄', bg: '#FFF8EC' },
    { id: 51, name: 'Ivory Drawing Sheets', price: 149, mrp: 229, emoji: '🗒️', bg: '#F0FFF4' },
    { id: 52, name: 'Colour Chart Set', price: 179, mrp: 279, emoji: '🌈', bg: '#F0EBFF' },
  ],
  pgeo: [
    { id: 53, name: 'Deluxe Geometry Set', price: 299, mrp: 449, emoji: '📐', bg: '#FFF8EC' },
    { id: 54, name: 'Compass + Divider', price: 199, mrp: 299, emoji: '🧭', bg: '#F0EBFF' },
    { id: 55, name: 'Set Square Duo', price: 129, mrp: 199, emoji: '📏', bg: '#FFF0F9' },
  ],
  kits: [
    { id: 56, name: 'Science Project Kit', price: 449, mrp: 649, emoji: '🔬', bg: '#F0FFF4' },
    { id: 57, name: 'Art Project Bundle', price: 599, mrp: 899, emoji: '🎨', bg: '#FFF0F9' },
    { id: 58, name: 'Craft & Paste Kit', price: 349, mrp: 549, emoji: '✂️', bg: '#FFF8EC' },
    { id: 59, name: 'Map Work Kit', price: 299, mrp: 449, emoji: '🗺️', bg: '#F0EBFF' },
  ],
  boards: [
    { id: 60, name: 'A1 Foam Board White', price: 199, mrp: 299, emoji: '🟥', bg: '#FFF8EC' },
    { id: 61, name: 'Tri-Fold Display Board', price: 349, mrp: 499, emoji: '🪧', bg: '#F0FFF4' },
    { id: 62, name: 'Cork Notice Board', price: 599, mrp: 899, emoji: '📌', bg: '#F0EBFF' },
  ],
  gifts: [
    { id: 18, name: 'Premium Gift Box', price: 1299, mrp: 1799, emoji: '🎁', bg: '#FFF0F9' },
    { id: 19, name: 'Stationery Hamper', price: 1499, mrp: 2199, emoji: '🎀', bg: '#F0EBFF' },
    { id: 21, name: 'Study Essentials Kit', price: 899, mrp: 1299, emoji: '📚', bg: '#FFF8EC' },
  ],
};

export function getFallbackProducts(): Product[] {
  return Object.entries(D).flatMap(([category, products]) =>
    products.map((product) => ({
      ...product,
      category: product.category || category,
      description: product.description || `Premium ${product.name} from Armosi.`,
    })),
  );
}

export function getFallbackProductById(productId: string | number): Product | null {
  const searchId = String(productId).trim();
  return getFallbackProducts().find((product) => String(product.id).trim() === searchId) || null;
}

export const CUSTOM_ITEMS: CustomItem[] = [
  { name: 'Customize Pad', sub: 'Personalised writing pad', emoji: '📝', bg: 'linear-gradient(145deg,#FFF0F4,#FFD6E0)' },
  { name: 'Customize Dairy', sub: 'Name & cover design', emoji: '📗', bg: 'linear-gradient(145deg,#E4F0FF,#C8DEFF)' },
  { name: 'Customize Pen', sub: 'Engraved or printed', emoji: '🖊️', bg: 'linear-gradient(145deg,#F0EBFF,#E0D4FF)' },
  { name: 'Photo Frames', sub: 'Custom photo frame', emoji: '🖼️', bg: 'linear-gradient(145deg,#FFF8E4,#FFE9B0)' },
];
