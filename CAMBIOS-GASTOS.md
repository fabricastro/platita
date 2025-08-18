# Implementación de Tipos de Gastos

## Resumen de Cambios

Se han implementado dos tipos de gastos en la aplicación:

### 1. Gastos Únicos
- Gastos de una sola vez que se registran en el mes actual
- Funcionamiento similar al sistema anterior
- Identificados con el tipo `"unico"`

### 2. Gastos de Tarjeta
- Gastos recurrentes que se pueden dividir en cuotas
- Se puede seleccionar el número de cuotas (1-36)
- Cada cuota se registra como un gasto individual en meses consecutivos
- Identificados con el tipo `"tarjeta"`

## Archivos Modificados

### 1. Tipos TypeScript (`app/types/index.ts`)
- Agregado tipo `ExpenseType = 'unico' | 'tarjeta'`
- Extendida interfaz `Expense` con campos opcionales:
  - `type`: Tipo de gasto
  - `installments`: Número total de cuotas
  - `currentInstallment`: Cuota actual
  - `totalAmount`: Monto total antes de dividir en cuotas
- Extendida interfaz `ExpenseForm` para manejar los nuevos campos

### 2. Schema de Base de Datos (`prisma/schema.prisma`)
- Agregado campo `type` (String, default "unico")
- Agregados campos opcionales para gastos de tarjeta:
  - `installments` (Int?)
  - `currentInstallment` (Int?)
  - `totalAmount` (Float?)

### 3. API de Gastos (`app/api/expenses/route.ts`)
- Actualizado método POST para manejar gastos de tarjeta:
  - Crea múltiples registros (uno por cuota)
  - Calcula fechas mensuales consecutivas
  - Divide el monto total entre las cuotas
- Actualizado método PUT para incluir nuevos campos

### 4. Componente de Gastos (`app/components/ExpensesManager.tsx`)
- Agregado selector de tipo de gasto con botones visuales
- Formulario dinámico que cambia según el tipo seleccionado:
  - Gasto único: Campo de monto simple
  - Gasto de tarjeta: Campos de monto total y número de cuotas
- Vista previa del cálculo de cuotas
- Visualización mejorada de gastos en la lista:
  - Iconos diferenciados (Receipt vs CreditCard)
  - Indicador de cuota actual para gastos de tarjeta
  - Colores diferenciados (azul para únicos, verde para tarjeta)

## Funcionalidades

### Gastos Únicos
1. Seleccionar "Gasto Único"
2. Completar descripción, monto, categoría y fecha
3. El gasto se registra una sola vez

### Gastos de Tarjeta
1. Seleccionar "Gasto de Tarjeta"
2. Completar descripción, monto total, número de cuotas, categoría y fecha
3. El sistema crea automáticamente:
   - Un registro por cada cuota
   - Fechas mensuales consecutivas
   - Monto dividido equitativamente
   - Descripción con indicador de cuota (ej: "Compra (1/12)")

## Migración de Base de Datos

Se ha creado el archivo `migration-add-expense-types.sql` con las consultas SQL necesarias para actualizar la base de datos. Ejecutar cuando tengas conexión:

```sql
-- Agregar columnas para tipos de gastos
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'unico';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS installments INTEGER;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS currentInstallment INTEGER;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS totalAmount DECIMAL(10,2);

-- Actualizar gastos existentes
UPDATE expenses SET type = 'unico' WHERE type IS NULL;

-- Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_user_type ON expenses(userId, type);
```

## Próximos Pasos

1. **Aplicar migración**: Ejecutar el archivo SQL cuando tengas conexión a la base de datos
2. **Generar cliente Prisma**: Ejecutar `npx prisma generate` después de la migración
3. **Pruebas**: Verificar que ambos tipos de gastos funcionen correctamente
4. **Optimizaciones opcionales**:
   - Agregar filtros por tipo de gasto
   - Implementar vista agrupada de gastos de tarjeta
   - Agregar notificaciones para cuotas próximas

## Beneficios

- **Mejor organización**: Separación clara entre gastos únicos y recurrentes
- **Planificación mejorada**: Visualización de cuotas futuras
- **Flexibilidad**: Manejo de diferentes tipos de gastos con una sola interfaz
- **Usabilidad**: Interfaz intuitiva con indicadores visuales claros
