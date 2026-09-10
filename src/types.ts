export type UserRole = 'farmer' | 'consumer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  phone?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Product {
  id: number;
  farmer_id: number;
  farmer_name: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  distance: number;
  rating: number;
  image_url?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface OrderItem {
  id: number;
  product_id?: number;
  farmer_id: number;
  product_name: string;
  unit: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  consumer_id: number;
  consumer_name: string;
  consumer_email: string;
  delivery_address: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  created_at: string;
  items: OrderItem[];
}

export interface ProductEarning {
  product_name: string;
  quantity_sold: number;
  unit: string;
  revenue: number;
}

export interface FarmerEarnings {
  farmer_id: number;
  farmer_name: string;
  total_revenue: number;
  delivered_revenue: number;
  pending_revenue: number;
  total_orders_count: number;
  delivered_orders_count: number;
  pending_orders_count: number;
  products_breakdown: ProductEarning[];
}

export interface PlatformStats {
  farmers_count: number;
  consumers_count: number;
  products_count: number;
  trade_volume_inr: number;
  middlemen_commission_saved_inr: number;
}
