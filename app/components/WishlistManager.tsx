'use client'

import React, { useState } from 'react'
import { Target, Trash2, Edit } from 'lucide-react'
import { WishItem, WishForm } from '../types'
import { formatCurrency } from '../utils/formatters'
import { priorities } from '../constants'

interface WishlistManagerProps {
  wishlist: WishItem[]
  setWishlist: (wishlist: WishItem[]) => void
}

export const WishlistManager: React.FC<WishlistManagerProps> = ({ wishlist, setWishlist }) => {
  const [editingWishItem, setEditingWishItem] = useState<string | null>(null)
  const [wishForm, setWishForm] = useState<WishForm>({
    item: '',
    price: '',
    priority: 'media',
    saved: '0'
  })

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

  const updateWishItem = async (id: string, updatedData: Partial<WishItem>) => {
    try {
      const response = await fetch(`/api/wishlist?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setWishlist(wishlist.map(item => item.id === id ? updatedItem : item))
        setEditingWishItem(null)
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <input
            type="number"
            placeholder="Ya ahorrado"
            value={wishForm.saved}
            onChange={(e) => setWishForm({...wishForm, saved: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={addWishItem}
            className="md:col-span-4 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center justify-center gap-2"
          >
            <Target size={18} />
            Agregar a Lista de Deseos
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Mi Lista de Deseos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 col-span-full">No hay artículos en tu lista de deseos</p>
          ) : (
            wishlist.map(item => {
              const progress = (item.saved / item.price) * 100
              return (
                <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  {editingWishItem === item.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        defaultValue={item.item}
                        onBlur={(e) => updateWishItem(item.id, { item: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        autoFocus
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          defaultValue={item.price}
                          onBlur={(e) => updateWishItem(item.id, { price: parseFloat(e.target.value) })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Precio"
                        />
                        <input
                          type="number"
                          defaultValue={item.saved}
                          onBlur={(e) => updateWishItem(item.id, { saved: parseFloat(e.target.value) })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Ahorrado"
                        />
                      </div>
                      <select
                        defaultValue={item.priority}
                        onChange={(e) => updateWishItem(item.id, { priority: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      >
                        {priorities.map(priority => (
                          <option key={priority} value={priority} className="capitalize">{priority}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.item}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingWishItem(item.id)}
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
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Ahorrado: {formatCurrency(item.saved)} / Falta: {formatCurrency(item.price - item.saved)}
                      </p>
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
