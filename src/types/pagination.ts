export interface IPaginationOptions {
  limit?: number;
  offset?: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
}
