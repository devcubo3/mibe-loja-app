/**
 * Formata valor numérico para moeda brasileira
 * @param value - Valor numérico
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata CPF
 * @param cpf - CPF com ou sem formatação
 * @returns String formatada (ex: "123.456.789-00")
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cpf;
}

/**
 * Formata CNPJ
 * @param cnpj - CNPJ com ou sem formatação
 * @returns String formatada (ex: "12.345.678/0001-00")
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
  }
  return cnpj;
}

/**
 * Formata telefone
 * @param phone - Telefone com ou sem formatação
 * @returns String formatada (ex: "(11) 98765-4321")
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  // Tenta formato com 8 dígitos
  const match8 = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (match8) {
    return `(${match8[1]}) ${match8[2]}-${match8[3]}`;
  }
  return phone;
}

/**
 * Formata data e hora relativa
 * @param date - String de data ISO
 * @returns String formatada (ex: "Há 5 minutos", "Hoje às 14:30", "Ontem às 09:15", "23/12/2024 às 16:45")
 */
export function formatTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const timeStr = then.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Menos de 1 hora: "Há X minutos"
  if (diffMins < 60) {
    if (diffMins < 1) return 'Agora';
    return `Há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  }

  // Menos de 24 horas e mesmo dia: "Há X horas" ou "Hoje às HH:MM"
  if (diffHours < 24 && then.getDate() === now.getDate()) {
    if (diffHours < 6) {
      return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    }
    return `Hoje às ${timeStr}`;
  }

  // Ontem
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (then.getDate() === yesterday.getDate() && then.getMonth() === yesterday.getMonth()) {
    return `Ontem às ${timeStr}`;
  }

  // Mais de 1 dia: "DD/MM/YYYY às HH:MM"
  const dateStr = then.toLocaleDateString('pt-BR');
  return `${dateStr} às ${timeStr}`;
}

/**
 * Formata data completa
 * @param date - String de data ISO
 * @returns String formatada (ex: "23/12/2024")
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Retorna saudação baseada no horário
 * @returns "Bom dia", "Boa tarde" ou "Boa noite"
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Remove formatação do CPF
 * @param cpf - CPF formatado
 * @returns CPF apenas com números
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Formata input de moeda em tempo real
 * @param value - Valor digitado
 * @returns Valor formatado (ex: "R$ 1.234,56")
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  if (!numbers) return '';

  // Converte para número com centavos
  const amount = parseInt(numbers) / 100;

  return formatCurrency(amount);
}

/**
 * Converte string formatada de moeda para número
 * @param value - Valor formatado (ex: "R$ 1.234,56")
 * @returns Número (ex: 1234.56)
 */
export function parseCurrencyInput(value: string): number {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return 0;
  return parseInt(numbers) / 100;
}

/**
 * Formata data e hora completa
 * @param date - String de data ISO
 * @returns String formatada (ex: "23/12/2024 às 14:30")
 */
export function formatDateTime(date: string): string {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('pt-BR');
  const timeStr = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr} às ${timeStr}`;
}

/**
 * Formata tempo relativo para notificações
 * @param date - String de data ISO
 * @returns String formatada (ex: "2 minutos atrás", "Ontem", "23/12/2024")
 */
export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Menos de 1 minuto
  if (diffMins < 1) return 'Agora';

  // Menos de 1 hora
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'} atrás`;
  }

  // Menos de 24 horas
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`;
  }

  // Ontem
  if (diffDays === 1) return 'Ontem';

  // Menos de 7 dias
  if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  }

  // Mais de 7 dias
  return formatDate(date);
}

/**
 * Formata input de data de nascimento em tempo real (DD/MM/AAAA)
 * @param value - Valor digitado
 * @returns Valor formatado (ex: "15/03/1990")
 */
export function formatBirthDateInput(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
  if (match) {
    let formatted = '';
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += '/' + match[2];
    if (match[3]) formatted += '/' + match[3];
    return formatted;
  }
  return value;
}

/**
 * Converte data DD/MM/AAAA para ISO
 * @param value - Data no formato DD/MM/AAAA
 * @returns String ISO date ou vazio
 */
export function parseBirthDateInput(value: string): string {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  return '';
}

/**
 * Converte data ISO para DD/MM/AAAA
 * @param value - Data ISO (YYYY-MM-DD)
 * @returns String DD/MM/AAAA
 */
export function formatBirthDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString('pt-BR');
}
