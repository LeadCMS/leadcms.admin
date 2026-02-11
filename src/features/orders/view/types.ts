import {
  ContactDetailsDto,
  OrderDetailsDto,
  OrderItemDetailsDto,
} from "@lib/network/swagger-client";

export interface OrderViewOutletContext {
  order: OrderDetailsDto | null;
  orderId?: number;
  contact: ContactDetailsDto | null;
  orderItems: OrderItemDetailsDto[];
  isLoading: boolean;
  refreshOrderItems: () => Promise<void>;
  currencies: string[];
}
