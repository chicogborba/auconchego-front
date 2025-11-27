import TopBar from '@/components/TopBar'
import { Mail, Clock, Phone } from 'lucide-react'

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />

      {/* Hero Section */}
      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5C4A1F] mb-4">
            Entre em Contato
          </h1>
          <p className="text-lg md:text-xl text-[#5C4A1F]/90 max-w-3xl mx-auto">
            Estamos aqui para ajudar! Tire suas dúvidas, compartilhe sugestões ou desenvolva parcerias conosco.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Introdução */}
        <div className="bg-[#F5E6C3] rounded-2xl p-6 md:p-8 shadow-lg border-2 border-[#5C4A1F]/20 mb-8">
          <p className="text-base md:text-lg text-[#5C4A1F] leading-relaxed text-center">
            Se você está no site <strong>Auconchego</strong> é porque temos o mesmo objetivo! Melhorar a qualidade de vida 
            dos animais vítimas de abandono! Caso tenha alguma dúvida, crítica, sugestão ou queira desenvolver 
            alguma parceria, utilize os meios informados abaixo.
          </p>
        </div>

        {/* Informações de Contato */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* WhatsApp */}
          <div className="bg-[#F5E6C3] rounded-2xl p-6 shadow-lg border-2 border-[#5C4A1F]/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#FFBD59] rounded-full p-3">
                <Phone className="w-6 h-6 text-[#5C4A1F]" />
              </div>
              <h3 className="text-xl font-bold text-[#5C4A1F]">WhatsApp</h3>
            </div>
            <p className="text-lg text-[#5C4A1F] font-semibold">
              (51) 99842-3754
            </p>
            <p className="text-sm text-[#5C4A1F]/80 mt-2">
              Atendimento rápido e direto
            </p>
          </div>

          {/* E-mail */}
          <div className="bg-[#F5E6C3] rounded-2xl p-6 shadow-lg border-2 border-[#5C4A1F]/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#FFBD59] rounded-full p-3">
                <Mail className="w-6 h-6 text-[#5C4A1F]" />
              </div>
              <h3 className="text-xl font-bold text-[#5C4A1F]">E-mail</h3>
            </div>
            <p className="text-lg text-[#5C4A1F] font-semibold break-all">
              atendimento@fadaorg.com.br
            </p>
            <p className="text-sm text-[#5C4A1F]/80 mt-2">
              Envie sua mensagem a qualquer momento
            </p>
          </div>
        </div>

        {/* Horário de Atendimento */}
        <div className="bg-gradient-to-r from-[#FFBD59] to-[#F5B563] rounded-2xl p-6 md:p-8 shadow-lg border-2 border-[#5C4A1F]">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-[#5C4A1F] rounded-full p-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-[#5C4A1F] mb-2">
                Horário de Atendimento
              </h3>
              <p className="text-lg md:text-xl text-[#5C4A1F] font-semibold">
                Segundas a Sextas-feiras das 9 às 18h
              </p>
              <p className="text-base text-[#5C4A1F]/90 mt-2">
                Procuramos responder o mais rápido possível!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
