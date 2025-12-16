'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CompanyForm from '@/components/admin/CompanyForm';

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCompany(params.id as string);
    }
  }, [params.id]);

  const fetchCompany = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orgs/companies/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch company');
      }

      const data = await response.json();
      setCompany(data);
    } catch (err: any) {
      console.error('Error fetching company:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (companyData: any) => {
    const response = await fetch(`/api/orgs/companies/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update company');
    }

    // Redirect back to company view page
    router.push(`/admin/orgs/companies/${params.id}`);
  };

  const handleCancel = () => {
    router.push(`/admin/orgs/companies/${params.id}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <CompanyForm
      mode="edit"
      company={company}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
