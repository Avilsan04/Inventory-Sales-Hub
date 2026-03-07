export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
}