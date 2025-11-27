// src/pages/AnimalDetail.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, type FormEvent } from 'react'
import TopBar from '@/components/TopBar'
import LocationMap from '@/components/LocationMap'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Heart,
    MapPin,
    Calendar,
    Ruler,
    Weight,
    Syringe,
    Scissors,
    Sparkles,
    Cat,
    Dog,
} from 'lucide-react'
import { usePets } from '@/contexts/PetsContext'
import * as api from '@/lib/api'
import type { LocationHistoryEntry } from '@/lib/api'
import AlertModal from '@/components/AlertModal'

interface CurrentUser {
    id: number
    role: 'TUTOR' | 'ONG' | 'ADOTANTE' | string
}

export default function AnimalDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getPetById } = usePets()

    const [pet, setPet] = useState<any | null>(null)
    const [selectedImage, setSelectedImage] = useState(0)

    const [locationHistory, setLocationHistory] = useState<LocationHistoryEntry[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [newActionName, setNewActionName] = useState('')
    const [newActionDescription, setNewActionDescription] = useState('')
    const [savingHistory, setSavingHistory] = useState(false)

    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean
        title: string
        message: string
        type: 'info' | 'success' | 'error' | 'warning'
        onConfirm?: () => void
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
    })

    // Carregar usuário atual do localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem('currentUser')
            if (!raw) return
            const parsed = JSON.parse(raw)
            if (parsed?.id && parsed?.role) {
                setCurrentUser({ id: parsed.id, role: parsed.role })
            }
        } catch (err) {
            console.error('Erro ao ler currentUser do localStorage', err)
        }
    }, [])

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                if (!id) return
                const idNum = Number(id)
                setLoadingHistory(true)

                // Tenta pegar o pet direto do backend pra garantir dados atuais
                const backendPet = await api.getPetById(idNum)

                let history: LocationHistoryEntry[] = []
                try {
                    history = await api.getLocationHistoryByPet(idNum)
                } catch (err) {
                    console.warn('Could not load location history for pet', err)
                }

                if (!mounted) return
                setPet(backendPet)
                setLocationHistory(history)
            } catch (err) {
                console.warn('Could not load pet from backend, falling back to context', err)
                const fromCtx = getPetById(Number(id))
                setPet(fromCtx ?? null)
            } finally {
                if (mounted) setLoadingHistory(false)
            }
        })()
        return () => {
            mounted = false
        }
    }, [id, getPetById])

    function formatDateRange(startIso: string, endIso?: string | null) {
        if (!startIso) return ''
        const start = new Date(startIso)
        const end = endIso ? new Date(endIso) : null
        const fmt = (d: Date) =>
            d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        if (end && !Number.isNaN(end.getTime()) && end.getTime() !== start.getTime()) {
            return `${fmt(start)} → ${fmt(end)}`
        }
        return fmt(start)
    }

    // 🔒 Regra de permissão para editar histórico e pet
    // Se o pet está ADOTADO, apenas o adotante pode editar
    // Se o pet NÃO está ADOTADO, tutor de origem e ONG podem editar
    const canEditHistory =
        !!pet &&
        !!currentUser &&
        (
            // Se pet está ADOTADO, apenas o adotante pode editar
            (pet.status === 'ADOTADO' && currentUser.role === 'ADOTANTE' && pet.adopterId === currentUser.id) ||
            // Se pet NÃO está ADOTADO, tutor de origem e ONG podem editar
            (pet.status !== 'ADOTADO' && (
                (currentUser.role === 'TUTOR' && (pet.tutorId === currentUser.id || (pet as any).tutorOrigem?.id === currentUser.id)) ||
                (currentUser.role === 'ONG' && pet.idOng === currentUser.id)
            ))
        )
    
    // Permissão para visualizar histórico (tutor de origem e adotante podem ver)
    const canViewHistory =
        !!pet &&
        !!currentUser &&
        (
            // Tutor de origem sempre pode ver (verifica tutorId ou tutorOrigem)
            (currentUser.role === 'TUTOR' && (pet.tutorId === currentUser.id || (pet as any).tutorOrigem?.id === currentUser.id)) ||
            // ONG responsável pode ver
            (currentUser.role === 'ONG' && pet.idOng === currentUser.id) ||
            // Adotante atual pode ver
            (currentUser.role === 'ADOTANTE' && pet.adopterId === currentUser.id)
        )

    const handleAddHistory = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!pet) return

        if (!canEditHistory) {
            setAlertModal({
                isOpen: true,
                title: 'Permissão negada',
                message: pet.status === 'ADOTADO' 
                    ? 'Apenas o adotante deste pet pode registrar novas ações no histórico.'
                    : 'Apenas o tutor ou a ONG responsável podem registrar novas ações.',
                type: 'warning',
            })
            return
        }

        const trimmedName = newActionName.trim()
        const trimmedDesc = newActionDescription.trim()
        if (!trimmedName) return

        setSavingHistory(true)
        ;(async () => {
            try {
                const nowIso = new Date().toISOString()
                const created = await api.createLocationHistory({
                    idPet: pet.id,
                    tipo: 'OUTRO', // genérico, backend valida o enum
                    local: trimmedName, // nome da ação
                    descricao: trimmedDesc,
                    dataInicio: nowIso,
                    dataFim: nowIso,
                })
                setLocationHistory(prev => [...prev, created])
                setNewActionName('')
                setNewActionDescription('')
            } catch (err) {
                console.error('Erro ao criar histórico manual', err)
                setAlertModal({
                    isOpen: true,
                    title: 'Erro',
                    message: 'Não foi possível salvar a ação. Tente novamente.',
                    type: 'error',
                })
            } finally {
                setSavingHistory(false)
            }
        })()
    }

    const handleAdopt = () => {
        ;(async () => {
            try {
                // Verificar se o pet está disponível
                if (pet.status === 'RESERVADO' || pet.status === 'ADOTADO') {
                    setAlertModal({
                        isOpen: true,
                        title: 'Pet não disponível',
                        message: pet.status === 'RESERVADO' 
                            ? 'Este pet já possui uma solicitação de adoção em análise.'
                            : 'Este pet já foi adotado.',
                        type: 'warning',
                    })
                    return
                }

                const rawUser = localStorage.getItem('currentUser')
                if (!rawUser) {
                    setAlertModal({
                        isOpen: true,
                        title: 'Login Necessário',
                        message: 'Você precisa estar logado como adotante para solicitar adoção.',
                        type: 'info',
                    })
                    return
                }

                let adotanteId: number | undefined = undefined

                try {
                    const parsed = JSON.parse(rawUser)
                    if (parsed?.role === 'ADOTANTE' && parsed?.id) {
                        adotanteId = parsed.id
                    }
                } catch (e) {
                    console.error('Erro ao ler currentUser do localStorage', e)
                }

                // Tentar obter do localStorage também (fallback)
                if (!adotanteId) {
                    const adotanteIdStr = localStorage.getItem('adotanteId')
                    if (adotanteIdStr) {
                        const parsedId = Number(adotanteIdStr)
                        if (!isNaN(parsedId)) {
                            adotanteId = parsedId
                        }
                    }
                }

                if (!adotanteId) {
                    setAlertModal({
                        isOpen: true,
                        title: 'Acesso Restrito',
                        message: 'Somente adotantes podem solicitar adoção. Por favor, faça login novamente.',
                        type: 'warning',
                    })
                    return
                }

                // Validar que o ID é um número válido
                if (isNaN(adotanteId) || adotanteId <= 0) {
                    setAlertModal({
                        isOpen: true,
                        title: 'Erro',
                        message: 'ID de adotante inválido. Por favor, faça login novamente.',
                        type: 'error',
                    })
                    return
                }

                await api.createAdoptionRequest(pet.id, adotanteId, 'Gostaria de adotar este pet')

                setAlertModal({
                    isOpen: true,
                    title: 'Pedido enviado!',
                    message: `Pedido de adoção para ${pet.name} enviado! Agora o tutor/ONG precisa aprovar.`,
                    type: 'success',
                    onConfirm: () => {
                        // Recarregar a página para atualizar o status do pet
                        window.location.reload()
                    },
                })
            } catch (err: any) {
                console.error('Erro ao solicitar adoção', err)
                
                // Extrair mensagem de erro mais específica
                let errorMessage = 'Não foi possível enviar o pedido. Tente novamente.'
                
                if (err?.message) {
                    const errMsg = err.message.toLowerCase()
                    if (errMsg.includes('adotante não encontrado') || errMsg.includes('adotante not found')) {
                        errorMessage = 'Adotante não encontrado. Por favor, faça login novamente.'
                    } else if (errMsg.includes('not available') || errMsg.includes('não disponível')) {
                        errorMessage = 'Este pet não está disponível para adoção no momento.'
                    } else if (errMsg.includes('already a pending') || errMsg.includes('já existe')) {
                        errorMessage = 'Já existe uma solicitação de adoção pendente para este pet.'
                    } else if (errMsg.includes('pet não encontrado') || errMsg.includes('pet not found')) {
                        errorMessage = 'Pet não encontrado. Por favor, recarregue a página.'
                    } else if (errMsg.includes('foreign key constraint') || errMsg.includes('constraint')) {
                        errorMessage = 'Erro ao processar solicitação. Por favor, faça login novamente e tente outra vez.'
                    } else {
                        // Tentar extrair mensagem do backend diretamente
                        errorMessage = err.message
                        // Se a mensagem contém JSON, tentar extrair
                        try {
                            if (err.message.includes('{')) {
                                const jsonMatch = err.message.match(/\{.*\}/)
                                if (jsonMatch) {
                                    const errorObj = JSON.parse(jsonMatch[0])
                                    if (errorObj.error) {
                                        errorMessage = errorObj.error
                                    }
                                }
                            }
                        } catch {
                            // Se não conseguir parsear, usar a mensagem original
                        }
                    }
                }

                setAlertModal({
                    isOpen: true,
                    title: 'Erro',
                    message: errorMessage,
                    type: 'error',
                })
            }
        })()
    }

    if (!pet) {
        return (
            <div className="min-h-screen bg-[#FFF1BA]">
                <TopBar />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <p className="text-center text-[#5C4A1F] text-xl">Carregando informações do pet...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FFF1BA]">
            <TopBar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <div className="grid lg:grid-cols-12 gap-5 lg:gap-6">
                    {/* Coluna da Imagem Principal + Thumbnails */}
                    <div className="lg:col-span-5">
                        <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 shadow-lg overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative rounded-t-2xl overflow-hidden">
                                    <img
                                        src={pet.images[selectedImage]}
                                        alt={pet.name}
                                        className="w-full h-[450px] md:h-[500px] object-cover"
                                    />
                                    <button
                                        onClick={() => setSelectedImage((selectedImage + 1) % pet.images.length)}
                                        className="absolute bottom-3 right-3 bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] px-4 py-2 rounded-lg font-semibold shadow-md border-2 border-[#5C4A1F] transition-all text-sm"
                                    >
                                        Ver outra foto
                                    </button>
                                </div>

                                {/* Thumbnails */}
                                {pet.images.length > 1 && (
                                    <div className="p-3 bg-[#F5E6C3]">
                                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                            {pet.images.map((img: string, index: number) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(index)}
                                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                        selectedImage === index
                                                            ? 'border-[#5C4A1F] shadow-md'
                                                            : 'border-[#5C4A1F]/20 opacity-70 hover:opacity-100 hover:border-[#5C4A1F]/40'
                                                    }`}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`${pet.name} ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna de Informações */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Nome e Ação */}
                        <div className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 rounded-2xl shadow-lg p-5 md:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                {pet.type === 'cat' ? (
                                    <Cat className="w-8 h-8 md:w-10 md:h-10 text-[#5C4A1F] flex-shrink-0" />
                                ) : (
                                    <Dog className="w-8 h-8 md:w-10 md:h-10 text-[#5C4A1F] flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#5C4A1F] tracking-tight">
                                        {pet.name}
                                    </h1>
                                </div>
                            </div>

                            {/* Botão de Adoção */}
                            {pet.status !== 'ADOTADO' && pet.status !== 'RESERVADO' && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-[#5C4A1F]/20">
                                    <Button
                                        onClick={handleAdopt}
                                        className="bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold text-sm md:text-base px-5 md:px-6 py-2.5 rounded-lg border-2 border-[#5C4A1F] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                                    >
                                        <Heart className="w-4 h-4" />
                                        Quero adotar
                                    </Button>
                                    <span className="text-xs text-[#8B6914] text-center sm:text-left">
                                        O tutor/ONG será notificado.
                                    </span>
                                </div>
                            )}
                            {pet.status === 'RESERVADO' && (
                                <div className="pt-3 border-t border-[#5C4A1F]/20">
                                    <div className="px-4 py-3 bg-[#FFF1BA] border-2 border-[#5C4A1F]/40 rounded-lg">
                                        <p className="text-[#5C4A1F] font-semibold text-sm">
                                            Este pet está em análise para adoção
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Descrição e Saúde em Grid */}
                        <div className="grid md:grid-cols-2 gap-4 items-stretch">
                            {/* Descrição */}
                            <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 shadow-lg h-full flex flex-col">
                                <CardContent className="p-4 md:p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg md:text-xl font-bold text-[#5C4A1F] mb-3">Sobre o pet</h3>
                                    <p className="text-[#5C4A1F] leading-relaxed mb-3 text-sm">{pet.description || 'Sem descrição disponível.'}</p>
                                    
                                    {/* Tags e Temperamento */}
                                    {(pet.tags?.length > 0 || pet.temperament?.length > 0) && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {pet.tags
                                                ?.filter((tag: string) => tag && tag.trim().length > 0)
                                                .map((tag: string, index: number) => {
                                                    const trimmedTag = tag.trim()
                                                    return (
                                                        <span
                                                            key={`tag-${index}`}
                                                            className="px-2 py-0.5 bg-[#FFF1BA] border border-[#5C4A1F] rounded-full text-xs font-medium text-[#5C4A1F] whitespace-nowrap"
                                                        >
                                                            {trimmedTag}
                                                        </span>
                                                    )
                                                })}
                                            {pet.temperament
                                                ?.filter((temp: string) => temp && temp.trim().length > 0)
                                                .map((temp: string, index: number) => {
                                                    const trimmedTemp = temp.trim()
                                                    return (
                                                        <span
                                                            key={`temp-${index}`}
                                                            className="px-2 py-0.5 bg-[#FCE4EC] border border-[#5C4A1F]/40 rounded-full text-xs font-medium text-[#5C4A1F] whitespace-nowrap"
                                                        >
                                                            {trimmedTemp}
                                                        </span>
                                                    )
                                                })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Status de Saúde */}
                            <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 shadow-lg h-full flex flex-col">
                                <CardContent className="p-4 md:p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg md:text-xl font-bold text-[#5C4A1F] mb-3">Saúde</h3>
                                    <p className="text-[#5C4A1F] mb-3 leading-relaxed text-sm">
                                        {pet.healthStatus || 'Informações de saúde não detalhadas.'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {pet.vaccinated && (
                                            <div className="px-3 py-1.5 bg-[#EAF7E9] border border-[#5C4A1F]/20 rounded-lg">
                                                <div className="flex items-center gap-1.5">
                                                    <Syringe className="w-3.5 h-3.5 text-[#5C4A1F]" />
                                                    <span className="font-semibold text-[#5C4A1F] text-xs">Vacinado</span>
                                                </div>
                                            </div>
                                        )}
                                        {pet.castrated && (
                                            <div className="px-3 py-1.5 bg-[#E3F2FD] border border-[#5C4A1F]/20 rounded-lg">
                                                <div className="flex items-center gap-1.5">
                                                    <Scissors className="w-3.5 h-3.5 text-[#5C4A1F]" />
                                                    <span className="font-semibold text-[#5C4A1F] text-xs">Castrado</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Informações Rápidas - Horizontal, abaixo dos cards acima */}
                        <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 shadow-lg w-full">
                            <CardContent className="p-4">
                                <h3 className="text-base font-bold text-[#5C4A1F] mb-3 text-center">Informações Rápidas</h3>
                                <div className="flex gap-2 justify-between overflow-x-auto scrollbar-hide">
                                    <div className="flex flex-col items-center p-2.5 bg-[#FFF1BA] rounded-xl border-2 border-[#5C4A1F]/20 hover:shadow-md transition-shadow flex-1 min-w-0">
                                        <Calendar className="w-4 h-4 text-[#5C4A1F] mb-1" />
                                        <p className="text-[9px] text-[#8B6914] mb-0.5 font-medium text-center">Idade</p>
                                        <p className="font-bold text-[#5C4A1F] text-xs">{pet.age || '—'}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-2.5 bg-[#FFF1BA] rounded-xl border-2 border-[#5C4A1F]/20 hover:shadow-md transition-shadow flex-1 min-w-0">
                                        <Ruler className="w-4 h-4 text-[#5C4A1F] mb-1" />
                                        <p className="text-[9px] text-[#8B6914] mb-0.5 font-medium text-center">Porte</p>
                                        <p className="font-bold text-[#5C4A1F] text-xs">{pet.size || '—'}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-2.5 bg-[#FFF1BA] rounded-xl border-2 border-[#5C4A1F]/20 hover:shadow-md transition-shadow flex-1 min-w-0">
                                        <Weight className="w-4 h-4 text-[#5C4A1F] mb-1" />
                                        <p className="text-[9px] text-[#8B6914] mb-0.5 font-medium text-center">Peso</p>
                                        <p className="font-bold text-[#5C4A1F] text-xs">{pet.weight ? `${pet.weight} kg` : '—'}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-2.5 bg-[#FFF1BA] rounded-xl border-2 border-[#5C4A1F]/20 hover:shadow-md transition-shadow flex-1 min-w-0">
                                        <MapPin className="w-4 h-4 text-[#5C4A1F] mb-1" />
                                        <p className="text-[9px] text-[#8B6914] mb-0.5 font-medium text-center">Local</p>
                                        <p className="font-bold text-[#5C4A1F] text-[10px] text-center leading-tight truncate w-full">{pet.location || '—'}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-2.5 bg-[#FFF1BA] rounded-xl border-2 border-[#5C4A1F]/20 hover:shadow-md transition-shadow flex-1 min-w-0">
                                        <Syringe className="w-4 h-4 text-[#5C4A1F] mb-1" />
                                        <p className="text-[9px] text-[#8B6914] mb-0.5 font-medium text-center">Vacinas</p>
                                        <p className="font-bold text-[#5C4A1F] text-[10px]">
                                            {pet.vaccinated ? 'Em dia' : 'Não'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center p-2.5 bg-[#FFF1BA] rounded-xl border-2 border-[#5C4A1F]/20 hover:shadow-md transition-shadow flex-1 min-w-0">
                                        <Scissors className="w-4 h-4 text-[#5C4A1F] mb-1" />
                                        <p className="text-[9px] text-[#8B6914] mb-0.5 font-medium text-center">Castrado</p>
                                        <p className="font-bold text-[#5C4A1F] text-[10px]">
                                            {pet.castrated ? 'Sim' : 'Não'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Histórico de ações do pet */}
                <div className="mt-8 lg:mt-10">
                    <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 shadow-lg">
                        <CardContent className="p-5 md:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-[#5C4A1F]" />
                                <h2 className="text-2xl font-bold text-[#5C4A1F]">Histórico do pet</h2>
                            </div>

                            {loadingHistory ? (
                                <p className="text-[#8B6914]">Carregando ações...</p>
                            ) : locationHistory.length === 0 ? (
                                <p className="text-[#8B6914]">
                                    Ainda não há ações registradas para este pet.
                                </p>
                            ) : (
                                <div className="mt-6">
                                    {/* container da timeline horizontal */}
                                    <div className="relative w-full h-28">
                                        {/* linha horizontal */}
                                        <div className="absolute left-4 right-4 top-1/2 h-1 bg-[#5C4A1F]/30 rounded-full" />

                                        {locationHistory
                                            .slice()
                                            .sort(
                                                (a, b) =>
                                                    new Date((a as any).dataInicio as string).getTime() -
                                                    new Date((b as any).dataInicio as string).getTime(),
                                            )
                                            .map((item, index, arr) => {
                                                const total = arr.length
                                                const pct = total === 1 ? 50 : (index / (total - 1)) * 100

                                                return (
                                                    <div
                                                        key={item.id ?? index}
                                                        className="absolute group"
                                                        style={{
                                                            left: `${pct}%`,
                                                            top: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                        }}
                                                    >
                                                        {/* bolinha */}
                                                        <div className="w-4 h-4 rounded-full bg-[#5C4A1F] border-2 border-[#F5E6C3] shadow-md group-hover:scale-110 transition-transform" />

                                                        {/* tooltip flutuante acima da bolinha */}
                                                        <div className="absolute left-1/2 -translate-x-1/2 -top-3 md:-top-24 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transform translate-y-2 group-hover:translate-y-0 bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 rounded-xl px-4 py-3 shadow-lg w-[260px]">
                                                            <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold text-[#5C4A1F] truncate">
                                  {(item as any).local || (item as any).tipo}
                                </span>
                                                                <span className="text-xs text-[#8B6914]">
                                  {formatDateRange(
                                      (item as any).dataInicio,
                                      (item as any).dataFim,
                                  )}
                                </span>
                                                            </div>
                                                            {(item as any).descricao && (
                                                                <p className="text-sm text-[#5C4A1F] mt-1">
                                                                    {(item as any).descricao}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* Formulário para adicionar ação manual / mensagem de permissão */}
                            <div className="mt-6 border-t border-[#5C4A1F]/20 pt-4">
                                {canEditHistory ? (
                                    <>
                                        <p className="text-sm text-[#8B6914] mb-3">
                                            Registrar nova ação manual para este pet
                                        </p>
                                        <form
                                            onSubmit={handleAddHistory}
                                            className="flex flex-col md:flex-row gap-3"
                                        >
                                            <input
                                                type="text"
                                                value={newActionName}
                                                onChange={e => setNewActionName(e.target.value)}
                                                placeholder="Nome da ação (ex: Resgate, Lar temporário, Adoção)"
                                                className="flex-1 rounded-xl border-2 border-[#5C4A1F] bg-[#FFF1BA] px-4 py-2 text-sm text-[#5C4A1F] focus:outline-none focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563]"
                                            />
                                            <input
                                                type="text"
                                                value={newActionDescription}
                                                onChange={e => setNewActionDescription(e.target.value)}
                                                placeholder="Descrição (ex: Nome do adotante, observações...)"
                                                className="flex-1 rounded-xl border-2 border-[#5C4A1F] bg-[#FFF1BA] px-4 py-2 text-sm text-[#5C4A1F] focus:outline-none focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563]"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={savingHistory}
                                                className="bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] px-6 py-2 rounded-xl font-bold border-2 border-[#5C4A1F] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {savingHistory ? 'Salvando...' : 'Adicionar ação'}
                                            </Button>
                                        </form>
                                    </>
                                ) : canViewHistory ? (
                                    <p className="text-sm text-[#8B6914]">
                                        {pet.status === 'ADOTADO' 
                                            ? 'Você pode visualizar o histórico, mas apenas o adotante pode adicionar novas ações.'
                                            : 'Você pode visualizar o histórico, mas apenas o tutor ou a ONG responsável podem adicionar novas ações.'}
                                    </p>
                                ) : (
                                    <p className="text-sm text-[#8B6914]">
                                        Você não tem permissão para visualizar ou editar o histórico deste pet.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mapa de Localização - Largura Total */}
                <div className="mt-8 lg:mt-10">
                    <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 shadow-lg">
                        <CardContent className="p-5 md:p-6">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-5 h-5 text-[#5C4A1F]" />
                                    <h2 className="text-2xl font-bold text-[#5C4A1F]">Localização</h2>
                                </div>
                                <p className="text-[#5C4A1F] ml-7">📍 {pet.address || pet.location || 'Localização não informada'}</p>
                            </div>
                            <div className="w-full h-[450px] rounded-xl overflow-hidden border-2 border-[#5C4A1F]/20 shadow-md relative">
                                {pet.coordinates && pet.coordinates.lat && pet.coordinates.lng ? (
                                    <LocationMap
                                        lat={pet.coordinates.lat}
                                        lng={pet.coordinates.lng}
                                        petName={pet.name}
                                        location={pet.location}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#F5E6C3]">
                                        <div className="text-center">
                                            <MapPin className="w-16 h-16 text-[#5C4A1F]/40 mx-auto mb-4" />
                                            <p className="text-[#5C4A1F] font-semibold">Mapa não disponível</p>
                                            <p className="text-[#8B6914] text-sm mt-2">
                                                Coordenadas não informadas para este pet
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
                onConfirm={alertModal.onConfirm}
            />
        </div>
    )
}
