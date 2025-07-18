import axios from '../lib/axios';

export interface UserAddress {
  id: number;
  user_id: number;
  label: string;
  address: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithAddresses {
  id: number;
  name: string;
  phone: string;
  addresses: UserAddress[];
}

export const userAddressesService = {
  // Buscar usuário e endereços por telefone
  async getByPhone(phone: string): Promise<{ user: UserWithAddresses | null; addresses: UserAddress[] }> {
    try {
      const response = await axios.get(`/user-addresses/by-phone/${phone}?role=CUSTOMER`);
      
      if (response.data.success) {
        return {
          user: response.data.user,
          addresses: response.data.addresses || []
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.duplicateUsers) {
        throw new Error('Múltiplos usuários encontrados com este telefone. Entre em contato com o administrador.');
      }
      throw new Error(error.response?.data?.message || 'Erro ao buscar endereços');
    }
  },

  // Listar endereços de um usuário
  async getUserAddresses(userId: number): Promise<UserAddress[]> {
    try {
      const response = await axios.get(`/user-addresses/user/${userId}`);
      
      if (response.data.success) {
        return response.data.addresses;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar endereços');
    }
  },

  // Adicionar novo endereço
  async addAddress(data: { label: string; address: string; is_default?: boolean; user_id?: number }): Promise<UserAddress> {
    try {
      const response = await axios.post('/user-addresses', data);
      
      if (response.data.success) {
        return response.data.address;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao adicionar endereço');
    }
  },

  // Atualizar endereço
  async updateAddress(addressId: number, data: { label: string; address: string; is_default?: boolean; user_id?: number }): Promise<UserAddress> {
    try {
      const response = await axios.put(`/user-addresses/${addressId}`, data);
      
      if (response.data.success) {
        return response.data.address;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar endereço');
    }
  },

  // Excluir endereço
  async deleteAddress(addressId: number): Promise<void> {
    try {
      const response = await axios.delete(`/user-addresses/${addressId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao excluir endereço');
    }
  },

  // Definir endereço como padrão
  async setDefaultAddress(addressId: number): Promise<void> {
    try {
      const response = await axios.patch(`/user-addresses/${addressId}/set-default`);
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao definir endereço padrão');
    }
  }
}; 