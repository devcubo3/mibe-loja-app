# 07 - Registrar Venda

## Objetivo
Implementar o fluxo completo de registro de venda com scanner QR Code, busca por CPF, preview do cliente e confirmação.

---

## Fluxo de Etapas

```
1. Identificar Cliente
   ├─ Scanner QR Code
   └─ Digitar CPF
         ↓
2. Visualizar Dados do Cliente (somente leitura)
         ↓
3. Registrar Valor da Venda
   ├─ Valor da compra
   ├─ Usar saldo (opcional)
   └─ Resumo com cashback
         ↓
4. Confirmação
   └─ Sucesso + Opções
```

---

## Passo 1: Criar Tipos de Cliente

Criar `src/types/customer.ts`:

```typescript
export interface Customer {
  id: string;
  name: string;
  cpf: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface CustomerBalance {
  customer_id: string;
  store_id: string;
  balance: number;
  total_purchases: number;
  total_spent: number;
  total_cashback: number;
  last_purchase?: string;
}

export interface CustomerWithBalance extends Customer {
  storeBalance: CustomerBalance;
}
```

---

## Passo 2: Criar Scanner QR Code

Criar `src/components/register-sale/QRScanner.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // Ignore scan errors
        }
      );

      setIsScanning(true);
      setHasPermission(true);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao iniciar scanner:', err);

      if (err.message?.includes('Permission')) {
        setHasPermission(false);
        setError('Permissão de câmera negada');
      } else {
        setError('Erro ao acessar a câmera');
      }

      onError?.(err.message);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Erro ao parar scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleScan = async (data: string) => {
    await stopScanner();
    onScan(data);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="w-full">
      {/* Scanner Area */}
      <div
        className={cn(
          'relative w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden',
          'bg-input-bg border-2 border-dashed border-input-border',
          isScanning && 'border-solid border-primary'
        )}
      >
        <div id="qr-reader" className="w-full h-full" />

        {/* Overlay quando não está escaneando */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-lg">
            {hasPermission === false ? (
              <>
                <CameraOff className="w-12 h-12 text-text-muted mb-md" />
                <p className="text-body text-text-secondary text-center mb-md">
                  Permissão de câmera necessária
                </p>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-12 h-12 text-error mb-md" />
                <p className="text-body text-error text-center mb-md">{error}</p>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-text-muted mb-md" />
                <p className="text-body text-text-secondary text-center mb-md">
                  Aponte a câmera para o QR Code do cliente
                </p>
              </>
            )}

            <Button onClick={startScanner} variant="secondary" size="sm">
              {hasPermission === false ? 'Tentar novamente' : 'Ativar câmera'}
            </Button>
          </div>
        )}

        {/* Scanning indicator */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-primary rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stop button */}
      {isScanning && (
        <div className="mt-md text-center">
          <Button onClick={stopScanner} variant="ghost" size="sm">
            Parar scanner
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## Passo 3: Criar Input de CPF

Criar `src/components/register-sale/CPFInput.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Input, Button } from '@/components/ui';
import { formatCPF, unformatCPF } from '@/lib/formatters';
import { Search, Loader2 } from 'lucide-react';

interface CPFInputProps {
  onSearch: (cpf: string) => Promise<void>;
  isLoading?: boolean;
}

export function CPFInput({ onSearch, isLoading }: CPFInputProps) {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCpf = unformatCPF(cpf);

    if (cleanCpf.length !== 11) {
      setError('CPF deve ter 11 dígitos');
      return;
    }

    if (!isValidCPF(cleanCpf)) {
      setError('CPF inválido');
      return;
    }

    await onSearch(cleanCpf);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <Input
        label="CPF do Cliente"
        placeholder="000.000.000-00"
        value={cpf}
        onChange={handleChange}
        error={error || undefined}
        maxLength={14}
        inputMode="numeric"
        icon={<Search className="w-5 h-5" />}
        iconPosition="left"
      />

      <Button
        type="submit"
        fullWidth
        loading={isLoading}
        disabled={cpf.length < 14 || isLoading}
      >
        Buscar Cliente
      </Button>
    </form>
  );
}

// Validação de CPF
function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf[10])) return false;

  return true;
}
```

---

## Passo 4: Criar Preview do Cliente

Criar `src/components/register-sale/CustomerPreview.tsx`:

```tsx
'use client';

import { Lock, AlertCircle, User } from 'lucide-react';
import { Avatar, Badge, Button, Card } from '@/components/ui';
import { formatCPF, formatCurrency, formatDate } from '@/lib/formatters';
import type { CustomerWithBalance } from '@/types/customer';

interface CustomerPreviewProps {
  customer: CustomerWithBalance;
  onContinue: () => void;
  onCancel: () => void;
}

export function CustomerPreview({
  customer,
  onContinue,
  onCancel,
}: CustomerPreviewProps) {
  return (
    <div className="space-y-lg">
      {/* Success Badge */}
      <div className="flex items-center gap-sm text-success">
        <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <span className="font-semibold">Cliente encontrado</span>
      </div>

      {/* Customer Card */}
      <Card variant="default" padding="lg">
        {/* Header with Avatar */}
        <div className="bg-primary -mx-lg -mt-lg px-lg py-lg mb-lg rounded-t-md flex items-center gap-md">
          <Avatar name={customer.name} size="lg" />
          <div>
            <p className="text-body-lg font-semibold text-white">
              {customer.name}
            </p>
            <Badge variant="light">{formatCPF(customer.cpf)}</Badge>
          </div>
        </div>

        {/* Info Fields */}
        <div className="space-y-md">
          <InfoField label="Nome completo" value={customer.name} />
          <InfoField label="CPF" value={formatCPF(customer.cpf)} />
          {customer.birth_date && (
            <InfoField
              label="Data de Nascimento"
              value={formatDate(customer.birth_date)}
            />
          )}

          {/* Balance */}
          <div className="bg-success-light rounded-md p-md flex items-center justify-between">
            <div>
              <p className="text-caption text-text-secondary">
                Saldo disponível na sua loja
              </p>
              <p className="text-subtitle font-bold text-success">
                {formatCurrency(customer.storeBalance?.balance || 0)}
              </p>
            </div>
            {customer.storeBalance?.balance > 0 && (
              <Badge variant="success">Disponível</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-sm text-text-secondary bg-warning-light rounded-md p-md">
        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-body">
          Você pode apenas visualizar os dados do cliente. Nenhuma alteração é
          permitida.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-md">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
        <Button onClick={onContinue} fullWidth>
          Continuar
        </Button>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  locked = true,
}: {
  label: string;
  value: string;
  locked?: boolean;
}) {
  return (
    <div className="border-b border-input-border pb-sm last:border-0 last:pb-0">
      <p className="text-caption text-text-muted mb-xs">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-body-lg text-text-primary">{value}</p>
        {locked && <Lock className="w-4 h-4 text-text-muted" />}
      </div>
    </div>
  );
}
```

---

## Passo 5: Criar Formulário de Venda

Criar `src/components/register-sale/SaleForm.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Input, Button, Card } from '@/components/ui';
import { Divider } from '@/components/ui/Divider';
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  formatCPF,
} from '@/lib/formatters';
import type { CustomerWithBalance } from '@/types/customer';

interface SaleFormProps {
  customer: CustomerWithBalance;
  cashbackPercentage: number;
  onConfirm: (data: SaleData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface SaleData {
  purchaseAmount: number;
  balanceUsed: number;
  amountPaid: number;
  cashbackGenerated: number;
}

export function SaleForm({
  customer,
  cashbackPercentage,
  onConfirm,
  onCancel,
  isLoading,
}: SaleFormProps) {
  const [purchaseValue, setPurchaseValue] = useState('');
  const [useBalance, setUseBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const purchaseAmount = parseCurrencyInput(purchaseValue);
  const availableBalance = customer.storeBalance?.balance || 0;
  const maxBalanceToUse = Math.min(availableBalance, purchaseAmount);

  const balanceUsed = useBalance
    ? Math.min(parseCurrencyInput(balanceAmount) || maxBalanceToUse, maxBalanceToUse)
    : 0;

  const amountPaid = Math.max(purchaseAmount - balanceUsed, 0);
  const cashbackGenerated = (amountPaid * cashbackPercentage) / 100;

  useEffect(() => {
    if (useBalance) {
      setBalanceAmount(formatCurrency(maxBalanceToUse));
    } else {
      setBalanceAmount('');
    }
  }, [useBalance, maxBalanceToUse]);

  const handlePurchaseChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setPurchaseValue(formatted);
    setError(null);
  };

  const handleBalanceChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    const parsed = parseCurrencyInput(formatted);

    if (parsed > maxBalanceToUse) {
      setBalanceAmount(formatCurrency(maxBalanceToUse));
    } else {
      setBalanceAmount(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (purchaseAmount <= 0) {
      setError('Informe o valor da compra');
      return;
    }

    await onConfirm({
      purchaseAmount,
      balanceUsed,
      amountPaid,
      cashbackGenerated,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-lg">
      {/* Customer Info */}
      <div className="bg-input-bg rounded-md p-md">
        <p className="text-caption text-text-muted">Cliente</p>
        <p className="font-semibold">{customer.name}</p>
        <p className="text-body text-text-secondary">
          CPF: {formatCPF(customer.cpf)}
        </p>
      </div>

      {/* Purchase Value */}
      <div>
        <Input
          label="Valor da Compra"
          placeholder="R$ 0,00"
          value={purchaseValue}
          onChange={handlePurchaseChange}
          error={error || undefined}
          inputMode="numeric"
        />
      </div>

      {/* Use Balance */}
      {availableBalance > 0 && purchaseAmount > 0 && (
        <Card variant="outlined" padding="md">
          <label className="flex items-center gap-md cursor-pointer">
            <input
              type="checkbox"
              checked={useBalance}
              onChange={(e) => setUseBalance(e.target.checked)}
              className="w-5 h-5 rounded border-input-border text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <p className="font-medium">Usar saldo do cliente</p>
              <p className="text-caption text-text-secondary">
                Disponível: {formatCurrency(availableBalance)}
              </p>
            </div>
          </label>

          {useBalance && (
            <div className="mt-md">
              <Input
                label="Valor a usar"
                placeholder="R$ 0,00"
                value={balanceAmount}
                onChange={handleBalanceChange}
                inputMode="numeric"
                helperText={`Máximo: ${formatCurrency(maxBalanceToUse)}`}
              />
            </div>
          )}
        </Card>
      )}

      {/* Summary */}
      {purchaseAmount > 0 && (
        <>
          <Divider />

          <div className="space-y-sm">
            <h3 className="font-semibold">Resumo</h3>

            <div className="flex justify-between text-body">
              <span className="text-text-secondary">Valor da compra:</span>
              <span>{formatCurrency(purchaseAmount)}</span>
            </div>

            {balanceUsed > 0 && (
              <div className="flex justify-between text-body text-error">
                <span>Saldo utilizado:</span>
                <span>- {formatCurrency(balanceUsed)}</span>
              </div>
            )}

            <Divider />

            <div className="flex justify-between text-body-lg font-semibold">
              <span>Valor a pagar:</span>
              <span>{formatCurrency(amountPaid)}</span>
            </div>

            <div className="flex justify-between text-body text-success">
              <span>Cashback gerado ({cashbackPercentage}%):</span>
              <span>+ {formatCurrency(cashbackGenerated)}</span>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-md pt-md">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          fullWidth
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={purchaseAmount <= 0 || isLoading}
        >
          Confirmar Venda
        </Button>
      </div>
    </form>
  );
}
```

---

## Passo 6: Criar Tela de Confirmação

Criar `src/components/register-sale/SaleConfirmation.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import type { Sale } from '@/types/sale';

interface SaleConfirmationProps {
  sale: Sale;
  onNewSale: () => void;
}

export function SaleConfirmation({ sale, onNewSale }: SaleConfirmationProps) {
  return (
    <div className="text-center space-y-lg">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-success" />
      </div>

      {/* Title */}
      <div>
        <h1 className="text-title font-bold mb-xs">Venda registrada!</h1>
        <p className="text-body text-text-secondary">
          A venda foi registrada com sucesso
        </p>
      </div>

      {/* Sale Details */}
      <Card variant="filled" padding="lg">
        <div className="space-y-sm text-left">
          <DetailRow label="Cliente" value={sale.customer_name} />
          <DetailRow
            label="Valor da compra"
            value={formatCurrency(sale.purchase_amount)}
          />
          {sale.balance_used > 0 && (
            <DetailRow
              label="Saldo usado"
              value={`- ${formatCurrency(sale.balance_used)}`}
              valueClass="text-error"
            />
          )}
          <DetailRow
            label="Valor pago"
            value={formatCurrency(sale.amount_paid)}
            bold
          />
          <DetailRow
            label="Cashback gerado"
            value={`+ ${formatCurrency(sale.cashback_generated)}`}
            valueClass="text-success"
          />
          <DetailRow
            label="Data"
            value={formatDateTime(sale.created_at)}
            valueClass="text-text-secondary"
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-sm">
        <Button onClick={onNewSale} fullWidth>
          Nova Venda
        </Button>
        <Link href="/">
          <Button variant="secondary" fullWidth>
            Voltar para o Início
          </Button>
        </Link>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold,
  valueClass,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-body text-text-secondary">{label}</span>
      <span
        className={`text-body ${bold ? 'font-semibold' : ''} ${valueClass || ''}`}
      >
        {value}
      </span>
    </div>
  );
}
```

---

## Passo 7: Criar Página Registrar Venda

Criar `src/app/(dashboard)/registrar-venda/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { QRScanner } from '@/components/register-sale/QRScanner';
import { CPFInput } from '@/components/register-sale/CPFInput';
import { CustomerPreview } from '@/components/register-sale/CustomerPreview';
import { SaleForm, SaleData } from '@/components/register-sale/SaleForm';
import { SaleConfirmation } from '@/components/register-sale/SaleConfirmation';
import { Divider } from '@/components/ui';
import type { CustomerWithBalance } from '@/types/customer';
import type { Sale } from '@/types/sale';

type Step = 'identify' | 'preview' | 'form' | 'confirmation';

export default function RegisterSalePage() {
  const router = useRouter();
  const { store } = useAuth();

  const [step, setStep] = useState<Step>('identify');
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQRScan = async (data: string) => {
    // Assumindo que o QR contém o CPF ou ID do cliente
    try {
      const parsed = JSON.parse(data);
      if (parsed.cpf) {
        await searchCustomer(parsed.cpf);
      } else if (parsed.id) {
        await searchCustomerById(parsed.id);
      }
    } catch {
      // Se não for JSON, assume que é o CPF direto
      await searchCustomer(data.replace(/\D/g, ''));
    }
  };

  const searchCustomer = async (cpf: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Buscar cliente pelo CPF
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (customerError || !customerData) {
        setError('Cliente não encontrado');
        setIsLoading(false);
        return;
      }

      // Buscar saldo do cliente na loja
      const { data: balanceData } = await supabase
        .from('customer_balances')
        .select('*')
        .eq('customer_id', customerData.id)
        .eq('store_id', store?.id)
        .single();

      const customerWithBalance: CustomerWithBalance = {
        ...customerData,
        storeBalance: balanceData || {
          customer_id: customerData.id,
          store_id: store?.id || '',
          balance: 0,
          total_purchases: 0,
          total_spent: 0,
          total_cashback: 0,
        },
      };

      setCustomer(customerWithBalance);
      setStep('preview');
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
      setError('Erro ao buscar cliente');
    }

    setIsLoading(false);
  };

  const searchCustomerById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (customerError || !customerData) {
        setError('Cliente não encontrado');
        setIsLoading(false);
        return;
      }

      const { data: balanceData } = await supabase
        .from('customer_balances')
        .select('*')
        .eq('customer_id', customerData.id)
        .eq('store_id', store?.id)
        .single();

      const customerWithBalance: CustomerWithBalance = {
        ...customerData,
        storeBalance: balanceData || {
          customer_id: customerData.id,
          store_id: store?.id || '',
          balance: 0,
          total_purchases: 0,
          total_spent: 0,
          total_cashback: 0,
        },
      };

      setCustomer(customerWithBalance);
      setStep('preview');
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
      setError('Erro ao buscar cliente');
    }

    setIsLoading(false);
  };

  const handleConfirmSale = async (data: SaleData) => {
    if (!customer || !store) return;

    setIsLoading(true);

    try {
      // Criar a venda
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          store_id: store.id,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_cpf: customer.cpf,
          purchase_amount: data.purchaseAmount,
          balance_used: data.balanceUsed,
          amount_paid: data.amountPaid,
          cashback_generated: data.cashbackGenerated,
          cashback_percentage: store.cashback_percentage,
          status: 'confirmed',
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Atualizar saldo do cliente (subtrair usado + adicionar cashback)
      const newBalance =
        (customer.storeBalance?.balance || 0) -
        data.balanceUsed +
        data.cashbackGenerated;

      await supabase
        .from('customer_balances')
        .upsert({
          customer_id: customer.id,
          store_id: store.id,
          balance: newBalance,
          total_purchases: (customer.storeBalance?.total_purchases || 0) + 1,
          total_spent:
            (customer.storeBalance?.total_spent || 0) + data.purchaseAmount,
          total_cashback:
            (customer.storeBalance?.total_cashback || 0) + data.cashbackGenerated,
          last_purchase: new Date().toISOString(),
        });

      setSale(saleData);
      setStep('confirmation');
    } catch (err) {
      console.error('Erro ao registrar venda:', err);
      setError('Erro ao registrar venda');
    }

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
```

---

## Passo 8: Exportar Componentes

Criar `src/components/register-sale/index.ts`:

```typescript
export { QRScanner } from './QRScanner';
export { CPFInput } from './CPFInput';
export { CustomerPreview } from './CustomerPreview';
export { SaleForm } from './SaleForm';
export type { SaleData } from './SaleForm';
export { SaleConfirmation } from './SaleConfirmation';
```

---

## Checklist

- [ ] QRScanner implementado com html5-qrcode
- [ ] CPFInput com validação e formatação
- [ ] CustomerPreview com dados somente leitura
- [ ] SaleForm com cálculo de cashback
- [ ] SaleConfirmation com resumo da venda
- [ ] Página completa com fluxo de etapas
- [ ] Integração com Supabase

---

## Tabelas no Supabase

```sql
-- Tabela de clientes (já deve existir do app mobile)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  birth_date DATE,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de saldos por loja
CREATE TABLE customer_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  store_id UUID REFERENCES stores(id) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_cashback DECIMAL(10,2) DEFAULT 0,
  last_purchase TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, store_id)
);

-- RLS
ALTER TABLE customer_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can view customer balances" ON customer_balances
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

CREATE POLICY "Stores can upsert customer balances" ON customer_balances
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );
```

---

## Próximo Passo

Seguir para [08-vendas.md](./08-vendas.md) para implementar o histórico de vendas.
