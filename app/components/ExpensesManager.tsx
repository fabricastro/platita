'use client'

import React, { useState } from 'react'
import { PlusCircle, Trash2, Edit, CreditCard, Receipt, Calendar, List, Grid } from 'lucide-react'
import { toast } from 'sonner'
import { Expense, ExpenseForm, ExpenseType } from '../types'
import { formatCurrency, formatDate, formatPriceInput, parsePriceInput, cleanInstallmentDescription } from '../utils/formatters'
import { categories, argentineCreditCards } from '../constants'
import { ExpensesCalendar } from './ExpensesCalendar'
import { ExpenseDetailsModal } from './ExpenseDetailsModal'
import { EnhancedCreditCardSelector } from './EnhancedCreditCardSelector'
import { InstallmentsTracker } from './InstallmentsTracker'
import { MoneyInput } from './MoneyInput'

interface ExpensesManagerProps {
  expenses: Expense[]
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ expenses, setExpenses }) => {
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<{
    description?: string
    amount?: string | number
    category?: string
    date?: string
  }>({})
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [modalData, setModalData] = useState<{
    isOpen: boolean
    expenses: Expense[]
    date: Date
  }>({
    isOpen: false,
    expenses: [],
    date: new Date()
  })
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    description: '',
    amount: '',
    category: 'comida',
    date: new Date().toISOString().split('T')[0],
    type: 'unico',
    purchaseMonth: new Date().toISOString().split('T')[0],
    cardId: ''
  })

  const addExpense = async () => {
    if (!expenseForm.description) {
      toast.error('Campo requerido', {
        description: 'Por favor, ingresa una descripción para el gasto',
        duration: 4000,
      })
      return
    }
    
    if (expenseForm.type === 'unico' && !expenseForm.amount) {
      toast.error('Campo requerido', {
        description: 'Por favor, ingresa el monto del gasto',
        duration: 4000,
      })
      return
    }
    
    if (expenseForm.description && (expenseForm.amount || (expenseForm.type === 'tarjeta' && expenseForm.totalAmount))) {
      // Validar campos específicos para gastos de tarjeta
      if (expenseForm.type === 'tarjeta' && (!expenseForm.installments || !expenseForm.totalAmount || !expenseForm.purchaseMonth || !expenseForm.cardId)) {
        toast.error('Campos incompletos', {
          description: 'Para gastos de tarjeta, debes especificar el monto total, número de cuotas, mes de compra y tarjeta',
          duration: 4000,
        })
        return
      }

      try {
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(expenseForm),
        })

        if (response.ok) {
          const result = await response.json()
          // Para gastos de tarjeta, result será un array de gastos
          const newExpenses = Array.isArray(result) ? result : [result]
          setExpenses([...newExpenses, ...expenses])
          setExpenseForm({
            description: '',
            amount: '',
            category: 'comida',
            date: new Date().toISOString().split('T')[0],
            type: 'unico',
            purchaseMonth: new Date().toISOString().split('T')[0],
            cardId: ''
          })
          
          // Notificación de éxito
          if (expenseForm.type === 'tarjeta') {
            toast.success(`Gasto de tarjeta "${expenseForm.description}" agregado exitosamente`, {
              description: `${expenseForm.installments} cuotas de ${formatCurrency(parseFloat(expenseForm.totalAmount || '0') / parseInt(expenseForm.installments || '1'))}`,
              duration: 4000,
            })
          } else {
            toast.success(`Gasto "${expenseForm.description}" agregado exitosamente`, {
              description: `${formatCurrency(parseFloat(expenseForm.amount))} - ${expenseForm.category}`,
              duration: 4000,
            })
          }
        } else {
          // Manejar errores específicos de la API
          const errorData = await response.json()
          toast.error('Error al agregar el gasto', {
            description: errorData.error || 'Por favor, inténtalo de nuevo',
            duration: 4000,
          })
        }
      } catch (error) {
        console.error('Error adding expense:', error)
        toast.error('Error al agregar el gasto', {
          description: 'Por favor, inténtalo de nuevo',
          duration: 4000,
        })
      }
    }
  }

  const updateExpense = async (id: string, updatedData: Partial<Expense>) => {
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const updatedExpense = await response.json()
        setExpenses(expenses.map(exp => exp.id === id ? updatedExpense : exp))
        setEditingExpense(null)
        
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

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Obtener información del gasto antes de eliminarlo para la notificación
        const deletedExpense = expenses.find(exp => exp.id === id)
        
        setExpenses(expenses.filter(exp => exp.id !== id))
        // Cerrar modal si el gasto eliminado estaba en él
        if (modalData.isOpen && modalData.expenses.some(exp => exp.id === id)) {
          setModalData(prev => ({ ...prev, isOpen: false }))
        }
        
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

  const handleExpenseClick = (expense: Expense) => {
    const expenseDate = new Date(expense.date)
    const dayExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date)
      return expDate.toDateString() === expenseDate.toDateString()
    })
    
    setModalData({
      isOpen: true,
      expenses: dayExpenses,
      date: expenseDate
    })
  }

  const closeModal = () => {
    setModalData(prev => ({ ...prev, isOpen: false }))
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense.id)
    
    // Convertir la fecha al formato YYYY-MM-DD para el input type="date"
    const expenseDate = new Date(expense.date)
    const formattedDate = expenseDate.toISOString().split('T')[0]
    
    // Para gastos de tarjeta, usar el monto total en lugar del monto de la cuota
    const amountToEdit = expense.type === 'tarjeta' && expense.totalAmount 
      ? expense.totalAmount.toString() 
      : expense.amount.toString()
    
    // Para gastos de tarjeta, limpiar la descripción removiendo el paréntesis de cuotas
    const cleanDescription = expense.type === 'tarjeta' 
      ? cleanInstallmentDescription(expense.description)
      : expense.description
    
    // Inicializar los datos de edición con los valores actuales
    setEditingData({
      description: cleanDescription,
      amount: amountToEdit,
      category: expense.category,
      date: formattedDate
    })
    
    closeModal()
  }

  const handleExpenseUpdated = async (updatedExpense: Expense) => {
    // Para gastos de tarjeta, recargar todos los gastos ya que se actualizaron múltiples cuotas
    if (updatedExpense.type === 'tarjeta') {
      try {
        const response = await fetch('/api/expenses')
        if (response.ok) {
          const allExpenses = await response.json()
          setExpenses(allExpenses)
        }
      } catch (error) {
        console.error('Error reloading expenses:', error)
        // En caso de error, al menos actualizar el gasto actual
        setExpenses(prev => 
          prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
        )
      }
    } else {
      // Para gastos únicos, actualizar solo localmente
      setExpenses(prev => 
        prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
      )
    }
  }

  const saveExpenseEdit = async (id: string) => {
    if (editingData.description && editingData.amount) {
      // Convertir amount a número antes de enviar
      const dataToUpdate = {
        ...editingData,
        amount: typeof editingData.amount === 'string' ? parseFloat(editingData.amount) : editingData.amount
      }
      await updateExpense(id, dataToUpdate)
      setEditingData({})
    } else {
      toast.error('Error al guardar', {
        description: 'Por favor, completa todos los campos requeridos',
        duration: 4000,
      })
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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Agregar Gasto</h2>
        
        {/* Selector de tipo de gasto */}
        <div className="mb-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setExpenseForm({...expenseForm, type: 'unico'})}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${
                expenseForm.type === 'unico' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <Receipt size={18} />
              Gasto Único
            </button>
            <button
              type="button"
              onClick={() => setExpenseForm({...expenseForm, type: 'tarjeta'})}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${
                expenseForm.type === 'tarjeta' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <CreditCard size={18} />
              Gasto de Tarjeta
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📝 Descripción *
            </label>
            <input
              type="text"
              placeholder="Ej: Supermercado, Ropa, etc."
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          
          {expenseForm.type === 'unico' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                💰 Monto del Gasto *
              </label>
              <MoneyInput
                value={expenseForm.amount || ''}
                onChange={(value) => setExpenseForm({...expenseForm, amount: value})}
                placeholder="Ej: 15.500,50"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  💳 Monto Total de la Compra *
                </label>
                <MoneyInput
                  value={expenseForm.totalAmount || ''}
                  onChange={(value) => setExpenseForm({...expenseForm, totalAmount: value})}
                  placeholder="Ej: 150.000,00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  🔢 Número de Cuotas *
                </label>
                <input
                  type="number"
                  placeholder="Ej: 12"
                  value={expenseForm.installments || ''}
                  onChange={(e) => setExpenseForm({...expenseForm, installments: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  min="1"
                  max="36"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  En cuántas cuotas pagarás
                </p>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              🏷️ Categoría *
            </label>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📅 Fecha del Gasto *
            </label>
            <input
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fecha en que realizaste el gasto
            </p>
          </div>
          
                     {/* Campos adicionales para gastos de tarjeta */}
           {expenseForm.type === 'tarjeta' && (
             <>
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                   📅 Mes de Compra *
                 </label>
                 <input
                   type="date"
                   placeholder="Mes de Compra"
                   value={expenseForm.purchaseMonth || ''}
                   onChange={(e) => setExpenseForm({...expenseForm, purchaseMonth: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                   required
                 />
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                   Fecha en que realizaste la compra con la tarjeta
                 </p>
               </div>
               <EnhancedCreditCardSelector
                 selectedCardId={expenseForm.cardId}
                 onCardSelect={(card) => setExpenseForm({...expenseForm, cardId: card.id})}
                 className="md:col-span-2"
               />
             </>
           )}
          
          {expenseForm.type === 'tarjeta' && expenseForm.totalAmount && expenseForm.installments && (
            <div className="md:col-span-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Cuota mensual:</strong> {formatCurrency(parseFloat(expenseForm.totalAmount) / parseInt(expenseForm.installments))} 
                × {expenseForm.installments} cuotas
              </p>
            </div>
          )}
          
          <button
            onClick={addExpense}
            className={`md:col-span-4 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
              expenseForm.type === 'unico' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {expenseForm.type === 'unico' ? <Receipt size={18} /> : <CreditCard size={18} />}
            {expenseForm.type === 'unico' ? 'Agregar Gasto Único' : 'Agregar Gasto de Tarjeta'}
          </button>
        </div>
      </div>

      {/* Selector de vista */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Visualización de Gastos
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 transition-colors ${
                viewMode === 'calendar' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <Grid size={16} />
              Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 transition-colors ${
                viewMode === 'list' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <List size={16} />
              Lista
            </button>
            {/* Botón de prueba temporal */}

          </div>
        </div>
      </div>

      {/* Vista del calendario */}
      {viewMode === 'calendar' && (
        <ExpensesCalendar 
          expenses={expenses} 
          onExpenseClick={handleExpenseClick}
        />
      )}

      {/* Vista de lista */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Lista de Gastos</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay gastos registrados</p>
            ) : (
              (() => {
                // Agrupar gastos de tarjeta por descripción base y fecha de compra
                const groupedExpenses = expenses.reduce((acc: any[], expense) => {
                  if (expense.type === 'tarjeta' && expense.currentInstallment === 1) {
                    // Solo mostrar la primera cuota de cada gasto de tarjeta
                    acc.push(expense)
                  } else if (expense.type === 'unico') {
                    // Mostrar todos los gastos únicos
                    acc.push(expense)
                  }
                  return acc
                }, [])
                
                return groupedExpenses.map(expense => (
                <div key={expense.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  {editingExpense === expense.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <input
                        type="text"
                        value={editingData.description || ''}
                        onChange={(e) => setEditingData({...editingData, description: e.target.value})}
                        onKeyDown={(e) => handleKeyDown(e, expense.id)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        autoFocus
                      />
                      <div>
                        <MoneyInput
                          value={editingData.amount || ''}
                          onChange={(value) => setEditingData({...editingData, amount: value})}
                          placeholder={expense.type === 'tarjeta' ? 'Monto total' : 'Monto'}
                          className="px-2 py-1 text-sm"
                        />
                        {expense.type === 'tarjeta' && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            💳 Total
                          </p>
                        )}
                      </div>
                      <select
                        value={editingData.category || ''}
                        onChange={(e) => setEditingData({...editingData, category: e.target.value})}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="capitalize">{cat}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={editingData.date || ''}
                        onChange={(e) => setEditingData({...editingData, date: e.target.value})}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveExpenseEdit(expense.id)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => cancelExpenseEdit()}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {expense.type === 'tarjeta' ? (
                            <CreditCard size={16} className="text-green-600" />
                          ) : (
                            <Receipt size={16} className="text-blue-600" />
                          )}
                          <span className="font-medium text-gray-900 dark:text-gray-100">{expense.description}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {expense.category} • {new Date(expense.date).toLocaleDateString('es-AR')}
                          {expense.type === 'tarjeta' && expense.installments && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {expense.installments} cuotas
                            </span>
                          )}
                        </div>
                        {expense.type === 'tarjeta' && expense.purchaseMonth && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Compra: {new Date(expense.purchaseMonth).toLocaleDateString('es-AR')}
                          </div>
                        )}
                        {expense.type === 'tarjeta' && expense.card && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <div 
                              className="w-3 h-2 rounded"
                              style={{ backgroundColor: expense.card.color }}
                            />
                            {expense.card.name} • {expense.card.bank}
                          </div>
                        )}

                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`font-bold ${expense.type === 'tarjeta' ? 'text-green-600' : 'text-red-600'}`}>
                            {expense.type === 'tarjeta' && expense.totalAmount 
                              ? formatCurrency(expense.totalAmount) 
                              : formatCurrency(expense.amount)
                            }
                          </span>
                          {expense.type === 'tarjeta' && expense.totalAmount && expense.installments && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatCurrency(expense.totalAmount / expense.installments)} × {expense.installments}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                ))
              })()
            )}
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      <ExpenseDetailsModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        expenses={modalData.expenses}
        date={modalData.date}
        onEditExpense={handleEditExpense}
        onDeleteExpense={deleteExpense}
        onExpenseUpdated={handleExpenseUpdated}
      />

      {/* Seguimiento de cuotas */}
      <InstallmentsTracker
        expenses={expenses}
      />
    </div>
  )
}
