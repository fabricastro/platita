'use client'

import React from 'react'
import { User, Expense } from '../types'
import { formatCurrency } from '../utils/formatters'
import { categories } from '../constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react'

interface DashboardProps {
  user: User | null
  expenses: Expense[]
  totalSavings: number
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className = "" 
}: { 
  title: string
  value: string
  icon: React.ElementType
  trend?: 'positive' | 'negative' | 'neutral'
  className?: string 
}) => {
  const trendColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400', 
    neutral: 'text-blue-600 dark:text-blue-400'
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${trend ? trendColors[trend] : 'text-foreground'}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

export const Dashboard: React.FC<DashboardProps> = ({ user, expenses, totalSavings }) => {
  // Cálculos
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyExpenses = expenses
    .filter(exp => exp.date.startsWith(currentMonth))
    .reduce((sum, exp) => sum + exp.amount, 0)
  
  const availableMoney = (user?.salary || 0) - monthlyExpenses

  // Gastos por categoría del mes actual
  const expensesByCategory = categories.map(category => {
    const categoryExpenses = expenses
      .filter(exp => exp.category === category && exp.date.startsWith(currentMonth))
      .reduce((sum, exp) => sum + exp.amount, 0)
    return { category, amount: categoryExpenses }
  }).filter(cat => cat.amount > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sueldo Mensual"
          value={formatCurrency(user?.salary || 0)}
          icon={DollarSign}
          trend="positive"
        />
        
        <StatCard
          title="Gastos este Mes"
          value={formatCurrency(monthlyExpenses)}
          icon={TrendingDown}
          trend="negative"
        />
        
        <StatCard
          title="Disponible"
          value={formatCurrency(availableMoney)}
          icon={Wallet}
          trend={availableMoney >= 0 ? 'neutral' : 'negative'}
        />

        <StatCard
          title="Total Ahorrado"
          value={formatCurrency(totalSavings)}
          icon={TrendingUp}
          trend="positive"
        />
      </div>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
          <CardDescription>
            Distribución de gastos del mes actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expensesByCategory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay gastos registrados este mes
              </p>
            ) : (
              expensesByCategory.map(({ category, amount }) => (
                <div key={category} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="capitalize text-sm font-medium">{category}</span>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
