import { NextResponse } from 'next/server';
import { getFallbackProducts } from '@/lib/data';
import { getStoreCategories } from '@/lib/categories';
import {
  allSavedProducts,
  getFallbackForCategory,
  getSavedProductsByCategory,
  pickProducts,
} from '@/lib/products';

const fallbackCategories = [
  { id: 'trending', label: 'Trending Products', group: 'Home', order: 1, showOnHome: true },
  { id: 'pens', label: 'Pens & Markers', group: 'Stationery', order: 2, parentShop: 'stationery' },
  { id: 'notebooks', label: 'Notebooks', group: 'Stationery', order: 3, parentShop: 'stationery' },
  { id: 'geo', label: 'Geometry & Rulers', group: 'Stationery', order: 4, parentShop: 'stationery' },
  { id: 'eraser', label: 'Erasers & Sharpeners', group: 'Stationery', order: 5, parentShop: 'stationery' },
  { id: 'art', label: 'Art Supplies', group: 'Unique Stationery', order: 6, parentShop: 'unique' },
  { id: 'washi', label: 'Washi Tapes', group: 'Unique Stationery', order: 7, parentShop: 'unique' },
  { id: 'calli', label: 'Calligraphy', group: 'Unique Stationery', order: 8, parentShop: 'unique' },
  { id: 'sticker', label: 'Sticker Sets', group: 'Unique Stationery', order: 9, parentShop: 'unique' },
  { id: 'chart', label: 'Chart Paper', group: 'Project Work', order: 10, parentShop: 'project' },
  { id: 'pgeo', label: 'Project Geometry Sets', group: 'Project Work', order: 11, parentShop: 'project' },
  { id: 'kits', label: 'Project Kits', group: 'Project Work', order: 12, parentShop: 'project' },
  { id: 'boards', label: 'Presentation Boards', group: 'Project Work', order: 13, parentShop: 'project' },
  { id: 'gifts', label: 'Gift Sets', group: 'Gifts', order: 14 },
];

export async function GET() {
  const savedCategories = await getStoreCategories();
  const categories = savedCategories.length > 0 ? savedCategories : fallbackCategories;
  const savedByCategory = await getSavedProductsByCategory();
  const savedProducts = allSavedProducts(savedByCategory);

  const fallbackProducts = categories.flatMap((category) => {
    return pickProducts(savedByCategory[category.id] || [], getFallbackForCategory(category))
      .map((product) => ({ ...product, category: product.category || category.id }));
  });

  const fallbackSearchProducts = getFallbackProducts();

  const products = (savedProducts.length > 0 ? savedProducts : fallbackSearchProducts)
    .concat(fallbackProducts)
    .filter((product, index, list) => list.findIndex(item => item.id === product.id) === index);

  return NextResponse.json({ products, categories });
}
