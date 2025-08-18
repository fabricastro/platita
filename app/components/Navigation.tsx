'use client'

import React from 'react'
import Image from 'next/image'
import { Target, Wallet, TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-react'
import { TabType } from '../types'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

interface NavigationProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

const TabButton = ({ 
  tab, 
  icon: Icon, 
  children, 
  activeTab, 
  onClick 
}: { 
  tab: TabType
  icon: any
  children: React.ReactNode
  activeTab: TabType
  onClick: (tab: TabType) => void
}) => (
  <Button
    variant={activeTab === tab ? "default" : "outline"}
    onClick={() => onClick(tab)}
    className={cn(
      "flex items-center gap-2 font-medium transition-colors",
      activeTab === tab && "shadow-md"
    )}
  >
    <Icon size={18} />
    {children}
  </Button>
)

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logosf.png"
              alt="Platita Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold">platita</h1>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-center">
          <nav className="flex items-center space-x-2">
            <TabButton tab="dashboard" icon={TrendingUp} activeTab={activeTab} onClick={setActiveTab}>
              <span className="hidden sm:inline">Dashboard</span>
            </TabButton>
            <TabButton tab="salary" icon={DollarSign} activeTab={activeTab} onClick={setActiveTab}>
              <span className="hidden sm:inline">Ingresos</span>
            </TabButton>
            <TabButton tab="expenses" icon={TrendingDown} activeTab={activeTab} onClick={setActiveTab}>
              <span className="hidden sm:inline">Gastos</span>
            </TabButton>
            <TabButton tab="savings" icon={Wallet} activeTab={activeTab} onClick={setActiveTab}>
              <span className="hidden sm:inline">Ahorros</span>
            </TabButton>
            <TabButton tab="wishlist" icon={Target} activeTab={activeTab} onClick={setActiveTab}>
              <span className="hidden sm:inline">Lista</span>
            </TabButton>
            <TabButton tab="extra-income" icon={Plus} activeTab={activeTab} onClick={setActiveTab}>
              <span className="hidden sm:inline">Extra</span>
            </TabButton>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
