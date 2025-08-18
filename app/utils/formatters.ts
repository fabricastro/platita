// Función para formatear moneda en pesos argentinos
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount)
}

// Función para formatear fecha
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Formatea un número para mostrar en inputs con separadores de miles y centavos
 * @param value - Valor numérico o string
 * @returns String formateado con separadores
 */
export const formatNumberInput = (value: number | string): string => {
  if (!value || value === '') return ''
  
  // Convertir a string y remover caracteres no numéricos excepto punto
  const stringValue = value.toString().replace(/[^\d.]/g, '')
  
  // Si es solo un punto, retornar "0."
  if (stringValue === '.') return '0.'
  
  // Separar parte entera y decimal
  const parts = stringValue.split('.')
  const integerPart = parts[0] || '0'
  const decimalPart = parts[1] || ''
  
  // Formatear parte entera con separadores de miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // Si hay parte decimal, agregarla
  if (decimalPart) {
    return `${formattedInteger}.${decimalPart}`
  }
  
  return formattedInteger
}

/**
 * Convierte un string formateado (con separadores) a número
 * @param formattedValue - String con separadores de miles
 * @returns Número o undefined si no es válido
 */
export const parseFormattedNumber = (formattedValue: string): number | undefined => {
  if (!formattedValue || formattedValue === '') return undefined
  
  // Remover separadores de miles y convertir a número
  const cleanValue = formattedValue.replace(/,/g, '')
  const number = parseFloat(cleanValue)
  
  return isNaN(number) ? undefined : number
}

/**
 * Formatea un número para mostrar en inputs de precio con formato argentino
 * @param value - Valor numérico o string
 * @returns String formateado con separadores argentinos
 */
export const formatPriceInput = (value: number | string): string => {
  if (!value || value === '') return ''
  
  // Convertir a string y remover caracteres no numéricos excepto punto
  const stringValue = value.toString().replace(/[^\d.]/g, '')
  
  // Si es solo un punto, retornar "0."
  if (stringValue === '.') return '0.'
  
  // Separar parte entera y decimal
  const parts = stringValue.split('.')
  const integerPart = parts[0] || '0'
  const decimalPart = parts[1] || ''
  
  // Formatear parte entera con separadores de miles (punto para miles, coma para decimales)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  // Si hay parte decimal, agregarla con coma
  if (decimalPart) {
    return `${formattedInteger},${decimalPart}`
  }
  
  return formattedInteger
}

/**
 * Convierte un string formateado argentino a número
 * @param formattedValue - String con formato argentino (punto para miles, coma para decimales)
 * @returns Número o undefined si no es válido
 */
export const parseFormattedPrice = (formattedValue: string): number | undefined => {
  if (!formattedValue || formattedValue === '') return undefined
  
  // Reemplazar punto por nada (separador de miles) y coma por punto (separador decimal)
  const cleanValue = formattedValue.replace(/\./g, '').replace(/,/g, '.')
  const number = parseFloat(cleanValue)
  
  return isNaN(number) ? undefined : number
}

/**
 * Formatea un número mientras se escribe, permitiendo comas como decimales
 * @param value - String que se está escribiendo
 * @returns String formateado con separadores de miles
 */
export const formatPriceWhileTyping = (value: string): string => {
  if (!value || value === '') return ''
  
  // Si termina en coma, mantenerla (indica que se está escribiendo decimal)
  const endsWithComma = value.endsWith(',')
  const endsWithDot = value.endsWith('.')
  
  // Remover la coma o punto final temporalmente para formatear
  let valueToFormat = value
  if (endsWithComma || endsWithDot) {
    valueToFormat = value.slice(0, -1)
  }
  
  // Separar parte entera y decimal
  const parts = valueToFormat.split(',')
  const integerPart = parts[0] || '0'
  const decimalPart = parts[1] || ''
  
  // Formatear parte entera con separadores de miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  // Reconstruir el valor
  let result = formattedInteger
  if (decimalPart) {
    result += `,${decimalPart}`
  }
  if (endsWithComma) {
    result += ','
  } else if (endsWithDot) {
    result += '.'
  }
  
  return result
}

/**
 * Convierte un string con formato de precio a número, manejando comas como decimales
 * @param formattedValue - String con formato de precio
 * @returns Número o undefined si no es válido
 */
export const parsePriceInput = (formattedValue: string): number | undefined => {
  if (!formattedValue || formattedValue === '') return undefined
  
  // Remover separadores de miles (puntos) y convertir coma a punto decimal
  const cleanValue = formattedValue.replace(/\./g, '').replace(/,/g, '.')
  const number = parseFloat(cleanValue)
  
  return isNaN(number) ? undefined : number
}
