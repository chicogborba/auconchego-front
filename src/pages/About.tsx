import TopBar from '@/components/TopBar'

export default function About() {
  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />

      {/* Quem Somos */}
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-[#5C4A1F]">
        <h2 className="text-4xl font-bold mb-6">Quem Somos</h2>
        <p className="text-2xl mb-4">
          Somos uma Startup de base tecnológica e impacto social voltada a melhorar a qualidade de vida 
          dos animais vítimas de abandono.
        </p>
        <p className="text-2xl mb-4">
          Constituída como Instituto FADA de Fomento do Bem-Estar - FADA Org em julho/2019, temos o objetivo 
          social principal de prover a vida dos animais, fomentando o ecossistema de bem-estar animal através 
          do engajamento do coletivo.
        </p>
        <p className="text-2xl mb-4">
          Uma das formas que utilizamos para incentivar Protetores de Animais/ONGs e Fornecedores a manterem-se 
          firmes no propósito é através das Campanhas de arrecadação do tipo sem Projeto/sem Fornecedor ou Sem 
          Projeto e Fornecedor definidos.
        </p>
      </div>

      {/* Nosso Propósito */}
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-[#5C4A1F]">
        <h2 className="text-4xl font-bold mb-6">Nosso Propósito</h2>
        <p className="text-2xl italic mb-6">
          "Acreditamos que ações positivas contagiam e provocam transformações nas comunidades em que são incentivadas"
        </p>
        <p className="text-2xl mb-6">
          Buscamos amplificar o impacto positivo de protetores de animais/ONGs, varejo pet e doadores dentro do 
          contexto do abandono de animais, fazendo com que cada doação destinada a animais vulneráveis contribua 
          para melhores Projetos e fomento do bem-estar animal nas comunidades.
        </p>
      </div>

      {/* O que provocamos */}
      <div className="max-w-6xl mx-auto px-4 py-12 text-[#5C4A1F]">
        <h2 className="text-4xl font-bold text-center mb-6">O que provocamos?</h2>
        <p className="text-2xl mb-4">
          <strong>Projetos mais organizados:</strong> Protetores/ONGs acompanham a demanda de ração dos animais, 
          em função do número de animais informado mensalmente à FADA Org.
        </p>
        <p className="text-2xl mb-4">
          <strong>Menos Protetores de Animais vulneráveis:</strong> devido ao apoio estruturado aos animais.
        </p>
        <p className="text-2xl mb-4">
          <strong>Maior número de animais beneficiados:</strong> garantindo que mais vidas sejam cuidadas.
        </p>
        <p className="text-2xl mb-4">
          <strong>Certeza do uso correto da doação:</strong> Transparência nas movimentações financeiras com 
          apresentação das notas fiscais.
        </p>
        <p className="text-2xl mb-4">
          <strong>Redução do abandono:</strong> pela participação do varejo pet. Este benefício será constatado 
          a partir do momento em que houver dados sobre o abandono nas diferentes localidades.
        </p>
      </div>

      {/* Call to Action */}
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-[#5C4A1F]">
        <p className="text-2xl mb-6">
          Junte-se a nós! Cada ação faz a diferença. Seja voluntário ou faça uma doação para transformar vidas!
        </p>
        <a
          href="/donate"
          className="inline-block bg-[#922B74] hover:bg-[#7A1F60] text-white px-10 py-5 text-2xl font-semibold rounded-lg"
        >
          Faça uma doação
        </a>
      </div>
    </div>
  )
}
