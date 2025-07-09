import api from '@/lib/axios';

// Tipos de usuário baseados no banco de dados
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ESTABLISHMENT' | 'DELIVERY';
  phone?: string;
  address?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  private static tokenKey = 'auth_token';
  private static userKey = 'auth_user';

  // Login
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const data = response.data;
      
      // Salvar token e dados do usuário
      this.setToken(data.token);
      this.setUser(data.user);

      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        // Chamar endpoint de logout no servidor
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Sempre limpar dados locais
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  // Verificar se está autenticado
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Obter usuário atual
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Obter token
  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Definir token
  private static setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Definir usuário
  private static setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Verificar token (opcional - para validar com o servidor)
  static async validateToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await api.get('/auth/validate');
      return response.status === 200;
    } catch (error) {
      console.error('Erro na validação do token:', error);
      return false;
    }
  }

  // Atualizar perfil
  static async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      let response;
      
      if (userData.id) {
        // Atualizar usuário específico
        const { id, ...dataToUpdate } = userData;
        response = await api.put(`/users/${id}`, dataToUpdate);
      } else {
        // Atualizar perfil do usuário autenticado
        response = await api.put('/users/profile', userData);
      }
      
      const updatedUser = response.data.user;
      this.setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  // Registrar novo usuário
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'ESTABLISHMENT' | 'DELIVERY';
    phone?: string;
    address?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      const data = response.data;
      
      // Salvar token e dados do usuário
      this.setToken(data.token);
      this.setUser(data.user);

      return data;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  // Recuperar senha
  static async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      throw error;
    }
  }

  // Redefinir senha
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  }

  // Cadastro completo de estabelecimento (sem upload de arquivos)
  static async registerEstablishment({
    user,
    establishment = {},
    business_hours = []
  }: {
    user: {
      nome: string;
      email: string;
      senha: string;
      cpfCnpj: string;
      suporte: string;
    };
    establishment?: Partial<{
      restaurant_name: string;
      description: string;
      cuisine_type: string;
      pix_key: string;
      instagram?: string;
      whatsapp: string;
      address: string;
      minimum_order: string | number;
      delivery_fee: string | number;
      delivery_radius: string | number;
    }>;
    business_hours?: any[];
  }): Promise<{ message: string }> {
    try {
      const payload = {
        ...user,
        ...establishment,
        business_hours: JSON.stringify(business_hours),
      };
      const response = await api.post('/auth/register', payload);
      return response.data;
    } catch (error) {
      console.error('Erro no cadastro de estabelecimento:', error);
      throw error;
    }
  }
}

// Hook personalizado para autenticação
export const useAuth = () => {
  const isAuthenticated = AuthService.isAuthenticated();
  const currentUser = AuthService.getCurrentUser();

  return {
    isAuthenticated,
    currentUser,
    login: AuthService.login,
    logout: AuthService.logout,
    updateProfile: AuthService.updateProfile,
    register: AuthService.register,
    forgotPassword: AuthService.forgotPassword,
    resetPassword: AuthService.resetPassword,
    registerEstablishment: AuthService.registerEstablishment,
  };
}; 