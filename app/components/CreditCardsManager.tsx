'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, CreditCard, Banknote, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { CreditCard as CreditCardType, CreditCardForm } from '../types'
import { argentineCreditCards } from '../constants'

interface CreditCardsManagerProps {
  className?: string
}

export const CreditCardsManager: React.FC<CreditCardsManagerProps> = ({ className = '' }) => {
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([])
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [cardForm, setCardForm] = useState<CreditCardForm>({
    name: '',
    bank: '',
    logo: '',
    color: '#000000',
    closingDay: '15',
    dueDay: '5',
    limit: ''
  })

  // Cargar tarjetas del usuario
  useEffect(() => {
    fetchCreditCards()
  }, [])

  const fetchCreditCards = async () => {
    try {
      const response = await fetch('/api/credit-cards')
      if (response.ok) {
        const cards = await response.json()
        setCreditCards(cards)
      }
    } catch (error) {
      console.error('Error fetching credit cards:', error)
    }
  }

  const handleAddCard = async () => {
    // Validar campos requeridos
    const requiredFields = []
    if (!cardForm.name.trim()) requiredFields.push('Nombre de la tarjeta')
    if (!cardForm.bank.trim()) requiredFields.push('Banco emisor')
    if (!cardForm.closingDay) requiredFields.push('Día de cierre')
    if (!cardForm.dueDay) requiredFields.push('Día de vencimiento')
    
    if (requiredFields.length > 0) {
      toast.error('Campos incompletos', {
        description: `Faltan: ${requiredFields.join(', ')}`,
        duration: 4000,
      })
      return
    }

    // Validar días
    const closingDay = parseInt(cardForm.closingDay)
    const dueDay = parseInt(cardForm.dueDay)
    
    if (closingDay < 1 || closingDay > 31) {
      toast.error('Día de cierre inválido', {
        description: 'Debe estar entre 1 y 31',
        duration: 4000,
      })
      return
    }
    
    if (dueDay < 1 || dueDay > 31) {
      toast.error('Día de vencimiento inválido', {
        description: 'Debe estar entre 1 y 31',
        duration: 4000,
      })
      return
    }

    try {
      const response = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardForm),
      })

      if (response.ok) {
        const newCard = await response.json()
        setCreditCards([newCard, ...creditCards])
        setIsAddingCard(false)
        setCardForm({
          name: '',
          bank: '',
          logo: '',
          color: '#000000',
          closingDay: '15',
          dueDay: '5',
          limit: ''
        })
        
        toast.success('Tarjeta agregada exitosamente', {
          description: `${newCard.name} - ${newCard.bank}`,
          duration: 4000,
        })
      } else {
        const error = await response.json()
        toast.error('Error al agregar tarjeta', {
          description: error.error || 'Por favor, inténtalo de nuevo',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error adding credit card:', error)
      toast.error('Error al agregar tarjeta', {
        description: 'Por favor, inténtalo de nuevo',
        duration: 4000,
      })
    }
  }

  const handleUpdateCard = async (id: string) => {
    try {
      const response = await fetch(`/api/credit-cards?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardForm),
      })

      if (response.ok) {
        const updatedCard = await response.json()
        setCreditCards(creditCards.map(card => card.id === id ? updatedCard : card))
        setEditingCard(null)
        setCardForm({
          name: '',
          bank: '',
          logo: '',
          color: '#000000',
          closingDay: '15',
          dueDay: '5',
          limit: ''
        })
        
        toast.success('Tarjeta actualizada exitosamente', {
          description: `${updatedCard.name} - ${updatedCard.bank}`,
          duration: 4000,
        })
      } else {
        const error = await response.json()
        toast.error('Error al actualizar tarjeta', {
          description: error.error || 'Por favor, inténtalo de nuevo',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error updating credit card:', error)
      toast.error('Error al actualizar tarjeta', {
        description: 'Por favor, inténtalo de nuevo',
        duration: 4000,
      })
    }
  }

  const handleDeleteCard = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      return
    }

    try {
      const response = await fetch(`/api/credit-cards?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const deletedCard = creditCards.find(card => card.id === id)
        setCreditCards(creditCards.filter(card => card.id !== id))
        
        toast.success('Tarjeta eliminada exitosamente', {
          description: deletedCard ? `${deletedCard.name} - ${deletedCard.bank}` : '',
          duration: 4000,
        })
      } else {
        const error = await response.json()
        toast.error('Error al eliminar tarjeta', {
          description: error.error || 'Por favor, inténtalo de nuevo',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error deleting credit card:', error)
      toast.error('Error al eliminar tarjeta', {
        description: 'Por favor, inténtalo de nuevo',
        duration: 4000,
      })
    }
  }

  const startEditing = (card: CreditCardType) => {
    setEditingCard(card.id)
    setCardForm({
      name: card.name,
      bank: card.bank,
      logo: card.logo,
      color: card.color,
      closingDay: card.closingDay.toString(),
      dueDay: card.dueDay.toString(),
      limit: card.limit?.toString() || ''
    })
  }

  const cancelEditing = () => {
    setEditingCard(null)
    setCardForm({
      name: '',
      bank: '',
      logo: '',
      color: '#000000',
      closingDay: '15',
      dueDay: '5',
      limit: ''
    })
  }

  const selectPresetCard = (presetCard: any) => {
    setCardForm({
      name: presetCard.name,
      bank: presetCard.bank,
      logo: presetCard.logo,
      color: presetCard.color,
      closingDay: presetCard.closingDay.toString(),
      dueDay: presetCard.dueDay.toString(),
      limit: ''
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Mis Tarjetas de Crédito
            </h3>
          </div>
          
          <button
            onClick={() => setIsAddingCard(!isAddingCard)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            {isAddingCard ? 'Cancelar' : 'Agregar Tarjeta'}
          </button>
        </div>
      </div>

      {/* Formulario para agregar/editar tarjeta */}
      {(isAddingCard || editingCard) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {editingCard ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
          </h4>
          {!editingCard && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
              <div className="flex items-start gap-2">
                <div className="text-blue-500 mt-0.5">
                  <CreditCard size={16} />
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">💡 Ejemplo de configuración:</p>
                  <p className="text-xs">
                    <strong>Santander Visa Gold:</strong> Cierra el 28, vence el 05 del mes siguiente
                  </p>
                  <p className="text-xs">
                    <strong>Galicia Mastercard:</strong> Cierra el 15, vence el 05 del mes siguiente
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la tarjeta *
              </label>
              <input
                type="text"
                placeholder="Ej: Visa Gold, Mastercard Black"
                value={cardForm.name}
                onChange={(e) => setCardForm({...cardForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Banco emisor *
              </label>
              <input
                type="text"
                placeholder="Ej: Banco Santander, Galicia"
                value={cardForm.bank}
                onChange={(e) => setCardForm({...cardForm, bank: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL del logo (opcional)
              </label>
              <input
                type="text"
                placeholder="https://ejemplo.com/logo.png"
                value={cardForm.logo}
                onChange={(e) => setCardForm({...cardForm, logo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color de la tarjeta
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cardForm.color}
                  onChange={(e) => setCardForm({...cardForm, color: e.target.value})}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {cardForm.color}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Día de cierre *
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="28"
                  value={cardForm.closingDay}
                  onChange={(e) => setCardForm({...cardForm, closingDay: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  min="1"
                  max="31"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  del mes
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Día en que cierra el resumen mensual
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Día de vencimiento *
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="05"
                  value={cardForm.dueDay}
                  onChange={(e) => setCardForm({...cardForm, dueDay: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  min="1"
                  max="31"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  del mes
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Día límite para pagar sin intereses
              </p>
              {parseInt(cardForm.dueDay) < parseInt(cardForm.closingDay) && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ⚠️ El vencimiento es antes que el cierre (normal para algunas tarjetas)
                </p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Límite de crédito (opcional)
              </label>
              <input
                type="number"
                placeholder="100000"
                value={cardForm.limit}
                onChange={(e) => setCardForm({...cardForm, limit: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                step="0.01"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Monto máximo disponible en la tarjeta
              </p>
            </div>
          </div>

          {/* Tarjetas predefinidas */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={16} className="text-blue-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tarjetas predefinidas argentinas (opcional)
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Haz clic en una tarjeta para pre-llenar el formulario con sus datos
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {argentineCreditCards.slice(0, 8).map((presetCard, index) => (
                <button
                  key={index}
                  onClick={() => selectPresetCard(presetCard)}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <div 
                    className="w-full h-5 rounded mb-2 shadow-sm"
                    style={{ backgroundColor: presetCard.color }}
                  />
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {presetCard.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {presetCard.bank}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Cierre: {presetCard.closingDay} • Vto: {presetCard.dueDay}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              O completa el formulario manualmente con los datos de tu tarjeta
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingCard ? () => handleUpdateCard(editingCard) : handleAddCard}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
            >
              {editingCard ? 'Actualizar Tarjeta' : 'Agregar Tarjeta'}
            </button>
            
            {!editingCard && (
              <button
                onClick={() => {
                  setCardForm({
                    name: '',
                    bank: '',
                    logo: '',
                    color: '#000000',
                    closingDay: '15',
                    dueDay: '5',
                    limit: ''
                  })
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Limpiar
              </button>
            )}
            
            <button
              onClick={editingCard ? cancelEditing : () => setIsAddingCard(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de tarjetas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {creditCards.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No tienes tarjetas de crédito registradas
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Agrega tu primera tarjeta para comenzar a hacer seguimiento
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map((card) => (
              <div key={card.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-12 h-8 rounded shadow-sm"
                    style={{ backgroundColor: card.color }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(card)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {card.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {card.bank}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar size={14} />
                    <span>Cierre: {card.closingDay} • Vencimiento: {card.dueDay}</span>
                  </div>
                  
                  {card.limit && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Banknote size={14} />
                      <span>Límite: ${card.limit.toLocaleString('es-AR')}</span>
                    </div>
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
