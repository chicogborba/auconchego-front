import { useEffect, useMemo, useState } from 'react'
import TopBar from '@/components/TopBar'
import { usePets } from '@/contexts/PetsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Cat, Dog, Check, X } from 'lucide-react'
import PetFormModal from '@/components/PetFormModal'
import type { Pet } from '@/data/petsData'
import * as api from '@/lib/api'

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


export default function PetsAdmin() {
    const { pets, deletePet } = usePets()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPet, setEditingPet] = useState<Pet | null>(null)
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

    const [adoptionByPet, setAdoptionByPet] = useState<
        Record<number, AdoptionRequestWithAdopter[]>
    >({})
    const [loadingRequests, setLoadingRequests] = useState(false)

    useEffect(() => {
        setCurrentUser(readCurrentUser())
    }, [])

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja deletar este pet?')) {
            ;(async () => {
                try {
                    await deletePet(id)
                } catch (e) {
                    alert('Erro ao deletar pet')
                }
            })()
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

    const allPets = Object.values(pets)

    // 🔍 pets visíveis pro usuário atual
    const visiblePets = useMemo(() => {
        if (!currentUser) return allPets

        // TUTOR vê só pets em que ele é tutor de origem
        if (currentUser.role === 'TUTOR') {
            return allPets.filter((p: any) => p.idTutorOrigem === currentUser.id)
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

    const handleApprove = (requestId: number, petId: number) => {
        if (!currentUser || (currentUser.role !== 'TUTOR' && currentUser.role !== 'ONG')) {
            alert('Apenas tutor ou ONG podem aprovar pedidos.')
            return
        }

        if (!window.confirm('Aprovar este pedido de adoção? Isso marcará o pet como ADOTADO.')) {
            return
        }

        ;(async () => {
            try {
                await api.approveAdoptionRequest(requestId, {
                    responderId: currentUser.id,
                    responderType: currentUser.role === 'TUTOR' ? 'TUTOR' : 'ONG',
                })
                alert('Pedido aprovado com sucesso!')

                // mais simples: recarregar página pra atualizar status do pet
                window.location.reload()
            } catch (e) {
                console.error('Erro ao aprovar pedido:', e)
                alert('Não foi possível aprovar o pedido.')
            }
        })()
    }

    const handleReject = (requestId: number, petId: number) => {
        if (!currentUser || (currentUser.role !== 'TUTOR' && currentUser.role !== 'ONG')) {
            alert('Apenas tutor ou ONG podem rejeitar pedidos.')
            return
        }

        const reason = window.prompt('Motivo da rejeição (opcional):') ?? undefined

        ;(async () => {
            try {
                await api.rejectAdoptionRequest(requestId, {
                    responderId: currentUser.id,
                    responderType: currentUser.role === 'TUTOR' ? 'TUTOR' : 'ONG',
                    reason,
                })
                alert('Pedido rejeitado.')

                // atualiza apenas a lista local
                setAdoptionByPet(prev => {
                    const copy = { ...prev }
                    const list = copy[petId] || []
                    copy[petId] = list.filter(r => r.id !== requestId)
                    return copy
                })
            } catch (e) {
                console.error('Erro ao rejeitar pedido:', e)
                alert('Não foi possível rejeitar o pedido.')
            }
        })()
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
                                                {pet.tags.map((tag: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="bg-[#FFF1BA] text-[#5C4A1F] px-3 py-1 rounded-full text-sm font-medium border border-[#5C4A1F]/20"
                                                    >
                            {tag}
                          </span>
                                                ))}
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
                onClose={handleCloseModal}
                pet={editingPet}
            />
        </div>
    )
}
