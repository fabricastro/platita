'use client'

import React, { useState, useEffect } from 'react'

interface MoneyInputProps {
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  placeholder = "Ej: 15.500,50",
  className = "",
  disabled = false,
  required = false
}) => {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Formatear número para mostrar en formato argentino
  const formatArgentineNumber = (num: number | string): string => {
    if (!num || num === '' || num === '0') return ''
    
    const number = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(number) || number === 0) return ''
    
    // Formatear manualmente para formato argentino: puntos para miles, coma para decimales
    const parts = number.toFixed(2).split('.')
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const decimalPart = parts[1]
    
    // Solo mostrar decimales si no son .00
    if (decimalPart && decimalPart !== '00') {
      return `${integerPart},${decimalPart}`
    }
    return integerPart
  }

  // Parsear input del usuario
  const parseUserInput = (input: string): number | null => {
    if (!input || input === '') return null
    
    let cleanInput = input.trim()
    
    // Contar puntos y comas
    const dotCount = (cleanInput.match(/\./g) || []).length
    const commaCount = (cleanInput.match(/,/g) || []).length
    
    if (dotCount > 1 || commaCount > 1) return null
    
    // Normalizar entrada
    if (commaCount === 1) {
      // Formato argentino: coma para decimales
      const parts = cleanInput.split(',')
      const integerPart = parts[0].replace(/\./g, '') // Remover puntos de miles
      const decimalPart = parts[1] || ''
      cleanInput = `${integerPart}.${decimalPart}`
    } else if (dotCount === 1) {
      // Solo punto - verificar si es separador de miles o decimal
      const parts = cleanInput.split('.')
      if (parts[1] && parts[1].length <= 2) {
        // Probablemente decimal - mantener como está
      } else {
        // Probablemente separador de miles
        cleanInput = cleanInput.replace(/\./g, '')
      }
    }
    
    const number = parseFloat(cleanInput)
    return isNaN(number) ? null : number
  }

  // Actualizar displayValue cuando cambia el value prop
  useEffect(() => {
    if (!isFocused) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      if (numValue && !isNaN(numValue) && numValue > 0) {
        setDisplayValue(formatArgentineNumber(numValue))
      } else {
        setDisplayValue('')
      }
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)
    
    const parsedNumber = parseUserInput(inputValue)
    if (parsedNumber !== null) {
      onChange(parsedNumber.toString())
    } else if (inputValue === '') {
      onChange('')
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    // Al enfocar, mostrar el valor sin formato
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (numValue && !isNaN(numValue) && numValue > 0) {
      setDisplayValue(numValue.toString())
    } else {
      setDisplayValue('')
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Al perder el foco, formatear el valor
    const parsedNumber = parseUserInput(displayValue)
    if (parsedNumber !== null && parsedNumber > 0) {
      const formattedValue = formatArgentineNumber(parsedNumber)
      setDisplayValue(formattedValue)
      onChange(parsedNumber.toString())
    } else {
      setDisplayValue('')
      onChange('')
    }
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${className}`}
      disabled={disabled}
      required={required}
    />
  )
}