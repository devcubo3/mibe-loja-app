'use client';

import { useState } from 'react';
import { Input, Button } from '@/components/ui';
import { formatCPF, unformatCPF } from '@/lib/formatters';
import { Search } from 'lucide-react';

interface CPFInputProps {
  onSearch: (cpf: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function CPFInput({ onSearch, isLoading }: CPFInputProps) {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
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
