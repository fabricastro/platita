'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, Calendar, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { CardClosing, CreditCard as CreditCardType } from '../types'
import { formatCurrency, formatDate } from '../utils/formatters'

interface CardClosingsManagerProps {
  cardClosings: CardClosing[]
  onUpdateClosing: (id: string, updates: Partial<CardClosing>) => void
  className?: string
}

export const CardClosingsManager: React.FC<CardClosingsManagerProps> = ({
  cardClosings,
  onUpdateClosing,
  className = ''
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Obtener cierres del mes seleccionado
  const monthClosings = cardClosings.filter(
    closing => closing.month === selectedMonth + 1 && closing.year === selectedYear
  )

  // Generar meses para el selector
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Generar años para el selector (últimos 2 años y próximos 2)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pagado':
        return <CheckCircle size={16} className="text-green-500" />
      case 'vencido':
        return <AlertCircle size={16} className="text-red-500" />
      case 'pendiente':
        return <Clock size={16} className="text-yellow-500" />
      default:
        return <Clock size={16} className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pagado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'vencido':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pagado':
        return 'Pagado'
      case 'vencido':
        return 'Vencido'
      case 'pendiente':
        return 'Pendiente'
      default:
        return 'Desconocido'
    }
  }

  const handleStatusChange = (closingId: string, newStatus: string) => {
    onUpdateClosing(closingId, { status: newStatus as any })
  }

  const handlePaidAmountChange = (closingId: string, newAmount: string) => {
    const amount = parseFloat(newAmount) || 0
    onUpdateClosing(closingId, { paidAmount: amount })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selector de mes y año */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Cierres de Tarjetas
            </h3>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              📅 Mes del cierre
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
              📅 Año del cierre
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

      {/* Lista de cierres */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {monthClosings.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay cierres de tarjetas para {months[selectedMonth]} {selectedYear}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthClosings.map((closing) => (
              <div key={closing.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-5 rounded shadow-sm"
                      style={{ backgroundColor: closing.card.color }}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {closing.card.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {closing.card.bank}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(closing.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(closing.status)}`}>
                      {getStatusText(closing.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total del Cierre</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(closing.totalAmount)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Vencimiento</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatDate(closing.dueDate)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">A Pagar</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(closing.dueAmount)}
                    </p>
                  </div>
                </div>

                {/* Controles de estado y pago */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Estado:
                    </label>
                    <select
                      value={closing.status}
                      onChange={(e) => handleStatusChange(closing.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagado">Pagado</option>
                      <option value="vencido">Vencido</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Monto Pagado:
                    </label>
                    <input
                      type="number"
                      value={closing.paidAmount}
                      onChange={(e) => handlePaidAmountChange(closing.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 w-24"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Barra de progreso del pago */}
                {closing.dueAmount > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progreso del pago</span>
                      <span>{Math.round((closing.paidAmount / closing.dueAmount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((closing.paidAmount / closing.dueAmount) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
