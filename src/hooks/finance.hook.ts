import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi, FinanceInvoiceQuery, CreateFinanceInvoiceDto } from '@/api/finance.api';

export const useInvoices = (params: FinanceInvoiceQuery) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => financeApi.getInvoices(params),
    enabled: !!params.schoolId || !!params.studentProfileId || !!params.parentProfileId,
  });
};

export const useInvoiceTotals = (params: FinanceInvoiceQuery) => {
  return useQuery({
    queryKey: ['invoice-totals', params],
    queryFn: () => financeApi.getInvoiceTotals(params),
    enabled: !!params.schoolId || !!params.studentProfileId || !!params.parentProfileId,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFinanceInvoiceDto) => financeApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-totals'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFinanceInvoiceDto> }) =>
      financeApi.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-totals'] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeApi.deleteInvoice(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-totals'] });
    },
  });
};

export const useResendInvoiceEmail = () => {
  return useMutation({
    mutationFn: (id: string) => financeApi.resendEmail(id),
  });
};
