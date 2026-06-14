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
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from '@/store/authStore';
import { doctorService, type Doctor } from '@/services/doctorService';
import { patientService, type Patient } from '@/services/patientService';

const appointmentFormSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  patientId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  onSubmit: (values: {
    doctorId: string;
    patientId?: string;
    appointmentDateTime: string;
    reason: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, isLoading }) => {
  const { user } = useAuthStore();
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      doctorId: '',
      patientId: '',
      date: '',
      time: '',
      reason: '',
      notes: '',
    },
  });

  const selectedDoctorId = form.watch('doctorId');
  const selectedDate = form.watch('date');

  // Load doctors & patients
  useEffect(() => {
    const loadData = async () => {
      try {
        const doctorsData = await doctorService.getAll({ limit: 100 });
        setDoctors(doctorsData.data || []);

        if (isAdminOrStaff) {
          const patientsData = await patientService.getAll({ limit: 100 });
          setPatients(patientsData.data || []);
        }
      } catch (error) {
        console.error('Failed to load doctors/patients', error);
      }
    };
    loadData();
  }, [isAdminOrStaff]);

  // Load available slots when doctor and date change
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDoctorId || !selectedDate) {
        setAvailableSlots([]);
        return;
      }
      try {
        setLoadingSlots(true);
        const data = await doctorService.getAvailableSlots(selectedDoctorId, selectedDate);
        setAvailableSlots(data.data?.slots || []);
        // Reset time selection if it's no longer in the list
        form.setValue('time', '');
      } catch (error) {
        console.error('Failed to load slots', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedDoctorId, selectedDate, form]);

  const handleFormSubmit = (values: AppointmentFormValues) => {
    // Combine date and time to ISO format (e.g. "2026-05-17T09:00:00")
    const appointmentDateTime = `${values.date}T${values.time}:00`;
    onSubmit({
      doctorId: values.doctorId,
      patientId: isAdminOrStaff ? values.patientId : undefined,
      appointmentDateTime,
      reason: values.reason,
      notes: values.notes,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {isAdminOrStaff && (
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.nik})
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.user?.name} - {d.specialty}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment Date</FormLabel>
                <FormControl>
                  <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Visit</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Regular checkup, headache, flu symptoms" {...field} />
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
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any extra information for the doctor..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Booking...' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
