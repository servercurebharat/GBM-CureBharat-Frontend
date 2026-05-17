'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import ProductCatalog from '@/components/sections/ProductCatalog';

export default function HBACatalogPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <DashboardLayout pageTitle="Product Catalog">
      <ProductCatalog user={user} />
    </DashboardLayout>
  );
}
