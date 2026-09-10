export interface ApiError {
  error?: string
  message?: string
  errors?: (string | { message?: string })[] | Record<string, string[]>
}
