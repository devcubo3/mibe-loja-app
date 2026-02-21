import { storeService } from './storeService';

export interface CreateAsaasCustomerParams {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  externalReference?: string;
}

export interface AsaasCustomerResponse {
  customer: {
    id: string;
    name?: string;
    email?: string;
    cpfCnpj?: string;
  };
  message?: string;
}

export const asaasService = {
  /**
   * Cria um cliente no Asaas via API route autenticada
   */
  async createCustomer(params: CreateAsaasCustomerParams): Promise<AsaasCustomerResponse> {
    const token = storeService.getAuthToken();
    if (!token) throw new Error('Não autenticado');

    const response = await fetch('/api/asaas/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao criar cliente Asaas');
    return result;
  },
};
