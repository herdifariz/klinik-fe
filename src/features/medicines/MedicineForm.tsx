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
import type { Medicine } from '@/services/medicineService';

const medicineSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  dosage: z.string().min(1, "Dosage is required (e.g. 500mg, 120mg/5ml)"),
  form: z.string().min(2, "Form is required (e.g. Tablet, Capsule, Syrup)"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  stock: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
});

type MedicineFormValues = z.infer<typeof medicineSchema>;

interface MedicineFormProps {
  initialData?: Medicine | null;
  onSubmit: (data: MedicineFormValues) => void;
  isLoading?: boolean;
}

export const MedicineForm: React.FC<MedicineFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      category: (initialData as any)?.category || '',
      dosage: (initialData as any)?.dosage || '',
      form: (initialData as any)?.form || 'Tablet',
      manufacturer: (initialData as any)?.manufacturer || '',
      stock: initialData?.stock || 0,
      unitPrice: initialData?.unitPrice || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicine Code</FormLabel>
                <FormControl>
                  <Input placeholder="OBT-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Paracetamol" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Analgesic / Antibiotic" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl>
                  <Input placeholder="Kimia Farma / Bio Farma" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dosage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage</FormLabel>
                <FormControl>
                  <Input placeholder="500mg / 120mg/5ml" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="form"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Form / Unit</FormLabel>
                <FormControl>
                  <Input placeholder="Tablet / Capsule / Syrup" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Unit (IDR)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Medicine" : "Add Medicine"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
