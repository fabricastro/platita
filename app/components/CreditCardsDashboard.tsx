'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { CreditCard as CreditCardType, CardClosing, Expense } from '../types'
import { formatCurrency } from '../utils/formatters'
import { CreditCardsManager } from './CreditCardsManager'
import { CardClosingsManager } from './CardClosingsManager'
import { InstallmentsTracker } from './InstallmentsTracker'

interface CreditCardsDashboardProps {
  className?: string
}

export const CreditCardsDashboard: React.FC<CreditCardsDashboardProps> = ({ className = '' }) => {
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([])
  const [cardClosings, setCardClosings] = useState<CardClosing[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'closings' | 'installments'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchCreditCards(),
        fetchCardClosings(),
        fetchExpenses()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos', {
        description: 'Por favor, recarga la página',
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCreditCards = async () => {
    try {
      const response = await fetch('/api/credit-cards')
      if (response.ok) {
        const cards = await response.json()
        setCreditCards(cards)
      }
    } catch (error) {
      console.error('Error fetching credit cards:', error)
    }
  }

  const fetchCardClosings = async () => {
    try {
      const response = await fetch('/api/card-closings')
      if (response.ok) {
        const closings = await response.json()
        setCardClosings(closings)
      }
    } catch (error) {
      console.error('Error fetching card closings:', error)
    }
  }

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const expensesData = await response.json()
        setExpenses(expensesData)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const handleUpdateClosing = async (id: string, updates: Partial<CardClosing>) => {
    try {
      const response = await fetch(`/api/card-closings?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedClosing = await response.json()
        setCardClosings(prev => 
          prev.map(closing => closing.id === id ? updatedClosing : closing)
        )
        
        toast.success('Cierre actualizado exitosamente', {
          description: `Estado: ${updatedClosing.status}`,
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error updating closing:', error)
      toast.error('Error al actualizar el cierre', {
        description: 'Por favor, inténtalo de nuevo',
        duration: 4000,
      })
    }
  }

  // Calcular estadísticas
  const totalCards = creditCards.length
  const activeClosings = cardClosings.filter(closing => closing.status === 'pendiente')
  const overdueClosings = cardClosings.filter(closing => closing.status === 'vencido')
  const totalDueAmount = activeClosings.reduce((sum, closing) => sum + closing.dueAmount, 0)
  const totalPaidAmount = cardClosings.reduce((sum, closing) => sum + closing.paidAmount, 0)

  // Obtener cuotas del mes actual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const currentMonthInstallments = expenses
    .filter(expense => 
      expense.type === 'tarjeta' && 
      expense.installments && 
      expense.currentInstallment
    )
    .map(expense => {
      if (!expense.installments || !expense.currentInstallment || !expense.totalAmount) return null
      
      const purchaseDate = expense.purchaseMonth ? new Date(expense.purchaseMonth) : new Date(expense.date)
      const purchaseMonth = purchaseDate.getMonth()
      const purchaseYear = purchaseDate.getFullYear()
      
      const monthsDiff = (currentYear - purchaseYear) * 12 + (currentMonth - purchaseMonth)
      
      if (monthsDiff >= 0 && monthsDiff < expense.installments) {
        return {
          id: expense.id,
          amount: expense.totalAmount / expense.installments,
          description: expense.description,
          card: expense.card
        }
      }
      
      return null
    })
    .filter(Boolean)

  const currentMonthTotal = currentMonthInstallments.reduce((sum, item) => sum + (item?.amount || 0), 0)

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard de tarjetas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={24} className="text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Dashboard de Tarjetas de Crédito
          </h2>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Resumen', icon: TrendingUp },
            { id: 'cards', label: 'Mis Tarjetas', icon: CreditCard },
            { id: 'closings', label: 'Cierres', icon: Calendar },
            { id: 'installments', label: 'Cuotas', icon: DollarSign }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de las tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={20} className="text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Tarjetas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalCards}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Cierres Pendientes</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {activeClosings.length}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total a Pagar</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalDueAmount)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Cuotas del Mes</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(currentMonthTotal)}
              </p>
            </div>
          </div>

          {/* Alertas */}
          {(overdueClosings.length > 0 || activeClosings.length > 0) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Alertas y Recordatorios
              </h3>
              
              <div className="space-y-3">
                {overdueClosings.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
                    <AlertCircle size={20} className="text-red-500" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">
                        {overdueClosings.length} cierre(s) vencido(s)
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        Total vencido: {formatCurrency(overdueClosings.reduce((sum, closing) => sum + closing.dueAmount, 0))}
                      </p>
                    </div>
                  </div>
                )}
                
                {activeClosings.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                    <Calendar size={20} className="text-yellow-500" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        {activeClosings.length} cierre(s) pendiente(s)
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Total pendiente: {formatCurrency(totalDueAmount)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resumen de cuotas del mes */}
          {currentMonthInstallments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Cuotas de {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </h3>
              
              <div className="space-y-3">
                {currentMonthInstallments.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex items-center gap-3">
                      {item?.card && (
                        <div 
                          className="w-6 h-4 rounded"
                          style={{ backgroundColor: item.card.color }}
                        />
                      )}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item?.description}
                      </span>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatCurrency(item?.amount || 0)}
                    </span>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Total del mes
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(currentMonthTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cards' && (
        <CreditCardsManager />
      )}

      {activeTab === 'closings' && (
        <CardClosingsManager
          cardClosings={cardClosings}
          onUpdateClosing={handleUpdateClosing}
        />
      )}

      {activeTab === 'installments' && (
        <InstallmentsTracker
          expenses={expenses}
          selectedMonth={currentMonth}
          selectedYear={currentYear}
          onMonthChange={() => {}}
          onYearChange={() => {}}
        />
      )}
    </div>
  )
}
