'use client'

import React, { useState } from 'react'
import { Target, Trash2, Edit, Save, X, CheckCircle, XCircle } from 'lucide-react'
import { WishItem, WishForm, Saving } from '../types'
import { formatCurrency } from '../utils/formatters'
import { priorities } from '../constants'

interface WishlistManagerProps {
  wishlist: WishItem[]
  setWishlist: (wishlist: WishItem[]) => void
  savings: Saving[]
}

export const WishlistManager: React.FC<WishlistManagerProps> = ({ wishlist, setWishlist, savings }) => {
  const [editingWishItem, setEditingWishItem] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<WishItem>>({})
  const [wishForm, setWishForm] = useState<WishForm>({
    item: '',
    price: '',
    priority: 'media',
    saved: '0'
  })

  // Calcular total de ahorros
  const totalSavings = savings.reduce((total, saving) => total + saving.amount, 0)

  // Verificar si un deseo se puede cubrir con los ahorros actuales
  const canAffordWish = (price: number) => {
    return totalSavings >= price
  }

  const addWishItem = async () => {
    if (wishForm.item && wishForm.price) {
      try {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wishForm),
        })

        if (response.ok) {
          const newItem = await response.json()
          setWishlist([newItem, ...wishlist])
          setWishForm({
            item: '',
            price: '',
            priority: 'media',
            saved: '0'
          })
        }
      } catch (error) {
        console.error('Error adding wish item:', error)
      }
    }
  }

  const startEditing = (item: WishItem) => {
    setEditingWishItem(item.id)
    setEditForm({
      item: item.item,
      price: item.price,
      priority: item.priority,
      saved: item.saved
    })
  }

  const cancelEditing = () => {
    setEditingWishItem(null)
    setEditForm({})
  }

  const saveEditing = async (id: string) => {
    try {
      const response = await fetch(`/api/wishlist?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setWishlist(wishlist.map(item => item.id === id ? updatedItem : item))
        setEditingWishItem(null)
        setEditForm({})
      }
    } catch (error) {
      console.error('Error updating wish item:', error)
    }
  }

  const deleteWishItem = async (id: string) => {
    try {
      const response = await fetch(`/api/wishlist?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWishlist(wishlist.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting wish item:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Agregar a Lista de Deseos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="¿Qué quieres comprar?"
            value={wishForm.item}
            onChange={(e) => setWishForm({...wishForm, item: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="number"
            placeholder="Precio"
            value={wishForm.price}
            onChange={(e) => setWishForm({...wishForm, price: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <select
            value={wishForm.priority}
            onChange={(e) => setWishForm({...wishForm, priority: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority} className="capitalize">{priority}</option>
            ))}
          </select>
          <button
            onClick={addWishItem}
            className="md:col-span-3 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center justify-center gap-2"
          >
            <Target size={18} />
            Agregar a Lista de Deseos
          </button>
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💰 <strong>Ahorros totales:</strong> {formatCurrency(totalSavings)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Mi Lista de Deseos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 col-span-full">No hay artículos en tu lista de deseos</p>
          ) : (
            wishlist.map(item => {
              const canAfford = canAffordWish(item.price)
              const remainingAfterPurchase = totalSavings - item.price
              return (
                <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  {editingWishItem === item.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.item || ''}
                        onChange={(e) => setEditForm({...editForm, item: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        autoFocus
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={editForm.price || ''}
                          onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Precio"
                        />
                        <input
                          type="number"
                          value={editForm.saved || ''}
                          onChange={(e) => setEditForm({...editForm, saved: parseFloat(e.target.value)})}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Ahorrado"
                        />
                      </div>
                      <select
                        value={editForm.priority || ''}
                        onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      >
                        {priorities.map(priority => (
                          <option key={priority} value={priority} className="capitalize">{priority}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditing(item.id)}
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
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.item}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(item)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteWishItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 capitalize">Prioridad: {item.priority}</p>
                      
                      {/* Indicador de disponibilidad de ahorros */}
                      <div className="mb-3 p-2 rounded-lg border">
                        {canAfford ? (
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">¡Puedes comprarlo!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                            <XCircle size={16} />
                            <span className="text-sm font-medium">No tienes suficientes ahorros</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {canAfford 
                            ? `Te quedarían ${formatCurrency(remainingAfterPurchase)} después de la compra`
                            : `Te faltan ${formatCurrency(item.price - totalSavings)}`
                          }
                        </div>
                      </div>

                      
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
