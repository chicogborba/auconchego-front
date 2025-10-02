import sobreImage from '@/assets/sobre.png'

export default function AboutSection() {
  return (
    <div className="bg-[#FFF1BA] py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Título */}
        <h2 className="text-5xl font-bold text-[#5C4A1F] text-center mb-16">
          Sobre o Auconchego
        </h2>

        {/* Conteúdo */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Imagem */}
          <div className="lg:w-1/2">
            <div className="rounded-[80px] overflow-hidden shadow-2xl border-4 border-[#FFBD59]">
              <img 
                src={sobreImage} 
                alt="Abrigo com gatos" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Texto */}
          <div className="lg:w-1/2 space-y-6">
            <h3 className="text-4xl font-bold text-[#5C4A1F]">
              Mais do que uma plataforma, somos uma rede de amor.
            </h3>
            
            <p className="text-xl text-[#5C4A1F] leading-relaxed">
              Trabalhamos em parceria com ONGs para dar voz e visibilidade a animais 
              em situação de vulnerabilidade, incentivando adoção responsável e 
              doações seguras.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
