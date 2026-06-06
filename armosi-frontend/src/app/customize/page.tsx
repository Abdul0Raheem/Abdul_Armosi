import { CustomizeCard } from '@/components/customize/CustomizeCard';
import { CUSTOM_ITEMS } from '@/lib/data';
import { getStoreCategories } from '@/lib/categories';
import {
  getSavedProductsByCategory,
  hasSavedProducts,
} from '@/lib/products';
import { Product } from '@/lib/types';

const CUSTOMIZE_OPTIONS = [
  { id: 'customize-pad', label: 'Customize Pad', fallback: CUSTOM_ITEMS[0] },
  { id: 'customize-dairy', label: 'Customize Dairy', fallback: CUSTOM_ITEMS[1] },
  { id: 'customize-pen', label: 'Customize Pen', fallback: CUSTOM_ITEMS[2] },
  { id: 'photo-frames', label: 'Photo Frames', fallback: CUSTOM_ITEMS[3] },
];

const WA_SVG = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.139-1.324A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

export default async function CustomizePage() {
  const categories = await getStoreCategories();
  const savedByCategory = await getSavedProductsByCategory();
  const customizeItems = CUSTOMIZE_OPTIONS.map((option) => {
    const category = categories.find((item) => item.id === option.id);
    const products = savedByCategory[option.id] || [];
    const product = products[0];

    if (product) {
      return {
        ...product,
        name: product.name || category?.label || option.label,
      } satisfies Product;
    }

    return option.fallback;
  });
  const savedCustomize = CUSTOMIZE_OPTIONS.flatMap((option) => savedByCategory[option.id] || []);

  return (
    <div className="page-body">
      <div style={{
        padding: 'calc(var(--nav) + 22px) 18px 22px',
        background: 'linear-gradient(155deg,var(--vmid),var(--vpale))',
        borderRadius: '0 0 28px 28px',
      }}>
        <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 36, fontWeight: 400, color: 'var(--vdk)', marginBottom: 6 }}>
          Customize
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--mute)', marginBottom: 12 }}>
          Personalized stationery crafted just for you
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'white', borderRadius: 100, padding: '6px 13px',
          fontSize: 11.5, color: 'var(--vdk)', fontWeight: 600,
          boxShadow: 'var(--sh-sm)',
        }}>
          <WA_SVG />
          Orders via WhatsApp only
        </div>
      </div>

      <div style={{
        padding: '20px 18px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 13,
      }}>
        {(hasSavedProducts(savedCustomize) ? customizeItems : CUSTOM_ITEMS).map((item, i) => (
          <CustomizeCard key={i} item={item} />
        ))}
      </div>

    </div>
  );
}
