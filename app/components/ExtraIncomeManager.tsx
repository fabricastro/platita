'use client'

import React, { useState } from 'react'
import { PlusCircle, Trash2, Edit, Save, X } from 'lucide-react'
import { ExtraIncome, ExtraIncomeForm } from '../types'
import { formatCurrency, formatDate } from '../utils/formatters'

interface ExtraIncomeManagerProps {
  extraIncome: ExtraIncome[]
  setExtraIncome: (extraIncome: ExtraIncome[]) => void
}

export const ExtraIncomeManager: React.FC<ExtraIncomeManagerProps> = ({ extraIncome, setExtraIncome }) => {
  const [editingIncome, setEditingIncome] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ExtraIncome>>({})
  const [incomeForm, setIncomeForm] = useState<ExtraIncomeForm>({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  const addExtraIncome = async () => {
    if (incomeForm.description && incomeForm.amount) {
      try {
        const response = await fetch('/api/extra-income', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(incomeForm),
        })

        if (response.ok) {
          const newIncome = await response.json()
          setExtraIncome([newIncome, ...extraIncome])
          setIncomeForm({
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0]
          })
        }
      } catch (error) {
        console.error('Error adding extra income:', error)
      }
    }
  }

  const startEditing = (income: ExtraIncome) => {
    setEditingIncome(income.id)
    setEditForm({
      description: income.description,
      amount: income.amount,
      date: income.date
    })
  }

  const cancelEditing = () => {
    setEditingIncome(null)
    setEditForm({})
  }

  const saveEditing = async (id: string) => {
    try {
      const response = await fetch(`/api/extra-income?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedIncome = await response.json()
        setExtraIncome(extraIncome.map(inc => inc.id === id ? updatedIncome : inc))
        setEditingIncome(null)
        setEditForm({})
      }
    } catch (error) {
      console.error('Error updating extra income:', error)
    }
  }

  const deleteExtraIncome = async (id: string) => {
    try {
      const response = await fetch(`/api/extra-income?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExtraIncome(extraIncome.filter(inc => inc.id !== id))
      }
    } catch (error) {
      console.error('Error deleting extra income:', error)
    }
  }

  const totalExtraIncome = extraIncome.reduce((total, income) => total + income.amount, 0)

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Agregar Ingreso Extra</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Descripción (ej: Aguinaldo, Freelance)"
            value={incomeForm.description}
            onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="number"
            placeholder="Monto"
            value={incomeForm.amount}
            onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="date"
            value={incomeForm.date}
            onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={addExtraIncome}
            className="md:col-span-3 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <PlusCircle size={18} />
            Agregar Ingreso Extra
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Historial de Ingresos Extra</h3>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            Total: {formatCurrency(totalExtraIncome)}
          </div>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {extraIncome.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay ingresos extra registrados</p>
          ) : (
            extraIncome.map(income => (
              <div key={income.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                {editingIncome === income.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      autoFocus
                    />
                    <input
                      type="number"
                      value={editForm.amount || ''}
                      onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    <input
                      type="date"
                      value={editForm.date || ''}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    <div className="md:col-span-3 flex gap-2">
                      <button
                        onClick={() => saveEditing(income.id)}
                        className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 flex items-center justify-center gap-1"
                      >
                        <Save size={14} />
                        Guardar
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600 flex items-center justify-center gap-1"
                      >
                        <X size={14} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{income.description}</span>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(income.date)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-600">{formatCurrency(income.amount)}</span>
                      <button
                        onClick={() => startEditing(income)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteExtraIncome(income.id)}
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
