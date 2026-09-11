"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Controller,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-messages";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/form-field";
import { cn } from "@/lib/utils";

export interface FormOption {
  value: string;
  label: string;
}
export interface FormFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?:
    "text" | "email" | "password" | "date" | "number" | "textarea" | "select";
  placeholder?: string;
  hint?: string;
  required?: boolean;
  options?: FormOption[];
  className?: string;
  disabled?: boolean;
}

interface EntityFormDialogProps<T extends FieldValues> {
  title: string;
  description?: string;
  trigger: ReactNode;
  schema: z.ZodType<T, T>;
  fields: FormFieldConfig<NoInfer<T>>[];
  defaultValues: DefaultValues<NoInfer<T>>;
  submitLabel?: string;
  successMessage: string;
  queryKey: readonly unknown[];
  additionalQueryKeys?: readonly (readonly unknown[])[];
  onSubmit: (values: NoInfer<T>) => Promise<unknown>;
}

export function EntityFormDialog<T extends FieldValues>({
  title,
  description,
  trigger,
  schema,
  fields,
  defaultValues,
  submitLabel = "Lưu thay đổi",
  successMessage,
  queryKey,
  additionalQueryKeys = [],
  onSubmit,
}: EntityFormDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<T, unknown, T>({
    resolver: zodResolver(schema) as Resolver<T, unknown, T>,
    defaultValues,
  });
  const mutation = useMutation<unknown, Error, T>({
    mutationFn: onSubmit,
    onSuccess: () => {
      toast.success(successMessage);
      void queryClient.invalidateQueries({ queryKey });
      additionalQueryKeys.forEach(
        (key) => void queryClient.invalidateQueries({ queryKey: key }),
      );
      setOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) reset(defaultValues);
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const error = errors[field.name]?.message;
              return (
                <div
                  key={field.name}
                  className={cn(
                    field.type === "textarea" && "sm:col-span-2",
                    field.className,
                  )}
                >
                  <FormField
                    label={field.label}
                    htmlFor={field.name}
                    required={field.required}
                    hint={field.hint}
                    error={typeof error === "string" ? error : undefined}
                  >
                    {field.type === "select" ? (
                      <Controller
                        name={field.name}
                        control={control}
                        render={({ field: controlled }) => (
                          <Select
                            value={String(controlled.value ?? "")}
                            onValueChange={controlled.onChange}
                            disabled={field.disabled}
                          >
                            <SelectTrigger id={field.name}>
                              <SelectValue
                                placeholder={
                                  field.placeholder ?? "Chọn giá trị"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    ) : field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        {...register(field.name)}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={
                          field.type === "number"
                            ? "text"
                            : (field.type ?? "text")
                        }
                        inputMode={
                          field.type === "number" ? "decimal" : undefined
                        }
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        {...register(field.name)}
                      />
                    )}
                  </FormField>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang lưu…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
