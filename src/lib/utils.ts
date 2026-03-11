import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Retorna uma data futura em formato 'YYYY-MM-DD' */
export function getDatePlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/** Retorna a data atual em formato 'YYYY-MM-DD' */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
