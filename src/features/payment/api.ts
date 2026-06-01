import apiClient from '@/lib/api';
import type {
  PaymentPlansResponse,
  CreatePaymentRequest,
  PaymentOrder,
  OrderStatusResponse,
  SubscriptionResponse,
  PaginatedPaymentHistory,
} from '@/types/api';

export async function getPlans(): Promise<PaymentPlansResponse> {
  const res = await apiClient.get<PaymentPlansResponse>('/payment/plans');
  return res.data;
}

export async function createOrder(data: CreatePaymentRequest): Promise<PaymentOrder> {
  const res = await apiClient.post<PaymentOrder>('/payment/create', data);
  return res.data;
}

export async function getOrderStatus(orderCode: number): Promise<OrderStatusResponse> {
  const res = await apiClient.get<OrderStatusResponse>(`/payment/orders/${orderCode}/status`);
  return res.data;
}

export async function getSubscription(): Promise<SubscriptionResponse> {
  const res = await apiClient.get<SubscriptionResponse>('/payment/subscription');
  return res.data;
}

export async function getPaymentHistory(
  page: number,
  pageSize: number
): Promise<PaginatedPaymentHistory> {
  const res = await apiClient.get<PaginatedPaymentHistory>('/payment/history', {
    params: { page, pageSize },
  });
  return res.data;
}
