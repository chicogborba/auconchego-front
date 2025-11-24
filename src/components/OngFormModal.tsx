import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Loader2 } from 'lucide-react'
import * as api from '@/lib/api'

interface OngFormModalProps {
  isOpen: boolean
  onClose: () => void
  ong: any | null
  onSaved: () => void
}

export default function OngFormModal({ isOpen, onClose, ong, onSaved }: OngFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ cnpj: '', nome: '', endereco: '', telefone: '', email: '' })

  useEffect(() => {
    if (ong) {
      setFormData({ cnpj: ong.cnpj ?? '', nome: ong.nome ?? '', endereco: ong.endereco ?? '', telefone: ong.telefone ?? '', email: ong.email ?? '' })
    } else {
      setFormData({ cnpj: '', nome: '', endereco: '', telefone: '', email: '' })
    }
  }, [ong, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (ong) {
        await api.updateOng(ong.id, formData)
      } else {
        await api.createOng(formData)
      }
      onSaved()
      onClose()
    } catch (error) {
      console.error('Erro ONG:', error)
      alert('Erro ao salvar ONG')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold">{ong ? 'Editar ONG' : 'Adicionar ONG'}</h3>
          <button onClick={onClose} className="p-2"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input id="cnpj" value={formData.cnpj} onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={formData.nome} onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" value={formData.endereco} onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={formData.telefone} onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/>Salvando...</> : (ong ? 'Atualizar' : 'Criar')}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
