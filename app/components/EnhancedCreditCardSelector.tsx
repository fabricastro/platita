'use client'

import React, { useState, useEffect } from 'react'
import { Search, CreditCard, Plus, X, Loader2 } from 'lucide-react'
import { argentineCreditCards } from '../constants'
import { CreditCardForm, CreditCard as CreditCardType } from '../types'
import { toast } from 'sonner'

interface EnhancedCreditCardSelectorProps {
  selectedCardId?: string
  onCardSelect: (card: any) => void
  className?: string
}

export const EnhancedCreditCardSelector: React.FC<EnhancedCreditCardSelectorProps> = ({
  selectedCardId,
  onCardSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [userCreditCards, setUserCreditCards] = useState<CreditCardType[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [newCardForm, setNewCardForm] = useState<CreditCardForm>({
    name: '',
    bank: '',
    logo: '',
    color: '#3B82F6',
    closingDay: '15',
    dueDay: '5',
    limit: ''
  })

  // Cargar tarjetas del usuario
  useEffect(() => {
    loadUserCreditCards()
  }, [])

  // Buscar la tarjeta seleccionada por ID
  useEffect(() => {
    if (selectedCardId && userCreditCards.length > 0) {
      const card = userCreditCards.find(c => c.id === selectedCardId)
      if (card) {
        setSelectedCard(card)
      }
    }
  }, [selectedCardId, userCreditCards])

  const loadUserCreditCards = async () => {
    setIsLoadingCards(true)
    try {
      const response = await fetch('/api/credit-cards')
      if (response.ok) {
        const cards = await response.json()
        setUserCreditCards(cards)
      }
    } catch (error) {
      console.error('Error loading credit cards:', error)
    } finally {
      setIsLoadingCards(false)
    }
  }

  // Combinar tarjetas del usuario con tarjetas predefinidas para búsqueda
  const allCards = [...userCreditCards, ...argentineCreditCards]
  const filteredCards = allCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.bank.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCardSelect = (card: any) => {
    setSelectedCard(card)
    onCardSelect(card)
    setIsOpen(false)
    setSearchTerm('')
    setShowAddForm(false)
  }

  const handleAddNewCard = () => {
    setShowAddForm(true)
  }

  const handleCancelAdd = () => {
    setShowAddForm(false)
    setNewCardForm({
      name: '',
      bank: '',
      logo: '',
      color: '#3B82F6',
      closingDay: '15',
      dueDay: '5',
      limit: ''
    })
  }

  const handleSubmitNewCard = async () => {
    if (!newCardForm.name || !newCardForm.bank) {
      toast.error('Error al crear tarjeta', {
        description: 'Por favor, completa todos los campos requeridos',
        duration: 4000,
      })
      return
    }

    setIsCreatingCard(true)
    
    try {
      // Llamada a la API para crear la tarjeta
      const response = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCardForm.name,
          bank: newCardForm.bank,
          logo: newCardForm.logo || '/logos/default-card.png',
          color: newCardForm.color,
          closingDay: newCardForm.closingDay,
          dueDay: newCardForm.dueDay,
          limit: newCardForm.limit || null
        }),
      })

      if (response.ok) {
        const newCard = await response.json()
        
        // Actualizar la lista de tarjetas del usuario
        await loadUserCreditCards()
        
        // Seleccionar la nueva tarjeta creada
        handleCardSelect(newCard)
        
        // Limpiar el formulario
        handleCancelAdd()
        
        // Mostrar mensaje de éxito
        toast.success('Tarjeta creada exitosamente', {
          description: `${newCard.name} de ${newCard.bank} ha sido agregada`,
          duration: 4000,
        })
      } else {
        const errorData = await response.json()
        toast.error('Error al crear tarjeta', {
          description: errorData.error || 'Por favor, inténtalo de nuevo',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error al crear la tarjeta:', error)
      toast.error('Error al crear tarjeta', {
        description: 'Error de conexión, por favor inténtalo de nuevo',
        duration: 4000,
      })
    } finally {
      setIsCreatingCard(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between"
      >
        {selectedCard ? (
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-5 rounded"
              style={{ backgroundColor: selectedCard.color }}
            />
            <span className="text-sm">{selectedCard.name}</span>
            <span className="text-xs text-gray-500">• {selectedCard.bank}</span>
          </div>
        ) : (
          <span className="text-gray-500">Seleccionar tarjeta</span>
        )}
        <CreditCard size={16} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {!showAddForm ? (
            <>
              {/* Header con búsqueda y botón + */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar tarjeta o banco..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddNewCard}
                    className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title="Agregar nueva tarjeta"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {/* Lista de tarjetas */}
              <div className="p-2">
                {isLoadingCards ? (
                  <div className="text-center py-4">
                    <Loader2 size={20} className="animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      Cargando tarjetas...
                    </p>
                  </div>
                ) : filteredCards.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      No se encontraron tarjetas
                    </p>
                    <button
                      type="button"
                      onClick={handleAddNewCard}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      <Plus size={16} />
                      Agregar nueva tarjeta
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Tarjetas del usuario */}
                    {userCreditCards.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Mis Tarjetas
                        </div>
                        {userCreditCards
                          .filter(card =>
                            card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            card.bank.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((card) => (
                            <button
                              key={card.id}
                              onClick={() => handleCardSelect(card)}
                              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-6 rounded shadow-sm"
                                  style={{ backgroundColor: card.color }}
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {card.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {card.bank}
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    Cierre: {card.closingDay} • Vencimiento: {card.dueDay}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                      </>
                    )}
                    
                    {/* Tarjetas predefinidas */}
                    {argentineCreditCards
                      .filter(card =>
                        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        card.bank.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-2">
                          Tarjetas Disponibles
                        </div>
                        {argentineCreditCards
                          .filter(card =>
                            card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            card.bank.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((card, index) => (
                            <button
                              key={`preset-${index}`}
                              onClick={() => handleCardSelect(card)}
                              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors opacity-75 hover:opacity-100"
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-6 rounded shadow-sm"
                                  style={{ backgroundColor: card.color }}
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {card.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {card.bank}
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    Cierre: {card.closingDay} • Vencimiento: {card.dueDay}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Formulario para agregar nueva tarjeta */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Nueva Tarjeta
                  </h4>
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre de la tarjeta"
                    value={newCardForm.name}
                    onChange={(e) => setNewCardForm({...newCardForm, name: e.target.value})}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Banco"
                    value={newCardForm.bank}
                    onChange={(e) => setNewCardForm({...newCardForm, bank: e.target.value})}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Día de cierre"
                    value={newCardForm.closingDay}
                    onChange={(e) => setNewCardForm({...newCardForm, closingDay: e.target.value})}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    min="1"
                    max="31"
                  />
                  <input
                    type="number"
                    placeholder="Día de vencimiento"
                    value={newCardForm.dueDay}
                    onChange={(e) => setNewCardForm({...newCardForm, dueDay: e.target.value})}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    min="1"
                    max="31"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCardForm.color}
                    onChange={(e) => setNewCardForm({...newCardForm, color: e.target.value})}
                    className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Color de la tarjeta
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSubmitNewCard}
                    disabled={!newCardForm.name || !newCardForm.bank || isCreatingCard}
                    className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreatingCard ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Agregar Tarjeta'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    disabled={isCreatingCard}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
