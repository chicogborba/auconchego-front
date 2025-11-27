import { useEffect, useMemo, useState } from 'react'
import TopBar from '@/components/TopBar'
import { usePets } from '@/contexts/PetsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Cat, Dog, Check, X, RefreshCw, History } from 'lucide-react'
import PetFormModal from '@/components/PetFormModal'
import type { Pet } from '@/data/petsData'
import * as api from '@/lib/api'
import AlertModal from '@/components/AlertModal'
import { useAlert } from '@/hooks/useAlert'

type Role = 'ADOTANTE' | 'TUTOR' | 'ONG' | 'ROOT'

interface CurrentUser {
    id: number
    role: Role
    nome?: string
    email?: string
    idOng?: number
}

interface AdoptionRequestWithAdopter {
    id: number
    petId: number
    adotanteId: number
    status: string
    message?: string
    createdAt?: string
    adotante?: {
        id: number
        nome: string
        email: string
        telefone?: string
        cidade?: string
        estado?: string
    }
}

function readCurrentUser(): CurrentUser | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem('currentUser')
        if (!raw) return null
        return JSON.parse(raw) as CurrentUser
    } catch {
        return null
    }
}

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


export default function PetsAdmin() {
    const { pets, deletePet } = usePets()
    const { alert, showAlert, closeAlert } = useAlert()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPet, setEditingPet] = useState<Pet | null>(null)
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; petId: number | null }>({ isOpen: false, petId: null })
    const [allPetsAdmin, setAllPetsAdmin] = useState<Pet[]>([])

    const [adoptionByPet, setAdoptionByPet] = useState<
        Record<number, AdoptionRequestWithAdopter[]>
    >({})
    const [loadingRequests, setLoadingRequests] = useState(false)
    
    // Estado para modal de histórico
    const [historyModal, setHistoryModal] = useState<{ isOpen: boolean; petId: number | null }>({ isOpen: false, petId: null })
    const [petHistory, setPetHistory] = useState<any[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Função para recarregar todos os pets
    const reloadPets = async () => {
        try {
            const allPets = await api.getAllPets()
            setAllPetsAdmin(allPets)
        } catch (e) {
            console.error('Erro ao carregar todos os pets:', e)
        }
    }

    useEffect(() => {
        const user = readCurrentUser()
        setCurrentUser(user)
        
        // Verifica se o usuário tem permissão para acessar esta página
        if (!user || (user.role !== 'TUTOR' && user.role !== 'ONG' && user.role !== 'ROOT')) {
            showAlert('Acesso negado', 'Apenas tutores, ONGs e administradores podem acessar esta área.', 'error', () => {
                window.location.href = '/main'
            })
            return
        }

        // Buscar todos os pets para admin (não apenas DISPONIVEL)
        reloadPets()

        // Recarregar pets quando a página recebe foco (útil quando voltar de outra aba)
        const handleFocus = () => {
            reloadPets()
        }
        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    const handleDelete = (id: number) => {
        setDeleteConfirm({ isOpen: true, petId: id })
    }

    const confirmDelete = async () => {
        if (!deleteConfirm.petId) return
        try {
            await deletePet(deleteConfirm.petId)
            setDeleteConfirm({ isOpen: false, petId: null })
            showAlert('Pet deletado', 'Pet deletado com sucesso!', 'success')
        } catch (e) {
            showAlert('Erro', 'Erro ao deletar pet', 'error')
        }
    }

    const handleEdit = (pet: Pet) => {
        setEditingPet(pet)
        setIsModalOpen(true)
    }

    const handleAdd = () => {
        setEditingPet(null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingPet(null)
    }

    // Usar allPetsAdmin se disponível, senão usar pets do contexto
    const allPets = allPetsAdmin.length > 0 ? allPetsAdmin : Object.values(pets)

    // 🔍 pets visíveis pro usuário atual
    const visiblePets = useMemo(() => {
        if (!currentUser) return allPets

        // TUTOR vê só pets em que ele é tutor de origem
        if (currentUser.role === 'TUTOR') {
            const filtered = allPets.filter((p: any) => {
                const matches = p.tutorId === currentUser.id
                if (!matches && p.tutorId) {
                    console.log(`Pet ${p.id} (${p.name}) - tutorId: ${p.tutorId}, currentUser.id: ${currentUser.id}`)
                }
                return matches
            })
            console.log(`TUTOR ${currentUser.id} (${currentUser.nome}): ${filtered.length} pets de ${allPets.length} totais`)
            return filtered
        }

        // ONG vê só pets da própria ONG
        if (currentUser.role === 'ONG') {
            return allPets.filter((p: any) => p.idOng === currentUser.id)
        }

        // ROOT vê tudo
        return allPets
    }, [allPets, currentUser])

    // Carregar pedidos de adoção pendentes + dados dos adotantes
    useEffect(() => {
        if (!currentUser) return
        if (currentUser.role !== 'TUTOR' && currentUser.role !== 'ONG') {
            setAdoptionByPet({})
            return
        }

        setLoadingRequests(true)
        ;(async () => {
            try {
                const [requests, adotantes] = await Promise.all([
                    api.getAdoptionRequests({ status: 'PENDENTE' }),
                    api.getAdotantes(),
                ])

                const adotantesById: Record<number, any> = {}
                adotantes.forEach((a: any) => {
                    adotantesById[a.id] = a
                })

                const byPet: Record<number, AdoptionRequestWithAdopter[]> = {}
                requests.forEach((req: any) => {
                    const enriched: AdoptionRequestWithAdopter = {
                        ...req,
                        adotante: adotantesById[req.adotanteId],
                    }
                    if (!byPet[req.petId]) byPet[req.petId] = []
                    byPet[req.petId].push(enriched)
                })

                setAdoptionByPet(byPet)
            } catch (e) {
                console.error('Erro ao carregar pedidos de adoção:', e)
            } finally {
                setLoadingRequests(false)
            }
        })()
    }, [currentUser])

    const [approveConfirm, setApproveConfirm] = useState<{ isOpen: boolean; requestId: number | null; petId: number | null }>({ isOpen: false, requestId: null, petId: null })

    const handleApprove = (requestId: number, petId: number) => {
        if (!currentUser || (currentUser.role !== 'TUTOR' && currentUser.role !== 'ONG')) {
            showAlert('Acesso negado', 'Apenas tutor ou ONG podem aprovar pedidos.', 'warning')
            return
        }

        setApproveConfirm({ isOpen: true, requestId, petId })
    }

    const confirmApprove = async () => {
        if (!approveConfirm.requestId || !currentUser) return
        try {
            await api.approveAdoptionRequest(approveConfirm.requestId, {
                responderId: currentUser.id,
                responderType: currentUser.role === 'TUTOR' ? 'TUTOR' : 'ONG',
            })
            setApproveConfirm({ isOpen: false, requestId: null, petId: null })
            // Recarregar pets e pedidos após aprovar
            await reloadPets()
            // Recarregar pedidos também
            const [requests, adotantes] = await Promise.all([
                api.getAdoptionRequests({ status: 'PENDENTE' }),
                api.getAdotantes(),
            ])
            const adotantesById: Record<number, any> = {}
            adotantes.forEach((a: any) => {
                adotantesById[a.id] = a
            })
            const byPet: Record<number, AdoptionRequestWithAdopter[]> = {}
            requests.forEach((req: any) => {
                const enriched: AdoptionRequestWithAdopter = {
                    ...req,
                    adotante: adotantesById[req.adotanteId],
                }
                if (!byPet[req.petId]) byPet[req.petId] = []
                byPet[req.petId].push(enriched)
            })
            setAdoptionByPet(byPet)
            showAlert('Pedido aprovado!', 'Pedido aprovado com sucesso!', 'success')
        } catch (e) {
            console.error('Erro ao aprovar pedido:', e)
            showAlert('Erro', 'Não foi possível aprovar o pedido.', 'error')
        }
    }

    const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; requestId: number | null; petId: number | null; reason: string }>({ isOpen: false, requestId: null, petId: null, reason: '' })

    const handleReject = (requestId: number, petId: number) => {
        if (!currentUser || (currentUser.role !== 'TUTOR' && currentUser.role !== 'ONG')) {
            showAlert('Acesso negado', 'Apenas tutor ou ONG podem rejeitar pedidos.', 'warning')
            return
        }

        setRejectModal({ isOpen: true, requestId, petId, reason: '' })
    }

    const confirmReject = async () => {
        if (!rejectModal.requestId || !currentUser) return
        try {
            await api.rejectAdoptionRequest(rejectModal.requestId, {
                responderId: currentUser.id,
                responderType: currentUser.role === 'TUTOR' ? 'TUTOR' : 'ONG',
                reason: rejectModal.reason || undefined,
            })
            const petId = rejectModal.petId
            setRejectModal({ isOpen: false, requestId: null, petId: null, reason: '' })
            // Recarregar pets e pedidos após rejeitar
            await reloadPets()
            // Recarregar pedidos também
            const [requests, adotantes] = await Promise.all([
                api.getAdoptionRequests({ status: 'PENDENTE' }),
                api.getAdotantes(),
            ])
            const adotantesById: Record<number, any> = {}
            adotantes.forEach((a: any) => {
                adotantesById[a.id] = a
            })
            const byPet: Record<number, AdoptionRequestWithAdopter[]> = {}
            requests.forEach((req: any) => {
                const enriched: AdoptionRequestWithAdopter = {
                    ...req,
                    adotante: adotantesById[req.adotanteId],
                }
                if (!byPet[req.petId]) byPet[req.petId] = []
                byPet[req.petId].push(enriched)
            })
            setAdoptionByPet(byPet)
            showAlert('Pedido rejeitado', 'Pedido rejeitado com sucesso.', 'success')
        } catch (e) {
            console.error('Erro ao rejeitar pedido:', e)
            showAlert('Erro', 'Não foi possível rejeitar o pedido.', 'error')
        }
    }

    return (
        <div className="min-h-screen bg-[#FFF1BA]">
            <TopBar />
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-5xl font-bold text-[#5C4A1F] mb-2">
                            Administração de Pets
                        </h1>
                        <p className="text-xl text-[#8B6914]">
                            Gerencie os pets disponíveis para adoção e responda pedidos
                        </p>
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="bg-[#F5B563] hover:bg-[#E5A553] text-[#5C4A1F] font-bold text-lg px-8 py-6 rounded-2xl shadow-lg transition-all"
                    >
                        <Plus className="w-6 h-6 mr-2" />
                        Adicionar Pet
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-[#8B6914] text-lg font-medium mb-2">
                                    Pets visíveis
                                </p>
                                <p className="text-5xl font-bold text-[#5C4A1F]">
                                    {visiblePets.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-[#8B6914] text-lg font-medium mb-2">
                                    Cachorros
                                </p>
                                <p className="text-5xl font-bold text-[#5C4A1F]">
                                    {visiblePets.filter(p => p.type === 'dog').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p className="text-[#8B6914] text-lg font-medium mb-2">
                                    Gatos
                                </p>
                                <p className="text-5xl font-bold text-[#5C4A1F]">
                                    {visiblePets.filter(p => p.type === 'cat').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Pets */}
                <div className="space-y-4">
                    {visiblePets.map((pet: any) => {
                        const requests = adoptionByPet[pet.id] || []

                        return (
                            <Card
                                key={pet.id}
                                className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 hover:shadow-xl transition-all"
                            >
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        {/* Imagem */}
                                        <div className="relative w-full md:w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={pet.images[0]}
                                                alt={pet.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-[#F5E6C3] rounded-full p-2 border-2 border-[#5C4A1F]">
                                                {pet.type === 'cat' ? (
                                                    <Cat className="w-5 h-5 text-[#5C4A1F]" />
                                                ) : (
                                                    <Dog className="w-5 h-5 text-[#5C4A1F]" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Informações */}
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-2xl font-bold text-[#5C4A1F]">
                                                {pet.name}
                                            </h3>
                                            <p className="text-[#8B6914] mb-1 line-clamp-2">
                                                {pet.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {pet.tags
                                                    .filter((tag: string) => tag && tag.trim().length > 0)
                                                    .map((tag: string, index: number) => {
                                                        const trimmedTag = tag.trim()
                                                        return (
                                                            <span
                                                                key={index}
                                                                className="bg-[#FFF1BA] text-[#5C4A1F] px-3 py-1 rounded-full text-sm font-medium border border-[#5C4A1F]/20 whitespace-nowrap"
                                                            >
                                                                {trimmedTag}
                                                            </span>
                                                        )
                                                    })}
                                            </div>
                                            <div className="mt-2 text-[#8B6914] text-sm space-y-1">
                                                <p>
                                                    <strong>Localização:</strong> {pet.location}
                                                </p>
                                                <p>
                                                    <strong>Status:</strong>{' '}
                                                    {formatPetStatus(pet.status)}
                                                </p>

                                            </div>

                                            {/* Pedidos de adoção (só tutor/ONG) */}
                                            {currentUser &&
                                                (currentUser.role === 'TUTOR' ||
                                                    currentUser.role === 'ONG') && (
                                                    <div className="mt-4 border-t border-[#5C4A1F]/20 pt-3">
                                                        <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-[#5C4A1F]">
                                Pedidos de adoção
                              </span>
                                                            {loadingRequests && (
                                                                <span className="text-xs text-[#8B6914]">
                                  carregando...
                                </span>
                                                            )}
                                                        </div>

                                                        {requests.length === 0 ? (
                                                            <p className="text-sm text-[#8B6914]">
                                                                Nenhum pedido pendente para este pet.
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {requests.map(req => (
                                                                    <div
                                                                        key={req.id}
                                                                        className="bg-white/60 border border-[#5C4A1F]/20 rounded-lg p-3 flex flex-col gap-1"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-[#5C4A1F]">
                                                                                    {req.adotante?.nome ??
                                                                                        `Adotante #${req.adotanteId}`}
                                                                                </p>
                                                                                <p className="text-xs text-[#8B6914]">
                                                                                    {req.adotante?.email}
                                                                                    {req.adotante?.telefone
                                                                                        ? ` • ${req.adotante.telefone}`
                                                                                        : ''}
                                                                                </p>
                                                                            </div>
                                                                            <span className="text-xs px-2 py-1 rounded-full bg-[#FFF1BA] text-[#5C4A1F] border border-[#5C4A1F]/30">
                                        {req.status}
                                      </span>
                                                                        </div>
                                                                        {req.message && (
                                                                            <p className="text-xs text-[#5C4A1F] mt-1">
                                                                                <strong>Mensagem:</strong>{' '}
                                                                                {req.message}
                                                                            </p>
                                                                        )}

                                                                        <div className="mt-2 flex gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                                                                                onClick={() =>
                                                                                    handleApprove(req.id, pet.id)
                                                                                }
                                                                            >
                                                                                <Check className="w-4 h-4 mr-1" />
                                                                                Aprovar
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="destructive"
                                                                                className="text-xs px-3 py-1"
                                                                                onClick={() =>
                                                                                    handleReject(req.id, pet.id)
                                                                                }
                                                                            >
                                                                                <X className="w-4 h-4 mr-1" />
                                                                                Rejeitar
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                        </div>

                                        {/* Ações básicas */}
                                        <div className="flex flex-col gap-3">
                                            {/* Botão para ver histórico - sempre visível */}
                                            <Button
                                                onClick={async () => {
                                                    setHistoryModal({ isOpen: true, petId: pet.id })
                                                    setLoadingHistory(true)
                                                    try {
                                                        const history = await api.getLocationHistoryByPet(pet.id)
                                                        setPetHistory(history)
                                                    } catch (err) {
                                                        console.error('Erro ao carregar histórico:', err)
                                                        setPetHistory([])
                                                    } finally {
                                                        setLoadingHistory(false)
                                                    }
                                                }}
                                                className="bg-[#8B6914] hover:bg-[#7A5A0F] text-white font-medium px-6 py-3 rounded-xl"
                                            >
                                                <History className="w-5 h-5 mr-2" />
                                                Ver Histórico
                                            </Button>
                                            
                                            {/* Se pet está ADOTADO, apenas o adotante pode editar */}
                                            {/* Tutor de origem não pode mais editar pets adotados */}
                                            {pet.status === 'ADOTADO' ? (
                                                currentUser?.role === 'ADOTANTE' && pet.adopterId === currentUser.id && (
                                                    <Button
                                                        onClick={() => handleEdit(pet)}
                                                        className="bg-[#5C4A1F] hover:bg-[#4C3A0F] text-white font-medium px-6 py-3 rounded-xl"
                                                    >
                                                        <Pencil className="w-5 h-5 mr-2" />
                                                        Editar
                                                    </Button>
                                                )
                                            ) : (
                                                <>
                                                    <Button
                                                        onClick={() => handleEdit(pet)}
                                                        className="bg-[#5C4A1F] hover:bg-[#4C3A0F] text-white font-medium px-6 py-3 rounded-xl"
                                                    >
                                                        <Pencil className="w-5 h-5 mr-2" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(pet.id)}
                                                        variant="destructive"
                                                        className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl"
                                                    >
                                                        <Trash2 className="w-5 h-5 mr-2" />
                                                        Deletar
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {visiblePets.length === 0 && (
                    <div className="mt-10 text-center text-[#8B6914]">
                        <p>
                            Nenhum pet encontrado para este usuário. Cadastre um novo pet
                            usando o botão acima.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <PetFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    handleCloseModal()
                    // Recarregar após fechar o modal para garantir que novos pets apareçam
                    setTimeout(() => {
                        window.location.reload()
                    }, 300)
                }}
                pet={editingPet}
            />

            {/* Alert Modal */}
            <AlertModal
                isOpen={alert.isOpen}
                onClose={closeAlert}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onConfirm={alert.onConfirm}
            />

            {/* Histórico Modal */}
            {historyModal.isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setHistoryModal({ isOpen: false, petId: null })}
                >
                    <Card 
                        className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <History className="w-6 h-6 text-[#5C4A1F]" />
                                    <h2 className="text-2xl font-bold text-[#5C4A1F]">Histórico de Rastreabilidade</h2>
                                </div>
                                <Button
                                    onClick={() => setHistoryModal({ isOpen: false, petId: null })}
                                    className="bg-[#5C4A1F] hover:bg-[#4C3A0F] text-white rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            
                            {loadingHistory ? (
                                <p className="text-[#8B6914] text-center py-8">Carregando histórico...</p>
                            ) : petHistory.length === 0 ? (
                                <p className="text-[#8B6914] text-center py-8">
                                    Ainda não há ações registradas para este pet.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {petHistory
                                        .slice()
                                        .sort(
                                            (a, b) =>
                                                new Date((a as any).dataInicio as string).getTime() -
                                                new Date((b as any).dataInicio as string).getTime(),
                                        )
                                        .map((item, index) => (
                                            <div
                                                key={item.id ?? index}
                                                className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 rounded-xl p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-[#5C4A1F] text-lg mb-1">
                                                            {(item as any).local || (item as any).tipo || 'Ação'}
                                                        </h3>
                                                        {(item as any).descricao && (
                                                            <p className="text-[#5C4A1F] text-sm mb-2">
                                                                {(item as any).descricao}
                                                            </p>
                                                        )}
                                                        <div className="text-xs text-[#8B6914]">
                                                            <span>
                                                                {formatDateRange(
                                                                    (item as any).dataInicio,
                                                                    (item as any).dataFim
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AlertModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, petId: null })}
                title="Confirmar exclusão"
                message="Tem certeza que deseja deletar este pet? Esta ação não pode ser desfeita."
                type="warning"
                onConfirm={confirmDelete}
                confirmText="Deletar"
                showCancel={true}
            />

            {/* Approve Confirmation Modal */}
            <AlertModal
                isOpen={approveConfirm.isOpen}
                onClose={() => setApproveConfirm({ isOpen: false, requestId: null, petId: null })}
                title="Aprovar pedido"
                message="Aprovar este pedido de adoção? Isso marcará o pet como ADOTADO."
                type="info"
                onConfirm={confirmApprove}
                confirmText="Aprovar"
                showCancel={true}
            />

            {/* Reject Modal */}
            {rejectModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-3xl max-w-md w-full shadow-2xl">
                        <div className="bg-[#FFBD59] p-6 rounded-t-3xl border-b-2 border-[#5C4A1F] flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-[#5C4A1F]">Rejeitar Pedido</h3>
                            <button
                                onClick={() => setRejectModal({ isOpen: false, requestId: null, petId: null, reason: '' })}
                                className="p-2 text-[#5C4A1F] hover:bg-[#F5B563] rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-semibold text-[#5C4A1F] mb-2">
                                Motivo da rejeição (opcional)
                            </label>
                            <textarea
                                value={rejectModal.reason}
                                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                                className="w-full h-24 bg-white border-2 border-[#5C4A1F] rounded-xl p-3 text-[#5C4A1F] text-sm focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all mb-4"
                                placeholder="Digite o motivo da rejeição..."
                            />
                            <div className="flex justify-end gap-3">
                                <Button
                                    onClick={() => setRejectModal({ isOpen: false, requestId: null, petId: null, reason: '' })}
                                    variant="outline"
                                    className="bg-[#FFF1BA] hover:bg-[#F5E6C3] text-[#5C4A1F] font-semibold rounded-xl border-2 border-[#5C4A1F] px-6 py-2"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={confirmReject}
                                    className="bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold rounded-xl border-2 border-[#5C4A1F] px-6 py-2 shadow-md hover:shadow-lg transition-all"
                                >
                                    Rejeitar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
