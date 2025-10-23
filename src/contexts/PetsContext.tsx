import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { petsData as initialPetsData } from '@/data/petsData'
import type { Pet } from '@/data/petsData'

interface PetsContextType {
  pets: Record<string, Pet>
  addPet: (pet: Omit<Pet, 'id'>) => void
  updatePet: (id: number, pet: Partial<Pet>) => void
  deletePet: (id: number) => void
  getPetById: (id: number) => Pet | undefined
}

const PetsContext = createContext<PetsContextType | undefined>(undefined)

const STORAGE_KEY = 'auconchego_pets'

export function PetsProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Record<string, Pet>>(() => {
    // Tenta carregar do localStorage, senão usa os dados iniciais
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Erro ao carregar pets do localStorage:', e)
        return initialPetsData
      }
    }
    return initialPetsData
  })

  // Salva no localStorage sempre que os pets mudarem
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets))
  }, [pets])

  const addPet = (petData: Omit<Pet, 'id'>) => {
    const newId = Math.max(...Object.values(pets).map(p => p.id), 0) + 1
    const newPet: Pet = {
      ...petData,
      id: newId,
    }
    setPets(prev => ({
      ...prev,
      [newId]: newPet,
    }))
  }

  const updatePet = (id: number, petData: Partial<Pet>) => {
    setPets(prev => {
      const existing = prev[id]
      if (!existing) return prev
      
      return {
        ...prev,
        [id]: {
          ...existing,
          ...petData,
        },
      }
    })
  }

  const deletePet = (id: number) => {
    setPets(prev => {
      const newPets = { ...prev }
      delete newPets[id]
      return newPets
    })
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
