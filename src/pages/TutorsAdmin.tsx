import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import TutorFormModal from '@/components/TutorFormModal'
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

export default function TutorsAdmin() {
  const { alert, showAlert, closeAlert } = useAlert()
  const [tutors, setTutors] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; tutorId: number | null }>({ isOpen: false, tutorId: null })

  const fetchTutors = async () => {
    try {
      const data = await api.getTutors()
      setTutors(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load tutors', err)
      setTutors([])
    }
  }

  useEffect(() => {
    const user = readCurrentUser()
    
    // Verifica se o usuário tem permissão (apenas ROOT)
    if (!user || user.role !== 'ROOT') {
      showAlert('Acesso negado', 'Apenas administradores podem acessar esta área.', 'error', () => {
        window.location.href = '/main'
      })
      return
    }
    
    fetchTutors()
  }, [])

  const handleAdd = () => { setEditing(null); setIsModalOpen(true) }
  const handleEdit = (t: any) => { setEditing(t); setIsModalOpen(true) }
  const handleSaved = async () => { await fetchTutors() }

  const handleDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, tutorId: id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.tutorId) return
    try {
      await api.deleteTutor(deleteConfirm.tutorId)
      setDeleteConfirm({ isOpen: false, tutorId: null })
      await fetchTutors()
      showAlert('Tutor deletado', 'Tutor deletado com sucesso!', 'success')
    } catch (err) {
      console.error('Failed to delete tutor', err)
      showAlert('Erro', 'Erro ao deletar tutor', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-[#5C4A1F] mb-2">Administração de Tutores</h1>
            <p className="text-xl text-[#8B6914]">Gerencie os tutores cadastrados</p>
          </div>
          <Button onClick={handleAdd} className="bg-[#F5B563] hover:bg-[#E5A553] text-[#5C4A1F] font-bold text-lg px-8 py-6 rounded-2xl shadow-lg transition-all">
            <Plus className="w-6 h-6 mr-2" /> Adicionar Tutor
          </Button>
        </div>

        <div className="space-y-4">
          {tutors.map(t => (
            <Card key={t.id} className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#5C4A1F] mb-2">{t.nome}</h3>
                  <p className="text-[#8B6914] mb-1">Email: {t.email}</p>
                  <p className="text-[#8B6914]">Telefone: {t.telefone ?? '—'}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => handleEdit(t)} className="bg-[#5C4A1F] hover:bg-[#4C3A0F] text-white font-medium px-6 py-3 rounded-xl"><Pencil className="w-5 h-5 mr-2"/>Editar</Button>
                  <Button variant="destructive" onClick={() => handleDelete(t.id)} className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl"><Trash2 className="w-5 h-5 mr-2"/>Deletar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tutors.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-3xl font-bold text-[#5C4A1F] mb-4">Nenhum tutor cadastrado</h3>
            <p className="text-[#8B6914] text-xl mb-8">Adicione o primeiro tutor para começar</p>
            <Button onClick={handleAdd} className="bg-[#F5B563] hover:bg-[#E5A553] text-[#5C4A1F] font-bold text-lg px-8 py-6 rounded-2xl shadow-lg"><Plus className="w-6 h-6 mr-2"/>Adicionar Tutor</Button>
          </div>
        )}
      </div>

      <TutorFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tutor={editing} onSaved={handleSaved} />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.onConfirm}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, tutorId: null })}
        title="Confirmar exclusão"
        message="Tem certeza que deseja deletar este tutor? Esta ação não pode ser desfeita."
        type="warning"
        onConfirm={confirmDelete}
        confirmText="Deletar"
        showCancel={true}
      />
    </div>
  )
}
