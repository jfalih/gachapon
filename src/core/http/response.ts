/** Standard API envelope (matches the backend `{ data, message, success }`). */
export type ApiResponse<T> = {
  data: T | null;
  message: string;
  success: boolean;
};

export type ApiSuccessResponse<T> = {
  data: T;
  message: string;
  success: true;
};

export type BaseListParams = {
  search?: string;
  limit?: number;
  offset?: number;
};
