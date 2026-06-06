import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage';

export default function AdminUsersPage() {
  return (
    <AdminCollectionPage
      collectionName="users"
      title="Users"
      columns={['id', 'name', 'email', 'role']}
    />
  );
}
