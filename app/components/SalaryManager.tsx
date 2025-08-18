'use client'

import React, { useState, useEffect } from 'react'
import { User } from '../types'
import { formatCurrency } from '../utils/formatters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, DollarSign, Save, AlertCircle } from 'lucide-react'

interface SalaryManagerProps {
  user: User | null
  setUser: (user: User | null) => void
}

export const SalaryManager: React.FC<SalaryManagerProps> = ({ user, setUser }) => {
  const [salaryInput, setSalaryInput] = useState('')
  const [savingSalary, setSavingSalary] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    const currentSalary = user?.salary?.toString() || ''
    setSalaryInput(currentSalary)
    setHasUnsavedChanges(false)
  }, [user?.salary])

  const handleSalaryInputChange = (value: string) => {
    setSalaryInput(value)
    const currentSalary = user?.salary?.toString() || ''
    setHasUnsavedChanges(value !== currentSalary)
  }

  const handleSaveSalary = async () => {
    const newSalary = parseFloat(salaryInput) || 0
    
    if (newSalary < 0) {
      alert('El sueldo no puede ser negativo')
      return
    }

    try {
      setSavingSalary(true)
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salary: newSalary }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setSalaryInput(updatedUser.salary?.toString() || '')
        setHasUnsavedChanges(false)
      } else {
        throw new Error('Error al guardar el sueldo')
      }
    } catch (error) {
      console.error('Error updating salary:', error)
      alert('Error al guardar el sueldo. Por favor, intenta de nuevo.')
    } finally {
      setSavingSalary(false)
    }
  }

  const handleDiscardChanges = () => {
    const currentSalary = user?.salary?.toString() || ''
    setSalaryInput(currentSalary)
    setHasUnsavedChanges(false)
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configurar Sueldo
          </CardTitle>
          <CardDescription>
            Define tu sueldo mensual para un mejor seguimiento de tus finanzas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="salary">Sueldo Mensual</Label>
            <Input
              id="salary"
              type="number"
              value={salaryInput}
              onChange={(e) => handleSalaryInputChange(e.target.value)}
              placeholder="Ingresa tu sueldo mensual"
              disabled={savingSalary}
            />
            {hasUnsavedChanges && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Tienes cambios sin guardar
              </p>
            )}
          </div>

          {hasUnsavedChanges && (
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveSalary} 
                disabled={savingSalary}
                className="flex-1"
              >
                {savingSalary ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDiscardChanges}
                disabled={savingSalary}
              >
                Descartar
              </Button>
            </div>
          )}
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Sueldo actual</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(user?.salary || 0)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
