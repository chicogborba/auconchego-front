import TopBar from '@/components/TopBar'
import { Heart, Target, Users, Shield, TrendingUp, HandHeart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function About() {
  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />

      {/* Hero Section */}
      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5C4A1F] mb-4">
            Sobre o Auconchego
          </h1>
          <p className="text-lg md:text-xl text-[#5C4A1F]/90 max-w-3xl mx-auto">
            Conectando pessoas, ONGs e protetores para transformar vidas através da adoção responsável
          </p>
        </div>
      </div>

      {/* Quem Somos */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-[#F5E6C3] rounded-2xl p-6 md:p-8 shadow-lg border-2 border-[#5C4A1F]/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#FFBD59] rounded-full p-3">
              <Users className="w-6 h-6 text-[#5C4A1F]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#5C4A1F]">Quem Somos</h2>
          </div>
          
          <div className="space-y-4 text-base md:text-lg text-[#5C4A1F] leading-relaxed">
            <p>
              Somos uma <strong>Startup de base tecnológica e impacto social</strong> voltada a melhorar a qualidade de vida 
              dos animais vítimas de abandono.
            </p>
            <p>
              Constituída como <strong>Instituto FADA de Fomento do Bem-Estar - FADA Org</strong> em julho/2019, temos o objetivo 
              social principal de prover a vida dos animais, fomentando o ecossistema de bem-estar animal através 
              do engajamento do coletivo.
            </p>
            <p>
              Uma das formas que utilizamos para incentivar Protetores de Animais/ONGs e Fornecedores a manterem-se 
              firmes no propósito é através das <strong>Campanhas de arrecadação</strong> do tipo sem Projeto/sem Fornecedor ou Sem 
              Projeto e Fornecedor definidos.
            </p>
          </div>
        </div>
      </div>

      {/* Nosso Propósito */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-[#F5E6C3] rounded-2xl p-6 md:p-8 shadow-lg border-2 border-[#5C4A1F]/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#FFBD59] rounded-full p-3">
              <Target className="w-6 h-6 text-[#5C4A1F]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#5C4A1F]">Nosso Propósito</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-[#FFF1BA] rounded-xl p-4 border-2 border-[#5C4A1F]/30">
              <p className="text-lg md:text-xl italic text-[#5C4A1F] text-center font-medium">
                "Acreditamos que ações positivas contagiam e provocam transformações nas comunidades em que são incentivadas"
              </p>
            </div>
            
            <p className="text-base md:text-lg text-[#5C4A1F] leading-relaxed">
              Buscamos amplificar o impacto positivo de protetores de animais/ONGs, varejo pet e doadores dentro do 
              contexto do abandono de animais, fazendo com que cada doação destinada a animais vulneráveis contribua 
              para melhores Projetos e fomento do bem-estar animal nas comunidades.
            </p>
          </div>
        </div>
      </div>

      {/* O que provocamos */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-[#F5E6C3] rounded-2xl p-6 md:p-8 shadow-lg border-2 border-[#5C4A1F]/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#FFBD59] rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-[#5C4A1F]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#5C4A1F]">O que provocamos?</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#FFF1BA] rounded-xl p-4 border-2 border-[#5C4A1F]/30">
              <h3 className="text-lg font-bold text-[#5C4A1F] mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Projetos mais organizados
              </h3>
              <p className="text-sm md:text-base text-[#5C4A1F] leading-relaxed">
                Protetores/ONGs acompanham a demanda de ração dos animais, em função do número de animais informado mensalmente à FADA Org.
              </p>
            </div>

            <div className="bg-[#FFF1BA] rounded-xl p-4 border-2 border-[#5C4A1F]/30">
              <h3 className="text-lg font-bold text-[#5C4A1F] mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Menos Protetores vulneráveis
              </h3>
              <p className="text-sm md:text-base text-[#5C4A1F] leading-relaxed">
                Devido ao apoio estruturado aos animais, reduzimos a vulnerabilidade dos protetores.
              </p>
            </div>

            <div className="bg-[#FFF1BA] rounded-xl p-4 border-2 border-[#5C4A1F]/30">
              <h3 className="text-lg font-bold text-[#5C4A1F] mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Maior número de animais beneficiados
              </h3>
              <p className="text-sm md:text-base text-[#5C4A1F] leading-relaxed">
                Garantindo que mais vidas sejam cuidadas e protegidas.
              </p>
            </div>

            <div className="bg-[#FFF1BA] rounded-xl p-4 border-2 border-[#5C4A1F]/30">
              <h3 className="text-lg font-bold text-[#5C4A1F] mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Transparência nas doações
              </h3>
              <p className="text-sm md:text-base text-[#5C4A1F] leading-relaxed">
                Certeza do uso correto da doação com transparência nas movimentações financeiras e apresentação das notas fiscais.
              </p>
            </div>
          </div>

          <div className="mt-4 bg-[#FFF1BA] rounded-xl p-4 border-2 border-[#5C4A1F]/30">
            <h3 className="text-lg font-bold text-[#5C4A1F] mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Redução do abandono
            </h3>
            <p className="text-sm md:text-base text-[#5C4A1F] leading-relaxed">
              Pela participação do varejo pet. Este benefício será constatado a partir do momento em que houver dados sobre o abandono nas diferentes localidades.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[#FFBD59] to-[#F5B563] rounded-2xl p-6 md:p-8 shadow-lg border-2 border-[#5C4A1F] text-center">
          <HandHeart className="w-12 h-12 text-[#5C4A1F] mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-[#5C4A1F] mb-4">
            Junte-se a nós!
          </h2>
          <p className="text-lg md:text-xl text-[#5C4A1F] mb-6 max-w-2xl mx-auto">
            Cada ação faz a diferença. Seja voluntário ou faça uma doação para transformar vidas!
          </p>
          <Link to="/donate">
            <Button className="h-12 px-6 bg-[#5C4A1F] hover:bg-[#8B6914] text-white font-bold text-base rounded-full border-2 border-[#5C4A1F] shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <Heart className="w-5 h-5 mr-2" />
              Faça uma doação
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
