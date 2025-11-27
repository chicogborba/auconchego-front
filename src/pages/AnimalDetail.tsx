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

    // 🔒 Regra de permissão para editar histórico
    const canEditHistory =
        !!pet &&
        !!currentUser &&
        (
            // Tutor de origem
            (currentUser.role === 'TUTOR' && pet.idTutorOrigem === currentUser.id) ||
            // ONG responsável
            (currentUser.role === 'ONG' && pet.idOng === currentUser.id) ||
            // Adotante atual (idTutorAdotante mapeado como adopterId)
            (currentUser.role === 'ADOTANTE' && pet.adopterId === currentUser.id)
        )

    const handleAddHistory = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!pet) return

        if (!canEditHistory) {
            setAlertModal({
                isOpen: true,
                title: 'Permissão negada',
                message: 'Apenas o tutor, a ONG responsável ou o adotante deste pet podem registrar novas ações.',
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

                if (!adotanteId) {
                    setAlertModal({
                        isOpen: true,
                        title: 'Acesso Restrito',
                        message: 'Somente adotantes podem solicitar adoção.',
                        type: 'warning',
                    })
                    return
                }

                await api.createAdoptionRequest(pet.id, adotanteId, 'Gostaria de adotar este pet')

                setAlertModal({
                    isOpen: true,
                    title: 'Pedido enviado!',
                    message: `Pedido de adoção para ${pet.name} enviado! Agora o tutor/ONG precisa aprovar.`,
                    type: 'success',
                    onConfirm: () => navigate('/main'),
                })
            } catch (err) {
                console.error('Erro ao solicitar adoção', err)
                setAlertModal({
                    isOpen: true,
                    title: 'Erro',
                    message: 'Não foi possível enviar o pedido. Tente novamente.',
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

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Coluna da Imagem Principal + Thumbnails */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
                            <CardContent className="p-4">
                                <div className="relative rounded-3xl overflow-hidden border-4 border-[#FFBD59] shadow-xl">
                                    <img
                                        src={pet.images[selectedImage]}
                                        alt={pet.name}
                                        className="w-full h-[420px] object-cover"
                                    />
                                    <button
                                        onClick={() => setSelectedImage((selectedImage + 1) % pet.images.length)}
                                        className="absolute bottom-4 right-4 bg-[#FFBD59] text-[#5C4A1F] px-4 py-2 rounded-full font-bold shadow-lg hover:bg-[#FFC977] transition-colors"
                                    >
                                        Ver outra foto
                                    </button>
                                    <div className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
                                        <Heart className="w-5 h-5 text-[#FF4B6E]" />
                                        <span className="font-semibold text-[#5C4A1F]">
                      Pronto para encontrar uma nova família
                    </span>
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                    {pet.images.map((img: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-4 ${
                                                selectedImage === index
                                                    ? 'border-[#FF4B6E]'
                                                    : 'border-transparent opacity-70 hover:opacity-100'
                                            } transition-all`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${pet.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info rápida (idade, porte, peso, etc) */}
                        <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                                        <Calendar className="w-8 h-8 text-[#FFBD59] mb-2" />
                                        <p className="text-sm text-[#8B6914] mb-1">Idade</p>
                                        <p className="font-bold text-[#5C4A1F] text-lg">{pet.age}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                                        <Ruler className="w-8 h-8 text-[#FFBD59] mb-2" />
                                        <p className="text-sm text-[#8B6914] mb-1">Porte</p>
                                        <p className="font-bold text-[#5C4A1F] text-lg">{pet.size}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                                        <Weight className="w-8 h-8 text-[#FFBD59] mb-2" />
                                        <p className="text-sm text-[#8B6914] mb-1">Peso</p>
                                        <p className="font-bold text-[#5C4A1F] text-lg">{pet.weight}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                                        <MapPin className="w-8 h-8 text-[#FFBD59] mb-2" />
                                        <p className="text-sm text-[#8B6914] mb-1">Local</p>
                                        <p className="font-bold text-[#5C4A1F] text-lg">{pet.location}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                                        <Syringe className="w-8 h-8 text-[#FFBD59] mb-2" />
                                        <p className="text-sm text-[#8B6914] mb-1">Vacinas</p>
                                        <p className="font-bold text-[#5C4A1F] text-lg">
                                            {pet.vaccinated ? 'Em dia' : 'Não'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                                        <Scissors className="w-8 h-8 text-[#FFBD59] mb-2" />
                                        <p className="text-sm text-[#8B6914] mb-1">Castrado</p>
                                        <p className="font-bold text-[#5C4A1F] text-lg">
                                            {pet.castrated ? 'Sim' : 'Não'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna de Informações */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Nome e Ação */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                {pet.type === 'cat' ? (
                                    <Cat className="w-10 h-10 text-[#FF4B6E]" />
                                ) : (
                                    <Dog className="w-10 h-10 text-[#FF4B6E]" />
                                )}
                                <div>
                                    <h1 className="text-5xl font-extrabold text-[#5C4A1F] tracking-tight">
                                        {pet.name}
                                    </h1>
                                    <p className="text-lg text-[#8B6914]">
                                        Um amigo especial esperando por um novo lar 💛
                                    </p>
                                </div>
                            </div>

                            {/* Botão de Adoção */}
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <Button
                                    onClick={handleAdopt}
                                    className="bg-[#FF4B6E] hover:bg-[#FF6B85] text-white font-bold text-lg px-8 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Heart className="w-5 h-5" />
                                    Quero adotar
                                </Button>
                                <span className="text-sm text-[#8B6914]">
                  Ao solicitar adoção, o tutor/ONG será notificado.
                </span>
                            </div>
                        </div>

                        {/* Descrição */}
                        <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-6 h-6 text-[#FFBD59]" />
                                    <h3 className="text-3xl font-bold text-[#5C4A1F]">Sobre o pet</h3>
                                </div>
                                <p className="text-[#5C4A1F] text-lg leading-relaxed">{pet.description}</p>
                            </CardContent>
                        </Card>

                        {/* Status de Saúde */}
                        <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Syringe className="w-6 h-6 text-[#FFBD59]" />
                                    <h3 className="text-3xl font-bold text-[#5C4A1F]">Saúde</h3>
                                </div>
                                <p className="text-[#5C4A1F] text-lg mb-6 leading-relaxed">
                                    {pet.healthStatus || 'Informações de saúde não detalhadas.'}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {pet.vaccinated && (
                                        <div className="flex-1 min-w-[160px] px-5 py-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-600 rounded-2xl shadow-lg">
                                            <div className="flex items-center justify-center gap-2">
                                                <Syringe className="w-6 h-6 text-green-700" />
                                                <span className="font-bold text-green-700 text-lg">Vacinado</span>
                                            </div>
                                        </div>
                                    )}
                                    {pet.castrated && (
                                        <div className="flex-1 min-w-[160px] px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-600 rounded-2xl shadow-lg">
                                            <div className="flex items-center justify-center gap-2">
                                                <Scissors className="w-6 h-6 text-blue-700" />
                                                <span className="font-bold text-blue-700 text-lg">Castrado</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Histórico de ações do pet */}
                <div className="mt-12">
                    <Card className="bg-white border-4 border-purple-500 shadow-xl">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-6 h-6 text-purple-500" />
                                <h2 className="text-3xl font-bold text-[#5C4A1F]">Histórico do pet</h2>
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
                                        {/* linha roxa horizontal */}
                                        <div className="absolute left-4 right-4 top-1/2 h-1 bg-purple-400 rounded-full" />

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
                                                        {/* bolinha roxa */}
                                                        <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-md group-hover:scale-110 transition-transform" />

                                                        {/* tooltip flutuante acima da bolinha */}
                                                        <div className="absolute left-1/2 -translate-x-1/2 -top-3 md:-top-24 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transform translate-y-2 group-hover:translate-y-0 bg-white/95 border border-purple-200 rounded-xl px-4 py-3 shadow-xl w-[260px]">
                                                            <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold text-purple-700 truncate">
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
                            <div className="mt-8 border-t border-[#F5E6C3] pt-4">
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
                                                className="flex-1 rounded-xl border-2 border-[#FFBD59] bg-[#FFF9E6] px-4 py-2 text-sm text-[#5C4A1F] focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            />
                                            <input
                                                type="text"
                                                value={newActionDescription}
                                                onChange={e => setNewActionDescription(e.target.value)}
                                                placeholder="Descrição (ex: Nome do adotante, observações...)"
                                                className="flex-1 rounded-xl border-2 border-[#FFBD59] bg-[#FFF9E6] px-4 py-2 text-sm text-[#5C4A1F] focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={savingHistory}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {savingHistory ? 'Salvando...' : 'Adicionar ação'}
                                            </Button>
                                        </form>
                                    </>
                                ) : (
                                    <p className="text-sm text-[#8B6914]">
                                        Apenas o tutor, a ONG responsável ou o adotante deste pet podem registrar novas ações.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mapa de Localização - Largura Total */}
                <div className="mt-12">
                    <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
                        <CardContent className="p-8">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-7 h-7 text-[#FFBD59]" />
                                    <h2 className="text-4xl font-bold text-[#5C4A1F]">Localização</h2>
                                </div>
                                <p className="text-[#5C4A1F] text-lg ml-9">📍 {pet.address}</p>
                            </div>
                            <div className="w-full h-[450px] rounded-2xl overflow-hidden border-4 border-[#FFBD59] shadow-xl">
                                <LocationMap
                                    lat={pet.coordinates.lat}
                                    lng={pet.coordinates.lng}
                                    petName={pet.name}
                                    location={pet.location}
                                />
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
