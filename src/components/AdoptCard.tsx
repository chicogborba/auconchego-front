import { Button } from '@/components/ui/button'
import { Cat, Dog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AlertModal from '@/components/AlertModal'

interface AdoptCardProps {
    id: number
    type: 'cat' | 'dog'
    name: string
    description: string
    image: string
    tags: string[]
    compatibility?: number
    // novos dados vindos do backend / mapBackendToFrontend
    age?: string | number
    size?: string
    weight?: string | number
    location?: string
    vaccinated?: boolean
    castrated?: boolean
    temperament?: string[]
    healthStatus?: string
    status?: string
    onAdopt?: () => void
    onDetails?: () => void
    hideAdoptButton?: boolean // Esconder botão "Quero adotar" quando o pet já foi adotado
}

export default function AdoptCard({
                                      id,
                                      type,
                                      name,
                                      description,
                                      image,
                                      tags,
                                      compatibility,
                                      age,
                                      size,
                                      weight,
                                      location,
                                      vaccinated,
                                      castrated,
                                      temperament,
                                      healthStatus,
                                      onAdopt,
                                      onDetails,
                                      status,
                                      hideAdoptButton = false,
                                  }: AdoptCardProps) {
    const navigate = useNavigate()

    function formatPetStatus(status?: string): string {
        if (!status) return '—'
        switch (status) {
            case 'DISPONIVEL':
                return 'Disponível'
            case 'RESERVADO':
                return 'Em análise'
            case 'ADOTADO':
                return 'Adotado'
            default:
                return status
        }
    }


    const rawUser =
        typeof window !== 'undefined'
            ? localStorage.getItem('currentUser')
            : null

    let userRole: string | null = null
    if (rawUser) {
        try {
            userRole = JSON.parse(rawUser).role
        } catch {
            userRole = null
        }
    }

    const isAdotante = userRole === 'ADOTANTE'
    const isTutor = userRole === 'TUTOR'


    const [showAlert, setShowAlert] = useState(false)

    const handleAdopt = () => {
        // Só deixa clicar se for ADOTANTE
        if (!isAdotante) {
            setShowAlert(true)
            return
        }

        if (onAdopt) return onAdopt()
        navigate(`/animal/${id}`)
    }


    const handleDetails = () => {
        if (onDetails) return onDetails()
        navigate(`/animal/${id}`)
    }

    return (
        <div className="bg-[#F5E6C3] rounded-3xl overflow-hidden shadow-lg max-w-md w-full border-2 border-[#5C4A1F]/20 flex flex-col h-full">
            {/* Imagem do Pet com Badge do Tipo */}
            <div className="relative h-64 flex-shrink-0">
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
            <div className="p-6 flex flex-col flex-grow">
                {/* Compatibilidade (se disponível) */}
                {typeof compatibility !== 'undefined' && (
                    <div className="mb-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#EAF7E9] text-green-800 font-semibold border border-green-200">
              Compatibilidade: {Math.round(compatibility)}%
            </span>
                    </div>
                )}

                {/* Nome */}
                <h3 className="text-3xl font-bold text-[#5C4A1F] mb-2">{name}</h3>

                {/* Infos rápidas: idade / porte / peso / localização */}
                <div className="flex flex-wrap gap-2 mb-3 text-xs font-medium text-[#5C4A1F]">
                    {age && (
                        <span className="px-3 py-1 bg-[#FFF1BA] rounded-full border border-[#5C4A1F]/40">
              Idade: {age}
            </span>
                    )}
                    {size && (
                        <span className="px-3 py-1 bg-[#FFF1BA] rounded-full border border-[#5C4A1F]/40">
              Porte: {size}
            </span>
                    )}
                    {typeof weight !== 'undefined' && weight !== '' && (
                        <span className="px-3 py-1 bg-[#FFF1BA] rounded-full border border-[#5C4A1F]/40">
              Peso: {weight} kg
            </span>
                    )}
                    {location && (
                        <span className="px-3 py-1 bg-[#FFF1BA] rounded-full border border-[#5C4A1F]/40">
              Local: {location}
            </span>
                    )}
                </div>

                {/* Status de saúde / vacinação / castração */}
                {(healthStatus || typeof vaccinated !== 'undefined' || typeof castrated !== 'undefined') && (
                    <div className="mb-4 text-xs text-[#5C4A1F] space-y-1">
                        {healthStatus && (
                            <p>
                                <span className="font-semibold">Saúde:</span> {healthStatus}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {typeof vaccinated !== 'undefined' && (
                                <span className="px-2 py-1 rounded-full bg-[#EAF7E9] border border-green-300 text-[0.7rem]">
                  {vaccinated ? 'Vacinado' : 'Não vacinado'}
                </span>
                            )}
                            {typeof castrated !== 'undefined' && (
                                <span className="px-2 py-1 rounded-full bg-[#EAF7E9] border border-green-300 text-[0.7rem]">
                  {castrated ? 'Castrado' : 'Não castrado'}
                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Descrição */}
                <p className="text-[#5C4A1F] text-sm mb-4 leading-relaxed">
                    {description}
                </p>

                {/* Tags + temperamento */}
                <div className="flex flex-wrap gap-2 mb-6 flex-grow">
                    {tags
                        .filter(tag => tag && tag.trim().length > 0)
                        .map((tag, index) => {
                            const trimmedTag = tag.trim()
                            return (
                                <span
                                    key={`tag-${index}`}
                                    className="px-3 py-1 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-full text-sm font-medium text-[#5C4A1F] whitespace-nowrap"
                                >
                                    {trimmedTag}
                                </span>
                            )
                        })}

                    {temperament && temperament.length > 0 && temperament
                        .filter(temp => temp && temp.trim().length > 0)
                        .map((temp, index) => {
                            const trimmedTemp = temp.trim()
                            return (
                                <span
                                    key={`temp-${index}`}
                                    className="px-2 py-1 bg-[#FCE4EC] border-2 border-[#5C4A1F]/40 rounded-full text-xs font-medium text-[#5C4A1F] whitespace-nowrap"
                                >
                                    {trimmedTemp}
                                </span>
                            )
                        })}
                </div>

                {/* Botões - sempre no final */}
                <div className="flex flex-col gap-3 mt-auto">
                    {!hideAdoptButton && (
                        <>
                            {isAdotante && status !== 'RESERVADO' && status !== 'ADOTADO' ? (
                                <Button
                                    onClick={handleAdopt}
                                    className="w-full h-12 bg-[#FFBD59] hover:bg-[#FFBD59]/90 text-[#5C4A1F] font-bold rounded-xl border-2 border-[#5C4A1F] shadow-md hover:shadow-lg transition-all"
                                >
                                    Quero adotar
                                </Button>
                            ) : (
                                <div className="w-full h-12 flex items-center justify-center rounded-xl border-2 border-[#5C4A1F]/40 bg-[#FFF1BA] text-[#5C4A1F] text-sm font-semibold">
                                    {status === 'RESERVADO' ? 'Em análise' : status === 'ADOTADO' ? 'Adotado' : `Status: ${formatPetStatus(status)}`}
                                </div>
                            )}
                        </>
                    )}

                    <Button
                        onClick={handleDetails}
                        variant="outline"
                        className="w-full h-12 bg-[#FFF1BA] hover:bg-[#F5E6C3] text-[#FFBD59] font-bold text-lg rounded-xl border-2 border-[#FFBD59] shadow-md hover:shadow-lg transition-all"
                    >
                        Detalhes
                    </Button>
                </div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                title="Acesso Restrito"
                message="Somente adotantes podem solicitar adoção."
                type="warning"
            />
        </div>
    )
}
