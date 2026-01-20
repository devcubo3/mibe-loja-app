'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SaleDetail } from '@/components/sales/SaleDetail';
import { Skeleton } from '@/components/ui';
import type { Sale } from '@/types/sale';
import Link from 'next/link';

// Dados mockados
const MOCK_SALES: Record<string, Sale> = {
  'sale-1': {
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
  'sale-2': {
    id: 'sale-2',
    store_id: 'mock-store-123',
    customer_id: 'cust-2',
    customer_name: 'Maria Santos',
    customer_cpf: '98765432101',
    amount: 200,
    purchase_amount: 200,
    balance_used: 20,
    amount_paid: 180,
    cashback_amount: 20,
    cashback_generated: 20,
    cashback_percentage: 10,
    status: 'confirmed',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
};

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSale = () => {
      if (!params.id) return;

      const id = params.id as string;
      const mockSale = MOCK_SALES[id];

      if (!mockSale) {
        setError('Venda não encontrada');
      } else {
        setSale(mockSale);
      }

      setIsLoading(false);
    };

    fetchSale();
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
        <h1 className="text-title font-bold">Detalhes da Venda</h1>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-lg">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-xl">
          <p className="text-body text-error mb-md">{error}</p>
          <Link href="/vendas" className="text-primary hover:underline">
            Voltar para vendas
          </Link>
        </div>
      )}

      {/* Sale Detail */}
      {sale && <SaleDetail sale={sale} />}
    </div>
  );
}
