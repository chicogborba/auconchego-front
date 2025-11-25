import TopBar from '@/components/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HandHeart, PiggyBank, HeartHandshake, ShieldCheck } from 'lucide-react'

export default function Transparency() {
  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#5C4A1F] mb-10">Transparência</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Para onde vão as doações */}
          <Card className="rounded-2xl shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[#5C4A1F] text-2xl">
                <PiggyBank className="w-7 h-7" />
                Para Onde Vão as Doações?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[#5C4A1F] space-y-3">
              <p>As doações recebidas são integralmente destinadas ao bem-estar dos animais resgatados.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Compra de ração e alimentação especial</li>
                <li>Vacinas, vermífugos e medicamentos</li>
                <li>Cirurgias, castrações e tratamentos emergenciais</li>
                <li>Manutenção do abrigo e infraestrutura</li>
                <li>Transporte de animais para consultas e adoções</li>
              </ul>
            </CardContent>
          </Card>

          {/* Compromisso com Transparência */}
          <Card className="rounded-2xl shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[#5C4A1F] text-2xl">
                <ShieldCheck className="w-7 h-7" />
                Nosso Compromisso
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[#5C4A1F] space-y-3">
              <p>Mantemos nossas ações com ética e responsabilidade, publicando relatórios periódicos e garantindo que cada ajuda seja utilizada com propósito.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Relatórios trimestrais de gastos</li>
                <li>Transparência em campanhas e arrecadações</li>
                <li>Auditoria interna de doações</li>
                <li>Prestação de contas pública</li>
              </ul>
            </CardContent>
          </Card>

          {/* Adoções e impacto */}
          <Card className="rounded-2xl shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[#5C4A1F] text-2xl">
                <HeartHandshake className="w-7 h-7" />
                Impacto das Adoções
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[#5C4A1F] space-y-3">
              <p>Cada adoção transforma vidas. Mantemos acompanhamento e transparência sobre o processo.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Visitas de acompanhamento</li>
                <li>Rastreamento e atualizações do pet</li>
                <li>Suporte pós-adoção</li>
              </ul>
            </CardContent>
          </Card>

          {/* Como ajudar */}
          <Card className="rounded-2xl shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[#5C4A1F] text-2xl">
                <HandHeart className="w-7 h-7" />
                Como Você Pode Ajudar
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[#5C4A1F] space-y-3">
              <p>Existem várias formas de apoiar nosso projeto!</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Doação financeira</li>
                <li>Doação de ração, medicamentos ou itens de higiene</li>
                <li>Apadrinhamento de animais</li>
                <li>Compartilhar e divulgar os pets disponíveis</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}