export interface ApiError {
  error?: string
  message?: string
  errors?: (string | { message?: string })[] | Record<string, string[]>
}

// Parámetros de los listados buyer/seller paginados por offset. La API
// responde un array plano: no hay envoltura con total.
export interface ListParams {
  limit?: number
  offset?: number
}
