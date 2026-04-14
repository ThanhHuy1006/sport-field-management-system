export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedApiResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};