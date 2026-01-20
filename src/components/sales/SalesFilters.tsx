'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SalesFilters {
  type: 'all' | 'with_cashback' | 'without_cashback';
  period: 'day' | 'week' | 'month' | 'all';
  sortBy: 'recent' | 'oldest' | 'highest' | 'lowest';
}

interface SalesFiltersProps {
  filters: SalesFilters;
  onChange: (filters: SalesFilters) => void;
}

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'with_cashback', label: 'Com cashback' },
  { value: 'without_cashback', label: 'Sem cashback' },
];

const periodOptions = [
  { value: 'day', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'all', label: 'Todo período' },
];

const sortOptions = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
  { value: 'highest', label: 'Maior valor' },
  { value: 'lowest', label: 'Menor valor' },
];

export function SalesFilters({ filters, onChange }: SalesFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleChange = (key: keyof SalesFilters, value: string) => {
    onChange({ ...filters, [key]: value });
    setOpenDropdown(null);
  };

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.period !== 'month' ||
    filters.sortBy !== 'recent';

  const clearFilters = () => {
    onChange({
      type: 'all',
      period: 'month',
      sortBy: 'recent',
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-sm">
      {/* Type Filter */}
      <FilterDropdown
        label={typeOptions.find((o) => o.value === filters.type)?.label || 'Tipo'}
        options={typeOptions}
        value={filters.type}
        onChange={(value) => handleChange('type', value)}
        isOpen={openDropdown === 'type'}
        onToggle={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
      />

      {/* Period Filter */}
      <FilterDropdown
        label={periodOptions.find((o) => o.value === filters.period)?.label || 'Período'}
        options={periodOptions}
        value={filters.period}
        onChange={(value) => handleChange('period', value)}
        isOpen={openDropdown === 'period'}
        onToggle={() => setOpenDropdown(openDropdown === 'period' ? null : 'period')}
      />

      {/* Sort Filter */}
      <FilterDropdown
        label={sortOptions.find((o) => o.value === filters.sortBy)?.label || 'Ordenar'}
        options={sortOptions}
        value={filters.sortBy}
        onChange={(value) => handleChange('sortBy', value)}
        isOpen={openDropdown === 'sortBy'}
        onToggle={() => setOpenDropdown(openDropdown === 'sortBy' ? null : 'sortBy')}
      />

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 px-3 py-2 text-caption text-error hover:bg-error-light rounded-sm transition-colors"
        >
          <X className="w-3 h-3" />
          Limpar
        </button>
      )}
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
}: FilterDropdownProps) {
  const isDefault = value === options[0]?.value;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-2 text-body rounded-sm border transition-colors',
          isDefault
            ? 'bg-input-bg border-input-border hover:border-primary'
            : 'bg-primary border-primary text-white'
        )}
      >
        {label}
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-white border border-input-border rounded-md shadow-lg z-20 py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className={cn(
                  'w-full px-4 py-2 text-left text-body hover:bg-input-bg transition-colors',
                  option.value === value && 'bg-input-bg font-medium'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
