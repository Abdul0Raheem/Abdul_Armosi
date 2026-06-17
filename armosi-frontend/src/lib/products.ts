import { listFirestoreDocuments } from './firestoreRest';
import { getStoreCategories, resolveCategorySlug, type StoreCategory } from './categories';
import { D, getFallbackProducts as getFallbackProductsFromData, getFallbackProductById as getFallbackProductFromData } from './data';
import { Product } from './types';
import { db } from './firebase';
import { doc as firestoreDoc, getDoc } from 'firebase/firestore';

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
  const imageUrl = sanitizeProductImage(
    String(fieldToValue(fields.imageUrl) || fieldToValue(fields.image) || ''),
  );

  if (!name || !price || !rawCategory) return null;

  return {
    id: getDocId(document.name),
    name,
    price,
    mrp: Number(fieldToValue(fields.mrp) || 0) || undefined,
    image: imageUrl,
    imageUrl,
    description: String(fieldToValue(fields.description) || fieldToValue(fields.desc) || '').trim() || undefined,
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

export function getAllSavedAndFallbackProducts(groups: ProductsByCategory) {
  const all = [...allSavedProducts(groups), ...getFallbackProductsFromData()];
  return Object.values(
    all.reduce<Record<string, Product>>((acc, product) => {
      const key = String(product.id);
      if (!acc[key]) acc[key] = product;
      return acc;
    }, {}),
  );
}

export function findFallbackProductById(productId: string | number): Product | null {
  return getFallbackProductFromData(productId);
}

export async function getSavedProductById(productId: string | number): Promise<Product | null> {
  const searchId = String(productId).trim();

  // Try direct Firestore document lookup by ID first
  try {
    const docRef = firestoreDoc(db, 'products', searchId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (process.env.NODE_ENV === 'development') {
        console.log('[getSavedProductById] Firestore doc exists for', searchId);
      }
      return {
        id: String(snap.id),
        name: String(data?.name || data?.title || 'Unnamed Product'),
        price: Number(data?.price || 0),
        mrp: data?.mrp != null ? Number(data.mrp) : undefined,
        image: data?.image || data?.imageUrl || undefined,
        imageUrl: data?.imageUrl || data?.image || undefined,
        description: String(data?.description || data?.desc || '').trim() || undefined,
        bg: data?.bg || undefined,
        emoji: data?.emoji || undefined,
        category: data?.category ? resolveCategorySlug(String(data.category)) : undefined,
        tags: Array.isArray(data?.tags) ? data.tags : undefined,
      };
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('[getSavedProductById] Firestore getDoc error', err);
  }

  // Fall back to saved groups and in-memory data
  const groups = await getSavedProductsByCategory();
  const product = allSavedProducts(groups).find((item) => String(item.id).trim() === searchId);

  if (process.env.NODE_ENV === 'development') {
    console.log('[getSavedProductById] searchId=', searchId, 'foundSaved=', Boolean(product));
  }

  const fallback = product || findFallbackProductById(searchId);

  if (process.env.NODE_ENV === 'development') {
    console.log('[getSavedProductById] searchId=', searchId, 'foundSaved=', Boolean(product), 'foundFallback=', Boolean(fallback));
  }

  if (process.env.NODE_ENV === 'development' && !fallback) {
    console.log('[getSavedProductById] fallback search failed for', searchId);
  }

  return fallback;
}

export function getRelatedProducts(product: Product, products: Product[], limit = 4) {
  return products
    .filter((item) => String(item.id) !== String(product.id) && item.category === product.category)
    .slice(0, limit);
}

export function hasSavedProducts(products: Product[]) {
  return products.length > 0;
}

export function pickProducts(saved: Product[], fallback: Product[]) {
  return saved.length > 0 ? saved : fallback;
}

export function getFallbackForCategory(category: StoreCategory): Product[] {
  if (category.fallbackKey && category.fallbackKey in D) {
    return (D[category.fallbackKey as keyof typeof D] || []).slice(0, 1);
  }
  return [];
}

export function getCategoriesForShop(
  categories: StoreCategory[],
  parentShop: string,
) {
  return categories.filter((category) => category.parentShop === parentShop);
}
