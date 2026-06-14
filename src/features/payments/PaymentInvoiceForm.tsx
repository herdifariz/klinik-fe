import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { appointmentService, type Appointment } from '@/services/appointmentService';
import { type PaymentMethod } from '@/services/paymentService';

const paymentInvoiceSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  amount: z.coerce.number().min(0, "Amount must be at least 0"),
  discountAmount: z.coerce.number().min(0).optional().default(0),
  discountReason: z.string().optional(),
  taxAmount: z.coerce.number().min(0).optional().default(0),
  paymentMethod: z.enum(['CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'INSURANCE']),
  notes: z.string().optional(),
});

type PaymentInvoiceFormValues = z.infer<typeof paymentInvoiceSchema>;

interface PaymentInvoiceFormProps {
  onSubmit: (values: {
    appointmentId: string;
    patientId: string;
    amount: number;
    discountAmount?: number;
    discountReason?: string;
    taxAmount?: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

export const PaymentInvoiceForm: React.FC<PaymentInvoiceFormProps> = ({ onSubmit, isLoading }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const form = useForm<PaymentInvoiceFormValues>({
    resolver: zodResolver(paymentInvoiceSchema),
    defaultValues: {
      appointmentId: '',
      amount: 50000, // Standard consultation fee default
      discountAmount: 0,
      discountReason: '',
      taxAmount: 0,
      paymentMethod: 'CASH',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Load some recent scheduled/completed appointments
        const response = await appointmentService.getAll({ limit: 50 });
        setAppointments(response.data || []);
      } catch (error) {
        console.error('Failed to load appointments', error);
      }
    };
    fetchAppointments();
  }, []);

  const watchAppointmentId = form.watch('appointmentId');

  useEffect(() => {
    if (watchAppointmentId) {
      const found = appointments.find(a => a.id === watchAppointmentId);
      setSelectedAppointment(found || null);
    } else {
      setSelectedAppointment(null);
    }
  }, [watchAppointmentId, appointments]);

  const handleFormSubmit = (values: PaymentInvoiceFormValues) => {
    if (!selectedAppointment) return;
    onSubmit({
      appointmentId: values.appointmentId,
      patientId: selectedAppointment.patientId,
      amount: values.amount,
      discountAmount: values.discountAmount,
      discountReason: values.discountReason,
      taxAmount: values.taxAmount,
      paymentMethod: values.paymentMethod,
      notes: values.notes,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="appointmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Appointment</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Choose Appointment</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} - {a.doctorName} (
                      {new Date(a.appointmentDateTime).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      )
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedAppointment && (
          <div className="p-3 bg-slate-50 border rounded-md text-sm space-y-1">
            <h4 className="font-semibold text-slate-700">Patient Details:</h4>
            <p className="text-slate-600">Name: <span className="font-medium text-slate-800">{selectedAppointment.patientName}</span></p>
            <p className="text-slate-600">Doctor: <span className="font-medium text-slate-800">{selectedAppointment.doctorName}</span></p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consultation/Base Fee</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="CASH">Cash</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="INSURANCE">Insurance</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Amount (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Amount (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="discountReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Reason (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Promo, Staff Family discount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Include print copy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading || !selectedAppointment}>
            {isLoading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
