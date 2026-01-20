'use client';

import { LogOut } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-error-light flex items-center justify-center mb-md">
          <LogOut className="w-8 h-8 text-error" />
        </div>

        {/* Title */}
        <h2 className="text-subtitle font-bold text-text-primary mb-xs">
          Sair da conta?
        </h2>

        {/* Description */}
        <p className="text-body text-text-secondary mb-lg">
          Você precisará fazer login novamente para acessar sua conta
        </p>

        {/* Actions */}
        <div className="flex gap-sm w-full">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={isLoading}
            fullWidth
          >
            Sair
          </Button>
        </div>
      </div>
    </Modal>
  );
}
