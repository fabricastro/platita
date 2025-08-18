'use client'

import React, { useState } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { TabType } from './types'
import { useFinanceData } from './hooks/useFinanceData'
import { 
  Navigation, 
  Dashboard, 
  SalaryManager, 
  ExpensesManager, 
  SavingsManager, 
  WishlistManager 
} from './components'

const FinanceTracker = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const {
    user,
    setUser,
    expenses,
    setExpenses,
    savings,
    setSavings,
    wishlist,
    setWishlist,
    loading,
    session,
    isAuthenticated
  } = useFinanceData()

  // Cálculo del total de ahorros
  const totalSavings = savings.reduce((sum, sav) => sum + sav.amount, 0)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Redirigiendo...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto py-6 px-4">
        {/* Header con información del usuario */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Mi Administrador Financiero
            </h1>
            <p className="text-muted-foreground">
              Gestiona tus finanzas de manera inteligente
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User size={16} />
              <span>{session?.user?.name || session?.user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <Dashboard 
            user={user} 
            expenses={expenses} 
            totalSavings={totalSavings} 
          />
        )}

        {activeTab === 'salary' && (
          <SalaryManager 
            user={user} 
            setUser={setUser} 
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesManager 
            expenses={expenses} 
            setExpenses={setExpenses} 
          />
        )}

        {activeTab === 'savings' && (
          <SavingsManager 
            savings={savings} 
            setSavings={setSavings} 
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistManager 
            wishlist={wishlist} 
            setWishlist={setWishlist} 
          />
        )}
      </main>
    </div>
  )
}

export default FinanceTracker
