import TopBar from '@/components/TopBar'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import heroImage from '@/assets/HERO.png'
import HowItWorks from '@/components/HowItWorks'
import AdoptCard from '@/components/AdoptCard'
import AboutSection from '@/components/AboutSection'
import { usePets } from '@/contexts/PetsContext'

export default function MainPage() {
  const { pets: petsData } = usePets()
  
  // Converte o objeto de pets em array para mapear
  const pets = Object.values(petsData).map(pet => ({
    id: pet.id,
    type: pet.type,
    name: pet.name,
    description: pet.description,
    image: pet.images[0], // Usa a primeira imagem
    tags: pet.tags,
  }))

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
              className="h-14 px-8 bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold text-lg rounded-full border-2 border-[#5C4A1F] shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              🐾 Quero Adotar
            </Button>
            
            <Button 
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {pets.map((pet) => (
            <AdoptCard
              key={pet.id}
              id={pet.id}
              type={pet.type}
              name={pet.name}
              description={pet.description}
              image={pet.image}
              tags={pet.tags}
            />
          ))}
        </div>
      </div>

      {/* Sobre o Auconchego */}
      <AboutSection />
    </div>
  )
}
