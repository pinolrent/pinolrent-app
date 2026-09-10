export interface ApiError {
  error?: string
  message?: string
  errors?: Array<string | { message?: string }> | Record<string, string[]>
}
