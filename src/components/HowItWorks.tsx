import { Heart } from 'lucide-react'

export default function HowItWorks() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-4xl font-bold text-[#5C4A1F] text-center mb-8">
        Como Funciona
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="text-center p-6 bg-white/50 rounded-2xl shadow-md">
          <div className="w-16 h-16 bg-[#FFBD59] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🐾</span>
          </div>
          <h3 className="text-xl font-bold text-[#5C4A1F] mb-2">Encontre seu Pet</h3>
          <p className="text-[#5C4A1F]">Navegue pelos perfis de pets disponíveis para adoção</p>
        </div>

        <div className="text-center p-6 bg-white/50 rounded-2xl shadow-md">
          <div className="w-16 h-16 bg-[#FFBD59] rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-[#5C4A1F]" />
          </div>
          <h3 className="text-xl font-bold text-[#5C4A1F] mb-2">Conecte-se</h3>
          <p className="text-[#5C4A1F]">Entre em contato com ONGs e protetores</p>
        </div>

        <div className="text-center p-6 bg-white/50 rounded-2xl shadow-md">
          <div className="w-16 h-16 bg-[#FFBD59] rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-[#5C4A1F]" />
          </div>
          <h3 className="text-xl font-bold text-[#5C4A1F] mb-2">Adote com Amor</h3>
          <p className="text-[#5C4A1F]">Transforme a vida de um pet e ganhe um amigo para sempre</p>
        </div>
      </div>
    </div>
  )
}
