import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage';

export default function AdminCategoriesPage() {
  return (
    <AdminCollectionPage
      collectionName="categories"
      title="Categories"
      columns={['id', 'label', 'group', 'order', 'parentShop', 'shopPath']}
    />
  );
}
