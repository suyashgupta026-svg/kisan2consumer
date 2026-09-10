import { User, AuthResponse, Product, Order, FarmerEarnings, PlatformStats } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('k2c_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `Request failed (${res.status})`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        if (typeof errData.detail === 'string') {
          errorMessage = errData.detail;
        } else if (Array.isArray(errData.detail)) {
          errorMessage = errData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        }
      } else if (errData.error) {
        errorMessage = errData.error;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string; role: string; location?: string; phone?: string }): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  async getDemoAccounts(): Promise<Record<string, any>> {
    return request<Record<string, any>>('/auth/demo-accounts');
  },

  // Products
  async getProducts(params?: { category?: string; search?: string; farmer_id?: number }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.farmer_id) query.append('farmer_id', String(params.farmer_id));
    
    const qs = query.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  async getProduct(id: number): Promise<Product> {
    return request<Product>(`/products/${id}`);
  },

  async createProduct(data: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    price: number;
    location: string;
    description?: string;
    distance?: number;
  }): Promise<Product> {
    return request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    return request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: number): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async placeOrder(data: {
    delivery_address: string;
    payment_method: string;
    items: { product_id: number; quantity: number }[];
  }): Promise<Order> {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getConsumerOrders(): Promise<Order[]> {
    return request<Order[]>('/orders/my-orders');
  },

  async getFarmerOrders(): Promise<Order[]> {
    return request<Order[]>('/orders/farmer-orders');
  },

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    return request<Order>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Stats & Health
  async getFarmerEarnings(): Promise<FarmerEarnings> {
    return request<FarmerEarnings>('/farmer/earnings');
  },

  async getPlatformStats(): Promise<PlatformStats> {
    return request<PlatformStats>('/stats/platform');
  },

  async checkHealth(): Promise<{ status: string; service: string; version: string; database: string }> {
    return request<{ status: string; service: string; version: string; database: string }>('/health');
  },
};
