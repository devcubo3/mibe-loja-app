'use client';

import { useState, useEffect, useRef } from 'react';
import {
    QrCode,
    CreditCard,
    Loader2,
    Copy,
    Check,
    ExternalLink,
    AlertCircle,
    ArrowLeft,
    CheckCircle,
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { storeService } from '@/services/storeService';
import type { PaymentMethod, PaymentStep, CreatePaymentResponse } from '@/types/payment';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceIds: string[];
    totalAmount: number;
    onPaymentComplete?: () => void;
}

export function PaymentModal({
    isOpen,
    onClose,
    invoiceIds,
    totalAmount,
    onPaymentComplete,
}: PaymentModalProps) {
    const [step, setStep] = useState<PaymentStep>('select-method');
    const [paymentData, setPaymentData] = useState<CreatePaymentResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Polling: verifica status PIX a cada 5s enquanto exibindo QR code
    useEffect(() => {
        if (step !== 'pix-display' || !paymentData?.payment_id) return;

        const token = storeService.getAuthToken();
        if (!token) return;

        const checkPayment = async () => {
            try {
                const res = await fetch(
                    `/api/subscription/check-payment?payment_id=${paymentData.payment_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!res.ok) return;
                const data = await res.json();
                if (data.is_paid) {
                    stopPolling();
                    setStep('payment-confirmed');
                    onPaymentComplete?.();
                }
            } catch {
                // Ignorar erros de rede no polling
            }
        };

        pollingRef.current = setInterval(checkPayment, 5000);
        return stopPolling;
    }, [step, paymentData?.payment_id]);

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    const handleSelectMethod = async (method: PaymentMethod) => {
        setStep('processing');
        setError(null);

        const token = storeService.getAuthToken();
        if (!token) {
            setError('Sessão expirada. Faça login novamente.');
            setStep('error');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/abacatepay-pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    payment_history_ids: invoiceIds,
                    billing_type: method,
                    app_url: window.location.origin,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Erro ao gerar cobrança');
                setStep('error');
                return;
            }

            setPaymentData(data);
            setStep(method === 'PIX' ? 'pix-display' : 'redirect-card');
        } catch (err) {
            console.error('Erro ao criar pagamento:', err);
            setError('Erro de conexão. Tente novamente.');
            setStep('error');
        }
    };

    const handleCopyPixCode = async () => {
        if (paymentData?.pix?.qrCodeText) {
            await navigator.clipboard.writeText(paymentData.pix.qrCodeText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOpenCheckout = () => {
        if (paymentData?.invoice_url) {
            window.open(paymentData.invoice_url, '_blank');
        }
    };

    const handleBack = () => {
        stopPolling();
        setStep('select-method');
        setError(null);
        setPaymentData(null);
    };

    const handleClose = () => {
        stopPolling();
        setStep('select-method');
        setError(null);
        setPaymentData(null);
        setCopied(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Pagamento de Faturas">
            <div className="space-y-lg">
                {/* Resumo das faturas */}
                <div className="bg-input-bg rounded-xl p-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-caption text-secondary">Faturas selecionadas</p>
                            <p className="text-body-lg font-semibold text-primary">{invoiceIds.length} fatura{invoiceIds.length > 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-caption text-secondary">Total</p>
                            <p className="text-body-lg font-bold text-primary">{formatCurrency(totalAmount)}</p>
                        </div>
                    </div>
                </div>

                {/* Etapa: Seleção de método */}
                {step === 'select-method' && (
                    <>
                        <div className="text-center">
                            <p className="text-body text-secondary">Escolha a forma de pagamento</p>
                        </div>

                        <div className="grid grid-cols-2 gap-md">
                            <button
                                onClick={() => handleSelectMethod('PIX')}
                                className="flex flex-col items-center gap-sm p-lg border-2 border-input-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <QrCode className="w-7 h-7 text-success" />
                                </div>
                                <span className="text-body font-semibold text-primary">PIX</span>
                                <span className="text-caption text-secondary">Aprovação instantânea</span>
                            </button>

                            <button
                                onClick={() => handleSelectMethod('CREDIT_CARD')}
                                className="flex flex-col items-center gap-sm p-lg border-2 border-input-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-7 h-7 text-primary" />
                                </div>
                                <span className="text-body font-semibold text-primary">Cartão</span>
                                <span className="text-caption text-secondary">Crédito ou Débito</span>
                            </button>
                        </div>
                    </>
                )}

                {/* Etapa: Processando */}
                {step === 'processing' && (
                    <div className="flex flex-col items-center gap-md py-xl">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-body text-secondary">Gerando cobrança...</p>
                    </div>
                )}

                {/* Etapa: Exibindo QR Code PIX */}
                {step === 'pix-display' && paymentData?.pix && (
                    <>
                        <div className="flex items-center gap-sm">
                            <button onClick={handleBack} className="p-sm hover:bg-input-bg rounded-lg">
                                <ArrowLeft className="w-5 h-5 text-secondary" />
                            </button>
                            <p className="text-body text-secondary">Escaneie o QR Code ou copie o código</p>
                        </div>

                        <div className="flex flex-col items-center gap-md">
                            <div className="bg-white p-md rounded-xl shadow-sm">
                                <img
                                    src={paymentData.pix.qrCodeImage}
                                    alt="QR Code PIX"
                                    className="w-48 h-48"
                                />
                            </div>

                            <div className="text-center">
                                <p className="text-caption text-secondary">Valor a pagar</p>
                                <p className="text-heading-lg font-bold text-primary">
                                    {formatCurrency(paymentData.value)}
                                </p>
                            </div>

                            <div className="w-full">
                                <div className="flex gap-sm">
                                    <input
                                        type="text"
                                        readOnly
                                        value={paymentData.pix.qrCodeText}
                                        className="flex-1 bg-input-bg border border-input-border rounded-lg px-md py-sm text-body text-primary truncate"
                                    />
                                    <Button
                                        variant={copied ? 'secondary' : 'primary'}
                                        onClick={handleCopyPixCode}
                                    >
                                        {copied ? (
                                            <><Check className="w-4 h-4" /> Copiado</>
                                        ) : (
                                            <><Copy className="w-4 h-4" /> Copiar</>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <p className="text-caption text-secondary">
                                Válido até {formatDateTime(paymentData.pix.expirationDate)}
                            </p>
                        </div>

                        <div className="bg-input-bg border border-input-border rounded-xl p-md flex items-center gap-sm">
                            <Loader2 className="w-4 h-4 text-secondary animate-spin shrink-0" />
                            <p className="text-caption text-secondary">
                                Aguardando confirmação do pagamento...
                            </p>
                        </div>
                    </>
                )}

                {/* Etapa: Pagamento confirmado */}
                {step === 'payment-confirmed' && (
                    <div className="flex flex-col items-center gap-md py-md">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <div className="text-center">
                            <p className="text-body-lg font-semibold text-primary">Pagamento confirmado!</p>
                            <p className="text-body text-secondary mt-xs">
                                Sua assinatura foi ativada com sucesso.
                            </p>
                        </div>
                        <Button fullWidth onClick={handleClose}>
                            Fechar
                        </Button>
                    </div>
                )}

                {/* Etapa: Redirect para Cartão */}
                {step === 'redirect-card' && paymentData && (
                    <>
                        <div className="flex items-center gap-sm">
                            <button onClick={handleBack} className="p-sm hover:bg-input-bg rounded-lg">
                                <ArrowLeft className="w-5 h-5 text-secondary" />
                            </button>
                            <p className="text-body text-secondary">Finalize o pagamento no site seguro</p>
                        </div>

                        <div className="flex flex-col items-center gap-md py-md">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <CreditCard className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-body-lg font-semibold text-primary">Pagamento com Cartão</p>
                                <p className="text-body text-secondary mt-xs">
                                    Clique no botão abaixo para ser redirecionado ao checkout seguro.
                                </p>
                            </div>
                        </div>

                        <Button fullWidth onClick={handleOpenCheckout}>
                            <ExternalLink className="w-4 h-4" />
                            Ir para pagamento
                        </Button>

                        <div className="bg-input-bg rounded-xl p-md">
                            <p className="text-caption text-secondary text-center">
                                Você será redirecionado para uma página segura para inserir os dados do cartão.
                            </p>
                        </div>
                    </>
                )}

                {/* Etapa: Erro */}
                {step === 'error' && (
                    <>
                        <div className="flex flex-col items-center gap-md py-md">
                            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-error" />
                            </div>
                            <div className="text-center">
                                <p className="text-body-lg font-semibold text-error">Ops! Algo deu errado</p>
                                <p className="text-body text-secondary mt-xs">{error}</p>
                            </div>
                        </div>

                        <div className="flex gap-md">
                            <Button variant="ghost" fullWidth onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button fullWidth onClick={handleBack}>
                                Tentar novamente
                            </Button>
                        </div>
                    </>
                )}

                {['select-method', 'pix-display', 'redirect-card'].includes(step) && (
                    <Button variant="ghost" fullWidth onClick={handleClose}>
                        {step === 'select-method' ? 'Cancelar' : 'Fechar'}
                    </Button>
                )}
            </div>
        </Modal>
    );
}
