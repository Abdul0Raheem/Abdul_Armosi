import type { StoreCategory } from "@/lib/admin/types";

/** Default storefront categories — seeded to Firestore when the collection is empty. */
export const DEFAULT_STORE_CATEGORIES: StoreCategory[] = [
  { id: "new-picks", label: "New Picks", group: "Home", order: 1, showOnHome: true, fallbackKey: "trending", shopPath: "/shop" },
  { id: "pens-markers", label: "Pens & Markers", group: "Stationery", order: 10, showOnHome: true, fallbackKey: "pens", shopPath: "/shop/stationery", parentShop: "stationery" },
  { id: "notebooks", label: "Notebooks", group: "Stationery", order: 11, showOnHome: true, fallbackKey: "notebooks", shopPath: "/shop/stationery", parentShop: "stationery" },
  { id: "geometry-rulers", label: "Geometry & Rulers", group: "Stationery", order: 12, fallbackKey: "geo", shopPath: "/shop/stationery", parentShop: "stationery" },
  { id: "erasers-sharpeners", label: "Erasers & Sharpeners", group: "Stationery", order: 13, fallbackKey: "eraser", shopPath: "/shop/stationery", parentShop: "stationery" },
  { id: "art-supplies", label: "Art Supplies", group: "Unique Stationery", order: 20, showOnHome: true, fallbackKey: "art", shopPath: "/shop/unique", parentShop: "unique" },
  { id: "washi-tapes", label: "Washi Tapes", group: "Unique Stationery", order: 21, fallbackKey: "washi", shopPath: "/shop/unique", parentShop: "unique" },
  { id: "calligraphy", label: "Calligraphy", group: "Unique Stationery", order: 22, fallbackKey: "calli", shopPath: "/shop/unique", parentShop: "unique" },
  { id: "sticker-sets", label: "Sticker Sets", group: "Unique Stationery", order: 23, fallbackKey: "sticker", shopPath: "/shop/unique", parentShop: "unique" },
  { id: "chart-paper", label: "Chart & Drawing Paper", group: "Project Work", order: 30, fallbackKey: "chart", shopPath: "/shop/project", parentShop: "project" },
  { id: "geometry-sets", label: "Geometry Sets", group: "Project Work", order: 31, fallbackKey: "pgeo", shopPath: "/shop/project", parentShop: "project" },
  { id: "project-kits", label: "Project Kits", group: "Project Work", order: 32, showOnHome: true, fallbackKey: "kits", shopPath: "/shop/project", parentShop: "project" },
  { id: "presentation-boards", label: "Presentation Boards", group: "Project Work", order: 33, fallbackKey: "boards", shopPath: "/shop/project", parentShop: "project" },
  { id: "customize-pad", label: "Customize Pad", group: "Customize", order: 40, showOnHome: true, shopPath: "/customize", parentShop: "customize" },
  { id: "customize-dairy", label: "Customize Dairy", group: "Customize", order: 41, showOnHome: true, shopPath: "/customize", parentShop: "customize" },
  { id: "customize-pen", label: "Customize Pen", group: "Customize", order: 42, showOnHome: true, shopPath: "/customize", parentShop: "customize" },
  { id: "photo-frames", label: "Photo Frames", group: "Customize", order: 43, showOnHome: true, shopPath: "/customize", parentShop: "customize" },
];

export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  stationery: "pens-markers",
  unique: "art-supplies",
  project: "project-kits",
  customize: "customize-pad",
};

export function resolveCategorySlug(category: string) {
  return LEGACY_CATEGORY_MAP[category] || category;
}
