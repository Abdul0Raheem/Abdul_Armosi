import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_STORE_CATEGORIES } from "@/lib/admin/categoryDefaults";
import type { StoreCategory } from "@/lib/admin/types";

export async function fetchStoreCategories(): Promise<StoreCategory[]> {
  const snapshot = await getDocs(collection(db, "categories"));
  const categories: StoreCategory[] = [];

  snapshot.forEach((document) => {
    const data = document.data();
    categories.push({
      id: document.id,
      label: String(data.label || document.id),
      group: String(data.group || "Other"),
      order: Number(data.order ?? 999),
      showOnHome: Boolean(data.showOnHome),
      shopPath: data.shopPath ? String(data.shopPath) : undefined,
      fallbackKey: data.fallbackKey ? String(data.fallbackKey) : undefined,
      parentShop: data.parentShop ? String(data.parentShop) : undefined,
    });
  });

  return categories.sort((a, b) => a.order - b.order);
}

export async function ensureStoreCategoriesSeeded() {
  const snapshot = await getDocs(collection(db, "categories"));
  const existingIds = new Set<string>();

  snapshot.forEach((document) => {
    existingIds.add(document.id);
  });

  const batch = writeBatch(db);
  let missingCount = 0;

  DEFAULT_STORE_CATEGORIES.forEach((category) => {
    if (existingIds.has(category.id)) return;

    const { id, ...data } = category;
    batch.set(doc(db, "categories", id), data);
    missingCount += 1;
  });

  if (missingCount > 0) {
    await batch.commit();
  }

  return fetchStoreCategories();
}

export function groupCategoriesByGroup(categories: StoreCategory[]) {
  const groups = new Map<string, StoreCategory[]>();

  categories.forEach((category) => {
    const list = groups.get(category.group) || [];
    list.push(category);
    groups.set(category.group, list);
  });

  return Array.from(groups.entries()).map(([group, items]) => ({
    group,
    categories: items.sort((a, b) => a.order - b.order),
  }));
}
