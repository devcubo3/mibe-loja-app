'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { storeService } from '@/services/storeService';
import type { Plan, SubscriptionWithPlan, PaymentRecord, SubscriptionStatus } from '@/types/plan';

export function usePlans() {
  const { company } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!company?.id) {
      setIsLoading(false);
      return;
    }

    const token = storeService.getAuthToken();
    if (!token) {
      setIsLoading(false);
      setError('Não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/data', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao carregar dados');
      }

      const data = await response.json();

      setPlans(data.plans || []);

      // Montar SubscriptionWithPlan se houver assinatura
      if (data.subscription && data.subscription.plans) {
        setSubscription({
          ...data.subscription,
          status: data.subscription.status as SubscriptionStatus,
          plan: data.subscription.plans as Plan,
        });
      } else {
        setSubscription(null);
      }

      setPayments(data.payments || []);
    } catch (err: any) {
      console.error('Erro ao carregar dados de planos:', err);
      setError(err.message || 'Erro ao carregar dados do plano');
    } finally {
      setIsLoading(false);
    }
  }, [company?.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Cálculos de uso
  const usagePercent = subscription
    ? Math.min((subscription.current_profile_count / subscription.plan.user_limit) * 100, 100)
    : 0;

  const isOverLimit = subscription
    ? subscription.current_profile_count > subscription.plan.user_limit
    : false;

  return {
    plans,
    subscription,
    payments,
    isLoading,
    error,
    usagePercent,
    isOverLimit,
    reload: loadAll,
  };
}
