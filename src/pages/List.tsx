import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import TopBar from '@/components/TopBar'
import AdoptCard from '@/components/AdoptCard'
import { usePets } from '@/contexts/PetsContext'
import { Search } from 'lucide-react'
import * as api from '@/lib/api'

export default function List() {
  const [searchTerm, setSearchTerm] = useState('')
  const { pets } = usePets()

  // Usa os pets do contexto
  const allPets = Object.values(pets)
  const [compatMap, setCompatMap] = useState<Record<number, number>>({})

  useEffect(() => {
    const adotanteIdStr = localStorage.getItem('adotanteId')
    if (!adotanteIdStr) return
    const id = Number(adotanteIdStr)
    if (Number.isNaN(id)) return
    let mounted = true
    api.getAdotanteCompatibility(id).then((rels: any[]) => {
      if (!mounted) return
      const map: Record<number, number> = {}
      for (const r of rels) {
        if (r.idPet !== undefined && r.compatibilidade !== undefined) map[r.idPet] = r.compatibilidade
      }
      setCompatMap(map)
    }).catch(err => {
      console.warn('Failed to load compatibilidade', err)
    })
    return () => { mounted = false }
  }, [pets])

  // Filtra os pets baseado na busca
  const filteredPets = allPets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#5C4A1F] mb-4">
            Adote seu novo companheiro
          </h1>
          <p className="text-xl text-[#8B6914]">
            Encontre o pet perfeito para você
          </p>
        </div>

        {/* Campo de Busca */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#8B6914] w-6 h-6" />
            <Input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 h-16 text-lg border-2 border-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] rounded-2xl bg-[#F5E6C3] placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] transition-all shadow-md"
            />
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="flex justify-center">
                <AdoptCard
                    id={pet.id}
                    type={pet.type}
                    name={pet.name}
                    description={pet.description}
                    image={pet.images[0]}
                    tags={pet.tags}
                    compatibility={compatMap[pet.id]}
                    status={pet.status}   // 👈 vem do backend via mapBackendToFrontend
                />

            </div>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredPets.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-3xl font-bold text-[#5C4A1F] mb-4">
              Nenhum pet encontrado
            </h3>
            <p className="text-[#8B6914] text-xl">
              Tente buscar com outros termos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
