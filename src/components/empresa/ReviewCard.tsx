'use client';

import { useState } from 'react';
import { Reply, Send, Loader2, Pencil } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { StarRating } from './StarRating';
import type { Review } from '@/types/store';

interface ReviewCardProps {
  review: Review;
  onReply: (reviewId: string, text: string) => Promise<void>;
}

export function ReviewCard({ review, onReply }: ReviewCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    setIsSending(true);
    try {
      await onReply(review.id, replyText);
      setReplyText('');
      setIsReplying(false);
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    }
    setIsSending(false);
  };

  return (
    <div className="bg-input-bg rounded-lg p-md">
      {/* Header */}
      <div className="flex items-start gap-md">
        <Avatar name={review.customer_name} size="md" src={review.customer_avatar_url || undefined} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-sm">
            <p className="font-semibold text-text-primary truncate">
              {review.customer_name}
            </p>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <p className="text-caption text-text-muted">
            {formatDate(review.created_at)}
          </p>
        </div>
      </div>

      {/* Comentário */}
      <div className="mt-md text-body text-text-secondary leading-relaxed break-words whitespace-pre-wrap">
        "{review.comment}"
      </div>

      {/* Resposta da empresa */}
      {review.owner_response && !isReplying && (
        <div className="mt-md pt-md border-t border-input-border pl-4 border-l-4 border-l-primary/20">
          <div className="flex items-center justify-between mb-sm">
            <div className="flex items-center gap-sm">
              <Reply className="w-4 h-4 text-text-muted" />
              <span className="text-caption font-medium text-text-muted">
                Resposta da empresa
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setReplyText(review.owner_response || '');
                setIsReplying(true);
              }}
              className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
          </div>
          <p className="text-body text-text-secondary italic">
            "{review.owner_response}"
          </p>
        </div>
      )}

      {/* Botão/Form de resposta */}
      {(!review.owner_response || isReplying) && (
        <div className="mt-md pt-md border-t border-input-border">
          {isReplying ? (
            <div className="space-y-sm">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="w-full h-24 px-md py-sm bg-white border border-input-border rounded-lg text-body resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isSending}
              />
              <div className="flex justify-end gap-sm">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                  disabled={isSending}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isSending || (review.owner_response === replyText.trim())}
                  loading={isSending}
                  icon={<Send className="w-4 h-4" />}
                >
                  {review.owner_response ? 'Salvar Edição' : 'Enviar'}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsReplying(true)}
              className="flex items-center gap-sm text-text-muted hover:text-primary transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span className="text-sm font-medium">Responder</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
