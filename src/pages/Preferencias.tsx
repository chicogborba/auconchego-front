import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '@/components/TopBar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import * as api from '@/lib/api'
import AlertModal from '@/components/AlertModal'
import { useAlert } from '@/hooks/useAlert'
import { Settings, Save } from 'lucide-react'

function readCurrentUser() {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem('currentUser')
        if (!raw) return null
        return JSON.parse(raw) as { id: number; role: string; nome?: string; email?: string }
    } catch {
        return null
    }
}

export default function Preferencias() {
    const navigate = useNavigate()
    const { alert, showAlert, closeAlert } = useAlert()
    const [currentUser, setCurrentUser] = useState<{ id: number; role: string; nome?: string; email?: string } | null>(null)
    const [adotante, setAdotante] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Estados para os campos editáveis
    const [formData, setFormData] = useState({
        especieDesejada: '',
        temOutrosAnimais: '',
        tipoMoradia: '',
        tempoCasa: '',
        experiencia: '',
        preferVacinado: '',
        preferCastrado: '',
        preferTemperamento: '',
        idadeMinima: '',
        idadeMaxima: '',
        pesoMinimo: '',
        pesoMaximo: '',
    })

    useEffect(() => {
        const user = readCurrentUser()
        setCurrentUser(user)

        if (!user || user.role !== 'ADOTANTE') {
            showAlert('Acesso negado', 'Apenas adotantes podem acessar esta página.', 'error', () => {
                navigate('/main')
            })
            return
        }

        loadAdotante(user.id)
    }, [])

    const loadAdotante = async (id: number) => {
        try {
            setLoading(true)
            const data = await api.getAdotanteById(id)
            setAdotante(data)
            
            // Preencher formData com os dados do adotante
            setFormData({
                especieDesejada: data.especieDesejada || '',
                temOutrosAnimais: data.temOutrosAnimais ? 'sim' : 'nao',
                tipoMoradia: data.tipoMoradia || '',
                tempoCasa: data.tempoCasa || '',
                experiencia: data.experiencia !== null && data.experiencia !== undefined ? (data.experiencia ? 'sim' : 'nao') : '',
                preferVacinado: data.preferVacinado !== null && data.preferVacinado !== undefined ? (data.preferVacinado ? 'sim' : 'nao') : '',
                preferCastrado: data.preferCastrado !== null && data.preferCastrado !== undefined ? (data.preferCastrado ? 'sim' : 'nao') : '',
                preferTemperamento: data.preferTemperamento && Array.isArray(data.preferTemperamento) 
                    ? data.preferTemperamento.join(', ') 
                    : (data.preferTemperamento || ''),
                idadeMinima: data.idadeMinima?.toString() || '',
                idadeMaxima: data.idadeMaxima?.toString() || '',
                pesoMinimo: data.pesoMinimo?.toString() || '',
                pesoMaximo: data.pesoMaximo?.toString() || '',
            })
        } catch (err) {
            console.error('Erro ao carregar adotante:', err)
            showAlert('Erro', 'Não foi possível carregar suas preferências.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!currentUser) return

        if (!formData.especieDesejada) {
            showAlert('Campo obrigatório', 'Espécie desejada é obrigatória.', 'warning')
            return
        }

        try {
            setSaving(true)
            const payload: any = {
                especieDesejada: formData.especieDesejada,
                temOutrosAnimais: formData.temOutrosAnimais === 'sim',
            }

            if (formData.tipoMoradia) payload.tipoMoradia = formData.tipoMoradia
            if (formData.tempoCasa) payload.tempoCasa = formData.tempoCasa
            if (formData.experiencia === 'sim' || formData.experiencia === 'nao') {
                payload.experiencia = formData.experiencia === 'sim'
            }
            if (formData.preferVacinado === 'sim' || formData.preferVacinado === 'nao') {
                payload.preferVacinado = formData.preferVacinado === 'sim'
            }
            if (formData.preferCastrado === 'sim' || formData.preferCastrado === 'nao') {
                payload.preferCastrado = formData.preferCastrado === 'sim'
            }
            if (formData.preferTemperamento && formData.preferTemperamento.trim()) {
                payload.preferTemperamento = formData.preferTemperamento
                    .split(',')
                    .map(t => t.trim())
                    .filter(t => t.length > 0)
            }
            if (formData.idadeMinima && !isNaN(Number(formData.idadeMinima))) {
                payload.idadeMinima = Number(formData.idadeMinima)
            }
            if (formData.idadeMaxima && !isNaN(Number(formData.idadeMaxima))) {
                payload.idadeMaxima = Number(formData.idadeMaxima)
            }
            if (formData.pesoMinimo && !isNaN(Number(formData.pesoMinimo))) {
                payload.pesoMinimo = Number(formData.pesoMinimo)
            }
            if (formData.pesoMaximo && !isNaN(Number(formData.pesoMaximo))) {
                payload.pesoMaximo = Number(formData.pesoMaximo)
            }

            await api.updateAdotante(currentUser.id, payload)
            
            // Recalcular compatibilidade após atualizar
            try {
                await api.getAdotanteCompatibility(currentUser.id)
            } catch (compatError) {
                console.warn('Erro ao recalcular compatibilidade:', compatError)
            }

            await loadAdotante(currentUser.id)
            showAlert('Sucesso!', 'Preferências atualizadas com sucesso!', 'success')
        } catch (err: any) {
            console.error('Erro ao salvar preferências:', err)
            showAlert('Erro', err?.message || 'Não foi possível salvar suas preferências.', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF1BA]">
                <TopBar />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <p className="text-center text-[#5C4A1F]">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!adotante) {
        return (
            <div className="min-h-screen bg-[#FFF1BA]">
                <TopBar />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <p className="text-center text-[#5C4A1F]">Erro ao carregar preferências.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FFF1BA]">
            <TopBar />
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="bg-[#F5E6C3] rounded-3xl p-6 md:p-8 shadow-lg border-2 border-[#5C4A1F]/20">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[#FFBD59] rounded-full">
                            <Settings className="w-6 h-6 text-[#5C4A1F]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#5C4A1F]">Minhas Preferências</h1>
                            <p className="text-[#8B6914] mt-1">Gerencie suas preferências de compatibilidade com pets</p>
                        </div>
                    </div>

                    {/* Grid em duas colunas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                        {/* Coluna 1 */}
                        <div className="space-y-4">
                            {/* Espécie Desejada - OBRIGATÓRIO */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Espécie desejada *
                                </label>
                                <select
                                    value={formData.especieDesejada}
                                    onChange={(e) => setFormData({ ...formData, especieDesejada: e.target.value })}
                                    required
                                    className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                >
                                    <option value="" disabled>Selecione a espécie</option>
                                    <option value="Cachorro">Cachorro</option>
                                    <option value="Gato">Gato</option>
                                </select>
                            </div>

                            {/* Possui outros animais */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Você possui outros animais?
                                </label>
                                <select
                                    value={formData.temOutrosAnimais}
                                    onChange={(e) => setFormData({ ...formData, temOutrosAnimais: e.target.value })}
                                    className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                >
                                    <option value="">Não informado</option>
                                    <option value="sim">Sim</option>
                                    <option value="nao">Não</option>
                                </select>
                            </div>

                            {/* Tipo de moradia */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Tipo de moradia
                                </label>
                                <select
                                    value={formData.tipoMoradia}
                                    onChange={(e) => setFormData({ ...formData, tipoMoradia: e.target.value })}
                                    className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                >
                                    <option value="">Não informado</option>
                                    <option value="apartamento">Apartamento</option>
                                    <option value="casa">Casa com quintal</option>
                                    <option value="chacara">Chácara / sítio</option>
                                </select>
                            </div>

                            {/* Tempo em casa */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Tempo que passa em casa por dia
                                </label>
                                <select
                                    value={formData.tempoCasa}
                                    onChange={(e) => setFormData({ ...formData, tempoCasa: e.target.value })}
                                    className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                >
                                    <option value="">Não informado</option>
                                    <option value="baixo">Menos de 4h</option>
                                    <option value="medio">4 a 8h</option>
                                    <option value="alto">Mais de 8h</option>
                                </select>
                            </div>

                            {/* Experiência */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Já teve pets antes?
                                </label>
                                <select
                                    value={formData.experiencia}
                                    onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                                    className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                >
                                    <option value="">Não informado</option>
                                    <option value="sim">Sim</option>
                                    <option value="nao">Não</option>
                                </select>
                            </div>
                        </div>

                        {/* Coluna 2 */}
                        <div className="space-y-4">
                            {/* Preferência de castração */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Prefere pet castrado?
                                </label>
                                <select
                                    value={formData.preferCastrado}
                                    onChange={(e) => setFormData({ ...formData, preferCastrado: e.target.value })}
                                    className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                >
                                    <option value="">Não informado</option>
                                    <option value="sim">Sim, prefiro castrado</option>
                                    <option value="nao">Não me importo</option>
                                </select>
                            </div>

                            {/* Preferência de vacinação */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Prefere pet vacinado?
                                </label>
                                <select
                                    value={formData.preferVacinado}
                                    onChange={(e) => setFormData({ ...formData, preferVacinado: e.target.value })}
                                    className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                >
                                    <option value="">Não informado</option>
                                    <option value="sim">Sim, prefiro vacinado</option>
                                    <option value="nao">Não me importo</option>
                                </select>
                            </div>

                            {/* Preferência de temperamento */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Temperamento desejado
                                </label>
                                <Input
                                    type="text"
                                    placeholder="ex: dócil, brincalhão, calmo"
                                    value={formData.preferTemperamento}
                                    onChange={(e) => setFormData({ ...formData, preferTemperamento: e.target.value })}
                                    className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                />
                            </div>

                            {/* Idade mínima e máxima */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Idade preferida (anos)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        type="number"
                                        placeholder="Mínima"
                                        min="0"
                                        value={formData.idadeMinima}
                                        onChange={(e) => setFormData({ ...formData, idadeMinima: e.target.value })}
                                        className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Máxima"
                                        min="0"
                                        value={formData.idadeMaxima}
                                        onChange={(e) => setFormData({ ...formData, idadeMaxima: e.target.value })}
                                        className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Peso mínimo e máximo */}
                            <div className="bg-[#FFF1BA] rounded-2xl p-4 border-2 border-[#5C4A1F]/20">
                                <label className="block font-semibold text-[#5C4A1F] mb-2">
                                    Peso preferido (kg)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        type="number"
                                        placeholder="Mínimo"
                                        min="0"
                                        step="0.1"
                                        value={formData.pesoMinimo}
                                        onChange={(e) => setFormData({ ...formData, pesoMinimo: e.target.value })}
                                        className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Máximo"
                                        min="0"
                                        step="0.1"
                                        value={formData.pesoMaximo}
                                        onChange={(e) => setFormData({ ...formData, pesoMaximo: e.target.value })}
                                        className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botão Salvar */}
                    <Button
                        onClick={handleSave}
                        disabled={saving || !formData.especieDesejada}
                        className="w-full h-12 bg-[#F5B563] hover:bg-[#E8A550] text-[#5C4A1F] font-bold text-lg rounded-2xl border-2 border-[#5C4A1F] shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Salvando...' : 'Salvar Preferências'}
                    </Button>
                </div>
            </div>

            <AlertModal
                isOpen={alert.isOpen}
                onClose={closeAlert}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onConfirm={alert.onConfirm}
            />
        </div>
    )
}
