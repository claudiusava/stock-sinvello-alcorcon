import { OrderItem } from './order-item.model';

export interface Order {
  id?: string;
  createdAt?: Date;
  items: OrderItem[];
}