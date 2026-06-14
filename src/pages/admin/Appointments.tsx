import React, { useEffect, useState } from 'react';
import { appointmentService,  type Appointment, type AppointmentStatus } from '@/services/appointmentService';
import { doctorService } from '@/services/doctorService';
import { DataTable } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { AppointmentForm } from '@/features/appointments/AppointmentForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, XCircle, CheckCircle, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Reschedule Form Schema
const rescheduleSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  reason: z.string().optional(),
});
type RescheduleValues = z.infer<typeof rescheduleSchema>;

// Cancel Form Schema
const cancelSchema = z.object({
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});
type CancelValues = z.infer<typeof cancelSchema>;

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const LIMIT = 10;

  const rescheduleForm = useForm<RescheduleValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: { date: '', time: '', reason: '' },
  });

  const cancelForm = useForm<CancelValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { reason: '' },
  });

  const selectedRescheduleDate = rescheduleForm.watch('date');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await appointmentService.getAll({
          page: currentPage,
          limit: LIMIT,
          status: statusFilter || undefined,
        });
        setAppointments(response.data || []);
        setTotalPages(response.meta?.totalPages || 1);
      } catch (error) {
        console.error('Failed to fetch appointments', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [currentPage, statusFilter]);

  // Load slots for rescheduling
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedAppointment || !selectedRescheduleDate) {
        setAvailableSlots([]);
        return;
      }
      try {
        setLoadingSlots(true);
        const response = await doctorService.getAvailableSlots(selectedAppointment.doctorId, selectedRescheduleDate);
        setAvailableSlots(response.data?.slots || []);
        rescheduleForm.setValue('time', '');
      } catch (error) {
        console.error('Failed to load slots', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedRescheduleDate, selectedAppointment, rescheduleForm]);

  const handleBookSubmit = async (values: {
    doctorId: string;
    patientId?: string;
    appointmentDateTime: string;
    reason: string;
    notes?: string;
  }) => {
    try {
      await appointmentService.create(values);
      setIsBookModalOpen(false);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to book appointment', error);
    }
  };

  const handleRescheduleSubmit = async (values: RescheduleValues) => {
    if (!selectedAppointment) return;
    try {
      const newAppointmentDateTime = `${values.date}T${values.time}:00`;
      await appointmentService.reschedule(selectedAppointment.id, {
        newAppointmentDateTime,
        reason: values.reason,
      });
      setIsRescheduleModalOpen(false);
      rescheduleForm.reset();
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to reschedule', error);
    }
  };

  const handleCancelSubmit = async (values: CancelValues) => {
    if (!selectedAppointment) return;
    try {
      await appointmentService.cancel(selectedAppointment.id, {
        reason: values.reason,
      });
      setIsCancelModalOpen(false);
      cancelForm.reset();
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to cancel appointment', error);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center w-fit gap-1">
            <Clock className="h-3 w-3" /> Scheduled
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center w-fit gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center w-fit gap-1">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
    }
  };

  const columns = [
    {
      header: 'Date & Time',
      accessor: (app: Appointment) => {
        const date = new Date(app.appointmentDateTime);
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">
              {date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="text-slate-500 text-sm">
              {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Patient',
      accessor: (app: Appointment) => (
        <div className="flex flex-col">
          <span className="font-semibold">{app.patientName || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Doctor',
      accessor: (app: Appointment) => (
        <span className="font-medium text-slate-700">{app.doctorName || 'N/A'}</span>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason' as keyof Appointment,
    },
    {
      header: 'Status',
      accessor: (app: Appointment) => getStatusBadge(app.status),
    },
    {
      header: 'Actions',
      accessor: (app: Appointment) => {
        if (app.status !== 'SCHEDULED') return null;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAppointment(app);
                setIsRescheduleModalOpen(true);
              }}
            >
              Reschedule
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => {
                setSelectedAppointment(app);
                setIsCancelModalOpen(true);
              }}
            >
              Cancel
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-slate-500">Manage patient booking schedules, reschedule or cancel appointments.</p>
        </div>
        <Button onClick={() => setIsBookModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 bg-white p-4 rounded-md border">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | '')}
          className="flex h-9 w-full max-w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={appointments}
        isLoading={isLoading}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          onPageChange: (page) => setCurrentPage(page),
        }}
      />

      {/* Book Appointment Modal */}
      <FormModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Book Appointment"
        description="Book a new session for a patient with an available doctor."
      >
        <AppointmentForm onSubmit={handleBookSubmit} />
      </FormModal>

      {/* Reschedule Modal */}
      <FormModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          rescheduleForm.reset();
        }}
        title="Reschedule Appointment"
        description="Select a new date and time for this appointment."
      >
        <Form {...rescheduleForm}>
          <form onSubmit={rescheduleForm.handleSubmit(handleRescheduleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={rescheduleForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Date</FormLabel>
                    <FormControl>
                      <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={rescheduleForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Time Slot</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={loadingSlots || availableSlots.length === 0}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">
                          {loadingSlots
                            ? 'Loading slots...'
                            : availableSlots.length === 0
                            ? 'No slots available'
                            : 'Select Time'}
                        </option>
                        {availableSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={rescheduleForm.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Reschedule (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Patient requested change" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="submit">Reschedule</Button>
            </div>
          </form>
        </Form>
      </FormModal>

      {/* Cancel Modal */}
      <FormModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          cancelForm.reset();
        }}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? Please provide a reason."
      >
        <Form {...cancelForm}>
          <form onSubmit={cancelForm.handleSubmit(handleCancelSubmit)} className="space-y-4">
            <FormField
              control={cancelForm.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Cancellation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Patient did not show up / cancelled" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="destructive" type="submit">
                Cancel Appointment
              </Button>
            </div>
          </form>
        </Form>
      </FormModal>
    </div>
  );
};

export default AppointmentsPage;
