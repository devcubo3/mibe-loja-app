'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SaleDetail } from '@/components/sales/SaleDetail';
import { Skeleton } from '@/components/ui';
import { useSales } from '@/hooks/useSales';
import type { SaleWithCustomer } from '@/types/sale';
import Link from 'next/link';

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchSaleById } = useSales();
  const [sale, setSale] = useState<SaleWithCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSale = async () => {
      if (!params.id) return;

      setIsLoading(true);
      const id = params.id as string;

      try {
        const saleData = await fetchSaleById(id);

        if (!saleData) {
          setError('Venda não encontrada');
        } else {
          setSale(saleData);
        }
      } catch (err) {
        console.error('Erro ao carregar venda:', err);
        setError('Erro ao carregar dados da venda');
      } finally {
        setIsLoading(false);
      }
    };

    loadSale();
  }, [params.id, fetchSaleById]);

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
      {error && !isLoading && (
        <div className="text-center py-xl">
          <p className="text-body text-error mb-md">{error}</p>
          <Link href="/vendas" className="text-primary hover:underline">
            Voltar para vendas
          </Link>
        </div>
      )}

      {/* Sale Detail */}
      {sale && !isLoading && <SaleDetail sale={sale} />}
    </div>
  );
}
