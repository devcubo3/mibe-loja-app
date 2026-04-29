'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, UserPlus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Modal, ModalFooter, EmptyState, Skeleton, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string | null;
}

interface StaffFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: StaffFormState = { name: '', email: '', password: '', confirmPassword: '' };

export default function EquipePage() {
  const { token } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [form, setForm] = useState<StaffFormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = editingUser !== null;

  const fetchStaff = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/company-users', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Falha ao carregar');
      const data = await res.json();
      setStaff(data.users || []);
    } catch {
      toast.error('Não foi possível carregar a equipe');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (user: StaffUser) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', confirmPassword: '' });
    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof StaffFormState, string>> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    if (!isEditing || form.password) {
      if (!form.password) e.password = 'Senha é obrigatória';
      else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Senhas não conferem';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !token) return;
    setSubmitting(true);
    try {
      if (isEditing && editingUser) {
        const body: Record<string, string> = { name: form.name, email: form.email };
        if (form.password) body.password = form.password;
        const res = await fetch(`/api/company-users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Erro ao atualizar');
        }
        toast.success('Funcionário atualizado');
      } else {
        const res = await fetch('/api/company-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Erro ao criar');
        }
        toast.success('Funcionário criado');
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (user: StaffUser) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/company-users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (!res.ok) throw new Error();
      toast.success(user.is_active ? 'Funcionário desativado' : 'Funcionário ativado');
      fetchStaff();
    } catch {
      toast.error('Erro ao alterar status');
    }
  };

  const handleDelete = async (user: StaffUser) => {
    if (!token) return;
    if (!confirm(`Excluir ${user.name}? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/company-users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Funcionário excluído');
      fetchStaff();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header flex items-center justify-between">
        <h1 className="text-title font-bold">Equipe</h1>
        <Button icon={<UserPlus className="w-4 h-4" />} onClick={openCreateModal}>
          Novo Funcionário
        </Button>
      </div>

      <p className="text-body text-text-secondary mb-md">
        Funcionários têm acesso para registrar vendas e visualizar dados, mas não podem editar a loja.
      </p>

      {isLoading ? (
        <div className="space-y-md">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="w-12 h-12 text-text-muted" />}
          title="Nenhum funcionário cadastrado"
          description="Adicione funcionários para que eles possam acessar o painel da loja"
          action={<Button onClick={openCreateModal}>Adicionar primeiro funcionário</Button>}
        />
      ) : (
        <div className="space-y-md">
          {staff.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-md bg-white border border-input-border rounded-md p-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-sm">
                  <h3 className="font-semibold text-text-primary truncate">{user.name}</h3>
                  <Badge variant={user.is_active ? 'success' : 'light'}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-caption text-text-muted mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggle(user)}
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  title={user.is_active ? 'Desativar' : 'Ativar'}
                >
                  {user.is_active ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => openEditModal(user)}
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="p-2 text-text-muted hover:text-error transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
      >
        <form onSubmit={handleSubmit} className="space-y-md">
          <Input
            label="Nome completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            placeholder="Nome do funcionário"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            placeholder="caixa@padariajoao.com"
            helperText="Pode ser real ou fictício, mas precisa ter formato válido"
          />
          <Input
            label={isEditing ? 'Nova senha (opcional)' : 'Senha'}
            type="password"
            showPasswordToggle
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            placeholder="Mínimo 6 caracteres"
          />
          <Input
            label="Confirmar senha"
            type="password"
            showPasswordToggle
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            placeholder="Repita a senha"
          />

          <ModalFooter>
            <Button type="button" variant="secondary" fullWidth onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={submitting}>
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
