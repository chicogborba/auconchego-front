import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Loader2 } from 'lucide-react'
import * as api from '@/lib/api'

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
        telefone: tutor.telefone ?? '',
        endereco: tutor.endereco ?? '',
        cidade: tutor.cidade ?? '',
        estado: tutor.estado ?? '',
        cep: tutor.cep ?? '',
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
      // If tutor has an id, update; otherwise create
      if (tutor && (tutor as any).id) {
        await api.updateTutor((tutor as any).id, form)
        onSaved?.()
      } else {
        const created = await api.createTutor(form)
        onSaved?.(created)
      }
      onClose()
    } catch (err) {
      console.error('Tutor error', err)
      alert('Erro ao salvar tutor')
    } finally { setLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold">{tutor ? 'Editar Tutor' : 'Adicionar Tutor'}</h3>
          <button onClick={onClose} className="p-2"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={form.nome} onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={form.telefone} onChange={(e) => setForm(prev => ({ ...prev, telefone: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" value={form.endereco} onChange={(e) => setForm(prev => ({ ...prev, endereco: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input placeholder="Cidade" value={form.cidade} onChange={(e) => setForm(prev => ({ ...prev, cidade: e.target.value }))} />
            <Input placeholder="Estado" value={form.estado} onChange={(e) => setForm(prev => ({ ...prev, estado: e.target.value }))} />
            <Input placeholder="CEP" value={form.cep} onChange={(e) => setForm(prev => ({ ...prev, cep: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="idOng">ONG</Label>
            <select id="idOng" value={form.idOng ?? ''} onChange={(e) => setForm(prev => ({ ...prev, idOng: e.target.value ? Number(e.target.value) : undefined }))}>
              <option value="">-- Selecionar ONG (opcional) --</option>
              {ongs.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/>Salvando...</> : (tutor ? 'Atualizar' : 'Criar')}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
