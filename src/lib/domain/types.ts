/** Shapes returned by the Spring Boot API (`/home/david/Projects/ecommerce`). */

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  subcategories: Subcategory[];
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  sku: string | null;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  weight: number | null;
  dimensions: string | null;
  isActive: boolean;
  subcategoryName: string;
  categoryName: string;
  imageUrls: string[];
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse extends AuthUser {
  token: string;
}

export interface CartItem {
  cartId: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string | null;
  productSlug: string;
  quantity: number;
  subtotal: number;
}

export type AddressType = 'SHIPPING' | 'BILLING';

export interface Address {
  id: number;
  addressType: AddressType;
  streetAddress: string;
  apartment: string | null;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id'>;

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderStatus: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: string;
  transactionId: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentDate: string | null;
}
