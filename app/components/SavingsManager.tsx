'use client'

import React, { useState } from 'react'
import { PlusCircle, Trash2, Edit } from 'lucide-react'
import { Saving, SavingForm } from '../types'
import { formatCurrency, formatDate } from '../utils/formatters'

interface SavingsManagerProps {
  savings: Saving[]
  setSavings: (savings: Saving[]) => void
}

export const SavingsManager: React.FC<SavingsManagerProps> = ({ savings, setSavings }) => {
  const [editingSaving, setEditingSaving] = useState<string | null>(null)
  const [savingForm, setSavingForm] = useState<SavingForm>({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  const addSaving = async () => {
    if (savingForm.description && savingForm.amount) {
      try {
        const response = await fetch('/api/savings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(savingForm),
        })

        if (response.ok) {
          const newSaving = await response.json()
          setSavings([newSaving, ...savings])
          setSavingForm({
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0]
          })
        }
      } catch (error) {
        console.error('Error adding saving:', error)
      }
    }
  }

  const updateSaving = async (id: string, updatedData: Partial<Saving>) => {
    try {
      const response = await fetch(`/api/savings?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const updatedSaving = await response.json()
        setSavings(savings.map(sav => sav.id === id ? updatedSaving : sav))
        setEditingSaving(null)
      }
    } catch (error) {
      console.error('Error updating saving:', error)
    }
  }

  const deleteSaving = async (id: string) => {
    try {
      const response = await fetch(`/api/savings?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavings(savings.filter(sav => sav.id !== id))
      }
    } catch (error) {
      console.error('Error deleting saving:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Agregar Ahorro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Descripción"
            value={savingForm.description}
            onChange={(e) => setSavingForm({...savingForm, description: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="number"
            placeholder="Monto"
            value={savingForm.amount}
            onChange={(e) => setSavingForm({...savingForm, amount: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="date"
            value={savingForm.date}
            onChange={(e) => setSavingForm({...savingForm, date: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={addSaving}
            className="md:col-span-3 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <PlusCircle size={18} />
            Agregar Ahorro
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Historial de Ahorros</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {savings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay ahorros registrados</p>
          ) : (
            savings.map(saving => (
              <div key={saving.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                {editingSaving === saving.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      defaultValue={saving.description}
                      onBlur={(e) => updateSaving(saving.id, { description: e.target.value })}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      autoFocus
                    />
                    <input
                      type="number"
                      defaultValue={saving.amount}
                      onBlur={(e) => updateSaving(saving.id, { amount: parseFloat(e.target.value) })}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    <input
                      type="date"
                      defaultValue={saving.date}
                      onChange={(e) => updateSaving(saving.id, { date: e.target.value })}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{saving.description}</span>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(saving.date)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-600">{formatCurrency(saving.amount)}</span>
                      <button
                        onClick={() => setEditingSaving(saving.id)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteSaving(saving.id)}
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
