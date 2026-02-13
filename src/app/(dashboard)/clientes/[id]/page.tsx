'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { CustomerDetail } from '@/components/customers/CustomerDetail';
import { Skeleton } from '@/components/ui';
import type { CustomerWithBalance } from '@/types/customer';
import type { SaleWithCustomer } from '@/types/sale';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getCustomerById } = useCustomers();
  const { fetchSales, sales } = useSales();
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);
  const [recentSales, setRecentSales] = useState<SaleWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!params.id) return;

      setIsLoading(true);
      const id = params.id as string;

      try {
        const customerData = await getCustomerById(id);

        if (!customerData) {
          setError('Cliente não encontrado');
          setIsLoading(false);
          return;
        }

        setCustomer(customerData);
      } catch (err) {
        console.error('Erro ao carregar cliente:', err);
        setError('Erro ao carregar dados do cliente');
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomer();
  }, [params.id, getCustomerById]);

  // Buscar vendas do cliente quando tiver dados
  useEffect(() => {
    if (customer) {
      fetchSales({ period: 'all' });
    }
  }, [customer, fetchSales]);

  // Filtrar vendas do cliente específico
  useEffect(() => {
    if (customer && sales.length > 0) {
      const customerSales = sales
        .filter(sale => sale.user_id === customer.id)
        .slice(0, 5);
      setRecentSales(customerSales);
    }
  }, [customer, sales]);

  return (
    <div className="page-container max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-md mb-lg">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-input-bg rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title font-bold">Perfil do Cliente</h1>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-lg">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-xl">
          <p className="text-body text-error mb-md">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline"
          >
            Voltar
          </button>
        </div>
      )}

      {/* Customer Detail */}
      {customer && !isLoading && (
        <CustomerDetail customer={customer} recentSales={recentSales} />
      )}
    </div>
  );
}
