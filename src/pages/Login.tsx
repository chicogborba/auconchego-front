import { useState, type FormEvent } from 'react'
import * as api from '@/lib/api'
import TutorFormModal from '@/components/TutorFormModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TopBar from '@/components/TopBar'

export default function Login() {
  
    // Estados para Login
    const [loginUsername, setLoginUsername] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginRole, setLoginRole] = useState<'ADOTANTE' | 'TUTOR' | 'ROOT'>('ADOTANTE')


    // Estados para Cadastro
  const [registerName, setRegisterName] = useState('')
  const [registerLastName, setRegisterLastName] = useState('')
  const [registerPhone, setRegisterPhone] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerEndereco, setRegisterEndereco] = useState('')
  const [registerCidade, setRegisterCidade] = useState('')
  const [registerEstado, setRegisterEstado] = useState('')
  const [registerCEP, setRegisterCEP] = useState('')
  const [tutorModalOpen, setTutorModalOpen] = useState(false)
  const [tutorPreset, setTutorPreset] = useState<any | null>(null)

    const handleLogin = (e: FormEvent) => {
        e.preventDefault()

        if (!loginUsername) {
            alert('Informe o seu email para login')
            return
        }

        ;(async () => {
            try {
                // ADOTANTE
                if (loginRole === 'ADOTANTE') {
                    const adotantes = await api.getAdotantes()
                    const found = adotantes.find(
                        (a: any) =>
                            String(a.email).toLowerCase() === String(loginUsername).toLowerCase(),
                    )

                    if (!found) {
                        alert('Adotante não encontrado. Faça cadastro primeiro.')
                        return
                    }

                    const currentUser = {
                        id: found.id,
                        role: 'ADOTANTE' as const,
                        nome: found.nome,
                        email: found.email,
                    }

                    // usado depois para compatibilidade e adoção
                    localStorage.setItem('currentUser', JSON.stringify(currentUser))
                    localStorage.setItem('adotanteId', String(found.id))

                    alert('Login realizado como adotante.')
                }

                // TUTOR
                else if (loginRole === 'TUTOR') {
                    const tutores = await api.getTutors()
                    const found = tutores.find(
                        (t: any) =>
                            String(t.email).toLowerCase() === String(loginUsername).toLowerCase(),
                    )

                    if (!found) {
                        alert('Tutor não encontrado. Peça para uma ONG ou root te cadastrar.')
                        return
                    }

                    const currentUser = {
                        id: found.id,
                        role: 'TUTOR' as const,
                        nome: found.nome,
                        email: found.email,
                        idOng: found.idOng,
                    }

                    localStorage.setItem('currentUser', JSON.stringify(currentUser))
                    alert('Login realizado como tutor.')
                }

                // ROOT (apenas front)
                else if (loginRole === 'ROOT') {
                    const ROOT_EMAIL = 'root@auconchego.com'
                    const ROOT_PASSWORD = 'root123'

                    if (
                        loginUsername.toLowerCase() !== ROOT_EMAIL.toLowerCase() ||
                        loginPassword !== ROOT_PASSWORD
                    ) {
                        alert('Credenciais de administrador inválidas.')
                        return
                    }

                    const currentUser = {
                        id: 0,
                        role: 'ROOT' as const,
                        nome: 'Root',
                        email: ROOT_EMAIL,
                    }

                    localStorage.setItem('currentUser', JSON.stringify(currentUser))
                    alert('Login realizado como administrador/root.')
                }

                // depois de qualquer login bem sucedido
                window.location.href = '/main'
            } catch (err) {
                console.error('Erro no login', err)
                alert('Erro ao tentar efetuar login. Tente novamente.')
            }
        })()
    }


    const handleRegister = (e: FormEvent) => {
    e.preventDefault()
    // Simulação de cadastro
    if (registerName && registerEmail && registerPassword && registerPhone && registerEndereco && registerCidade && registerEstado && registerCEP) {
      ;(async () => {
        try {
          const nomeFull = `${registerName} ${registerLastName}`.trim()
          const payload = {
            nome: nomeFull,
            email: registerEmail,
            telefone: registerPhone,
            endereco: registerEndereco,
            cidade: registerCidade,
            estado: registerEstado,
            cep: registerCEP,
            // prefencias de compatibilidade podem ficar vazias por enquanto
            especieDesejada: '',
            possuiDisponibilidade: true,
          }
          const created = await api.createAdotante(payload)
          // store adotante id locally for compatibility calculations
          if (created && created.id) {
            localStorage.setItem('adotanteId', String(created.id))
          }
          alert('Cadastro de adotante realizado com sucesso! Você será usado para calcular compatibilidade na listagem de pets.')
        } catch (err) {
          console.error('Erro ao criar adotante', err)
          alert('Erro ao criar adotante. Verifique os dados e tente novamente.')
        }
      })()
    } else {
      alert('Preencha todos os campos obrigatórios de cadastro para criar um adotante.')
    }
  }

  const handleCreateTutorFromRegister = async () => {
    // open modal prefilled
    setTutorPreset({ nome: registerName, email: registerEmail, telefone: registerPhone })
    setTutorModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#FFF1BA]">
      <TopBar />
      
      <div className="flex items-start justify-center px-4 md:px-8 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 max-w-7xl w-full items-start">
          {/* Formulário de Cadastro - Esquerda */}
          <div className="flex-1 w-full bg-white/30 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg border-2 border-[#E8B563]">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#5C4A1F] mb-2">Registre-se</h2>
              <p className="text-sm md:text-base text-[#8B6914]">Crie sua conta e faça parte da nossa comunidade</p>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
              {/* Nome e Sobrenome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Nome"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Sobrenome"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    required
                    className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                  />
                </div>
              </div>

              {/* Telefone */}
              <Input
                type="tel"
                placeholder="Telefone"
                value={registerPhone}
                onChange={(e) => setRegisterPhone(e.target.value)}
                required
                className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
              />

              {/* Email */}
              <Input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
              />

              {/* Senha */}
              <Input
                type="password"
                placeholder="Senha"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
              />

              {/* Endereço */}
              <Input
                type="text"
                placeholder="Endereço"
                value={registerEndereco}
                onChange={(e) => setRegisterEndereco(e.target.value)}
                required
                className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Cidade"
                  value={registerCidade}
                  onChange={(e) => setRegisterCidade(e.target.value)}
                  required
                  className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                />
                <Input
                  type="text"
                  placeholder="Estado"
                  value={registerEstado}
                  onChange={(e) => setRegisterEstado(e.target.value)}
                  required
                  className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                />
              </div>
              <Input
                type="text"
                placeholder="CEP"
                value={registerCEP}
                onChange={(e) => setRegisterCEP(e.target.value)}
                required
                className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
              />

              {/* Filtro de compatibilidade */}
              <div className="pt-4 border-t border-[#E8B563]/50">
                <h3 className="text-lg font-semibold text-[#5C4A1F] mb-3 text-center">
                  Compatibilidade com pets
                </h3>

                <div className="space-y-3">
                  {/* Possui outros animais */}
                  <select
                    className="w-full h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    defaultValue=""
                  >
                    <option value="" disabled>Você possui outros animais?</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>

                  {/* Tipo de moradia */}
                  <select
                    className="w-full h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    defaultValue=""
                  >
                    <option value="" disabled>Tipo de moradia</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa com quintal</option>
                    <option value="chacara">Chácara / sítio</option>
                  </select>

                  {/* Tempo em casa */}
                  <select
                    className="w-full h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    defaultValue=""
                  >
                    <option value="" disabled>Tempo que passa em casa por dia</option>
                    <option value="baixo">Menos de 4h</option>
                    <option value="medio">4 a 8h</option>
                    <option value="alto">Mais de 8h</option>
                  </select>

                  {/* Experiência */}
                  <select
                    className="w-full h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl text-[#8B6914] text-center font-medium focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] appearance-none transition-all"
                    defaultValue=""
                  >
                    <option value="" disabled>Já teve pets antes?</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                 
                </div>
              </div>

              {/* Botão Cadastro */}
              <Button
                type="submit"
                className="w-full h-12 md:h-14 bg-[#F5B563] hover:bg-[#E8A550] text-[#5C4A1F] font-bold text-lg md:text-xl rounded-2xl border-2 border-[#5C4A1F] shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Cadastro
              </Button>
              <div className="mt-3">
                <Button type="button" onClick={handleCreateTutorFromRegister} className="w-full h-12 md:h-14 bg-[#8B6914] hover:bg-[#6f5310] text-white font-bold text-lg md:text-xl rounded-2xl border-2 border-[#5C4A1F] shadow-md">Criar como Tutor</Button>
              </div>
            </form>
          </div>

          {/* Divisor vertical com ícone - Hidden on mobile */}
          <div className="hidden lg:flex flex-col items-center gap-4 pt-32">
            <div className="w-px bg-gradient-to-b from-transparent via-[#5C4A1F]/30 to-transparent h-48"></div>
            <div className="w-12 h-12 bg-[#F5B563] rounded-full flex items-center justify-center border-2 border-[#5C4A1F] shadow-md">
              <span className="text-[#5C4A1F] font-bold text-xl">ou</span>
            </div>
            <div className="w-px bg-gradient-to-b from-transparent via-[#5C4A1F]/30 to-transparent h-48"></div>
          </div>

          {/* Divisor horizontal para mobile */}
          <div className="lg:hidden w-full flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#5C4A1F]/30 to-transparent"></div>
            <div className="w-10 h-10 bg-[#F5B563] rounded-full flex items-center justify-center border-2 border-[#5C4A1F] shadow-md">
              <span className="text-[#5C4A1F] font-bold text-lg">ou</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#5C4A1F]/30 to-transparent"></div>
          </div>

          {/* Formulário de Login - Direita */}
          <div className="flex-1 w-full bg-white/30 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg border-2 border-[#E8B563]">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#5C4A1F] mb-2">Bem-vindo de volta!</h2>
              <p className="text-sm md:text-base text-[#8B6914]">Faça login para continuar</p>
            </div>
            
            <div className="flex flex-col justify-center min-h-[300px] md:min-h-[400px]">
                <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
                    {/* Tipo de usuário */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[#5C4A1F]">
                            Entrar como
                        </label>
                        <select
                            value={loginRole}
                            onChange={(e) => setLoginRole(e.target.value as any)}
                            className="w-full h-12 md:h-14 rounded-md border-2 border-[#F5E6C3] bg-[#F5E6C3] px-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                        >
                            <option value="ADOTANTE">Adotante</option>
                            <option value="TUTOR">Tutor</option>
                            <option value="ROOT">Administrador (Root)</option>
                        </select>
                    </div>

                    {/* Login (e-mail) */}
                    <Input
                        type="email"
                        placeholder="E-mail"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        required
                        className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#F5E6C3] rounded-md px-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    />

                    {/* Senha – só obrigatória pro ROOT */}
                    <Input
                        type="password"
                        placeholder={loginRole === 'ROOT' ? 'Senha do administrador' : 'Senha (não usada para este login)'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required={loginRole === 'ROOT'}
                        className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#F5E6C3] rounded-md px-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                    />

                    {/* Botão Entre */}
                    <Button
                        type="submit"
                        className="w-full h-12 md:h-14 bg-[#F5B563] hover:bg-[#F5B563]/90 text-[#5C4A1F] font-bold rounded-md shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Entre
                    </Button>
                </form>

            </div>
          </div>
        </div>
      </div>
      <TutorFormModal isOpen={tutorModalOpen} onClose={() => { setTutorModalOpen(false); setTutorPreset(null) }} tutor={tutorPreset} onSaved={() => { setTutorModalOpen(false); setTutorPreset(null); alert('Tutor criado com sucesso!') }} />
    </div>
  )
}
