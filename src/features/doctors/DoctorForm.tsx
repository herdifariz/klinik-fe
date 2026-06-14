import React from 'react';
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
import type { Doctor } from '@/services/doctorService';

const doctorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  specialty: z.string().min(2, "Specialty is required"),
  experience: z.coerce.number().min(0),
  biography: z.string().optional().or(z.literal('')),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

interface DoctorFormProps {
  initialData?: Doctor | null;
  users?: { id: string, name: string }[]; // List of users with role DOCTOR who don't have profiles yet
  onSubmit: (data: DoctorFormValues) => void;
  isLoading?: boolean;
}

export const DoctorForm: React.FC<DoctorFormProps> = ({
  initialData,
  users = [],
  onSubmit,
  isLoading,
}) => {
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      userId: initialData?.userId || '',
      specialty: initialData?.specialty || '',
      experience: initialData?.experience || 0,
      biography: initialData?.biography || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!initialData && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User (Doctor)</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a user</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialty</FormLabel>
                <FormControl>
                  <Input placeholder="General Practitioner / Cardiologist" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience (Years)</FormLabel>
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
          name="biography"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea placeholder="Doctor's background..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Profile" : "Create Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
