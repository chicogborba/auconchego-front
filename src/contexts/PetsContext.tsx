import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Pet } from '@/data/petsData'
import * as api from '@/lib/api'

interface PetsContextType {
  pets: Record<string, Pet>
  // Async operations that call backend and update local state
  addPet: (pet: any) => Promise<void>
  updatePet: (id: number, pet: any) => Promise<void>
  deletePet: (id: number) => Promise<void>
  getPetById: (id: number) => Pet | undefined
}

const PetsContext = createContext<PetsContextType | undefined>(undefined)

const STORAGE_KEY = 'auconchego_pets'

export function PetsProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Record<string, Pet>>(() => {
    // Try to load from localStorage if available (but do NOT fall back to
    // demo/mock data). If nothing stored, start with an empty list so the
    // UI reflects the backend state (or absence of it) instead of showing
    // hard-coded mocks when the API is unreachable.
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Erro ao carregar pets do localStorage:', e)
        return {}
      }
    }
    return {}
  })

  // Persist local cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets))
  }, [pets])

  // On mount try to load from backend
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const list = await api.getPets()
        if (!mounted) return
        const asRecord: Record<string, Pet> = {}
        list.forEach((p: Pet) => {
          asRecord[p.id] = p
        })
        setPets(asRecord)
      } catch (e) {
        // If backend call fails, clear pets so the UI does not show demo/mock
        // data. Log the error for debugging.
        console.warn('Could not load pets from backend:', e)
        if (mounted) setPets({})
      }
    })()
    return () => { mounted = false }
  }, [])

  const addPet = async (petData: any) => {
    try {
      const created = await api.createPet(petData as any)
      setPets(prev => ({ ...prev, [created.id]: created }))
    } catch (error) {
      console.error('Erro ao criar pet:', error)
      throw error
    }
  }

  const updatePet = async (id: number, petData: any) => {
    try {
      const updated = await api.updatePet(id, petData as any)
      setPets(prev => ({ ...prev, [updated.id]: updated }))
    } catch (error) {
      console.error('Erro ao atualizar pet:', error)
      throw error
    }
  }

  const deletePet = async (id: number) => {
    try {
      await api.deletePet(id)
      setPets(prev => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
    } catch (error) {
      console.error('Erro ao deletar pet:', error)
      throw error
    }
  }

  const getPetById = (id: number) => {
    return pets[id]
  }

  return (
    <PetsContext.Provider value={{ pets, addPet, updatePet, deletePet, getPetById }}>
      {children}
    </PetsContext.Provider>
  )
}

export function usePets() {
  const context = useContext(PetsContext)
  if (!context) {
    throw new Error('usePets must be used within PetsProvider')
  }
  return context
}
