import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Loader2 } from 'lucide-react'
import * as api from '@/lib/api'
import { maskCNPJ, unmaskCNPJ, maskPhone, unmaskPhone } from '@/lib/masks'

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
      setFormData({ 
        cnpj: ong.cnpj ? maskCNPJ(ong.cnpj) : '', 
        nome: ong.nome ?? '', 
        endereco: ong.endereco ?? '', 
        telefone: ong.telefone ? maskPhone(ong.telefone) : '', 
        email: ong.email ?? '' 
      })
    } else {
      setFormData({ cnpj: '', nome: '', endereco: '', telefone: '', email: '' })
    }
  }, [ong, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Remove máscaras antes de enviar
      const dataToSend = {
        ...formData,
        cnpj: unmaskCNPJ(formData.cnpj),
        telefone: formData.telefone ? unmaskPhone(formData.telefone) : formData.telefone,
      }
      
      if (ong) {
        await api.updateOng(ong.id, dataToSend)
      } else {
        await api.createOng(dataToSend)
      }
      onSaved()
      onClose()
    } catch (error) {
      console.error('Erro ONG:', error)
      // Erro será tratado silenciosamente ou pode adicionar um toast aqui
      console.error('Erro ao salvar ONG')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F5E6C3] rounded-3xl max-w-2xl w-full border-2 border-[#5C4A1F]/30 shadow-2xl">
        {/* Header */}
        <div className="bg-[#FFBD59] rounded-t-3xl p-6 border-b-2 border-[#5C4A1F]/30 flex items-center justify-between">
          <h3 className="text-2xl md:text-3xl font-bold text-[#5C4A1F]">
            {ong ? 'Editar ONG' : 'Adicionar ONG'}
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
          {/* CNPJ */}
          <div>
            <Label htmlFor="cnpj" className="text-[#5C4A1F] font-semibold mb-2 block">
              CNPJ *
            </Label>
            <Input 
              id="cnpj" 
              value={formData.cnpj} 
              onChange={(e) => setFormData(prev => ({ ...prev, cnpj: maskCNPJ(e.target.value) }))} 
              placeholder="XX.XXX.XXX/XXXX-XX"
              maxLength={18}
              required
              className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
            />
          </div>

          {/* Nome */}
          <div>
            <Label htmlFor="nome" className="text-[#5C4A1F] font-semibold mb-2 block">
              Nome *
            </Label>
            <Input 
              id="nome" 
              value={formData.nome} 
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} 
              required
              className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
            />
          </div>

          {/* Endereço */}
          <div>
            <Label htmlFor="endereco" className="text-[#5C4A1F] font-semibold mb-2 block">
              Endereço
            </Label>
            <Input 
              id="endereco" 
              value={formData.endereco} 
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))} 
              className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
            />
          </div>

          {/* Telefone e Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone" className="text-[#5C4A1F] font-semibold mb-2 block">
                Telefone
              </Label>
              <Input 
                id="telefone" 
                type="tel"
                value={formData.telefone} 
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: maskPhone(e.target.value) }))} 
                placeholder="(XX) XXXXX-XXXX"
                maxLength={15}
                className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-[#5C4A1F] font-semibold mb-2 block">
                Email
              </Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                className="h-12 bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-xl text-[#5C4A1F] focus:ring-2 focus:ring-[#FFBD59] focus:border-[#FFBD59]"
              />
            </div>
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
                ong ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
