'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CustomerDetail } from '@/components/customers/CustomerDetail';
import { Skeleton } from '@/components/ui';
import type { CustomerWithBalance } from '@/types/customer';
import type { Sale } from '@/types/sale';

// Dados mockados
const MOCK_CUSTOMERS: Record<string, CustomerWithBalance> = {
  'cust-1': {
    id: 'cust-1',
    name: 'João Silva',
    cpf: '12345678901',
    email: 'joao@email.com',
    phone: '11999999999',
    created_at: new Date().toISOString(),
    storeBalance: {
      customer_id: 'cust-1',
      store_id: 'mock-store-123',
      balance: 125.50,
      total_purchases: 12,
      total_spent: 2500,
      total_cashback: 250,
    },
  },
  'cust-2': {
    id: 'cust-2',
    name: 'Maria Santos',
    cpf: '98765432101',
    email: 'maria@email.com',
    phone: '11988888888',
    created_at: new Date().toISOString(),
    storeBalance: {
      customer_id: 'cust-2',
      store_id: 'mock-store-123',
      balance: 75.00,
      total_purchases: 5,
      total_spent: 750,
      total_cashback: 75,
    },
  },
};

const MOCK_SALES: Sale[] = [
  {
    id: 'sale-1',
    store_id: 'mock-store-123',
    customer_id: 'cust-1',
    customer_name: 'João Silva',
    customer_cpf: '12345678901',
    amount: 150,
    purchase_amount: 150,
    balance_used: 0,
    amount_paid: 150,
    cashback_amount: 15,
    cashback_generated: 15,
    cashback_percentage: 10,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { store } = useAuth();
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = () => {
      if (!params.id) return;

      const id = params.id as string;
      const mockCustomer = MOCK_CUSTOMERS[id];

      if (!mockCustomer) {
        setError('Cliente não encontrado');
        setIsLoading(false);
        return;
      }

      setCustomer(mockCustomer);
      setRecentSales(MOCK_SALES.filter(s => s.customer_id === id));
      setIsLoading(false);
    };

    fetchCustomer();
  }, [params.id]);

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
      {error && (
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
      {customer && (
        <CustomerDetail customer={customer} recentSales={recentSales} />
      )}
    </div>
  );
}
