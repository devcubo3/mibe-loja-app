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
  onConfirm: (data: SaleData) => void | Promise<void>;
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

  const handlePurchaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setPurchaseValue(formatted);
    setError(null);
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
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
