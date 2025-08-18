'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSessionManager } from './useSessionManager'
import { Expense, Saving, WishItem, User, ExtraIncome } from '../types'

export const useFinanceData = () => {
  const { session, status, isAuthenticated, isLoading: sessionLoading } = useSessionManager()
  const [user, setUser] = useState<User | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [savings, setSavings] = useState<Saving[]>([])
  const [wishlist, setWishlist] = useState<WishItem[]>([])
  const [extraIncome, setExtraIncome] = useState<ExtraIncome[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const loadData = useCallback(async (forceRefresh = false) => {
    // Evitar recargar si ya tenemos datos y la sesión es la misma, a menos que se fuerce
    if (!isAuthenticated || !session?.user || (dataLoaded && !forceRefresh)) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [userRes, expensesRes, savingsRes, wishlistRes, extraIncomeRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/expenses'),
        fetch('/api/savings'),
        fetch('/api/wishlist'),
        fetch('/api/extra-income')
      ])

      const userData = await userRes.json()
      const expensesData = await expensesRes.json()
      const savingsData = await savingsRes.json()
      const wishlistData = await wishlistRes.json()
      const extraIncomeData = await extraIncomeRes.json()

      // Only set data if the response is valid and not an error
      if (userData && !userData.error) {
        setUser(userData)
      }
      
      // Ensure arrays are always set, even if API returns an error
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setSavings(Array.isArray(savingsData) ? savingsData : [])
      setWishlist(Array.isArray(wishlistData) ? wishlistData : [])
      setExtraIncome(Array.isArray(extraIncomeData) ? extraIncomeData : [])
      
      setDataLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
      // Set empty arrays as fallback
      setExpenses([])
      setSavings([])
      setWishlist([])
      setExtraIncome([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, session, dataLoaded])

  // Función para recargar datos manualmente
  const refreshData = useCallback(() => {
    setDataLoaded(false)
    setRefreshTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (!sessionLoading) {
      loadData()
    }
  }, [loadData, refreshTrigger, sessionLoading])

  // Memoizar el valor de loading para evitar cambios innecesarios
  const isLoading = useMemo(() => {
    return loading || sessionLoading
  }, [loading, sessionLoading])

  return {
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
    loading: isLoading,
    loadData,
    refreshData,
    session,
    isAuthenticated
  }
}
