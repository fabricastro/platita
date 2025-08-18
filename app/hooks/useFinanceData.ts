'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Expense, Saving, WishItem, User } from '../types'

export const useFinanceData = () => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [savings, setSavings] = useState<Saving[]>([])
  const [wishlist, setWishlist] = useState<WishItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [userRes, expensesRes, savingsRes, wishlistRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/expenses'),
        fetch('/api/savings'),
        fetch('/api/wishlist')
      ])

      const userData = await userRes.json()
      const expensesData = await expensesRes.json()
      const savingsData = await savingsRes.json()
      const wishlistData = await wishlistRes.json()

      // Only set data if the response is valid and not an error
      if (userData && !userData.error) {
        setUser(userData)
      }
      
      // Ensure arrays are always set, even if API returns an error
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setSavings(Array.isArray(savingsData) ? savingsData : [])
      setWishlist(Array.isArray(wishlistData) ? wishlistData : [])
    } catch (error) {
      console.error('Error loading data:', error)
      // Set empty arrays as fallback
      setExpenses([])
      setSavings([])
      setWishlist([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status !== 'loading') {
      loadData()
    }
  }, [status, session])

  return {
    user,
    setUser,
    expenses,
    setExpenses,
    savings,
    setSavings,
    wishlist,
    setWishlist,
    loading: loading || status === 'loading',
    loadData,
    session,
    isAuthenticated: status === 'authenticated'
  }
}
