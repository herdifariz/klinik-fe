import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Plus, Trash2 } from 'lucide-react';
import { medicineService, type Medicine } from '@/services/medicineService';

const prescriptionItemSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  notes: z.string().optional(),
  validityDays: z.coerce.number().int().min(1).default(30),
  items: z.array(prescriptionItemSchema).min(1, "At least one medicine is required"),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  onSubmit: (values: {
    notes?: string;
    validityDays: number;
    items: {
      medicineId: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions?: string;
    }[];
  }) => void;
  isLoading?: boolean;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onSubmit, isLoading }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      notes: '',
      validityDays: 30,
      items: [{ medicineId: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await medicineService.getAll({ limit: 100 });
        setMedicines(response.data || []);
      } catch (error) {
        console.error('Failed to load medicines', error);
      }
    };
    fetchMedicines();
  }, []);

  const handleFormSubmit = (values: PrescriptionFormValues) => {
    onSubmit({
      notes: values.notes,
      validityDays: values.validityDays ?? 30,
      items: (values.items || []).map(item => ({
        medicineId: item.medicineId,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        instructions: item.instructions,
      })),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <FormLabel className="text-base font-semibold">Prescribed Medicines</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ medicineId: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' })}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {fields.map((field, index) => (
            <div key={field.id} className="p-3 border rounded-md bg-slate-50 space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Medicine #{index + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`items.${index}.medicineId`}
                  render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Medicine</FormLabel>
                      <FormControl>
                        <select
                          {...subField}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Medicine</option>
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                              {m.name} ({m.code}) - Stock: {m.stock}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.dosage`}
                  render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 500mg, 1 tablet" {...subField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name={`items.${index}.frequency`}
                  render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 3x a day" {...subField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.duration`}
                  render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5 days" {...subField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Qty</FormLabel>
                      <FormControl>
                        <Input type="number" {...subField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`items.${index}.instructions`}
                render={({ field: subField }) => (
                  <FormItem>
                    <FormLabel>Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Take after meals" {...subField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="validityDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Validity (Days)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                <FormLabel>General Notes (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Any specific pharmacist notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Prescription'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
