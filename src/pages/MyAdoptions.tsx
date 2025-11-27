import TopBar from '@/components/TopBar'
import { useEffect, useState } from 'react'
import * as api from '@/lib/api'
import AdoptCard from '@/components/AdoptCard'

export default function MyAdoptions() {
  const [adopted, setAdopted] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const adotanteIdStr = localStorage.getItem('adotanteId')
        if (!adotanteIdStr) {
          setAdopted([])
          setLoading(false)
          return
        }
        const id = Number(adotanteIdStr)
        const list = await api.getMyAdopted(id)
        setAdopted(list)
      } catch (err) {
        console.error('Erro ao buscar adotados', err)
        setAdopted([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#5C4A1F] mb-8">Meus Pets Adotados</h1>
        {loading ? (
          <p>Carregando...</p>
        ) : adopted.length === 0 ? (
          <p className="text-[#5C4A1F]">Você ainda não adotou nenhum pet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adopted.map((p: any) => (
              <AdoptCard
                key={p.id}
                id={p.id}
                type={(p.especie || '').toLowerCase().includes('gato') ? 'cat' : 'dog'}
                name={p.nome}
                description={p.descricao ?? p.descricaoSaude ?? ''}
                image={(p.imagens && p.imagens[0]) || '/assets/icon.png'}
                tags={[p.porte, p.sexo].filter(Boolean)}
                compatibility={undefined}
                hideAdoptButton={true}
                status="ADOTADO"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
