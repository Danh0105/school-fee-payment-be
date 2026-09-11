"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-messages";
import { usersApi } from "./api";
export const useCreateUser = () =>
  useMutation({
    mutationFn: usersApi.create,
    onSuccess: (user) => toast.success(`Đã tạo tài khoản ${user.email}`),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
