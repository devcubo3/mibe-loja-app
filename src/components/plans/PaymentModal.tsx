'use client';

import { useState } from 'react';
import {
    QrCode,
    CreditCard,
    Loader2,
    Copy,
    Check,
    ExternalLink,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { storeService } from '@/services/storeService';
import type { Plan, SubscriptionWithPlan } from '@/types/plan';
import type { PaymentMethod, PaymentStep, CreatePaymentResponse, PixData } from '@/types/payment';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: Plan;
    currentSubscription: SubscriptionWithPlan | null;
}

export function PaymentModal({
    isOpen,
    onClose,
    plan,
    currentSubscription,
}: PaymentModalProps) {
    const [step, setStep] = useState<PaymentStep>('select-method');
    const [paymentData, setPaymentData] = useState<CreatePaymentResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const isUpgrade = currentSubscription
        ? plan.monthly_price > currentSubscription.plan.monthly_price
        : true;

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
            const response = await fetch('/api/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    plan_id: plan.id,
                    billing_type: method,
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
        setStep('select-method');
        setError(null);
        setPaymentData(null);
    };

    const handleClose = () => {
        setStep('select-method');
        setError(null);
        setPaymentData(null);
        setCopied(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Pagamento do Plano">
            <div className="space-y-lg">
                {/* Resumo do plano */}
                <div className="bg-input-bg rounded-xl p-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-caption text-secondary">Plano selecionado</p>
                            <p className="text-body-lg font-semibold text-primary">{plan.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-caption text-secondary">Valor</p>
                            <p className="text-body-lg font-bold text-primary">
                                {formatCurrency(plan.monthly_price)}
                                <span className="text-caption text-secondary font-normal">/mês</span>
                            </p>
                        </div>
                    </div>
                    {currentSubscription && (
                        <div className="mt-sm pt-sm border-t border-input-border">
                            <span className={`text-caption ${isUpgrade ? 'text-success' : 'text-warning'}`}>
                                {isUpgrade ? '↑ Upgrade' : '↓ Downgrade'} do plano {currentSubscription.plan.name}
                            </span>
                        </div>
                    )}
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
                            {/* QR Code */}
                            <div className="bg-white p-md rounded-xl shadow-sm">
                                <img
                                    src={`data:image/png;base64,${paymentData.pix.qrCodeImage}`}
                                    alt="QR Code PIX"
                                    className="w-48 h-48"
                                />
                            </div>

                            {/* Valor */}
                            <div className="text-center">
                                <p className="text-caption text-secondary">Valor a pagar</p>
                                <p className="text-heading-lg font-bold text-primary">
                                    {formatCurrency(paymentData.value)}
                                </p>
                            </div>

                            {/* Código Copia e Cola */}
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
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copiado
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copiar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Validade */}
                            <p className="text-caption text-secondary">
                                Válido até {formatDateTime(paymentData.pix.expirationDate)}
                            </p>
                        </div>

                        <div className="bg-success/10 border border-success/20 rounded-xl p-md">
                            <p className="text-body text-success text-center">
                                Após o pagamento, seu plano será ativado automaticamente em alguns minutos.
                            </p>
                        </div>
                    </>
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
                                Você será redirecionado para uma página segura do Asaas para inserir os dados do cartão.
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

                {/* Botão Cancelar (exceto em processing e error) */}
                {['select-method', 'pix-display', 'redirect-card'].includes(step) && (
                    <Button variant="ghost" fullWidth onClick={handleClose}>
                        {step === 'select-method' ? 'Cancelar' : 'Fechar'}
                    </Button>
                )}
            </div>
        </Modal>
    );
}
