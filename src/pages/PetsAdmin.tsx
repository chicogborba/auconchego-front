import { useState } from 'react'
import TopBar from '@/components/TopBar'
import { usePets } from '@/contexts/PetsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Cat, Dog } from 'lucide-react'
import PetFormModal from '@/components/PetFormModal'
import type { Pet } from '@/data/petsData'

export default function PetsAdmin() {
  const { pets, deletePet } = usePets()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)

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
              Gerencie os pets disponíveis para adoção
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
                <p className="text-[#8B6914] text-lg font-medium mb-2">Total de Pets</p>
                <p className="text-5xl font-bold text-[#5C4A1F]">{allPets.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-[#8B6914] text-lg font-medium mb-2">Cachorros</p>
                <p className="text-5xl font-bold text-[#5C4A1F]">
                  {allPets.filter(p => p.type === 'dog').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-[#8B6914] text-lg font-medium mb-2">Gatos</p>
                <p className="text-5xl font-bold text-[#5C4A1F]">
                  {allPets.filter(p => p.type === 'cat').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Pets */}
        <div className="space-y-4">
          {allPets.map((pet) => (
            <Card key={pet.id} className="bg-[#F5E6C3] border-2 border-[#5C4A1F]/20 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Imagem */}
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
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
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#5C4A1F] mb-2">{pet.name}</h3>
                    <p className="text-[#8B6914] mb-3 line-clamp-2">{pet.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {pet.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-[#FFF1BA] text-[#5C4A1F] px-3 py-1 rounded-full text-sm font-medium border border-[#5C4A1F]/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 text-[#8B6914] text-sm">
                      <p><strong>Localização:</strong> {pet.location}</p>
                      <p><strong>Idade:</strong> {pet.age} • <strong>Tamanho:</strong> {pet.size} • <strong>Peso:</strong> {pet.weight}</p>
                    </div>
                  </div>

                  {/* Ações */}
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
          ))}
        </div>

        {/* Mensagem quando não há pets */}
        {allPets.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-3xl font-bold text-[#5C4A1F] mb-4">
              Nenhum pet cadastrado
            </h3>
            <p className="text-[#8B6914] text-xl mb-8">
              Adicione o primeiro pet para começar
            </p>
            <Button
              onClick={handleAdd}
              className="bg-[#F5B563] hover:bg-[#E5A553] text-[#5C4A1F] font-bold text-lg px-8 py-6 rounded-2xl shadow-lg"
            >
              <Plus className="w-6 h-6 mr-2" />
              Adicionar Pet
            </Button>
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
