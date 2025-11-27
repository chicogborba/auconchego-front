import TopBar from '@/components/TopBar'
import { HandHeart, PiggyBank, HeartHandshake, ShieldCheck } from 'lucide-react'

export default function Transparency() {
  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />

      {/* Hero Section */}
      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5C4A1F] mb-4">
            Transparência
          </h1>
          <p className="text-lg md:text-xl text-[#5C4A1F]/90 max-w-3xl mx-auto">
            Mantemos total transparência em todas as nossas ações e uso dos recursos
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Para onde vão as doações */}
          <div className="bg-[#F5E6C3] rounded-2xl p-6 shadow-lg border-2 border-[#5C4A1F]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFBD59] rounded-full p-3">
                <PiggyBank className="w-6 h-6 text-[#5C4A1F]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#5C4A1F]">
                Para Onde Vão as Doações?
              </h2>
            </div>
            <div className="text-[#5C4A1F] space-y-3">
              <p className="text-base md:text-lg leading-relaxed">
                As doações recebidas são integralmente destinadas ao bem-estar dos animais resgatados.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>Compra de ração e alimentação especial</li>
                <li>Vacinas, vermífugos e medicamentos</li>
                <li>Cirurgias, castrações e tratamentos emergenciais</li>
                <li>Manutenção do abrigo e infraestrutura</li>
                <li>Transporte de animais para consultas e adoções</li>
              </ul>
            </div>
          </div>

          {/* Compromisso com Transparência */}
          <div className="bg-[#F5E6C3] rounded-2xl p-6 shadow-lg border-2 border-[#5C4A1F]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFBD59] rounded-full p-3">
                <ShieldCheck className="w-6 h-6 text-[#5C4A1F]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#5C4A1F]">
                Nosso Compromisso
              </h2>
            </div>
            <div className="text-[#5C4A1F] space-y-3">
              <p className="text-base md:text-lg leading-relaxed">
                Mantemos nossas ações com ética e responsabilidade, publicando relatórios periódicos e garantindo que cada ajuda seja utilizada com propósito.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>Relatórios trimestrais de gastos</li>
                <li>Transparência em campanhas e arrecadações</li>
                <li>Auditoria interna de doações</li>
                <li>Prestação de contas pública</li>
              </ul>
            </div>
          </div>

          {/* Adoções e impacto */}
          <div className="bg-[#F5E6C3] rounded-2xl p-6 shadow-lg border-2 border-[#5C4A1F]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFBD59] rounded-full p-3">
                <HeartHandshake className="w-6 h-6 text-[#5C4A1F]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#5C4A1F]">
                Impacto das Adoções
              </h2>
            </div>
            <div className="text-[#5C4A1F] space-y-3">
              <p className="text-base md:text-lg leading-relaxed">
                Cada adoção transforma vidas. Mantemos acompanhamento e transparência sobre o processo.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>Visitas de acompanhamento</li>
                <li>Rastreamento e atualizações do pet</li>
                <li>Suporte pós-adoção</li>
              </ul>
            </div>
          </div>

          {/* Como ajudar */}
          <div className="bg-[#F5E6C3] rounded-2xl p-6 shadow-lg border-2 border-[#5C4A1F]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFBD59] rounded-full p-3">
                <HandHeart className="w-6 h-6 text-[#5C4A1F]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#5C4A1F]">
                Como Você Pode Ajudar
              </h2>
            </div>
            <div className="text-[#5C4A1F] space-y-3">
              <p className="text-base md:text-lg leading-relaxed">
                Existem várias formas de apoiar nosso projeto!
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>Doação financeira</li>
                <li>Doação de ração, medicamentos ou itens de higiene</li>
                <li>Apadrinhamento de animais</li>
                <li>Compartilhar e divulgar os pets disponíveis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}