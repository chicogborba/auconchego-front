import TopBar from '@/components/TopBar'
import { Button } from '@/components/ui/button'
import { Heart, Info, X } from 'lucide-react'
import heroImage from '@/assets/HERO.png'
import HowItWorks from '@/components/HowItWorks'
import AdoptCard from '@/components/AdoptCard'
import AboutSection from '@/components/AboutSection'
import { usePets } from '@/contexts/PetsContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

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

export default function MainPage() {
  const { pets: petsData } = usePets()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false)
  
  useEffect(() => {
    setCurrentUser(readCurrentUser())
  }, [])
  
  // Converte o objeto de pets em array para mapear e filtra apenas DISPONIVEL
  const pets = Object.values(petsData)
    .filter(pet => pet.status === 'DISPONIVEL' || !pet.status)
    .map(pet => ({
      id: pet.id,
      type: pet.type,
      name: pet.name,
      description: pet.description,
      image: pet.images?.[0] || '/assets/icon.png', // Usa a primeira imagem
      tags: pet.tags,
      status: pet.status,
    }))

  const handleQueroDoar = () => {
    const user = readCurrentUser()
    
    // Verifica se o usuário tem permissão (TUTOR, ONG ou ROOT)
    if (user && (user.role === 'TUTOR' || user.role === 'ONG' || user.role === 'ROOT')) {
      navigate('/pets/admin')
    } else {
      // Se for adotante ou não logado, mostra modal ao invés de redirecionar
      setShowAccessDeniedModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      {/* Hero Section */}
      <div className="relative h-[85vh] overflow-hidden">
        {/* Background Image com Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-bottom"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        </div>

        {/* TopBar sobre o Hero */}
        <div className="relative z-20">
          <TopBar />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pb-32">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            Transforme a vida de um pet hoje mesmo
          </h1>
          
          <p className="text-xl md:text-2xl text-white max-w-3xl mb-10 drop-shadow-lg font-medium">
            No Auconchego, conectamos pessoas a ONGs e protetores independentes para criar histórias cheias de amor e cuidado.
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-6 mb-12">
            <Button 
              onClick={() => navigate('/pets')}
              className="h-14 px-8 bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold text-lg rounded-full border-2 border-[#5C4A1F] shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              🐾 Quero Adotar
            </Button>
            
            <Button 
              onClick={handleQueroDoar}
              className="h-14 px-8 bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold text-lg rounded-full border-2 border-[#5C4A1F] shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2" />
              Quero Doar
            </Button>
          </div>
        </div>

        {/* Onda na parte inferior */}
        {/* rotaciona a onde em 180 graus */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 rotate-180">
          <svg 
            className="relative block w-full h-32"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
              className="fill-[#FFF1BA]"
            ></path>
          </svg>
        </div>
      </div>

      {/* Como Funciona */}
      <HowItWorks />

      {/* Seção de Pets para Adoção */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-[#5C4A1F] text-center mb-12">
          Pets Disponíveis para Adoção
        </h2>
        
        {pets.length > 0 ? (
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: pets.length > 3,
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {pets.map((pet) => (
                  <CarouselItem key={pet.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="flex justify-center h-full w-full">
                      <AdoptCard
                        id={pet.id}
                        type={pet.type}
                        name={pet.name}
                        description={pet.description}
                        image={pet.image}
                        tags={pet.tags}
                        status={pet.status}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {pets.length > 1 && (
                <>
                  <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-12" />
                  <CarouselNext className="hidden sm:flex -right-4 lg:-right-12" />
                </>
              )}
            </Carousel>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-[#5C4A1F]">Nenhum pet disponível no momento.</p>
          </div>
        )}
      </div>

      {/* Sobre o Auconchego */}
      <AboutSection />

      {/* Modal de Acesso Negado */}
      {showAccessDeniedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-3xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="bg-[#FFBD59] p-6 rounded-t-3xl border-b-2 border-[#5C4A1F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F5E6C3] rounded-full">
                  <Info className="w-6 h-6 text-[#5C4A1F]" />
                </div>
                <h3 className="text-2xl font-bold text-[#5C4A1F]">
                  Acesso Restrito
                </h3>
              </div>
              <button
                onClick={() => setShowAccessDeniedModal(false)}
                className="p-2 text-[#5C4A1F] hover:bg-[#F5B563] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[#8B6914] text-base leading-relaxed mb-6">
                Apenas tutores, ONGs e administradores podem acessar a área de doação.
                <br /><br />
                Para se tornar um tutor, faça login como tutor ou entre em contato com uma ONG para se cadastrar.
              </p>

              {/* Actions */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowAccessDeniedModal(false)}
                  className="bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold rounded-xl border-2 border-[#5C4A1F] px-6 py-2 shadow-md hover:shadow-lg transition-all"
                >
                  Entendi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
