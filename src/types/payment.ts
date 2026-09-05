export interface Payment {
  id: number
  reservation_id: number
  method: 'pos' | 'cash'
  status: 'pending' | 'approved' | 'rejected'
  proof_url?: string
}

export interface CreatePaymentRequest {
  method: 'pos' | 'cash'
  proof_url?: string
}
