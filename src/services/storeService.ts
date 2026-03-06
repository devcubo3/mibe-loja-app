import type { StoreUpdateData } from '@/types/store';

export const storeService = {
    /**
     * Busca as categorias sincronizadas via API Route
     */
    async getCategories() {
        const response = await fetch('/api/categories');
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Erro ao buscar categorias');

        return result.data;
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
     * Upload de arquivo para o storage via API Route
     */
    async uploadAsset(file: File, type: 'logo' | 'cover' | 'gallery') {
        const token = this.getAuthToken();
        if (!token) throw new Error('Não autenticado');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Erro no upload');

        const publicUrl = result.publicUrl;

        // Salva a nova URL no banco
        const updateData = type === 'logo' ? { logo_url: publicUrl } : { cover_image: publicUrl };
        await this.updateStore(updateData);

        return publicUrl;
    }
};
