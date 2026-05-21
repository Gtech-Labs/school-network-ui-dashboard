import api from './index';

export interface CreateFinanceInvoiceDto {
  studentProfileId: string;
  amount: number;
  term: number;
  dueDate: string;
  description?: string;
  status?: 'PAID' | 'UNPAID' | 'PENDING';
}

export interface FinanceInvoiceQuery {
  schoolId?: string;
  studentProfileId?: string;
  parentProfileId?: string;
  status?: string;
  term?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const financeApi = {
  getInvoices: (params: FinanceInvoiceQuery) =>
    api.get('/finance', { params }).then((res) => res.data),

  getInvoice: (id: string) =>
    api.get(`/finance/${id}`).then((res) => res.data),

  createInvoice: (data: CreateFinanceInvoiceDto) =>
    api.post('/finance', data).then((res) => res.data),

  updateInvoice: (id: string, data: Partial<CreateFinanceInvoiceDto>) =>
    api.patch(`/finance/${id}`, data).then((res) => res.data),

  deleteInvoice: (id: string, reason: string) =>
    api.delete(`/finance/${id}?reason=${encodeURIComponent(reason)}`).then((res) => res.data),

  getInvoiceTotals: (params: FinanceInvoiceQuery) =>
    api.get('/finance/totals', { params }).then((res) => res.data),

  initiatePayment: (id: string) =>
    api.post(`/finance/${id}/pay`).then((res) => res.data),

  resendEmail: (id: string) =>
    api.post(`/finance/${id}/resend-email`).then((res) => res.data),
};
