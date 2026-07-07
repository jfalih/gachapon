import { useMutation } from "@tanstack/react-query";

import { login, register, type LoginPayload, type RegisterPayload } from "@/core/api/auth";

/** Authenticates an existing user. */
export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });

/** Registers a customer or store-owner account. */
export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
