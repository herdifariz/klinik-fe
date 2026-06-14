import React, { useEffect, useState } from 'react';
import { paymentService, type Payment, type PaymentStatus } from '@/services/paymentService';
import { DataTable } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { PaymentInvoiceForm } from '@/features/payments/PaymentInvoiceForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Check, Eye, Printer } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Confirm Payment Schema
const confirmPaymentSchema = z.object({
  transactionId: z.string().min(3, 'Transaction ID must be at least 3 characters'),
  referenceNumber: z.string().optional(),
  paidAmount: z.coerce.number().min(0, 'Paid amount must be positive'),
  notes: z.string().optional(),
});
type ConfirmPaymentValues = z.infer<typeof confirmPaymentSchema>;

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');

  const confirmForm = useForm<ConfirmPaymentValues>({
    resolver: zodResolver(confirmPaymentSchema),
    defaultValues: { transactionId: '', referenceNumber: '', paidAmount: 0, notes: '' },
  });

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.getAll({
        page: pagination.currentPage,
        limit: pagination.limit,
        status: statusFilter || undefined,
      });
      setPayments(response.data || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.meta?.totalPages || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [pagination.currentPage, statusFilter]);

  const handleCreateInvoice = async (values: any) => {
    try {
      await paymentService.create(values);
      setIsInvoiceModalOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Failed to create payment invoice', error);
    }
  };

  const handleConfirmSubmit = async (values: ConfirmPaymentValues) => {
    if (!selectedPayment) return;
    try {
      await paymentService.confirm(selectedPayment.id, {
        transactionId: values.transactionId!,
        referenceNumber: values.referenceNumber,
        paidAmount: values.paidAmount,
        notes: values.notes,
      });
      setIsConfirmModalOpen(false);
      confirmForm.reset();
      fetchPayments();
    } catch (error) {
      console.error('Failed to confirm payment', error);
    }
  };

  const handlePrint = (payment: Payment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${payment.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .details { margin: 20px 0; display: flex; justify-content: space-between; }
            .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .table th, .table td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
            .table th { background-color: #f9f9f9; }
            .totals { float: right; width: 300px; margin-top: 20px; }
            .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 12px; }
            .footer { margin-top: 100px; text-align: center; font-size: 0.8em; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>KLINIK APP RECEIPT</h2>
            <p>Invoice ID: ${payment.id}</p>
          </div>
          <div class="details">
            <div>
              <strong>Billed To:</strong><br>
              ${payment.patient?.name}<br>
              NIK: ${payment.patient?.nik}
            </div>
            <div style="text-align: right;">
              <strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
              <strong>Payment Status:</strong> ${payment.status}<br>
              <strong>Method:</strong> ${payment.paymentMethod}
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Medical Consultation & Base Services</td>
                <td style="text-align: right;">${formatCurrency(payment.amount)}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals">
            <div>
              <span>Subtotal:</span>
              <span>${formatCurrency(payment.amount)}</span>
            </div>
            <div>
              <span>Tax:</span>
              <span>+ ${formatCurrency(payment.taxAmount)}</span>
            </div>
            <div>
              <span>Discount:</span>
              <span>- ${formatCurrency(payment.discountAmount)}</span>
            </div>
            <div class="grand-total">
              <span>Total:</span>
              <span>${formatCurrency(payment.totalAmount)}</span>
            </div>
          </div>
          <div style="clear: both;"></div>
          <div class="footer">
            <p>Thank you for choosing Klinik App. Get well soon!</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
      case 'PAID':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Paid</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Refunded</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>;
    }
  };

  const columns = [
    {
      header: 'Invoice ID',
      accessor: (pay: Payment) => <span className="font-mono text-xs">{pay.id}</span>,
    },
    {
      header: 'Date Issued',
      accessor: (pay: Payment) => {
        const date = new Date(pay.createdAt);
        return (
          <span className="font-semibold text-slate-800">
            {date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        );
      },
    },
    {
      header: 'Patient',
      accessor: (pay: Payment) => (
        <span className="font-semibold">{pay.patient?.name || 'N/A'}</span>
      ),
    },
    {
      header: 'Total Amount',
      accessor: (pay: Payment) => <span className="font-semibold text-slate-900">{formatCurrency(pay.totalAmount)}</span>,
    },
    {
      header: 'Method',
      accessor: 'paymentMethod' as keyof Payment,
    },
    {
      header: 'Status',
      accessor: (pay: Payment) => getStatusBadge(pay.status),
    },
    {
      header: 'Actions',
      accessor: (pay: Payment) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedPayment(pay); setIsDetailModalOpen(true); }}>
            <Eye className="h-4 w-4" />
          </Button>
          {pay.status === 'PENDING' && (
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-600 hover:text-emerald-800"
              onClick={() => {
                setSelectedPayment(pay);
                confirmForm.setValue('paidAmount', pay.totalAmount);
                setIsConfirmModalOpen(true);
              }}
            >
              <Check className="h-4 w-4 mr-1" /> Confirm
            </Button>
          )}
          {pay.status === 'PAID' && (
            <Button variant="ghost" size="sm" onClick={() => handlePrint(pay)}>
              <Printer className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Cashier</h1>
          <p className="text-slate-500">Generate medical invoices, accept payments, and issue receipts.</p>
        </div>
        <Button onClick={() => setIsInvoiceModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 bg-white p-4 rounded-md border">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')}
          className="flex h-9 w-full max-w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="REFUNDED">Refunded</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: (page) => setPagination((prev) => ({ ...prev, currentPage: page })),
        }}
      />

      {/* Invoice Modal */}
      <FormModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create Payment Invoice"
        description="Fill out the fees and discount details to generate a payment invoice."
      >
        <PaymentInvoiceForm onSubmit={handleCreateInvoice} />
      </FormModal>

      {/* Confirm Payment Modal */}
      <FormModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          confirmForm.reset();
        }}
        title="Confirm Payment"
        description="Verify and register payment transaction details."
      >
        <Form {...confirmForm}>
          <form onSubmit={confirmForm.handleSubmit(handleConfirmSubmit)} className="space-y-4">
            <FormField
              control={confirmForm.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID / Reference ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. TXN10023412" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={confirmForm.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Bank slip number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={confirmForm.control}
              name="paidAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid Amount (IDR)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={confirmForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any cashier notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit">Confirm Payment</Button>
            </div>
          </form>
        </Form>
      </FormModal>

      {/* Detail Modal */}
      <FormModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Invoice Detail"
        description="Full details of the selected invoice."
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="border-b pb-3 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-base">{selectedPayment.patient?.name}</h3>
                <p className="text-sm text-slate-500">NIK: {selectedPayment.patient?.nik}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold">{getStatusBadge(selectedPayment.status)}</span>
                <p className="text-xs text-slate-500 mt-1">Invoice ID: {selectedPayment.id}</p>
              </div>
            </div>

            <div className="space-y-2 border-b pb-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Base/Consultation Fee:</span>
                <span className="font-semibold">{formatCurrency(selectedPayment.amount)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount Amount:</span>
                <span>- {formatCurrency(selectedPayment.discountAmount)}</span>
              </div>
              {selectedPayment.discountReason && (
                <div className="text-xs text-slate-400 italic">Reason: {selectedPayment.discountReason}</div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax Amount:</span>
                <span>+ {formatCurrency(selectedPayment.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Grand Total:</span>
                <span className="text-indigo-600">{formatCurrency(selectedPayment.totalAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Payment Method</span>
                <p className="font-semibold">{selectedPayment.paymentMethod}</p>
              </div>
              {selectedPayment.transactionId && (
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Transaction ID</span>
                  <p className="font-mono text-xs font-semibold">{selectedPayment.transactionId}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              {selectedPayment.status === 'PAID' && (
                <Button variant="outline" onClick={() => handlePrint(selectedPayment)}>
                  <Printer className="h-4 w-4 mr-2" /> Print Receipt
                </Button>
              )}
              <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
};

export default PaymentsPage;
