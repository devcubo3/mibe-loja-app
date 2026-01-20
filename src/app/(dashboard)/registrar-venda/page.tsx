'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { QRScanner } from '@/components/register-sale/QRScanner';
import { CPFInput } from '@/components/register-sale/CPFInput';
import { CustomerPreview } from '@/components/register-sale/CustomerPreview';
import { SaleForm, SaleData } from '@/components/register-sale/SaleForm';
import { SaleConfirmation } from '@/components/register-sale/SaleConfirmation';
import { Divider } from '@/components/ui';
import type { CustomerWithBalance } from '@/types/customer';
import type { Sale } from '@/types/sale';

type Step = 'identify' | 'preview' | 'form' | 'confirmation';

// Dados mockados
const MOCK_CUSTOMERS: Record<string, CustomerWithBalance> = {
  '12345678901': {
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
  '98765432101': {
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

export default function RegisterSalePage() {
  const { store } = useAuth();

  const [step, setStep] = useState<Step>('identify');
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQRScan = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.cpf) {
        searchCustomer(parsed.cpf);
      } else if (parsed.id) {
        searchCustomerById(parsed.id);
      }
    } catch {
      searchCustomer(data.replace(/\D/g, ''));
    }
  };

  const searchCustomer = (cpf: string) => {
    setIsLoading(true);
    setError(null);

    const customerData = MOCK_CUSTOMERS[cpf];

    if (!customerData) {
      setError('Cliente não encontrado');
      setIsLoading(false);
      return;
    }

    setCustomer(customerData);
    setStep('preview');
    setIsLoading(false);
  };

  const searchCustomerById = (id: string) => {
    setIsLoading(true);
    setError(null);

    const customerData = Object.values(MOCK_CUSTOMERS).find(c => c.id === id);

    if (!customerData) {
      setError('Cliente não encontrado');
      setIsLoading(false);
      return;
    }

    setCustomer(customerData);
    setStep('preview');
    setIsLoading(false);
  };

  const handleConfirmSale = (data: SaleData) => {
    if (!customer || !store) return;

    setIsLoading(true);

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      store_id: store.id,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_cpf: customer.cpf,
      purchase_amount: data.purchaseAmount,
      balance_used: data.balanceUsed,
      amount_paid: data.amountPaid,
      cashback_generated: data.cashbackGenerated,
      amount: data.amountPaid,
      cashback_amount: data.cashbackGenerated,
      cashback_percentage: store.cashback_percentage,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSale(newSale);
    setStep('confirmation');
    setIsLoading(false);
  };

  const handleNewSale = () => {
    setStep('identify');
    setCustomer(null);
    setSale(null);
    setError(null);
  };

  const handleCancel = () => {
    if (step === 'form') {
      setStep('preview');
    } else {
      setStep('identify');
      setCustomer(null);
    }
  };

  return (
    <div className="page-container max-w-lg mx-auto">
      {/* Header */}
      {step !== 'confirmation' && (
        <div className="flex items-center gap-md mb-lg">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-input-bg rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-title font-bold">Registrar Venda</h1>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-error-light border border-error rounded-md p-md mb-lg">
          <p className="text-body text-error">{error}</p>
        </div>
      )}

      {/* Steps */}
      {step === 'identify' && (
        <div className="space-y-lg">
          {/* QR Scanner */}
          <QRScanner onScan={handleQRScan} />

          {/* Divider */}
          <Divider text="ou" />

          {/* CPF Input */}
          <CPFInput onSearch={searchCustomer} isLoading={isLoading} />
        </div>
      )}

      {step === 'preview' && customer && (
        <CustomerPreview
          customer={customer}
          onContinue={() => setStep('form')}
          onCancel={handleCancel}
        />
      )}

      {step === 'form' && customer && store && (
        <SaleForm
          customer={customer}
          cashbackPercentage={store.cashback_percentage}
          onConfirm={handleConfirmSale}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}

      {step === 'confirmation' && sale && (
        <SaleConfirmation sale={sale} onNewSale={handleNewSale} />
      )}
    </div>
  );
}
