import { resolveCategorySlug } from "@/lib/admin/categoryDefaults";
import type { Product, StoreCategory } from "@/lib/admin/types";

export function parseStockInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatStock(stock: number | null | undefined) {
  if (stock === null || stock === undefined) return "Not tracked";
  return String(stock);
}

export function getCategoryLabel(categories: StoreCategory[], categoryId: string) {
  const slug = resolveCategorySlug(categoryId);
  return categories.find((category) => category.id === slug)?.label || categoryId;
}

export function groupProductsForAdmin(products: Product[], categories: StoreCategory[]) {
  const buckets = new Map<string, Product[]>();
  categories.forEach((category) => buckets.set(category.id, []));

  const uncategorized: Product[] = [];

  products.forEach((product) => {
    const slug = resolveCategorySlug(product.category);
    const bucket = buckets.get(slug);
    if (bucket) {
      bucket.push(product);
      return;
    }
    uncategorized.push(product);
  });

  const sections = categories
    .map((category) => ({
      category,
      products: buckets.get(category.id) || [],
    }))
    .filter((section) => section.products.length > 0);

  return { sections, uncategorized };
}
