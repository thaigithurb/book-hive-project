export interface Order {
  _id: string;
  orderCode: string;
  userInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    bookId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  isExpired: boolean;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
}