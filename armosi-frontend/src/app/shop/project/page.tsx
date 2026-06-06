import { CategoryHero } from '@/components/shop/CategoryHero';
import { BackRow } from '@/components/shop/BackRow';
import { ProductSection } from '@/components/home/ProductSection';
import { getStoreCategories } from '@/lib/categories';
import {
  getCategoriesForShop,
  getFallbackForCategory,
  getSavedProductsByCategory,
  pickProducts,
} from '@/lib/products';

export default async function ProjectWorkPage() {
  const categories = await getStoreCategories();
  const savedByCategory = await getSavedProductsByCategory();
  const shopCategories = getCategoriesForShop(categories, 'project');

  return (
    <div className="page-body">
      <CategoryHero
        eyebrow="Academic"
        title="Project Work Items"
        desc="Charts, boards, geometry & project essentials"
        variant="amber"
      />
      <BackRow backHref="/shop" />
      <div style={{ marginTop: 8 }}>
        {shopCategories.map((category) => (
          <ProductSection
            key={category.id}
            title={category.label}
            products={pickProducts(savedByCategory[category.id] || [], getFallbackForCategory(category))}
          />
        ))}
      </div>
    </div>
  );
}
