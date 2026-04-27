export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type CheckoutResponse = {
  qrString: string;
  paymentId: string;
  deepLink?: string;
};

export type PaymentStatus = 'IDLE' | 'PENDING' | 'COMPLETED' | 'EXPIRED';

export type PaymentMethod = 'ABA_KHQR' | 'BAKONG_KHQR';