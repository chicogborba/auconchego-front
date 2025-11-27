import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Loader2 } from 'lucide-react'
import * as api from '@/lib/api'
import { maskPhone, unmaskPhone, maskCEP, unmaskCEP } from '@/lib/masks'

interface Props {
  isOpen: boolean
  onClose: () => void
  tutor: any | null
  onSaved: (tutor?: any) => void
}

export default function TutorFormModal({ isOpen, onClose, tutor, onSaved }: Props) {
  const [loading, setLoading] = useState(false)
  const [ongs, setOngs] = useState<any[]>([])
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', endereco: '', cidade: '', estado: '', cep: '', idOng: undefined as number | undefined })

  useEffect(() => {
    let mounted = true
    api.getOngs().then(d => mounted && setOngs(d)).catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (tutor) {
      setForm({
        nome: tutor.nome ?? '',
        email: tutor.email ?? '',
        telefone: tutor.telefone ? maskPhone(tutor.telefone) : '',
        endereco: tutor.endereco ?? '',
        cidade: tutor.cidade ?? '',
        estado: tutor.estado ?? '',
        cep: tutor.cep ? maskCEP(tutor.cep) : '',
        idOng: tutor.idOng ?? undefined,
      })
    } else {
      setForm({ nome: '', email: '', telefone: '', endereco: '', cidade: '', estado: '', cep: '', idOng: undefined })
    }
  }, [tutor, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Remove máscaras antes de enviar
      const dataToSend = {
        ...form,
        telefone: form.telefone ? unmaskPhone(form.telefone) : form.telefone,
        cep: form.cep ? unmaskCEP(form.cep) : form.cep,
      }
      
      // If tutor has an id, update; otherwise create
      if (tutor && (tutor as any).id) {
        await api.updateTutor((tutor as any).id, dataToSend)
        onSaved?.()
      } else {
        const created = await api.createTutor(dataToSend)
        onSaved?.(created)
      }
      onClose()
    } catch (err) {
      console.error('Tutor error', err)
      // Erro será tratado silenciosamente ou pode adicionar um toast aqui
      console.error('Erro ao salvar tutor')
    } finally { setLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F5E6C3] rounded-3xl max-w-2xl w-full border-2 border-[#5C4A1F]/30 shadow-2xl">
        {/* Header */}
        <div className="bg-[#FFBD59] rounded-t-3xl p-6 border-b-2 border-[#5C4A1F]/30 flex items-center justify-between">
          <h3 className="text-2xl md:text-3xl font-bold text-[#5C4A1F]">
            {tutor ? 'Editar Tutor' : 'Adicionar Tutor'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-[#F5B563] transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6 text-[#5C4A1F]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {/* Nome */}
          <div>
            <Label htmlFor="nome" className="text-[#5C4A1F] font-semibold mb-2 block">
              Nome *
            </Label>
            <Input 
              id="nome" 
              value={form.nome} 
              onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))} 
              required
              className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
            />
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-[#5C4A1F] font-semibold mb-2 block">
                Email *
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} 
                required
                className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
              />
            </div>
            <div>
              <Label htmlFor="telefone" className="text-[#5C4A1F] font-semibold mb-2 block">
                Telefone
              </Label>
              <Input 
                id="telefone" 
                type="tel"
                value={form.telefone} 
                onChange={(e) => setForm(prev => ({ ...prev, telefone: maskPhone(e.target.value) }))} 
                placeholder="(XX) XXXXX-XXXX"
                maxLength={15}
                className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <Label htmlFor="endereco" className="text-[#5C4A1F] font-semibold mb-2 block">
              Endereço
            </Label>
            <Input 
              id="endereco" 
              value={form.endereco} 
              onChange={(e) => setForm(prev => ({ ...prev, endereco: e.target.value }))} 
              className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
            />
          </div>

          {/* Cidade, Estado e CEP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cidade" className="text-[#5C4A1F] font-semibold mb-2 block">
                Cidade
              </Label>
              <Input 
                id="cidade"
                placeholder="Cidade" 
                value={form.cidade} 
                onChange={(e) => setForm(prev => ({ ...prev, cidade: e.target.value }))} 
                className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
              />
            </div>
            <div>
              <Label htmlFor="estado" className="text-[#5C4A1F] font-semibold mb-2 block">
                Estado
              </Label>
              <Input 
                id="estado"
                placeholder="Estado" 
                value={form.estado} 
                onChange={(e) => setForm(prev => ({ ...prev, estado: e.target.value }))} 
                className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
              />
            </div>
            <div>
              <Label htmlFor="cep" className="text-[#5C4A1F] font-semibold mb-2 block">
                CEP
              </Label>
              <Input 
                id="cep"
                placeholder="XXXXX-XXX" 
                value={form.cep} 
                onChange={(e) => setForm(prev => ({ ...prev, cep: maskCEP(e.target.value) }))} 
                maxLength={9}
                className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
              />
            </div>
          </div>

          {/* ONG */}
          <div>
            <Label htmlFor="idOng" className="text-[#5C4A1F] font-semibold mb-2 block">
              ONG (opcional)
            </Label>
            <select 
              id="idOng" 
              value={form.idOng ?? ''} 
              onChange={(e) => setForm(prev => ({ ...prev, idOng: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] px-4 focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59] focus:outline-none"
            >
              <option value="">-- Selecionar ONG (opcional) --</option>
              {ongs.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </div>

          {/* Botões */}
          <div className="flex gap-4 justify-end pt-4 border-t-2 border-[#5C4A1F]/20">
            <Button 
              type="button" 
              onClick={onClose}
              className="h-12 px-6 bg-[#FFF1BA] hover:bg-[#F5E6C3] text-[#5C4A1F] font-bold rounded-xl border-2 border-[#5C4A1F] transition-all"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-12 px-6 bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold rounded-xl border-2 border-[#5C4A1F] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                tutor ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
