'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { QRScanner } from '@/components/register-sale/QRScanner';
import { CPFInput } from '@/components/register-sale/CPFInput';
import { CustomerPreview } from '@/components/register-sale/CustomerPreview';
import { SaleForm, SaleData } from '@/components/register-sale/SaleForm';
import { SaleConfirmation } from '@/components/register-sale/SaleConfirmation';
import { Divider } from '@/components/ui';
import type { CustomerWithBalance } from '@/types/customer';
import type { SaleWithCustomer } from '@/types/sale';

type Step = 'identify' | 'preview' | 'form' | 'confirmation';

export default function RegisterSalePage() {
  const { company } = useAuth();
  const { findCustomerByCpf, getCustomerById } = useCustomers();
  const { createSale } = useSales();

  const [step, setStep] = useState<Step>('identify');
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);
  const [sale, setSale] = useState<SaleWithCustomer | null>(null);
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

  const searchCustomer = async (cpf: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const customerData = await findCustomerByCpf(cpf);

      if (!customerData) {
        setError('Cliente não encontrado');
        setIsLoading(false);
        return;
      }

      setCustomer(customerData);
      setStep('preview');
    } catch (err) {
      setError('Erro ao buscar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const searchCustomerById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const customerData = await getCustomerById(id);

      if (!customerData) {
        setError('Cliente não encontrado');
        setIsLoading(false);
        return;
      }

      setCustomer(customerData);
      setStep('preview');
    } catch (err) {
      setError('Erro ao buscar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSale = async (data: SaleData) => {
    if (!customer || !company) return;

    setIsLoading(true);

    try {
      const result = await createSale({
        user_id: customer.id,
        total_amount: data.purchaseAmount,
        cashback_redeemed: data.balanceUsed,
        net_amount_paid: data.amountPaid,
        cashback_earned: data.cashbackGenerated,
      });

      if (result.success && result.sale) {
        setSale(result.sale);
        setStep('confirmation');
      } else {
        setError(result.error || 'Erro ao registrar venda');
      }
    } catch (err) {
      setError('Erro ao registrar venda');
    } finally {
      setIsLoading(false);
    }
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

      {step === 'form' && customer && company && (
        <SaleForm
          customer={customer}
          cashbackPercentage={company.cashback_percent}
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
