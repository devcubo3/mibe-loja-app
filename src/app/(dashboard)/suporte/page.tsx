'use client';

import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button } from '@/components/ui';

const SUPPORT_WHATSAPP = '5511999999999';

export default function SuportePage() {
  const { store } = useAuth();

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(
      `Olá! Preciso de ajuda com minha loja ${store?.name || ''} (CNPJ: ${store?.cnpj || ''}).`
    );
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${message}`, '_blank');
  };

  return (
    <div className="page-container max-w-xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-title font-bold">Suporte</h1>
      </div>

      {/* Descrição */}
      <div className="mb-lg">
        <p className="text-body text-text-secondary">
          Precisa de ajuda? Entre em contato com nossa equipe de suporte pelo WhatsApp.
          Estamos disponíveis para ajudar você com qualquer dúvida ou problema.
        </p>
      </div>

      {/* Card de Suporte */}
      <Card variant="default" padding="lg" className="mb-lg">
        <div className="flex flex-col items-center text-center">
          {/* Ícone */}
          <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mb-md">
            <MessageCircle className="w-10 h-10 text-success" />
          </div>

          {/* Título */}
          <h2 className="text-subtitle font-bold text-text-primary mb-xs">
            Falar com o suporte
          </h2>

          {/* Descrição */}
          <p className="text-body text-text-secondary mb-lg">
            Atendimento via WhatsApp de segunda a sexta, das 9h às 18h
          </p>

          {/* Botão WhatsApp */}
          <Button
            onClick={handleWhatsAppSupport}
            fullWidth
            icon={<MessageCircle className="w-5 h-5" />}
            className="bg-whatsapp hover:bg-[#20BA5A] border-whatsapp"
          >
            Abrir WhatsApp
          </Button>
        </div>
      </Card>

      {/* Informações adicionais */}
      <Card variant="default" padding="md">
        <h3 className="text-body-lg font-semibold text-text-primary mb-sm">
          Como podemos ajudar?
        </h3>
        <ul className="space-y-sm text-body text-text-secondary">
          <li className="flex items-start gap-sm">
            <span className="text-primary mt-1">•</span>
            <span>Dúvidas sobre configuração de cashback</span>
          </li>
          <li className="flex items-start gap-sm">
            <span className="text-primary mt-1">•</span>
            <span>Problemas com registro de vendas</span>
          </li>
          <li className="flex items-start gap-sm">
            <span className="text-primary mt-1">•</span>
            <span>Questões sobre gerenciamento de clientes</span>
          </li>
          <li className="flex items-start gap-sm">
            <span className="text-primary mt-1">•</span>
            <span>Suporte técnico e bugs</span>
          </li>
          <li className="flex items-start gap-sm">
            <span className="text-primary mt-1">•</span>
            <span>Sugestões e melhorias</span>
          </li>
        </ul>
      </Card>

      {/* Version */}
      <p className="text-center text-caption text-text-muted py-lg">
        Versão 1.0.0
      </p>
    </div>
  );
}
