import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { usePets } from '@/contexts/PetsContext'
import type { Pet } from '@/data/petsData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Upload, MapPin, Loader2 } from 'lucide-react'

interface PetFormModalProps {
  isOpen: boolean
  onClose: () => void
  pet: Pet | null
}

interface FormData {
  type: 'cat' | 'dog'
  name: string
  description: string
  images: string[]
  tags: string
  age: string
  size: string
  weight: string
  location: string
  address: string
  vaccinated: boolean
  castrated: boolean
  temperament: string
  healthStatus: string
  coordinates: {
    lat: number
    lng: number
  }
}

export default function PetFormModal({ isOpen, onClose, pet }: PetFormModalProps) {
  const { addPet, updatePet } = usePets()
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    type: 'dog',
    name: '',
    description: '',
    images: [''],
    tags: '',
    age: '',
    size: 'Médio',
    weight: '',
    location: '',
    address: '',
    vaccinated: false,
    castrated: false,
    temperament: '',
    healthStatus: '',
    coordinates: { lat: 0, lng: 0 }
  })

  useEffect(() => {
    if (pet) {
      setFormData({
        type: pet.type,
        name: pet.name,
        description: pet.description,
        images: pet.images,
        tags: pet.tags.join(', '),
        age: pet.age,
        size: pet.size,
        weight: pet.weight,
        location: pet.location,
        address: pet.address,
        vaccinated: pet.vaccinated,
        castrated: pet.castrated,
        temperament: pet.temperament.join(', '),
        healthStatus: pet.healthStatus,
        coordinates: pet.coordinates
      })
    } else {
      setFormData({
        type: 'dog',
        name: '',
        description: '',
        images: [''],
        tags: '',
        age: '',
        size: 'Médio',
        weight: '',
        location: '',
        address: '',
        vaccinated: false,
        castrated: false,
        temperament: '',
        healthStatus: '',
        coordinates: { lat: 0, lng: 0 }
      })
    }
  }, [pet, isOpen])

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData(prev => {
          const newImages = [...prev.images]
          newImages[index] = base64
          return { ...prev, images: newImages }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const addImageSlot = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const removeImageSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const geocodeAddress = async () => {
    if (!formData.address) {
      alert('Por favor, insira um endereço')
      return
    }

    setGeocoding(true)
    try {
      // Usando Nominatim (OpenStreetMap) para geocoding gratuito
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'AuconchegoPets/1.0'
          }
        }
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setFormData(prev => ({
          ...prev,
          coordinates: {
            lat: parseFloat(lat),
            lng: parseFloat(lon)
          }
        }))
        alert('Coordenadas encontradas com sucesso!')
      } else {
        alert('Não foi possível encontrar as coordenadas para este endereço')
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error)
      alert('Erro ao buscar coordenadas. Tente novamente.')
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const petData = {
        type: formData.type,
        name: formData.name,
        description: formData.description,
        images: formData.images.filter(img => img !== ''),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        age: formData.age,
        size: formData.size,
        weight: formData.weight,
        location: formData.location,
        address: formData.address,
        vaccinated: formData.vaccinated,
        castrated: formData.castrated,
        temperament: formData.temperament.split(',').map(t => t.trim()).filter(t => t !== ''),
        healthStatus: formData.healthStatus,
        coordinates: formData.coordinates
      }

      if (pet) {
        updatePet(pet.id, petData)
      } else {
        addPet(petData)
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
              Descrição *
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl min-h-[120px]"
              required
            />
          </div>

          {/* Imagens */}
          <div>
            <Label className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
              Imagens (Base64)
            </Label>
            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
                    />
                    {image && (
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="mt-2 w-32 h-32 object-cover rounded-lg border-2 border-[#5C4A1F]/20"
                      />
                    )}
                  </div>
                  {formData.images.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeImageSlot(index)}
                      variant="destructive"
                      className="mt-1"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={addImageSlot}
                className="bg-[#5C4A1F] hover:bg-[#4C3A0F] text-white"
              >
                <Upload className="w-5 h-5 mr-2" />
                Adicionar Mais Imagens
              </Button>
            </div>
          </div>

          {/* Grid de informações */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tags */}
            <div>
              <Label htmlFor="tags" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                Tags (separadas por vírgula)
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Ex: Adulto, Grande, Macho"
                className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
              />
            </div>

            {/* Idade */}
            <div>
              <Label htmlFor="age" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                Idade *
              </Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Ex: 2 anos"
                className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
                required
              />
            </div>

            {/* Tamanho */}
            <div>
              <Label htmlFor="size" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                Tamanho *
              </Label>
              <select
                id="size"
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                className="w-full bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F] text-lg p-3 rounded-xl"
                required
              >
                <option value="Pequeno">Pequeno</option>
                <option value="Médio">Médio</option>
                <option value="Grande">Grande</option>
              </select>
            </div>

            {/* Peso */}
            <div>
              <Label htmlFor="weight" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                Peso *
              </Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="Ex: 5kg"
                className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
                required
              />
            </div>

            {/* Localização */}
            <div>
              <Label htmlFor="location" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
                Localização (cidade) *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: São Paulo, SP"
                className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
                required
              />
            </div>

            {/* Status de Saúde */}
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
          </div>

          {/* Endereço e Coordenadas */}
          <div>
            <Label htmlFor="address" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
              Endereço Completo *
            </Label>
            <div className="flex gap-3">
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Ex: Rua Augusta, 1234 - Consolação, São Paulo - SP"
                className="flex-1 bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
                required
              />
              <Button
                type="button"
                onClick={geocodeAddress}
                disabled={geocoding}
                className="bg-[#F5B563] hover:bg-[#E5A553] text-[#5C4A1F] font-semibold whitespace-nowrap"
              >
                {geocoding ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5 mr-2" />
                )}
                Buscar Coordenadas
              </Button>
            </div>
            {formData.coordinates.lat !== 0 && formData.coordinates.lng !== 0 && (
              <p className="text-[#8B6914] mt-2 text-sm">
                Coordenadas: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Temperamento */}
          <div>
            <Label htmlFor="temperament" className="text-[#5C4A1F] text-lg font-semibold mb-2 block">
              Temperamento (separado por vírgula)
            </Label>
            <Input
              id="temperament"
              value={formData.temperament}
              onChange={(e) => setFormData(prev => ({ ...prev, temperament: e.target.value }))}
              placeholder="Ex: Carinhoso, Brincalhão, Sociável"
              className="bg-[#FFF1BA] border-2 border-[#5C4A1F]/20 text-[#5C4A1F]"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.vaccinated}
                onChange={(e) => setFormData(prev => ({ ...prev, vaccinated: e.target.checked }))}
                className="w-6 h-6 rounded border-2 border-[#5C4A1F]/20"
              />
              <span className="text-[#5C4A1F] text-lg font-medium">Vacinado</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.castrated}
                onChange={(e) => setFormData(prev => ({ ...prev, castrated: e.target.checked }))}
                className="w-6 h-6 rounded border-2 border-[#5C4A1F]/20"
              />
              <span className="text-[#5C4A1F] text-lg font-medium">Castrado</span>
            </label>
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
