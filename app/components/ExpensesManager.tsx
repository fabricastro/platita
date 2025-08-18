'use client'

import React, { useState } from 'react'
import { PlusCircle, Trash2, Edit, CreditCard, Receipt } from 'lucide-react'
import { Expense, ExpenseForm, ExpenseType } from '../types'
import { formatCurrency, formatDate } from '../utils/formatters'
import { categories } from '../constants'

interface ExpensesManagerProps {
  expenses: Expense[]
  setExpenses: (expenses: Expense[]) => void
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ expenses, setExpenses }) => {
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    description: '',
    amount: '',
    category: 'comida',
    date: new Date().toISOString().split('T')[0],
    type: 'unico'
  })

  const addExpense = async () => {
    if (expenseForm.description && (expenseForm.amount || (expenseForm.type === 'tarjeta' && expenseForm.totalAmount))) {
      // Validar campos específicos para gastos de tarjeta
      if (expenseForm.type === 'tarjeta' && (!expenseForm.installments || !expenseForm.totalAmount)) {
        alert('Para gastos de tarjeta, debes especificar el monto total y el número de cuotas')
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
            type: 'unico'
          })
        }
      } catch (error) {
        console.error('Error adding expense:', error)
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
      }
    } catch (error) {
      console.error('Error updating expense:', error)
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExpenses(expenses.filter(exp => exp.id !== id))
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Descripción"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          
          {expenseForm.type === 'unico' ? (
            <input
              type="number"
              placeholder="Monto"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          ) : (
            <>
              <input
                type="number"
                placeholder="Monto Total"
                value={expenseForm.totalAmount || ''}
                onChange={(e) => setExpenseForm({...expenseForm, totalAmount: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              <input
                type="number"
                placeholder="Número de Cuotas"
                value={expenseForm.installments || ''}
                onChange={(e) => setExpenseForm({...expenseForm, installments: e.target.value})}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                min="1"
                max="36"
                required
              />
            </>
          )}
          
          <select
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          
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

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Lista de Gastos</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay gastos registrados</p>
          ) : (
            expenses.map(expense => (
              <div key={expense.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                {editingExpense === expense.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      defaultValue={expense.description}
                      onBlur={(e) => updateExpense(expense.id, { description: e.target.value })}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      autoFocus
                    />
                    <input
                      type="number"
                      defaultValue={expense.amount}
                      onBlur={(e) => updateExpense(expense.id, { amount: parseFloat(e.target.value) })}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    <select
                      defaultValue={expense.category}
                      onChange={(e) => updateExpense(expense.id, { category: e.target.value })}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      defaultValue={expense.date}
                      onChange={(e) => updateExpense(expense.id, { date: e.target.value })}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    />
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
                        {expense.category} • {formatDate(expense.date)}
                        {expense.type === 'tarjeta' && expense.installments && expense.currentInstallment && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            Cuota {expense.currentInstallment}/{expense.installments}
                          </span>
                        )}
                      </div>
                      {expense.type === 'tarjeta' && expense.totalAmount && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Total: {formatCurrency(expense.totalAmount)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${expense.type === 'tarjeta' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(expense.amount)}
                      </span>
                      <button
                        onClick={() => setEditingExpense(expense.id)}
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
          )}
        </div>
      </div>
    </div>
  )
}
