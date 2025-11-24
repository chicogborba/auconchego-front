import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import LocationMap from '@/components/LocationMap'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, MapPin, Calendar, Ruler, Weight, Syringe, Scissors, Sparkles, Cat, Dog } from 'lucide-react'
import { usePets } from '@/contexts/PetsContext'
import * as api from '@/lib/api'

export default function AnimalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)
  const { getPetById } = usePets()
  const [pet, setPet] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!id) return
        const idNum = Number(id)
        // Prefer fresh fetch from backend to ensure we have current status
        const backendPet = await api.getPetById(idNum)
        if (!mounted) return
        setPet(backendPet)
      } catch (err) {
        console.warn('Could not load pet from backend, falling back to context', err)
        const fromCtx = getPetById(Number(id))
        setPet(fromCtx ?? null)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#FFF1BA]">
        <TopBar />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#5C4A1F] mb-4">Pet não encontrado</h2>
            <Button onClick={() => navigate('/list')} className="bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F]">
              Voltar para página inicial
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleAdopt = () => {
    ;(async () => {
      try {
        const adotanteIdStr = localStorage.getItem('adotanteId')
        const adotanteId = adotanteIdStr ? Number(adotanteIdStr) : undefined
        await api.adoptPet(pet.id, adotanteId)
        alert(`A adoção de ${pet.name} foi registrada com sucesso! Obrigado.`)
        // After adoption, go to main page — main route is /main
        navigate('/main')
      } catch (err) {
        console.error('Erro ao adotar', err)
        alert('Não foi possível concluir a adoção. Tente novamente.')
      }
    })()
  }

  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Coluna da Galeria - 3 colunas */}
          <div className="lg:col-span-3 space-y-6">
            {/* Imagem Principal */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFBD59]">
              <img
                src={pet.images[selectedImage]}
                alt={`${pet.name} - Foto ${selectedImage + 1}`}
                className="w-full h-[550px] object-cover"
              />
            </div>

            {/* Galeria de Miniaturas */}
            <div className="grid grid-cols-4 gap-4">
              {pet.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative rounded-2xl overflow-hidden shadow-lg transition-all hover:scale-105 ${
                    selectedImage === index 
                      ? 'border-4 border-[#FFBD59] ring-2 ring-[#5C4A1F]' 
                      : 'border-2 border-[#5C4A1F] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${pet.name} - Miniatura ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Card de Informações Rápidas */}
            <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-6 h-6 text-[#FFBD59]" />
                  <h3 className="text-2xl font-bold text-[#5C4A1F]">Informações</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                    <Calendar className="w-8 h-8 text-[#FFBD59] mb-2" />
                    <p className="text-sm text-[#8B6914] mb-1">Idade</p>
                    <p className="font-bold text-[#5C4A1F] text-lg">{pet.age}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                    <Ruler className="w-8 h-8 text-[#FFBD59] mb-2" />
                    <p className="text-sm text-[#8B6914] mb-1">Porte</p>
                    <p className="font-bold text-[#5C4A1F] text-lg">{pet.size}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                    <Weight className="w-8 h-8 text-[#FFBD59] mb-2" />
                    <p className="text-sm text-[#8B6914] mb-1">Peso</p>
                    <p className="font-bold text-[#5C4A1F] text-lg">{pet.weight}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                    <MapPin className="w-8 h-8 text-[#FFBD59] mb-2" />
                    <p className="text-sm text-[#8B6914] mb-1">Local</p>
                    <p className="font-bold text-[#5C4A1F] text-lg">{pet.location}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                    <Syringe className="w-8 h-8 text-[#FFBD59] mb-2" />
                    <p className="text-sm text-[#8B6914] mb-1">Vacinas</p>
                    <p className="font-bold text-[#5C4A1F] text-lg">{pet.vaccinated ? 'Em dia' : 'Não'}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-[#FFF1BA] rounded-2xl border-2 border-[#FFBD59]">
                    <Scissors className="w-8 h-8 text-[#FFBD59] mb-2" />
                    <p className="text-sm text-[#8B6914] mb-1">Castrado</p>
                    <p className="font-bold text-[#5C4A1F] text-lg">{pet.castrated ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna de Informações - 2 colunas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nome e Tags */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                {pet.type === 'cat' ? (
                  <Cat className="w-16 h-16 text-[#FFBD59]" />
                ) : (
                  <Dog className="w-16 h-16 text-[#FFBD59]" />
                )}
                <h1 className="text-6xl font-bold text-[#5C4A1F] leading-tight">{pet.name}</h1>
              </div>
              <div className="flex flex-wrap gap-3">
                {pet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-5 py-3 bg-[#FFBD59] border-2 border-[#5C4A1F] rounded-full text-base font-bold text-[#5C4A1F] shadow-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Botão de Adoção - Destacado no topo */}
            <Button
              onClick={handleAdopt}
              className="w-full h-20 bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold text-2xl rounded-2xl border-4 border-[#5C4A1F] shadow-2xl hover:shadow-[#FFBD59]/50 transition-all hover:scale-105 hover:-translate-y-1"
            >
              <Heart className="w-8 h-8 mr-3 fill-[#5C4A1F]" />
              Quero Adotar {pet.name}!
            </Button>

            {/* Sobre */}
            <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-[#FFBD59]" />
                  <h3 className="text-3xl font-bold text-[#5C4A1F]">Sobre {pet.name}</h3>
                </div>
                <p className="text-[#5C4A1F] leading-relaxed text-lg">{pet.description}</p>
              </CardContent>
            </Card>

            {/* Temperamento */}
            <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-[#FFBD59]" />
                  <h3 className="text-3xl font-bold text-[#5C4A1F]">Temperamento</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {pet.temperament.map((trait, index) => (
                    <span
                      key={index}
                      className="px-5 py-3 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-full text-base font-bold text-[#5C4A1F] shadow-md hover:bg-[#FFBD59] transition-colors"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status de Saúde */}
            <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Syringe className="w-6 h-6 text-[#FFBD59]" />
                  <h3 className="text-3xl font-bold text-[#5C4A1F]">Saúde</h3>
                </div>
                <p className="text-[#5C4A1F] text-lg mb-6 leading-relaxed">{pet.healthStatus}</p>
                <div className="flex gap-4">
                  {pet.vaccinated && (
                    <div className="flex-1 px-5 py-4 bg-gradient-to-br from-green-50 to-green-100 border-3 border-green-600 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-center gap-2">
                        <Syringe className="w-6 h-6 text-green-700" />
                        <span className="font-bold text-green-700 text-lg">Vacinado</span>
                      </div>
                    </div>
                  )}
                  {pet.castrated && (
                    <div className="flex-1 px-5 py-4 bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-blue-600 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-center gap-2">
                        <Scissors className="w-6 h-6 text-blue-700" />
                        <span className="font-bold text-blue-700 text-lg">Castrado</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mapa de Localização - Largura Total */}
        <div className="mt-12">
          <Card className="bg-white border-4 border-[#FFBD59] shadow-xl">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-7 h-7 text-[#FFBD59]" />
                  <h2 className="text-4xl font-bold text-[#5C4A1F]">Localização</h2>
                </div>
                <p className="text-[#5C4A1F] text-lg ml-9">
                  📍 {pet.address}
                </p>
              </div>
              <div className="w-full h-[450px] rounded-2xl overflow-hidden border-4 border-[#FFBD59] shadow-xl">
                <LocationMap 
                  lat={pet.coordinates.lat}
                  lng={pet.coordinates.lng}
                  petName={pet.name}
                  location={pet.location}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
