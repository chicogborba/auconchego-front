import { useState, useEffect } from 'react'
import { usePets } from '@/contexts/PetsContext'
import * as api from '@/lib/api'
import type { Pet } from '@/data/petsData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Loader2 } from 'lucide-react'

interface PetFormModalProps {
    isOpen: boolean
    onClose: () => void
    pet: Pet | null
}

interface FormData {
    type: 'cat' | 'dog'
    name: string
    raca: string
    porte: string
    sexo: 'MACHO' | 'FEMEA' | string
    necessidadesEspeciais: boolean
    tratamentoContinuo: boolean
    doencaCronica: boolean
    description?: string
    healthStatus?: string
    dataResgate?: string
    status?: 'DISPONIVEL' | 'ADOTADO' | 'RESERVADO'
    idTutorOrigem?: number
    idTutorAdotante?: number
    idOng?: number

    // novos campos que refletem o schema/front
    idade?: string
    peso?: string
    local?: string
    vacinado: boolean
    castrado: boolean
    temperamentText: string // texto que vira array de temperamento
}

export default function PetFormModal({ isOpen, onClose, pet }: PetFormModalProps) {
    const { addPet, updatePet } = usePets()
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)


    const [formData, setFormData] = useState<FormData>({
        type: 'dog',
        name: '',
        raca: '',
        porte: 'MEDIO',
        sexo: 'MACHO',
        necessidadesEspeciais: false,
        tratamentoContinuo: false,
        doencaCronica: false,
        description: '',
        healthStatus: '',
        dataResgate: new Date().toISOString().slice(0,10),
        status: 'DISPONIVEL',
        idTutorOrigem: undefined,
        idTutorAdotante: undefined,
        idOng: undefined,
        idade: '',
        peso: '',
        local: '',
        vacinado: false,
        castrado: false,
        temperamentText: '',
    })

    const [ongs, setOngs] = useState<any[]>([])
    const [tutors, setTutors] = useState<any[]>([])

    useEffect(() => {
        let mounted = true
        api.getOngs().then(data => {
            if (mounted) setOngs(data)
        }).catch(err => {
            console.warn('Failed to load ONGs', err)
        })
        api.getTutors().then(d => { if (mounted) setTutors(d) }).catch(() => {})
        return () => { mounted = false }
    }, [])

    useEffect(() => {
        if (pet) {
            const anyPet = pet as any
            setFormData({
                type: anyPet.especie?.toLowerCase()?.includes('gato') ? 'cat' : 'dog',
                raca: anyPet.raca ?? '',
                name: anyPet.nome ?? pet.name,
                description: anyPet.descricao ?? '',
                healthStatus: anyPet.descricaoSaude ?? '',
                dataResgate: anyPet.dataResgate
                    ? new Date(anyPet.dataResgate).toISOString().slice(0,10)
                    : new Date().toISOString().slice(0,10),
                status: anyPet.status ?? 'DISPONIVEL',
                idTutorOrigem: anyPet.idTutorOrigem ?? undefined,
                idTutorAdotante: anyPet.idTutorAdotante ?? undefined,
                porte: anyPet.porte ?? 'MEDIO',
                sexo: anyPet.sexo ?? 'MACHO',
                necessidadesEspeciais: !!anyPet.necessidadesEspeciais,
                tratamentoContinuo: !!anyPet.tratamentoContinuo,
                doencaCronica: !!anyPet.doencaCronica,
                idOng: anyPet.idOng ?? anyPet.ong?.id ?? undefined,

                // novos campos
                idade: (anyPet.idade ?? anyPet.age ?? '')?.toString() ?? '',
                peso: (anyPet.peso ?? anyPet.weight ?? '')?.toString() ?? '',
                local: anyPet.local ?? anyPet.location ?? '',
                vacinado: !!(anyPet.vacinado ?? anyPet.vaccinated),
                castrado: !!(anyPet.castrado ?? anyPet.castrated),
                temperamentText: Array.isArray(anyPet.temperamento ?? anyPet.temperament)
                    ? (anyPet.temperamento ?? anyPet.temperament).join(', ')
                    : '',
            })
        } else {
            setFormData({
                type: 'dog',
                raca: '',
                name: '',
                description: '',
                healthStatus: '',
                dataResgate: new Date().toISOString().slice(0,10),
                status: 'DISPONIVEL',
                idTutorOrigem: undefined,
                idTutorAdotante: undefined,
                porte: 'MEDIO',
                sexo: 'MACHO',
                necessidadesEspeciais: false,
                tratamentoContinuo: false,
                doencaCronica: false,
                idOng: undefined,
                idade: '',
                peso: '',
                local: '',
                vacinado: false,
                castrado: false,
                temperamentText: '',
            })
        }
    }, [pet, isOpen])

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            setImageFile(file)
            const { url } = await api.uploadPetImage(file)
            setImageUrl(url)
        } catch (err) {
            console.error('Erro ao enviar imagem', err)
            alert('Não foi possível enviar a imagem. Tente novamente.')
        } finally {
            setUploading(false)
        }
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Build payload em formato de frontend — api.createPet/updatePet mapeia pro backend
            const payload: Record<string, any> = {
                name: formData.name,
                type: formData.type,
                raca: formData.raca || 'SRD',
                porte: formData.porte || 'MEDIO',
                sexo: formData.sexo || 'MACHO',
                descricao: formData.description,
                descricaoSaude: formData.healthStatus,
                dataResgate: formData.dataResgate,
                status: formData.status,
                necessidadesEspeciais: !!formData.necessidadesEspeciais,
                tratamentoContinuo: !!formData.tratamentoContinuo,
                doencaCronica: !!formData.doencaCronica,
                idTutorOrigem: formData.idTutorOrigem,
                idTutorAdotante: formData.idTutorAdotante,
                idOng: formData.idOng ?? undefined,

                // 👇 NOVOS CAMPOS
                idade: formData.idade && formData.idade.trim() !== '' ? Number(formData.idade) : undefined,
                peso: formData.peso && formData.peso.trim() !== '' ? Number(formData.peso) : undefined,
                local: formData.local && formData.local.trim() !== '' ? formData.local : undefined,
                vacinado: !!formData.vacinado,
                castrado: !!formData.castrado,
                temperamento: formData.temperamentText
                    ? formData.temperamentText
                        .split(',')
                        .map(t => t.trim())
                        .filter(Boolean)
                    : [],
            }

            if (imageUrl) {
                // backend espera algo tipo string[] em `imagens`
                ;(payload as any).imagens = [imageUrl]
            }


            if (pet) {
                await updatePet(pet.id, payload)
            } else {
                await addPet(payload)
            }

            onClose()
        } catch (error) {
            console.error('Erro ao salvar pet:', error)
            alert('Erro ao salvar pet. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#F5E6C3] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-[#5C4A1F] shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-[#F5E6C3] border-b-2 border-[#5C4A1F]/20 p-6 flex justify-between items-center z-10">
                    <h2 className="text-3xl font-bold text-[#5C4A1F]">
                        {pet ? 'Editar Pet' : 'Adicionar Novo Pet'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#5C4A1F] hover:bg-[#5C4A1F]/10 p-2 rounded-full transition-all"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Tipo */}
                    <div>
                        <Label className="text-[#5C4A1F] text-lg font-semibold mb-2 block">Tipo *</Label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'dog' }))}
                                className={`flex-1 p-4 rounded-xl font-semibold text-lg transition-all ${
                                    formData.type === 'dog'
                                        ? 'bg-[#F5B563] text-[#5C4A1F] border-2 border-[#5C4A1F]'
                                        : 'bg-[#FFF1BA] text-[#8B6914] border-2 border-[#5C4A1F]/20'
                                }`}
                            >
                                🐕 Cachorro
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'cat' }))}
                                className={`flex-1 p-4 rounded-xl font-semibold text-lg transition-all ${
                                    formData.type === 'cat'
                                        ? 'bg-[#F5B563] text-[#5C4A1F] border-2 border-[#5C4A1F]'
                                        : 'bg-[#FFF1BA] text-[#8B6914] border-2 border-[#5C4A1F]/20'
                                }`}
                            >
                                🐱 Gato
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-[#5C4A1F]">
                            Imagem do pet
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-[#5C4A1F] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FFBD59] file:text-[#5C4A1F] hover:file:bg-[#FFBD59]/90"
                        />
                        {uploading && (
                            <p className="text-xs text-[#8B6914] mt-1">
                                Enviando imagem...
                            </p>
                        )}
                        {imageUrl && (
                            <div className="mt-2">
                                <p className="text-xs text-[#5C4A1F] mb-1">Pré-visualização:</p>
                                <img
                                    src={imageUrl}
                                    alt="Pré-visualização do pet"
                                    className="w-32 h-32 object-cover rounded-xl border border-[#5C4A1F]/20"
                                />
                            </div>
                        )}
                    </div>


                    {/* Nome */}
                    <div>
                        <Label htmlFor="name" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                            Nome *
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl"
                            required
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <Label htmlFor="description" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                            Descrição
                        </Label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl min-h-[100px]"
                        />
                    </div>

                    {/* Health / DataResgate / Status / Tutors / ONG */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="healthStatus" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                                Status de Saúde
                            </Label>
                            <Input
                                id="healthStatus"
                                value={formData.healthStatus}
                                onChange={(e) => setFormData(prev => ({ ...prev, healthStatus: e.target.value }))}
                                placeholder="Ex: Saudável, vacinado"
                                className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
                            />
                        </div>

                        <div>
                            <Label htmlFor="dataResgate" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                                Data do Resgate
                            </Label>
                            <Input
                                id="dataResgate"
                                type="date"
                                value={formData.dataResgate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dataResgate: e.target.value }))}
                                className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
                            />
                        </div>

                        <div>
                            <Label htmlFor="status" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                                Status
                            </Label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                className="w-full bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl"
                            >
                                <option value="DISPONIVEL">Disponível</option>
                                <option value="ADOTADO">Adotado</option>
                                <option value="RESERVADO">Reservado</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="idTutorOrigem" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                                Tutor de Origem
                            </Label>
                            <select
                                id="idTutorOrigem"
                                value={formData.idTutorOrigem ?? ''}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        idTutorOrigem: e.target.value ? Number(e.target.value) : undefined,
                                    }))
                                }
                                className="w-full bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl"
                            >
                                <option value="">-- Selecionar tutor (opcional) --</option>
                                {tutors.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="idTutorAdotante" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                                Tutor Adotante
                            </Label>
                            <select
                                id="idTutorAdotante"
                                value={formData.idTutorAdotante ?? ''}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        idTutorAdotante: e.target.value ? Number(e.target.value) : undefined,
                                    }))
                                }
                                className="w-full bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl"
                            >
                                <option value="">-- Selecionar tutor (opcional) --</option>
                                {tutors.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="idOng" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                                ONG
                            </Label>
                            <select
                                id="idOng"
                                value={formData.idOng ?? ''}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        idOng: e.target.value ? Number(e.target.value) : undefined,
                                    }))
                                }
                                className="w-full bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl"
                            >
                                <option value="">-- Selecionar ONG (opcional) --</option>
                                {ongs.map(o => (
                                    <option key={o.id} value={o.id}>
                                        {o.nome} ({o.cnpj})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Raça, Porte, Sexo, info extras e flags de saúde */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="raca" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                                    Raça *
                                </Label>
                                <Input
                                    id="raca"
                                    value={formData.raca}
                                    onChange={(e) => setFormData(prev => ({ ...prev, raca: e.target.value }))}
                                    placeholder="Ex: SRD"
                                    className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="porte" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                                    Porte *
                                </Label>
                                <select
                                    id="porte"
                                    value={formData.porte}
                                    onChange={(e) => setFormData(prev => ({ ...prev, porte: e.target.value }))}
                                    className="w-full bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl"
                                    required
                                >
                                    <option value="PEQUENO">Pequeno</option>
                                    <option value="MEDIO">Médio</option>
                                    <option value="GRANDE">Grande</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="sexo" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                                    Sexo *
                                </Label>
                                <select
                                    id="sexo"
                                    value={formData.sexo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, sexo: e.target.value }))}
                                    className="w-full bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl"
                                    required
                                >
                                    <option value="MACHO">Macho</option>
                                    <option value="FEMEA">Fêmea</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Idade / Peso / Local */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label htmlFor="idade" className="text-[#5C4A1F] text-sm font-semibold mb-1 block">
                                        Idade
                                    </Label>
                                    <Input
                                        id="idade"
                                        type="number"
                                        min={0}
                                        value={formData.idade}
                                        onChange={(e) => setFormData(prev => ({ ...prev, idade: e.target.value }))}
                                        className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="peso" className="text-[#5C4A1F] text-sm font-semibold mb-1 block">
                                        Peso (kg)
                                    </Label>
                                    <Input
                                        id="peso"
                                        type="number"
                                        min={0}
                                        step="0.1"
                                        value={formData.peso}
                                        onChange={(e) => setFormData(prev => ({ ...prev, peso: e.target.value }))}
                                        className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="local" className="text-[#5C4A1F] text-sm font-semibold mb-1 block">
                                        Local
                                    </Label>
                                    <Input
                                        id="local"
                                        value={formData.local}
                                        onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                                        className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-sm"
                                    />
                                </div>
                            </div>

                            {/* Vacinado / Castrado */}
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.vacinado}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vacinado: e.target.checked }))}
                                        className="w-6 h-6 rounded border-2 border-[#5C4A1F]/20"
                                    />
                                    <span className="text-[#5C4A1F] text-sm font-medium">Vacinado</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.castrado}
                                        onChange={(e) => setFormData(prev => ({ ...prev, castrado: e.target.checked }))}
                                        className="w-6 h-6 rounded border-2 border-[#5C4A1F]/20"
                                    />
                                    <span className="text-[#5C4A1F] text-sm font-medium">Castrado</span>
                                </label>
                            </div>

                            {/* Temperamento */}
                            <div>
                                <Label htmlFor="temperamentText" className="text-[#5C4A1F] text-sm font-semibold mb-1 block">
                                    Temperamento (separar por vírgulas)
                                </Label>
                                <Input
                                    id="temperamentText"
                                    value={formData.temperamentText}
                                    onChange={(e) => setFormData(prev => ({ ...prev, temperamentText: e.target.value }))}
                                    placeholder="Ex: dócil, brincalhão, calmo"
                                    className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-sm"
                                />
                            </div>

                            {/* Flags de saúde já existentes */}
                            <div className="flex flex-col justify-center gap-3 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.necessidadesEspeciais}
                                        onChange={(e) =>
                                            setFormData(prev => ({ ...prev, necessidadesEspeciais: e.target.checked }))
                                        }
                                        className="w-6 h-6 rounded border-2 border-[#5C4A1F]/20"
                                    />
                                    <span className="text-[#5C4A1F] text-sm font-medium">Necessidades Especiais</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.tratamentoContinuo}
                                        onChange={(e) =>
                                            setFormData(prev => ({ ...prev, tratamentoContinuo: e.target.checked }))
                                        }
                                        className="w-6 h-6 rounded border-2 border-[#5C4A1F]/20"
                                    />
                                    <span className="text-[#5C4A1F] text-sm font-medium">Tratamento Contínuo</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.doencaCronica}
                                        onChange={(e) =>
                                            setFormData(prev => ({ ...prev, doencaCronica: e.target.checked }))
                                        }
                                        className="w-6 h-6 rounded border-2 border-[#5C4A1F]/20"
                                    />
                                    <span className="text-[#5C4A1F] text-sm font-medium">Doença Crônica</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-4 pt-4 border-t-2 border-[#5C4A1F]/20">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 text-lg py-6 rounded-xl border-2 border-[#5C4A1F] text-[#5C4A1F] hover:bg-[#5C4A1F]/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#F5B563] hover:bg-[#E5A553] text-[#5C4A1F] font-bold text-lg py-6 rounded-xl"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>{pet ? 'Atualizar' : 'Adicionar'} Pet</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
