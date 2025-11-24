import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import OngFormModal from '@/components/OngFormModal'
import * as api from '@/lib/api'

export default function OngsAdmin() {
  const [ongs, setOngs] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const fetchOngs = async () => {
    try {
      const data = await api.getOngs()
      setOngs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load ONGs', err)
      setOngs([])
    }
  }

  useEffect(() => {
    fetchOngs()
  }, [])

  const handleAdd = () => {
    setEditing(null)
    setIsModalOpen(true)
  }

  const handleEdit = (ong: any) => {
    setEditing(ong)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar esta ONG?')) return
    try {
      await api.deleteOng(id)
      await fetchOngs()
    } catch (err) {
      console.error('Failed to delete ONG', err)
      alert('Erro ao deletar ONG')
    }
  }

  const handleSaved = async () => {
    await fetchOngs()
  }

  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-[#5C4A1F] mb-2">Administração de ONGs</h1>
            <p className="text-xl text-[#8B6914]">Gerencie as organizações cadastradas</p>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-[#F5B563] hover:bg-[#E5A553] text-[#5C4A1F] font-bold text-lg px-8 py-6 rounded-2xl shadow-lg transition-all"
          >
            <Plus className="w-6 h-6 mr-2" />
            Adicionar ONG
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20">
            <CardContent className="p-6 text-center">
              <p className="text-[#8B6914] text-lg font-medium mb-2">Total de ONGs</p>
              <p className="text-5xl font-bold text-[#5C4A1F]">{ongs.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20">
            <CardContent className="p-6 text-center">
              <p className="text-[#8B6914] text-lg font-medium mb-2">Com email</p>
              <p className="text-5xl font-bold text-[#5C4A1F]">{ongs.filter(o => o.email).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20">
            <CardContent className="p-6 text-center">
              <p className="text-[#8B6914] text-lg font-medium mb-2">Com telefone</p>
              <p className="text-5xl font-bold text-[#5C4A1F]">{ongs.filter(o => o.telefone).length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {ongs.map((ong) => (
            <Card key={ong.id} className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#5C4A1F] mb-2">{ong.nome}</h3>
                  <p className="text-[#8B6914] mb-1">CNPJ: {ong.cnpj}</p>
                  <p className="text-[#8B6914]">Endereço: {ong.endereco ?? '—'}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleEdit(ong)}
                    className="bg-[#5C4A1F] hover:bg-[#4C3A0F] text-white font-medium px-6 py-3 rounded-xl"
                  >
                    <Pencil className="w-5 h-5 mr-2" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(ong.id)}
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {ongs.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-3xl font-bold text-[#5C4A1F] mb-4">Nenhuma ONG cadastrada</h3>
            <p className="text-[#8B6914] text-xl mb-8">Adicione a primeira ONG para começar</p>
            <Button onClick={handleAdd} className="bg-[#F5B563] hover:bg-[#E5A553] text-[#5C4A1F] font-bold text-lg px-8 py-6 rounded-2xl shadow-lg">
              <Plus className="w-6 h-6 mr-2" />
              Adicionar ONG
            </Button>
          </div>
        )}
      </div>

      <OngFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ong={editing} onSaved={handleSaved} />
    </div>
  )
}
