export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  items: OrderItemRequest[];
}

export interface OrderItemDTO {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItemDTO[];
}
