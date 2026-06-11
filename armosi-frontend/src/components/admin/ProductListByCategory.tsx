"use client";

import type { Product, StoreCategory } from "@/lib/admin/types";
import { formatStock, getCategoryLabel, groupProductsForAdmin } from "@/lib/admin/productUtils";
import { groupCategoriesByGroup } from "@/lib/admin/categories";
import { ProductImageFrame } from '@/components/common/ProductImageFrame';

interface ProductListByCategoryProps {
  products: Product[];
  categories: StoreCategory[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

function ProductCard({
  product,
  categoryLabel,
  onEdit,
  onDelete,
}: {
  product: Product;
  categoryLabel: string;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  const imageUrl = product.imageUrl || product.image;

  return (
    <div className="adm-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <ProductImageFrame
        src={imageUrl}
        alt={product.name}
        fallbackText="No image"
        background="#FFFFFF"
        height={160}
        style={{ borderRadius: 0 }}
      />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h4 style={{ fontWeight: 700, color: 'var(--adm-ink)', marginBottom: 4 }}>{product.name}</h4>
        <p style={{ color: 'var(--adm-muted)', fontSize: 13, marginBottom: 12, lineHeight: 1.45, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>
        <div style={{ fontSize: 13, color: 'var(--adm-muted)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p><span style={{ fontWeight: 600, color: 'var(--adm-ink)' }}>Price:</span> Rs. {product.price}</p>
          <p><span style={{ fontWeight: 600, color: 'var(--adm-ink)' }}>Stock:</span> {formatStock(product.stock)}</p>
          <span className="adm-badge adm-badge-neutral" style={{ alignSelf: 'flex-start' }}>{categoryLabel}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button type="button" onClick={() => onEdit(product)} className="adm-btn adm-btn-primary adm-btn-sm" style={{ flex: 1 }}>
            Edit
          </button>
          <button type="button" onClick={() => onDelete(product.id)} className="adm-btn adm-btn-danger adm-btn-sm" style={{ flex: 1 }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductListByCategory({
  products,
  categories,
  onEdit,
  onDelete,
}: ProductListByCategoryProps) {
  if (products.length === 0) {
    return (
      <div className="adm-card adm-empty">
        <p style={{ fontWeight: 600, color: 'var(--adm-ink)' }}>No products yet</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>Add your first product using the button above.</p>
      </div>
    );
  }

  const { sections, uncategorized } = groupProductsForAdmin(products, categories);
  const groupedCatalog = groupCategoriesByGroup(categories);

  const sectionsByGroup = groupedCatalog.map(({ group, categories: groupCategories }) => {
    const groupSections = groupCategories
      .map((category) => sections.find((section) => section.category.id === category.id))
      .filter((section): section is NonNullable<typeof section> => Boolean(section));

    return { group, groupSections };
  }).filter((entry) => entry.groupSections.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {sectionsByGroup.map(({ group, groupSections }) => (
        <div key={group}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--ff-head)', fontSize: 22, fontWeight: 500, color: 'var(--adm-ink)' }}>{group}</h2>
            <span className="adm-badge adm-badge-neutral">
              {groupSections.reduce((count, section) => count + section.products.length, 0)} products
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {groupSections.map(({ category, products: categoryProducts }) => (
              <section key={category.id} className="adm-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--adm-line)' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--adm-ink)' }}>{category.label}</h3>
                  <span style={{ fontSize: 13, color: 'var(--adm-muted)' }}>{categoryProducts.length} item(s)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryLabel={category.label}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ))}

      {uncategorized.length > 0 && (
        <section className="adm-section" style={{ background: 'var(--adm-warning-soft)', borderColor: '#fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #fde68a' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#92400e' }}>Uncategorized</h3>
            <span style={{ fontSize: 13, color: '#b45309' }}>{uncategorized.length} item(s)</span>
          </div>
          <p style={{ fontSize: 13, color: '#92400e', marginBottom: 16 }}>
            These products use an old or unknown category. Edit them and pick a category from the list.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {uncategorized.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryLabel={getCategoryLabel(categories, product.category)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
