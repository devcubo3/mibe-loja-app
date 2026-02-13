import { supabase } from '@/lib/supabase';
import type { StoreUpdateData } from '@/types/store';

export const storeService = {
    /**
     * Busca as categorias sincronizadas do banco
     */
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name')
            .order('name');

        if (error) throw error;
        return data;
    },

    /**
     * Obtém o token de autenticação do localStorage (via zustand persist)
     */
    getAuthToken() {
        const storage = localStorage.getItem('mibe-auth-storage');
        if (!storage) return null;
        try {
            const parsed = JSON.parse(storage);
            return parsed.state?.token || null;
        } catch {
            return null;
        }
    },

    /**
     * Atualiza os dados da empresa via API Route para garantir segurança
     */
    async updateStore(data: StoreUpdateData & { category_id?: number }) {
        const token = this.getAuthToken();
        if (!token) throw new Error('Não autenticado');

        const response = await fetch('/api/company/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Erro ao atualizar dados');
        return result.company;
    },

    /**
     * Upload de arquivo para o storage
     */
    async uploadAsset(file: File, type: 'logo' | 'cover' | 'gallery') {
        const token = this.getAuthToken();
        if (!token) throw new Error('Não autenticado');

        // Para o upload, precisamos do ID da empresa que está no token
        const tokenData = JSON.parse(atob(token));
        const companyId = tokenData.companyId;

        const fileExt = file.name.split('.').pop();
        const fileName = `${companyId}/${type}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload direto via Supabase Client (usando políticas públicas de upload caso existam, 
        // ou precisaremos ajustar policies)
        const { error: uploadError } = await supabase.storage
            .from('store-assets')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('store-assets')
            .getPublicUrl(filePath);

        // Salva a nova URL no banco
        const updateData = type === 'logo' ? { logo_url: publicUrl } : { cover_image: publicUrl };
        await this.updateStore(updateData);

        return publicUrl;
    }
};
