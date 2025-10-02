import TopBar from '@/components/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-[#5C4A1F]">Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-[#5C4A1F]">Página de Contato em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
