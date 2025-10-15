'use client';

import CompanyForm from '@/components/admin/CompanyForm';

export default function CreateCompany() {
  return (
    <div className="container mx-auto py-6 px-4">
      <CompanyForm mode="create" />
    </div>
  );
}