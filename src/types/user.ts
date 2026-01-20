export interface UserAccount {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birth_date?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAccountUpdateData {
  name?: string;
  phone?: string;
  birth_date?: string;
  photo_url?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
