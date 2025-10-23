import TopBar from '@/components/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="shadow-none border-none bg-[#FFF1BA]">
          <CardHeader>
            <CardTitle className="text-3xl text-[#5C4A1F]">Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-[#5C4A1F] text-2xl">
            <p>
              Se você está no site FADA Org é porque temos o mesmo objetivo! Melhorar a qualidade de vida 
              dos animais vítimas de abandono! Caso tenha alguma dúvida, crítica, sugestão ou queira desenvolver 
              alguma parceria, utilize os meios informados abaixo ou o formulário.
            </p>

            <div className="space-y-4">
              <p><strong>Whatsapp:</strong> 51998423754</p>
              <p><strong>E-mail:</strong> atendimento@fadaorg.com.br</p>
              <p>
                <strong>Chat:</strong><br />
                Versão Mobile: Clique nos três pontinhos no rodapé da página<br />
                Versão Desktop: Clique em "Vamos conversar" na parte inferior direita do site
              </p>
            </div>

            <p>
              Procuramos responder o mais rápido possível, segue abaixo nossos horários de atendimento:
            </p>
            <p><strong>Segundas a Sextas-feiras das 9 às 18h</strong></p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
