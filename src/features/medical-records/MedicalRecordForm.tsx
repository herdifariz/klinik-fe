import React from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from 'lucide-react';
import { type MedicalRecord } from '@/services/medicalRecordService';

const medicalRecordSchema = z.object({
  diagnosis: z.string().min(2, "Diagnosis is required"),
  treatment: z.string().min(2, "Treatment/Action is required"),
  medications: z.array(z.object({ name: z.string().min(1, "Medication name is required") })).optional().default([]),
  investigations: z.string().optional(),
  followUpRequired: z.boolean().optional().default(false),
  followUpDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional(),
  documentUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

interface MedicalRecordFormProps {
  initialData?: MedicalRecord | null;
  onSubmit: (values: {
    diagnosis: string;
    treatment: string;
    medications?: string[];
    investigations?: string;
    followUpRequired?: boolean;
    followUpDate?: string;
    notes?: string;
    documentUrl?: string;
  }) => void;
  isLoading?: boolean;
}

export const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      diagnosis: initialData?.diagnosis || '',
      treatment: initialData?.treatment || '',
      medications: initialData?.medications?.map(m => ({ name: m })) || [],
      investigations: initialData?.investigations || '',
      followUpRequired: initialData?.followUpRequired || false,
      followUpDate: initialData?.followUpDate ? new Date(initialData.followUpDate).toISOString().split('T')[0] : '',
      notes: initialData?.notes || '',
      documentUrl: initialData?.documentUrl || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications" as never,
  });

  const selectedFollowUpRequired = form.watch('followUpRequired');

  const handleFormSubmit = (values: MedicalRecordFormValues) => {
    onSubmit({
      ...values,
      medications: values.medications?.map(m => m.name) || [],
      followUpDate: values.followUpRequired && values.followUpDate ? values.followUpDate : undefined,
      documentUrl: values.documentUrl || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Common Cold, Acute Pharyngitis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment / Action</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Administered paracetamol, bed rest for 3 days" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Medications list */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <FormLabel>Medications Given</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '' })}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Medication
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name={`medications.${index}.name` as any}
                  render={({ field: subField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="e.g. Paracetamol 500mg" {...subField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="investigations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lab Investigations (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Blood test, X-Ray results" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="followUpRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-white">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Follow-up Required</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {selectedFollowUpRequired && (
            <FormField
              control={form.control}
              name="followUpDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Date</FormLabel>
                  <FormControl>
                    <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional clinical notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. https://lab-results-url.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : initialData ? 'Update Record' : 'Save Record'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
