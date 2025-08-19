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
  if (!value || value === '' || value === '0') return ''
  
  const number = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(number)) return ''
  
  // Usar Intl.NumberFormat para formato argentino consistente
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(number)
}



/**
 * Convierte un string con formato de precio argentino a número
 * Maneja tanto formato argentino (15.500,50) como internacional (15,500.50)
 * @param formattedValue - String con formato de precio
 * @returns Número o undefined si no es válido
 */
export const parsePriceInput = (formattedValue: string): number | undefined => {
  if (!formattedValue || formattedValue === '') return undefined
  
  // Remover espacios
  let cleanValue = formattedValue.trim()
  
  // Contar puntos y comas para determinar el formato
  const dotCount = (cleanValue.match(/\./g) || []).length
  const commaCount = (cleanValue.match(/,/g) || []).length
  
  if (dotCount > 1 || commaCount > 1) {
    return undefined // Formato inválido
  }
  
  if (dotCount === 1 && commaCount === 1) {
    // Ambos presentes - determinar cuál es el separador decimal
    const dotIndex = cleanValue.lastIndexOf('.')
    const commaIndex = cleanValue.lastIndexOf(',')
    
    if (commaIndex > dotIndex) {
      // Formato argentino: puntos para miles, coma para decimales
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
    } else {
      // Formato internacional: comas para miles, punto para decimales
      cleanValue = cleanValue.replace(/,/g, '')
    }
  } else if (dotCount === 1) {
    // Solo punto - determinar si es separador de miles o decimales
    const parts = cleanValue.split('.')
    const afterDot = parts[1]
    
    if (afterDot && afterDot.length <= 2) {
      // Probablemente decimal (ej: 123.45)
      // Mantener como está
    } else if (afterDot && afterDot.length === 3) {
      // Probablemente separador de miles (ej: 123.456)
      cleanValue = cleanValue.replace('.', '')
    }
  } else if (commaCount === 1) {
    // Solo coma - formato argentino para decimales
    cleanValue = cleanValue.replace(',', '.')
  }
  
  const number = parseFloat(cleanValue)
  return isNaN(number) ? undefined : number
}

/**
 * Limpia la descripción de un gasto removiendo el sufijo de cuotas si existe
 * @param description - Descripción que puede contener formato "(1/12)"
 * @returns Descripción limpia sin el sufijo de cuotas
 */
export const cleanInstallmentDescription = (description: string): string => {
  return description.replace(/\s*\(\d+\/\d+\)$/, '')
}
