import { ShopHero } from '@/components/shop/ShopHero';
import { ShopCategoryCard } from '@/components/shop/ShopCategoryCard';

export default function ShopPage() {
  return (
    <div className="page-body">
      <ShopHero />
      <div style={{ padding: '22px 18px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <ShopCategoryCard
          eyebrow="Essentials"
          name="Stationery Items"
          desc="Pens, notebooks, rulers & more"
          emoji="📝"
          href="/shop/stationery"
          variant="purple"
        />
        <ShopCategoryCard
          eyebrow="Creative"
          name="Unique Stationery"
          desc="Art supplies, washi, calligraphy"
          emoji="🎨"
          href="/shop/unique"
          variant="green"
        />
        <ShopCategoryCard
          eyebrow="Academic"
          name="Project Work Items"
          desc="Charts, boards, geometry sets"
          emoji="📐"
          href="/shop/project"
          variant="amber"
        />
      </div>
    </div>
  );
}
