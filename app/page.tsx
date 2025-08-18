'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { LogOut, User } from 'lucide-react'
import { TabType } from './types'
import { useFinanceData } from './hooks/useFinanceData'
import { useSessionManager } from './hooks/useSessionManager'
import { 
  Navigation, 
  Dashboard, 
  SalaryManager, 
  ExpensesManager, 
  SavingsManager, 
  WishlistManager,
  ExtraIncomeManager
} from './components'

const FinanceTracker = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const { signOut: handleSignOut } = useSessionManager()
  const {
    user,
    setUser,
    expenses,
    setExpenses,
    savings,
    setSavings,
    wishlist,
    setWishlist,
    extraIncome,
    setExtraIncome,
    loading,
    session,
    isAuthenticated
  } = useFinanceData()

  // Cálculo del total de ahorros - memoizado para evitar recálculos innecesarios
  const totalSavings = useMemo(() => 
    savings.reduce((sum, sav) => sum + sav.amount, 0), 
    [savings]
  )

  // Memoizar el handler de cambio de tab
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

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
      <Navigation activeTab={activeTab} setActiveTab={handleTabChange} />
      
      <main className="container mx-auto py-6 px-4">
        {/* Header con información del usuario */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <p className="text-muted-foreground">
              Gestiona tu platita de manera inteligente
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
            extraIncome={extraIncome}
          />
        )}

        {activeTab === 'salary' && (
          <SalaryManager 
            user={user} 
            setUser={setUser} 
            extraIncome={extraIncome}
            setExtraIncome={setExtraIncome}
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
            savings={savings}
          />
        )}

        {activeTab === 'extra-income' && (
          <ExtraIncomeManager 
            extraIncome={extraIncome} 
            setExtraIncome={setExtraIncome} 
          />
        )}
      </main>
    </div>
  )
}

export default FinanceTracker
