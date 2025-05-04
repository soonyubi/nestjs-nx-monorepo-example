import { OrderStatus } from '@prisma/client';

export class OrderResponseDto {
  id!: string;
  orderNumber!: string;
  status!: OrderStatus;
  totalAmount!: number;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  user!: {
    id: string;
    name: string;
    email: string;
  };
  orderItems!: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
    };
  }[];
  payment?: {
    id: string;
    amount: number;
    status: string;
    method: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export class UpdateOrderStatusDto {
  status!: OrderStatus;
}
