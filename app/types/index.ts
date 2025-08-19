export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: ExpenseType
  // Campos específicos para gastos de tarjeta
  installments?: number
  currentInstallment?: number
  totalAmount?: number
  purchaseMonth?: string // Mes en que se realizó la compra
  cardId?: string // ID de la tarjeta utilizada
  card?: CreditCard // Información de la tarjeta
  createdAt: string
  updatedAt: string
}

export interface Saving {
  id: string
  description: string
  amount: number
  date: string
  createdAt: string
  updatedAt: string
}

export interface WishItem {
  id: string
  item: string
  price: number
  priority: string
  saved: number
  createdAt: string
  updatedAt: string
}

export interface ExtraIncome {
  id: string
  description: string
  amount: number
  date: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string | null
  salary: number
}

export interface ExpenseForm {
  description: string
  amount: string
  category: string
  date: string
  type: ExpenseType
  // Campos específicos para gastos de tarjeta
  installments?: string
  totalAmount?: string
  purchaseMonth?: string // Mes en que se realizó la compra
  cardId?: string // ID de la tarjeta utilizada
}

export interface SavingForm {
  description: string
  amount: string
  date: string
}

export interface WishForm {
  item: string
  price: string
  priority: string
  saved: string
}

export interface ExtraIncomeForm {
  description: string
  amount: string
  date: string
}

export type TabType = 'dashboard' | 'salary' | 'expenses' | 'savings' | 'wishlist' | 'extra-income'
export type Priority = 'alta' | 'media' | 'baja'
export type Category = 'comida' | 'transporte' | 'entretenimiento' | 'ropa' | 'salud' | 'servicios' | 'educacion' | 'hogar' | 'otros'
export type ExpenseType = 'unico' | 'tarjeta'

// Nuevas interfaces para tarjetas de crédito
export interface CreditCard {
  id: string
  name: string
  bank: string
  logo: string
  color: string
  closingDay: number
  dueDay: number
  limit?: number
  createdAt: string
  updatedAt: string
}

export interface CardClosing {
  id: string
  month: number
  year: number
  totalAmount: number
  dueAmount: number
  paidAmount: number
  status: 'pendiente' | 'pagado' | 'vencido'
  dueDate: string
  cardId: string
  card: CreditCard
  createdAt: string
  updatedAt: string
}

export interface CreditCardForm {
  name: string
  bank: string
  logo: string
  color: string
  closingDay: string
  dueDay: string
  limit?: string
}
