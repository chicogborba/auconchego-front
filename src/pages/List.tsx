import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import TopBar from '@/components/TopBar'
import AdoptCard from '@/components/AdoptCard'
import { usePets } from '@/contexts/PetsContext'
import { Search, Filter } from 'lucide-react'
import * as api from '@/lib/api'
import { Button } from '@/components/ui/button'

interface Filters {
  especie: string // 'Cachorro' | 'Gato' | 'Todos'
  porte: string // 'PEQUENO' | 'MEDIO' | 'GRANDE' | 'Todos'
  sexo: string // 'MACHO' | 'FEMEA' | 'Todos'
  status: string // 'DISPONIVEL' | 'RESERVADO' | 'ADOTADO' | 'Todos'
  vacinado: string // 'Sim' | 'Não' | 'Todos'
  castrado: string // 'Sim' | 'Não' | 'Todos'
  localizacao: string
  compatibilidadeMin: number
}

export default function List() {
  const [searchTerm, setSearchTerm] = useState('')
  const { pets } = usePets()

  const [filters, setFilters] = useState<Filters>({
    especie: 'Todos',
    porte: 'Todos',
    sexo: 'Todos',
    status: 'DISPONIVEL',
    vacinado: 'Todos',
    castrado: 'Todos',
    localizacao: '',
    compatibilidadeMin: 0,
  })

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

  // Filtra os pets baseado na busca e filtros
  const filteredPets = useMemo(() => {
    return allPets.filter(pet => {
      // Busca por texto
      const matchesSearch = !searchTerm || 
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false

      // Filtro de espécie
      if (filters.especie !== 'Todos') {
        const especieMatch = filters.especie === 'Cachorro' 
          ? (pet.type === 'dog' || pet.tags.some(t => t.toLowerCase().includes('cachorro')))
          : (pet.type === 'cat' || pet.tags.some(t => t.toLowerCase().includes('gato')))
        if (!especieMatch) return false
      }

      // Filtro de porte
      if (filters.porte !== 'Todos') {
        const porteMatch = pet.tags.some(tag => {
          const tagUpper = tag.toUpperCase()
          return tagUpper === filters.porte || tagUpper.includes(filters.porte)
        }) || (pet as any).size?.toUpperCase().includes(filters.porte === 'PEQUENO' ? 'PEQUENO' : filters.porte === 'MEDIO' ? 'MÉDIO' : 'GRANDE')
        if (!porteMatch) return false
      }

      // Filtro de sexo
      if (filters.sexo !== 'Todos') {
        const sexoMatch = pet.tags.some(tag => {
          const tagUpper = tag.toUpperCase()
          return tagUpper === filters.sexo
        })
        if (!sexoMatch) return false
      }

      // Filtro de status
      if (filters.status !== 'Todos') {
        if (pet.status !== filters.status) return false
      }

      // Filtro de vacinado
      if (filters.vacinado !== 'Todos') {
        const vacinado = (pet as any).vaccinated === true
        if (filters.vacinado === 'Sim' && !vacinado) return false
        if (filters.vacinado === 'Não' && vacinado) return false
      }

      // Filtro de castrado
      if (filters.castrado !== 'Todos') {
        const castrado = (pet as any).castrated === true
        if (filters.castrado === 'Sim' && !castrado) return false
        if (filters.castrado === 'Não' && castrado) return false
      }

      // Filtro de localização
      if (filters.localizacao) {
        const local = (pet as any).location || ''
        if (!local.toLowerCase().includes(filters.localizacao.toLowerCase())) return false
      }

      // Filtro de compatibilidade mínima
      if (filters.compatibilidadeMin > 0) {
        const compat = compatMap[pet.id] || 0
        if (compat < filters.compatibilidadeMin) return false
      }

      return true
    })
  }, [allPets, searchTerm, filters, compatMap])

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      especie: 'Todos',
      porte: 'Todos',
      sexo: 'Todos',
      status: 'DISPONIVEL',
      vacinado: 'Todos',
      castrado: 'Todos',
      localizacao: '',
      compatibilidadeMin: 0,
    })
    setSearchTerm('')
  }

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== 'Todos' && v !== 'DISPONIVEL' && v !== '' && v !== 0
  ).length

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
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#8B6914] w-6 h-6" />
            <Input
              type="text"
              placeholder="Buscar por nome, descrição ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 h-16 text-lg border-2 border-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] rounded-2xl bg-[#F5E6C3] placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] transition-all shadow-md"
            />
          </div>
        </div>

        {/* Filtros Horizontais */}
        <div className="max-w-7xl mx-auto mb-8 bg-white/50 backdrop-blur-sm rounded-3xl p-4 md:p-6 shadow-lg border-2 border-[#E8B563]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#5C4A1F] flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-[#5C4A1F] text-white rounded-full px-2 py-0.5 text-sm">
                  {activeFiltersCount}
                </span>
              )}
            </h2>
            <Button
              onClick={resetFilters}
              variant="outline"
              className="bg-[#FFF1BA] hover:bg-[#F5E6C3] text-[#5C4A1F] font-semibold rounded-xl border-2 border-[#5C4A1F] text-sm px-4 py-2"
            >
              Limpar
            </Button>
          </div>

          {/* Filtros em duas linhas horizontais */}
          <div className="space-y-4">
            {/* Primeira linha de filtros */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Filtro de Espécie */}
              <div>
                <label className="block text-xs font-semibold text-[#5C4A1F] mb-1">
                  Espécie
                </label>
                <select
                  value={filters.especie}
                  onChange={(e) => handleFilterChange('especie', e.target.value)}
                  className="w-full h-10 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] text-sm text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                >
                  <option value="Todos">Todos</option>
                  <option value="Cachorro">Cachorro</option>
                  <option value="Gato">Gato</option>
                </select>
              </div>

              {/* Filtro de Porte */}
              <div>
                <label className="block text-xs font-semibold text-[#5C4A1F] mb-1">
                  Porte
                </label>
                <select
                  value={filters.porte}
                  onChange={(e) => handleFilterChange('porte', e.target.value)}
                  className="w-full h-10 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] text-sm text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                >
                  <option value="Todos">Todos</option>
                  <option value="PEQUENO">Pequeno</option>
                  <option value="MEDIO">Médio</option>
                  <option value="GRANDE">Grande</option>
                </select>
              </div>

              {/* Filtro de Sexo */}
              <div>
                <label className="block text-xs font-semibold text-[#5C4A1F] mb-1">
                  Sexo
                </label>
                <select
                  value={filters.sexo}
                  onChange={(e) => handleFilterChange('sexo', e.target.value)}
                  className="w-full h-10 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] text-sm text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                >
                  <option value="Todos">Todos</option>
                  <option value="MACHO">Macho</option>
                  <option value="FEMEA">Fêmea</option>
                </select>
              </div>

              {/* Filtro de Status */}
              <div>
                <label className="block text-xs font-semibold text-[#5C4A1F] mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full h-10 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] text-sm text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                >
                  <option value="Todos">Todos</option>
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="RESERVADO">Reservado</option>
                  <option value="ADOTADO">Adotado</option>
                </select>
              </div>
            </div>

            {/* Segunda linha de filtros */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Filtro de Vacinado */}
              <div>
                <label className="block text-xs font-semibold text-[#5C4A1F] mb-1">
                  Vacinado
                </label>
                <select
                  value={filters.vacinado}
                  onChange={(e) => handleFilterChange('vacinado', e.target.value)}
                  className="w-full h-10 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] text-sm text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                >
                  <option value="Todos">Todos</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {/* Filtro de Castrado */}
              <div>
                <label className="block text-xs font-semibold text-[#5C4A1F] mb-1">
                  Castrado
                </label>
                <select
                  value={filters.castrado}
                  onChange={(e) => handleFilterChange('castrado', e.target.value)}
                  className="w-full h-10 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] text-sm text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                >
                  <option value="Todos">Todos</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {/* Filtro de Localização */}
              <div>
                <label className="block text-xs font-semibold text-[#5C4A1F] mb-1">
                  Localização
                </label>
                <Input
                  type="text"
                  placeholder="Cidade ou estado..."
                  value={filters.localizacao}
                  onChange={(e) => handleFilterChange('localizacao', e.target.value)}
                  className="h-10 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] text-sm text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                />
              </div>

              {/* Filtro de Compatibilidade Mínima */}
              <div>
                <label className="block text-xs font-semibold text-[#5C4A1F] mb-1">
                  Compatibilidade: {filters.compatibilidadeMin}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.compatibilidadeMin}
                  onChange={(e) => handleFilterChange('compatibilidadeMin', Number(e.target.value))}
                  className="w-full h-3 bg-[#F5E6C3] rounded-lg appearance-none cursor-pointer accent-[#FFBD59]"
                />
                <div className="flex justify-between text-xs text-[#8B6914] mt-0.5">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-center mb-6">
          <p className="text-lg text-[#8B6914]">
            {filteredPets.length} {filteredPets.length === 1 ? 'pet encontrado' : 'pets encontrados'}
          </p>
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
                    status={pet.status}
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
            <p className="text-[#8B6914] text-xl mb-4">
              Tente ajustar os filtros ou buscar com outros termos
            </p>
            <Button
              onClick={resetFilters}
              className="bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold rounded-xl border-2 border-[#5C4A1F] shadow-md"
            >
              Limpar Todos os Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
