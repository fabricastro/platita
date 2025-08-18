# Refactorización del Finance Tracker

## Estructura de la Aplicación

La aplicación ha sido refactorizada para mejorar la mantenibilidad y organización del código. A continuación se describe la nueva estructura:

### 📁 Estructura de Carpetas

```
app/
├── components/           # Componentes reutilizables
│   ├── Navigation.tsx    # Navegación principal
│   ├── Dashboard.tsx     # Panel de resumen
│   ├── SalaryManager.tsx # Gestión de sueldo
│   ├── ExpensesManager.tsx # Gestión de gastos
│   ├── SavingsManager.tsx  # Gestión de ahorros
│   ├── WishlistManager.tsx # Gestión de lista de deseos
│   └── index.ts         # Exportaciones de componentes
├── hooks/               # Hooks personalizados
│   └── useFinanceData.ts # Hook para manejo de datos
├── types/               # Definiciones de tipos
│   └── index.ts         # Tipos TypeScript
├── utils/               # Utilidades
│   └── formatters.ts    # Funciones de formateo
├── constants/           # Constantes de la aplicación
│   └── index.ts         # Categorías, prioridades, etc.
└── page.tsx            # Página principal refactorizada
```

### 🧩 Componentes

#### **Navigation.tsx**
- Maneja la navegación entre las diferentes secciones
- Recibe `activeTab` y `setActiveTab` como props
- Contiene los botones de navegación con iconos

#### **Dashboard.tsx**
- Muestra el resumen financiero
- Calcula y presenta métricas clave
- Gastos por categoría del mes actual

#### **SalaryManager.tsx**
- Gestiona la configuración del sueldo mensual
- Implementa debounce para auto-guardado
- Muestra indicador de carga durante el guardado

#### **ExpensesManager.tsx**
- Maneja la creación, edición y eliminación de gastos
- Formulario para agregar nuevos gastos
- Lista de gastos con funcionalidad de edición inline

#### **SavingsManager.tsx**
- Gestiona los ahorros del usuario
- Formulario para registrar nuevos ahorros
- Historial de ahorros con opciones de edición

#### **WishlistManager.tsx**
- Administra la lista de deseos
- Muestra progreso de ahorro para cada artículo
- Tarjetas visuales con barras de progreso

### 🎣 Hooks Personalizados

#### **useFinanceData.ts**
- Centraliza la lógica de carga de datos
- Maneja el estado de la aplicación (user, expenses, savings, wishlist)
- Proporciona función `loadData()` para recargar datos

### 📋 Tipos TypeScript

#### **types/index.ts**
- Define todas las interfaces de la aplicación
- Incluye tipos para formularios y estados
- Mejora la seguridad de tipos y el IntelliSense

### 🛠 Utilidades

#### **formatters.ts**
- `formatCurrency()`: Formatea números como moneda argentina (ARS)
- `formatDate()`: Formatea fechas al formato local argentino

#### **constants/index.ts**
- Define categorías de gastos disponibles
- Niveles de prioridad para la lista de deseos

### 🔧 Beneficios de la Refactorización

1. **Separación de Responsabilidades**: Cada componente tiene una función específica
2. **Reutilización**: Los componentes pueden ser reutilizados fácilmente
3. **Mantenibilidad**: Código más fácil de mantener y debuggear
4. **Escalabilidad**: Estructura preparada para futuras expansiones
5. **Legibilidad**: Código más limpio y fácil de entender
6. **Tipado Fuerte**: Mejor experiencia de desarrollo con TypeScript

### 📊 Página Principal Refactorizada

La página principal (`page.tsx`) ahora es mucho más simple y limpia:
- Solo maneja el estado de navegación (`activeTab`)
- Utiliza el hook `useFinanceData` para los datos
- Renderiza condicionalmente los componentes según la tab activa
- Pasa las props necesarias a cada componente

### 🚀 Próximos Pasos Recomendados

1. **Testing**: Agregar tests unitarios para cada componente
2. **Optimización**: Implementar React.memo donde sea necesario
3. **Validación**: Agregar validación de formularios con librerías como Yup o Zod
4. **Estado Global**: Considerar Context API o Zustand si la aplicación crece
5. **Lazy Loading**: Implementar carga perezosa para componentes grandes
