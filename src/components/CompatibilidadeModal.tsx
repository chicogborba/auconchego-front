import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CompatibilidadeModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: CompatibilidadeData) => void
    initialData?: CompatibilidadeData
}

export interface CompatibilidadeData {
    especieDesejada: string
    temOutrosAnimais: string
    tipoMoradia: string
    tempoCasa: string
    experiencia: string
    preferVacinado: string
    preferCastrado: string
    preferTemperamento: string
    idadeMinima: string
    idadeMaxima: string
    pesoMinimo: string
    pesoMaximo: string
}

export default function CompatibilidadeModal({
    isOpen,
    onClose,
    onSave,
    initialData,
}: CompatibilidadeModalProps) {
    const [formData, setFormData] = useState<CompatibilidadeData>({
        especieDesejada: initialData?.especieDesejada || '',
        temOutrosAnimais: initialData?.temOutrosAnimais || '',
        tipoMoradia: initialData?.tipoMoradia || '',
        tempoCasa: initialData?.tempoCasa || '',
        experiencia: initialData?.experiencia || '',
        preferVacinado: initialData?.preferVacinado || '',
        preferCastrado: initialData?.preferCastrado || '',
        preferTemperamento: initialData?.preferTemperamento || '',
        idadeMinima: initialData?.idadeMinima || '',
        idadeMaxima: initialData?.idadeMaxima || '',
        pesoMinimo: initialData?.pesoMinimo || '',
        pesoMaximo: initialData?.pesoMaximo || '',
    })

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.especieDesejada) {
            alert('Espécie desejada é obrigatória')
            return
        }
        onSave(formData)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#FFF1BA] rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-[#5C4A1F]">
                <div className="sticky top-0 bg-[#FFBD59] px-6 py-4 flex items-center justify-between border-b-2 border-[#5C4A1F]">
                    <h2 className="text-2xl font-bold text-[#5C4A1F]">Compatibilidade com pets</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#F5E6C3] rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-[#5C4A1F]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Espécie Desejada - OBRIGATÓRIO */}
                    <select
                        value={formData.especieDesejada}
                        onChange={(e) => setFormData({ ...formData, especieDesejada: e.target.value })}
                        required
                        className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    >
                        <option value="" disabled>Espécie desejada *</option>
                        <option value="Cachorro">Cachorro</option>
                        <option value="Gato">Gato</option>
                    </select>

                    {/* Possui outros animais */}
                    <select
                        value={formData.temOutrosAnimais}
                        onChange={(e) => setFormData({ ...formData, temOutrosAnimais: e.target.value })}
                        className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    >
                        <option value="" disabled>Você possui outros animais?</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                    </select>

                    {/* Tipo de moradia */}
                    <select
                        value={formData.tipoMoradia}
                        onChange={(e) => setFormData({ ...formData, tipoMoradia: e.target.value })}
                        className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    >
                        <option value="" disabled>Tipo de moradia</option>
                        <option value="apartamento">Apartamento</option>
                        <option value="casa">Casa com quintal</option>
                        <option value="chacara">Chácara / sítio</option>
                    </select>

                    {/* Tempo em casa */}
                    <select
                        value={formData.tempoCasa}
                        onChange={(e) => setFormData({ ...formData, tempoCasa: e.target.value })}
                        className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    >
                        <option value="" disabled>Tempo que passa em casa por dia</option>
                        <option value="baixo">Menos de 4h</option>
                        <option value="medio">4 a 8h</option>
                        <option value="alto">Mais de 8h</option>
                    </select>

                    {/* Experiência */}
                    <select
                        value={formData.experiencia}
                        onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                        className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    >
                        <option value="" disabled>Já teve pets antes?</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                    </select>

                    {/* Preferência de vacinação */}
                    <select
                        value={formData.preferVacinado}
                        onChange={(e) => setFormData({ ...formData, preferVacinado: e.target.value })}
                        className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    >
                        <option value="" disabled>Prefere pet vacinado?</option>
                        <option value="sim">Sim, prefiro vacinado</option>
                        <option value="nao">Não me importo</option>
                    </select>

                    {/* Preferência de castração */}
                    <select
                        value={formData.preferCastrado}
                        onChange={(e) => setFormData({ ...formData, preferCastrado: e.target.value })}
                        className="w-full h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] px-4 font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    >
                        <option value="" disabled>Prefere pet castrado?</option>
                        <option value="sim">Sim, prefiro castrado</option>
                        <option value="nao">Não me importo</option>
                    </select>

                    {/* Preferência de temperamento */}
                    <Input
                        type="text"
                        placeholder="Temperamento desejado (ex: dócil, brincalhão, calmo)"
                        value={formData.preferTemperamento}
                        onChange={(e) => setFormData({ ...formData, preferTemperamento: e.target.value })}
                        className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    />

                    {/* Idade mínima e máxima */}
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="number"
                            placeholder="Idade mínima (anos)"
                            min="0"
                            value={formData.idadeMinima}
                            onChange={(e) => setFormData({ ...formData, idadeMinima: e.target.value })}
                            className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                        />
                        <Input
                            type="number"
                            placeholder="Idade máxima (anos)"
                            min="0"
                            value={formData.idadeMaxima}
                            onChange={(e) => setFormData({ ...formData, idadeMaxima: e.target.value })}
                            className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                        />
                    </div>

                    {/* Peso mínimo e máximo */}
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="number"
                            placeholder="Peso mínimo (kg)"
                            min="0"
                            step="0.1"
                            value={formData.pesoMinimo}
                            onChange={(e) => setFormData({ ...formData, pesoMinimo: e.target.value })}
                            className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                        />
                        <Input
                            type="number"
                            placeholder="Peso máximo (kg)"
                            min="0"
                            step="0.1"
                            value={formData.pesoMaximo}
                            onChange={(e) => setFormData({ ...formData, pesoMaximo: e.target.value })}
                            className="h-12 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] px-4 font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 bg-[#8B6914] hover:bg-[#6f5310] text-white font-bold rounded-2xl border-2 border-[#5C4A1F] shadow-md"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-12 bg-[#F5B563] hover:bg-[#E8A550] text-[#5C4A1F] font-bold rounded-2xl border-2 border-[#5C4A1F] shadow-md"
                        >
                            Salvar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

