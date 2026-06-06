import { listFirestoreDocuments } from './firestoreRest';
import { getStoreCategories, resolveCategorySlug, type StoreCategory } from './categories';
import { D } from './data';
import { Product } from './types';

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
};

interface FirestoreProductDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

export type ProductsByCategory = Record<string, Product[]>;
type SavedProduct = Product & { category: string };

function fieldToValue(value: FirestoreValue | undefined) {
  if (!value) return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  return undefined;
}

function getDocId(name: string) {
  return name.split('/').pop() || name;
}

/** Inline base64 images stored in Firestore bloat every page load — use URL or emoji fallback instead. */
function sanitizeProductImage(image: string | undefined) {
  const trimmed = image?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('data:') && trimmed.length > 50_000) return undefined;
  return trimmed;
}

function toProduct(document: FirestoreProductDocument): SavedProduct | null {
  const fields = document.fields || {};
  const name = String(fieldToValue(fields.name) || '').trim();
  const price = Number(fieldToValue(fields.price) || 0);
  const rawCategory = String(fieldToValue(fields.category) || '').trim();

  if (!name || !price || !rawCategory) return null;

  return {
    id: getDocId(document.name),
    name,
    price,
    mrp: Number(fieldToValue(fields.mrp) || 0) || undefined,
    image: sanitizeProductImage(String(fieldToValue(fields.image) || '')),
    bg: '#FFF8EC',
    emoji: '🛍️',
    category: resolveCategorySlug(rawCategory),
  };
}

function emptyGroups(categories: StoreCategory[]): ProductsByCategory {
  return categories.reduce<ProductsByCategory>((groups, category) => {
    groups[category.id] = [];
    return groups;
  }, {});
}

export async function getSavedProductsByCategory(): Promise<ProductsByCategory> {
  const categories = await getStoreCategories();
  const groups = emptyGroups(categories);

  try {
    const payload = await listFirestoreDocuments('products');
    const documents = Array.isArray(payload.documents)
      ? (payload.documents as FirestoreProductDocument[])
      : [];

    documents.forEach((document) => {
      const product = toProduct(document);
      if (!product) return;

      const category = product.category;

      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getSavedProductsByCategory]', error);
    }
  }

  return groups;
}

/** @deprecated Use getSavedProductsByCategory — kept for gradual migration */
export async function getSavedProducts() {
  const byCategory = await getSavedProductsByCategory();
  return {
    stationery: [
      ...(byCategory['pens-markers'] || []),
      ...(byCategory['notebooks'] || []),
      ...(byCategory['geometry-rulers'] || []),
      ...(byCategory['erasers-sharpeners'] || []),
      ...(byCategory.stationery || []),
    ],
    unique: [
      ...(byCategory['art-supplies'] || []),
      ...(byCategory['washi-tapes'] || []),
      ...(byCategory.calligraphy || []),
      ...(byCategory['sticker-sets'] || []),
      ...(byCategory.unique || []),
    ],
    project: [
      ...(byCategory['chart-paper'] || []),
      ...(byCategory['geometry-sets'] || []),
      ...(byCategory['project-kits'] || []),
      ...(byCategory['presentation-boards'] || []),
      ...(byCategory.project || []),
    ],
    customize: [
      ...(byCategory['customize-pad'] || []),
      ...(byCategory['customize-dairy'] || []),
      ...(byCategory['customize-pen'] || []),
      ...(byCategory['photo-frames'] || []),
      ...(byCategory.customize || []),
    ],
  };
}

export function allSavedProducts(groups: ProductsByCategory) {
  return Object.values(groups).flat();
}

export function hasSavedProducts(products: Product[]) {
  return products.length > 0;
}

export function pickProducts(saved: Product[], fallback: Product[]) {
  return saved.length > 0 ? saved : fallback;
}

export function getFallbackForCategory(category: StoreCategory): Product[] {
  if (category.fallbackKey && category.fallbackKey in D) {
    return D[category.fallbackKey as keyof typeof D] || [];
  }
  return [];
}

export function getCategoriesForShop(
  categories: StoreCategory[],
  parentShop: string,
) {
  return categories.filter((category) => category.parentShop === parentShop);
}
