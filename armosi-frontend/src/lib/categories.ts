import { listFirestoreDocuments } from './firestoreRest';

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
};

interface FirestoreCategoryDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

export interface StoreCategory {
  id: string;
  label: string;
  group: string;
  order: number;
  showOnHome?: boolean;
  shopPath?: string;
  fallbackKey?: string;
  parentShop?: string;
}

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

function toCategory(document: FirestoreCategoryDocument): StoreCategory | null {
  const fields = document.fields || {};
  const label = String(fieldToValue(fields.label) || '').trim();
  if (!label) return null;

  return {
    id: getDocId(document.name),
    label,
    group: String(fieldToValue(fields.group) || 'Other'),
    order: Number(fieldToValue(fields.order) ?? 999),
    showOnHome: Boolean(fieldToValue(fields.showOnHome)),
    shopPath: fieldToValue(fields.shopPath) ? String(fieldToValue(fields.shopPath)) : undefined,
    fallbackKey: fieldToValue(fields.fallbackKey) ? String(fieldToValue(fields.fallbackKey)) : undefined,
    parentShop: fieldToValue(fields.parentShop) ? String(fieldToValue(fields.parentShop)) : undefined,
  };
}

export async function getStoreCategories(): Promise<StoreCategory[]> {
  try {
    const payload = await listFirestoreDocuments('categories');
    const documents = Array.isArray(payload.documents)
      ? (payload.documents as FirestoreCategoryDocument[])
      : [];

    return documents
      .map(toCategory)
      .filter((category): category is StoreCategory => Boolean(category))
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getStoreCategories]', error);
    }
    return [];
  }
}

export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  stationery: 'pens-markers',
  unique: 'art-supplies',
  project: 'project-kits',
  customize: 'customize-pad',
  'gift-sets': 'customize-pad',
  'custom-products': 'customize-pad',
};

export function resolveCategorySlug(category: string) {
  return LEGACY_CATEGORY_MAP[category] || category;
}
