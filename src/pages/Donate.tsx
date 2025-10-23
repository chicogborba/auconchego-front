import TopBar from '@/components/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Donate() {
  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="shadow-none bg-[#FFF1BA] border-none">
          <CardHeader>
            <CardTitle className="text-3xl text-[#5C4A1F]">Como Doar</CardTitle>
          </CardHeader>

          <CardContent>
            {/* Texto centralizado abaixo do título */}
            <p className="text-xl text-[#5C4A1F] text-center mb-8">
  Sua doação é muito importante! Ajude os animais que precisam de cuidados e atenção. 
  Faça sua doação principalmente pelo QR Code abaixo ou acesse o site para conhecer outras opções. 
  Cada contribuição faz a diferença! Obrigado por apoiar essa causa.
</p>

            {/* layout em duas colunas */}
            <div className="flex flex-col md:flex-row items-center gap-8 text-[#5C4A1F]">
              
              {/* imagem à esquerda */}
              <div className="flex-1">
                <img
                  src="https://static.wixstatic.com/media/1a9786_91713829273e441096042465f4afade9~mv2.jpg/v1/fit/w_2500,h_1330,al_c/1a9786_91713829273e441096042465f4afade9~mv2.jpg"
                  alt="Animais sendo cuidados"
                  className="rounded-xl shadow-md object-cover w-full max-h-[500px]"
                />
              </div>

              {/* conteúdo à direita */}
              <div className="flex-1 space-y-6 text-lg">
                
                {/* QR CODE */}
                <div className="flex justify-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?data=https://www.fadaorg.com.br/apoiar-animais&size=300x300"
                    alt="QR Code para doação"
                    className="rounded-lg border border-[#5C4A1F] bg-white p-4 w-[400px] h-[400px] object-contain"
                  />
                </div>

                {/* BOTÃO / LINK */}
                <div className="text-center">
                  <Button asChild className="bg-[#922B74] hover:bg-[#7A6531] text-white px-8 py-4">
                    <a
                      href="https://www.fadaorg.com.br/apoiar-animais"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver mais opções de doação
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
