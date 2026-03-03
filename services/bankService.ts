import { api } from './apiService'

export type BankAccount = {
  id: string
  holder_name: string
  holder_document: string
  bank_code: string | null
  bank_name: string | null
  agency: string | null
  agency_digit: string | null
  account_number: string | null
  account_digit: string | null
  account_type: 'checking' | 'savings' | null
  pix_key: string | null
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | null
  is_default: boolean
  created_at: string
}

export type AddBankAccountPayload = {
  holder_name: string
  holder_document: string
  bank_code?: string
  bank_name?: string
  agency?: string
  agency_digit?: string
  account_number?: string
  account_digit?: string
  account_type?: 'checking' | 'savings'
  pix_key?: string
  pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  is_default?: boolean
}

export const bankService = {
  getAccounts: (token: string, slug: string) =>
    api.get<BankAccount[]>(`/org/${slug}/bank-accounts`, token),

  addAccount: (token: string, slug: string, payload: AddBankAccountPayload) =>
    api.post<{ id: string; message: string }>(`/org/${slug}/bank-accounts`, token, payload),

  setDefault: (token: string, slug: string, accountID: string) =>
    api.patch<{ message: string }>(`/org/${slug}/bank-accounts/${accountID}/default`, token, {}),

  deleteAccount: (token: string, slug: string, accountID: string) =>
    api.delete<{ message: string }>(`/org/${slug}/bank-accounts/${accountID}`, token),
}
