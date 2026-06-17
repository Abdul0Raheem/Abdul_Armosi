import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductImageFrame } from '@/components/common/ProductImageFrame';
import { ProductDetailActions } from '@/components/product/ProductDetailActions';
import { getSavedProductById, getSavedProductsByCategory, getAllSavedAndFallbackProducts, allSavedProducts } from '@/lib/products';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import RelatedProductsScroller from '@/components/product/RelatedProductsScroller';

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const searchId = String(productId || '').trim();
  const product = await getSavedProductById(searchId);

  if (!product) {
    return {
      title: 'Product not found — Armosi',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: `${product.name} | Armosi`,
    description: product.description || `Order ${product.name} for ₹${product.price} from Armosi marketplace.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const searchId = String(productId || '').trim();
  const product = await getSavedProductById(searchId);

  if (!product) {
    if (process.env.NODE_ENV === 'development') {
      const savedByCategory = await getSavedProductsByCategory();
      const all = allSavedProducts(savedByCategory);
      console.log('[ProductPage] params.productId=', searchId, 'NOT found; savedCount=', all.length, 'sampleIds=', all.slice(0, 20).map((p) => p.id));

      return (
        <div className="page-body" style={{ paddingTop: 18, paddingBottom: 34 }}>
          <div style={{ padding: '0 18px' }}>
            <Link href="/shop" style={{ textDecoration: 'none', color: 'var(--v)', fontSize: 13, fontWeight: 600 }}>
              ← Back to Shop
            </Link>
          </div>
          <div style={{ padding: 18 }}>
            <h2 style={{ marginBottom: 8 }}>Product debug (development)</h2>
            <div style={{ marginBottom: 8 }}>Requested param: <strong>{productId}</strong></div>
            <div style={{ marginBottom: 8 }}>Saved products count: <strong>{all.length}</strong></div>
            <div style={{ fontSize: 13, color: 'var(--mute)' }}>
              Sample saved IDs:
              <pre style={{ background: 'rgba(0,0,0,0.04)', padding: 8, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(all.slice(0, 50).map((p) => p.id), null, 2)}</pre>
            </div>
            <div style={{ marginTop: 12, color: 'var(--vdk)' }}>
              Check console for additional Firestore lookup logs: <code>[getSavedProductById]</code>
            </div>
          </div>
        </div>
      );
    }
    notFound();
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[ProductPage] params.productId=', searchId, 'resolved productId=', product.id, 'category=', product.category);
  }

  const savedByCategory = await getSavedProductsByCategory();
  const allProducts = getAllSavedAndFallbackProducts(savedByCategory);
  const sameCategoryProducts = allProducts.filter(
    (item) => String(item.id) !== String(product.id) && item.category === product.category,
  );
  const relatedProducts = sameCategoryProducts.length > 0
    ? sameCategoryProducts
    : allProducts.filter((item) => String(item.id) !== String(product.id));
  const visibleProducts = relatedProducts.slice(0, 4);

  return (
    <div className="page-body" style={{ paddingTop: 18, paddingBottom: 34 }}>
      <div style={{ padding: '0 18px' }}>
        <Link href="/shop" style={{ textDecoration: 'none', color: 'var(--v)', fontSize: 13, fontWeight: 600 }}>
          ← Back to Shop
        </Link>
      </div>

      <div className="product-detail-grid">
        <section className="product-detail-media">
          <ProductImageFrame
            src={product.imageUrl || product.image}
            alt={product.name}
            fallbackText={product.emoji ?? 'Product'}
            background="#FFFFFF"
            height={360}
            style={{ borderRadius: '26px' }}
          />
        </section>

        <section className="product-detail-summary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {product.category && (
                <span className="product-detail-tag">{product.category}</span>
              )}
              {product.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="product-detail-tag" style={{ background: 'var(--vpale)', color: 'var(--vdk)' }}>
                  {tag}
                </span>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.08, color: 'var(--ink)' }}>
                {product.name}
              </div>
              <div style={{ marginTop: 10, fontSize: 16, color: 'var(--mute)', maxWidth: 510, lineHeight: 1.7 }}>
                {product.description || 'Premium stationery item for students, creatives, and home offices.'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)' }}>₹{product.price}</div>
                {product.mrp != null && (
                  <div style={{ fontSize: 14, color: 'var(--mute)', textDecoration: 'line-through' }}>
                    ₹{product.mrp}
                  </div>
                )}
              </div>
              <div className="trend-bg" style={{ borderRadius: 18, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--vdk)', display: 'inline-flex', alignItems: 'center' }}>
                Best value
              </div>
            </div>

            <ProductDetailActions product={product} />

            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Product Details</div>
              <div style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.75 }}>
                {product.description || 'This product is carefully sourced for quality. Add it to your cart with confidence.'}
              </div>
            </div>
          </div>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <RevealOnScroll>
          <section style={{ marginTop: 30, padding: '0 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>Browse more products</div>
              <Link href="/shop" style={{ fontSize: 12.5, color: 'var(--v)', fontWeight: 600, textDecoration: 'none' }}>
                Shop more
              </Link>
            </div>
            <div style={{ color: 'var(--mute)', fontSize: 14, marginBottom: 14 }}>
              Scroll to load more items from the same category.
            </div>
            <RelatedProductsScroller initial={visibleProducts} all={relatedProducts} />
          </section>
        </RevealOnScroll>
      )}
    </div>
  );
}
