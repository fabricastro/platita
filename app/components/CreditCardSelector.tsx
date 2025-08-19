'use client'

import React, { useState } from 'react'
import { Search, CreditCard } from 'lucide-react'
import { argentineCreditCards } from '../constants'

interface CreditCardSelectorProps {
  selectedCardId?: string
  onCardSelect: (card: any) => void
  onAddNewCard?: () => void
  className?: string
}

export const CreditCardSelector: React.FC<CreditCardSelectorProps> = ({
  selectedCardId,
  onCardSelect,
  onAddNewCard,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCard, setSelectedCard] = useState<any>(null)

  // Buscar la tarjeta seleccionada por ID
  React.useEffect(() => {
    if (selectedCardId) {
      const card = argentineCreditCards.find(c => c.id === selectedCardId)
      if (card) {
        setSelectedCard(card)
      }
    }
  }, [selectedCardId])

  const filteredCards = argentineCreditCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.bank.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCardSelect = (card: any) => {
    setSelectedCard(card)
    onCardSelect(card)
    setIsOpen(false)
    setSearchTerm('')
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
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-y-auto">
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
              
              {onAddNewCard && (
                <button
                  type="button"
                  onClick={() => {
                    onAddNewCard()
                    setIsOpen(false)
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Agregar nueva tarjeta"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="p-2">
            {filteredCards.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No se encontraron tarjetas
                </p>
                {onAddNewCard && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddNewCard()
                      setIsOpen(false)
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar nueva tarjeta
                  </button>
                )}
              </div>
            ) : (
              filteredCards.map((card, index) => (
                <button
                  key={`${card.name}-${card.bank}-${index}`}
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
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
