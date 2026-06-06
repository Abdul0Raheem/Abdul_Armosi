import { HeroSection } from '@/components/home/HeroSection';
import { HomeCategoryCards } from '@/components/home/HomeCategoryCards';
import { TrendingBadge } from '@/components/home/TrendingBadge';
import { ProductSection } from '@/components/home/ProductSection';
import { ProductSlider } from '@/components/product/ProductSlider';
import { Loader } from '@/components/common/Loader';
import { D } from '@/lib/data';
import { getStoreCategories } from '@/lib/categories';
import {
  allSavedProducts,
  getFallbackForCategory,
  getSavedProductsByCategory,
  hasSavedProducts,
  pickProducts,
} from '@/lib/products';
import Link from 'next/link';

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--v)" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default async function HomePage() {
  const categories = await getStoreCategories();
  const savedByCategory = await getSavedProductsByCategory();
  const allSaved = allSavedProducts(savedByCategory);
  const homeCategories = categories.filter((category) => category.showOnHome);
  const newPicksCategory = categories.find((category) => category.id === 'new-picks');
  const sliderProducts = pickProducts(
    allSaved,
    newPicksCategory ? getFallbackForCategory(newPicksCategory) : D.trending,
  );

  return (
    <>
      <Loader />
      <div className="page-body">
        <HeroSection />
        <HomeCategoryCards />

        <div style={{ marginTop: 34 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', marginBottom: 4 }}>
            <div>
              <TrendingBadge />
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '.01em' }}>
                {hasSavedProducts(allSaved) ? 'Our Products' : 'Hot Picks'}
              </div>
            </div>
            <Link href="/shop" style={{ fontSize: 12.5, color: 'var(--v)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
              View All <ArrowRight />
            </Link>
          </div>
          <ProductSlider products={sliderProducts} />
        </div>

        {hasSavedProducts(allSaved) && (
          <ProductSection title="New Arrivals" products={allSaved} viewAllHref="/shop" />
        )}

        {homeCategories
          .filter((category) => category.id !== 'new-picks')
          .map((category) => (
            <ProductSection
              key={category.id}
              title={category.label}
              products={pickProducts(savedByCategory[category.id] || [], getFallbackForCategory(category))}
              viewAllHref={category.shopPath || '/shop'}
            />
          ))}
      </div>
    </>
  );
}
