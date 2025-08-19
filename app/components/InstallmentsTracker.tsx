'use client'

import React, { useState } from 'react'
import { Calendar, CreditCard, DollarSign, TrendingUp } from 'lucide-react'
import { Expense } from '../types'
import { formatCurrency } from '../utils/formatters'

interface InstallmentsTrackerProps {
  expenses: Expense[]
  className?: string
}

export const InstallmentsTracker: React.FC<InstallmentsTrackerProps> = ({
  expenses,
  className = ''
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  // Filtrar gastos de tarjeta que corresponden al mes y año seleccionados
  const monthInstallments = expenses
    .filter(expense => {
      if (expense.type !== 'tarjeta' || !expense.installments || !expense.currentInstallment) {
        return false
      }
      
      const expenseDate = new Date(expense.date)
      const expenseMonth = expenseDate.getMonth()
      const expenseYear = expenseDate.getFullYear()
      
      // Filtrar por mes y año seleccionados
      return expenseMonth === selectedMonth && expenseYear === selectedYear
    })
    .map(expense => ({
      id: expense.id,
      description: expense.description.replace(/\s*\(\d+\/\d+\)$/, ''), // Remover el sufijo de cuota de la descripción
      card: expense.card,
      installmentNumber: expense.currentInstallment,
      totalInstallments: expense.installments,
      amount: expense.amount,
      totalAmount: expense.totalAmount,
      category: expense.category,
      purchaseDate: expense.purchaseMonth || expense.date
    }))

  // Generar meses para el selector
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Generar años para el selector
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  // Calcular totales
  const totalAmount = monthInstallments.reduce((sum, item) => sum + (item.amount || 0), 0)
  const totalExpenses = monthInstallments.length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con selectores */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Seguimiento de Cuotas
            </h3>
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                📅 Mes a consultar
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                📅 Año a consultar
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del mes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={20} className="text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total de Cuotas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalExpenses}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Monto Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} className="text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Mes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {months[selectedMonth]}
          </p>
        </div>
      </div>

      {/* Lista de cuotas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {monthInstallments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay cuotas para {months[selectedMonth]} {selectedYear}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthInstallments.map((item) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {item.card && (
                      <div 
                        className="w-8 h-5 rounded shadow-sm"
                        style={{ backgroundColor: item.card.color }}
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {item.description}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Cuota {item.installmentNumber}/{item.totalInstallments}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Compra:</span> {new Date(item.purchaseDate).toLocaleDateString('es-AR')}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Total:</span> {formatCurrency(item.totalAmount || 0)}
                  </div>
                  {item.card && (
                    <>
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Tarjeta:</span> {item.card.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Banco:</span> {item.card.bank}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
