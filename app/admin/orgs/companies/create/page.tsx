'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CompanyForm from '@/components/admin/CompanyForm';

function CreateCompanyContent() {
  const searchParams = useSearchParams();
  const parentCompanyId = searchParams.get('parentCompanyId');
  const parentName = searchParams.get('parentName');

  return (
    <div className="container mx-auto py-6 px-4">
      <CompanyForm
        mode="create"
        initialParentCompanyId={parentCompanyId || undefined}
        initialParentName={parentName || undefined}
      />
    </div>
  );
}

export default function CreateCompany() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6 px-4">Loading...</div>}>
      <CreateCompanyContent />
    </Suspense>
  );
}
