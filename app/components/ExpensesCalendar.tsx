'use client'

import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CreditCard, Receipt, Calendar, Grid } from 'lucide-react'
import { Expense } from '../types'
import { formatCurrency, formatDate } from '../utils/formatters'

interface ExpensesCalendarProps {
  expenses: Expense[]
  onExpenseClick?: (expense: Expense) => void
}

export const ExpensesCalendar: React.FC<ExpensesCalendarProps> = ({ 
  expenses, 
  onExpenseClick 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual')

  // Obtener el primer día del mes actual
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  // Obtener el último día del mes actual
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
  // Convertir para que lunes sea 0, domingo sea 6
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7
  // Obtener el número total de días en el mes
  const daysInMonth = lastDayOfMonth.getDate()

  // Generar array de días para el calendario mensual
  const calendarDays = useMemo(() => {
    const days = []
    
    // Agregar días del mes anterior para completar la primera semana
    for (let i = firstDayWeekday; i > 0; i--) {
      const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
      days.push({
        date: new Date(prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), prevMonthLastDay.getDate() - i + 1),
        isCurrentMonth: false,
        expenses: []
      })
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      days.push({
        date,
        isCurrentMonth: true,
        expenses: []
      })
    }
    
    // Agregar días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length // 6 semanas × 7 días = 42
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
        isCurrentMonth: false,
        expenses: []
      })
    }
    
    return days
  }, [currentDate, firstDayWeekday, daysInMonth])

  // Generar array de meses para la vista anual
  const annualMonths = useMemo(() => {
    const months = []
    const currentYear = currentDate.getFullYear()
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentYear, month, 1)
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === month
      })
      
      const monthTotal = monthExpenses.reduce((total, expense) => total + expense.amount, 0)
      
      months.push({
        month,
        monthDate,
        expenses: monthExpenses,
        total: monthTotal,
        daysWithExpenses: monthExpenses.length > 0 ? 
          new Set(monthExpenses.map(exp => new Date(exp.date).getDate())).size : 0
      })
    }
    
    return months
  }, [currentDate, expenses])

  // Agrupar gastos por fecha
  const expensesByDate = useMemo(() => {
    const grouped: { [key: string]: Expense[] } = {}
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date)
      const dateKey = expenseDate.toISOString().split('T')[0]
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(expense)
    })
    
    return grouped
  }, [expenses])

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Ir al mes actual
  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  // Navegar al año anterior
  const goToPreviousYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))
  }

  // Navegar al año siguiente
  const goToNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))
  }

  // Ir al año actual
  const goToCurrentYear = () => {
    setCurrentDate(new Date())
  }

  // Obtener nombre del mes
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }

  // Obtener nombre corto del mes
  const getShortMonthName = (monthIndex: number) => {
    const date = new Date(2024, monthIndex, 1)
    return date.toLocaleDateString('es-ES', { month: 'short' })
  }

  // Obtener nombre del día de la semana
  const getWeekdayName = (weekday: number) => {
    const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    return weekdays[weekday]
  }

  // Calcular total de gastos para un día específico
  const getDayTotal = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    const dayExpenses = expensesByDate[dateKey] || []
    return dayExpenses.reduce((total, expense) => total + expense.amount, 0)
  }

  // Obtener gastos para un día específico
  const getDayExpenses = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    return expensesByDate[dateKey] || []
  }

  // Vista anual del calendario
  const renderAnnualView = () => (
    <div className="space-y-4">
      {/* Header del año */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Calendario Anual {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousYear}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Año anterior"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={goToCurrentYear}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Este año
          </button>
          
          <button
            onClick={goToNextYear}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Año siguiente"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Grid de meses */}
      <div className="grid grid-cols-3 gap-4">
        {annualMonths.map((monthData) => {
          const isCurrentMonth = monthData.month === new Date().getMonth() && 
                               currentDate.getFullYear() === new Date().getFullYear()
          const hasExpenses = monthData.total > 0
          
          return (
            <div
              key={monthData.month}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                ${isCurrentMonth 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : hasExpenses 
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }
                ${hasExpenses ? 'hover:border-green-400' : 'hover:border-gray-300'}
              `}
              onClick={() => {
                setCurrentDate(new Date(currentDate.getFullYear(), monthData.month, 1))
                setViewMode('monthly')
              }}
            >
              <div className="text-center">
                <h4 className={`font-semibold mb-2 ${
                  isCurrentMonth 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : hasExpenses 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {getShortMonthName(monthData.month)}
                </h4>
                
                {hasExpenses ? (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(monthData.total)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {monthData.expenses.length} gastos • {monthData.daysWithExpenses} días
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 text-sm">
                    Sin gastos
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen anual */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Resumen del Año</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total anual: </span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(annualMonths.reduce((total, month) => total + month.total, 0))}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Meses con gastos: </span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {annualMonths.filter(month => month.total > 0).length}/12
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  // Vista mensual del calendario
  const renderMonthlyView = () => (
    <div className="space-y-4">
      {/* Header del mes */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Calendario Mensual
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={goToCurrentMonth}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Este mes
          </button>
          
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 min-w-[150px] text-center">
            {getMonthName(currentDate)}
          </span>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {getWeekdayName(i)}
          </div>
        ))}
      </div>

      {/* Calendario mensual */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayExpenses = getDayExpenses(day.date)
          const dayTotal = getDayTotal(day.date)
          const isToday = day.date.toDateString() === new Date().toDateString()
          
          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border border-gray-200 dark:border-gray-600 rounded-md
                ${day.isCurrentMonth 
                  ? 'bg-white dark:bg-gray-700' 
                  : 'bg-gray-50 dark:bg-gray-800'
                }
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${dayExpenses.length > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer
              `}
              onClick={() => dayExpenses.length > 0 && onExpenseClick?.(dayExpenses[0])}
            >
              {/* Número del día */}
              <div className={`
                text-sm font-medium mb-1
                ${day.isCurrentMonth 
                  ? 'text-gray-900 dark:text-gray-100' 
                  : 'text-gray-400 dark:text-gray-500'
                }
                ${isToday ? 'text-blue-600 font-bold' : ''}
              `}>
                {day.date.getDate()}
              </div>

              {/* Total del día */}
              {dayTotal > 0 && (
                <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                  {formatCurrency(dayTotal)}
                </div>
              )}

              {/* Gastos del día */}
              <div className="space-y-1">
                {dayExpenses.slice(0, 2).map((expense, expIndex) => (
                  <div
                    key={expense.id}
                    className={`
                      text-xs p-1 rounded truncate flex items-center gap-1
                      ${expense.type === 'tarjeta' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }
                    `}
                    title={`${expense.description} - ${formatCurrency(expense.amount)}`}
                  >
                    {expense.type === 'tarjeta' ? (
                      <CreditCard size={10} />
                    ) : (
                      <Receipt size={10} />
                    )}
                    <span className="truncate">{expense.description}</span>
                  </div>
                ))}
                
                {dayExpenses.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{dayExpenses.length - 2} más
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
          <span>Gasto único</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
          <span>Gasto de tarjeta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Hoy</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      {/* Selector de vista */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Calendario de Gastos
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('annual')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 transition-colors ${
              viewMode === 'annual' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <Grid size={16} />
            Vista Anual
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 transition-colors ${
              viewMode === 'monthly' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <Calendar size={16} />
            Vista Mensual
          </button>
        </div>
      </div>

      {/* Contenido según la vista seleccionada */}
      {viewMode === 'annual' ? renderAnnualView() : renderMonthlyView()}
    </div>
  )
}
