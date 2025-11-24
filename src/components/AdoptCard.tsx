import { Button } from '@/components/ui/button'
import { Cat, Dog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface AdoptCardProps {
  id: number
  type: 'cat' | 'dog'
  name: string
  description: string
  image: string
  tags: string[]
  compatibility?: number
  onAdopt?: () => void
  onDetails?: () => void
}

export default function AdoptCard({
  id,
  type,
  name,
  description,
  image,
  tags,
  compatibility,
}: AdoptCardProps) {
  const navigate = useNavigate()

  const handleAdopt = () => {
    navigate(`/animal/${id}`)
  }

  const handleDetails = () => {
    navigate(`/animal/${id}`)
  }
  return (
    <div className="bg-[#F5E6C3] rounded-3xl overflow-hidden shadow-lg max-w-md w-full border-2 border-[#5C4A1F]/20">
      {/* Imagem do Pet com Badge do Tipo */}
      <div className="relative h-64">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        {/* Badge de Tipo (Gato/Cachorro) */}
        <div className="absolute top-4 right-4 bg-[#F5E6C3] rounded-full px-4 py-2 flex items-center gap-2 border-2 border-[#5C4A1F]">
          {type === 'cat' ? (
            <>
              <Cat className="w-5 h-5 text-[#5C4A1F]" />
              <span className="font-bold text-[#5C4A1F]">Gato</span>
            </>
          ) : (
            <>
              <Dog className="w-5 h-5 text-[#5C4A1F]" />
              <span className="font-bold text-[#5C4A1F]">Cachorro</span>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-6">
        {/* Compatibilidade (se disponível) */}
        {typeof compatibility !== 'undefined' && (
          <div className="mb-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#EAF7E9] text-green-800 font-semibold border border-green-200">Compatibilidade: {Math.round(compatibility)}%</span>
          </div>
        )}
        {/* Nome */}
        <h3 className="text-3xl font-bold text-[#5C4A1F] mb-3">{name}</h3>

        {/* Descrição */}
        <p className="text-[#5C4A1F] text-sm mb-4 leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-4 py-1 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-full text-sm font-medium text-[#5C4A1F]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleAdopt}
            className="w-full h-12 bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold text-lg rounded-xl border-2 border-[#5C4A1F] shadow-md hover:shadow-lg transition-all"
          >
            Quero adotar
          </Button>
          
          <Button
            onClick={handleDetails}
            variant="outline"
            className="w-full h-12 bg-[#FFF1BA] hover:bg-[#F5E6C3] text-[#FFBD59] font-bold text-lg rounded-xl border-2 border-[#FFBD59] shadow-md hover:shadow-lg transition-all"
          >
            Detalhes
          </Button>
        </div>
      </div>
    </div>
  )
}
