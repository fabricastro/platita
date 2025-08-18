'use client'

import React, { useState, useEffect } from 'react'
import { X, CreditCard, Receipt, Edit, Trash2, Save, X as CloseIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Expense } from '../types'
import { formatCurrency, formatDate, formatPriceInput, parseFormattedPrice, formatPriceWhileTyping, parsePriceInput } from '../utils/formatters'
import { categories } from '../constants'

interface ExpenseDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  expenses: Expense[]
  date: Date
  onEditExpense: (expense: Expense) => void
  onDeleteExpense: (id: string) => void
  onExpenseUpdated?: (updatedExpense: Expense) => void
}

export const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  isOpen,
  onClose,
  expenses,
  date,
  onEditExpense,
  onDeleteExpense,
  onExpenseUpdated
}) => {
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Expense>>({})
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(expenses)

  // Actualizar expenses locales cuando cambien las props
  useEffect(() => {
    setLocalExpenses(expenses)
  }, [expenses])

  if (!isOpen) return null

  const totalAmount = localExpenses.reduce((total, expense) => total + expense.amount, 0)
  const dateString = date.toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense.id)
    
    // Convertir la fecha al formato YYYY-MM-DD para el input type="date"
    const expenseDate = new Date(expense.date)
    const formattedDate = expenseDate.toISOString().split('T')[0]
    
    setEditingData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: formattedDate
    })
  }

  const saveExpenseEdit = async (id: string) => {
    if (editingData.description && editingData.amount) {
      try {
        const response = await fetch(`/api/expenses?id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingData),
        })

        if (response.ok) {
          const updatedExpense = await response.json()
          
          // Actualizar localmente
          setLocalExpenses(prev => 
            prev.map(exp => exp.id === id ? updatedExpense : exp)
          )
          
          // Notificar al componente padre
          if (onExpenseUpdated) {
            onExpenseUpdated(updatedExpense)
          }
          
          // Salir del modo edición
          setEditingExpense(null)
          setEditingData({})
          
          // Notificación de éxito
          toast.success(`Gasto "${updatedExpense.description}" actualizado exitosamente`, {
            description: `${formatCurrency(updatedExpense.amount)} - ${updatedExpense.category}`,
            duration: 4000,
          })
        }
      } catch (error) {
        console.error('Error updating expense:', error)
        toast.error('Error al actualizar el gasto', {
          description: 'Por favor, inténtalo de nuevo',
          duration: 4000,
        })
      }
    }
  }

  const cancelExpenseEdit = () => {
    setEditingExpense(null)
    setEditingData({})
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveExpenseEdit(id)
    } else if (e.key === 'Escape') {
      cancelExpenseEdit()
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Actualizar localmente
        setLocalExpenses(prev => prev.filter(exp => exp.id !== id))
        
        // Obtener información del gasto antes de eliminarlo para la notificación
        const deletedExpense = localExpenses.find(exp => exp.id === id)
        
        // Notificar al componente padre
        onDeleteExpense(id)
        
        // Notificación de éxito
        if (deletedExpense) {
          toast.success(`Gasto "${deletedExpense.description}" eliminado exitosamente`, {
            description: `${formatCurrency(deletedExpense.amount)} - ${deletedExpense.category}`,
            duration: 4000,
          })
        }
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Error al eliminar el gasto', {
        description: 'Por favor, inténtalo de nuevo',
        duration: 4000,
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Gastos del {dateString}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {localExpenses.length} gasto{localExpenses.length !== 1 ? 's' : ''} • Total: {formatCurrency(totalAmount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {localExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No hay gastos registrados para este día</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {editingExpense === expense.id ? (
                    // Formulario de edición
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={editingData.description || ''}
                          onChange={(e) => setEditingData({...editingData, description: e.target.value})}
                          onKeyDown={(e) => handleKeyDown(e, expense.id)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Descripción"
                        />
                        <input
                          type="text"
                          placeholder="Monto (ej: 15.500,50)"
                          value={formatPriceWhileTyping(editingData.amount || '')}
                          onChange={(e) => {
                            // Permitir escribir libremente, incluyendo comas
                            setEditingData({...editingData, amount: e.target.value})
                          }}
                          onBlur={(e) => {
                            // Al perder el foco, convertir a número y formatear
                            const parsedValue = parsePriceInput(e.target.value)
                            if (parsedValue !== undefined) {
                              setEditingData({...editingData, amount: parsedValue})
                            }
                          }}
                          onKeyDown={(e) => handleKeyDown(e, expense.id)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        />
                        <select
                          value={editingData.category || ''}
                          onChange={(e) => setEditingData({...editingData, category: e.target.value})}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat} className="capitalize">{cat}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editingData.date || ''}
                          onChange={(e) => setEditingData({...editingData, date: e.target.value})}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => saveExpenseEdit(expense.id)}
                          className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <Save size={14} />
                          Guardar
                        </button>
                        <button
                          onClick={cancelExpenseEdit}
                          className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <CloseIcon size={14} />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Vista normal del gasto
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {expense.type === 'tarjeta' ? (
                            <CreditCard size={20} className="text-green-600" />
                          ) : (
                            <Receipt size={20} className="text-blue-600" />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {expense.description}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {expense.category} • {new Date(expense.date).toLocaleDateString('es-AR')}
                            </p>
                          </div>
                        </div>

                        {/* Información específica para gastos de tarjeta */}
                        {expense.type === 'tarjeta' && (
                          <div className="ml-8 space-y-1">
                            {expense.totalAmount && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Monto total:</span> {formatCurrency(expense.totalAmount)}
                              </p>
                            )}
                            {expense.installments && expense.currentInstallment && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Cuota:</span> {expense.currentInstallment}/{expense.installments}
                              </p>
                            )}
                            {expense.installments && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Cuota mensual:</span> {formatCurrency(expense.amount)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Monto */}
                        <div className="ml-8 mt-2">
                          <span className={`text-lg font-bold ${
                            expense.type === 'tarjeta' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total del día: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalAmount)}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
