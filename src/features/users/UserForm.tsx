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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from '@/services/userService';

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'DOCTOR', 'STAFF']),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (data: UserFormValues) => void;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.fullName || '',
      email: initialData?.email || '',
      password: '',
      role: initialData?.role || 'STAFF',
    },
  });

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      await onSubmit(values);
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && Array.isArray(apiErrors)) {
        apiErrors.forEach((e: any) => {
          const fieldName = e.field.replace('body.', '');
          let formField = fieldName;
          if (fieldName === 'fullName') formField = 'name';
          
          form.setError(formField as any, {
            type: 'server',
            message: e.message,
          });
        });
      } else {
        form.setError('root', {
          type: 'server',
          message: err.response?.data?.message || 'Failed to save user',
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium">
            {form.formState.errors.root.message}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!initialData && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>

                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
