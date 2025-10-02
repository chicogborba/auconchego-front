import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TopBar from '@/components/TopBar'

export default function Login() {
  
  // Estados para Login
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Estados para Cadastro
  const [registerName, setRegisterName] = useState('')
  const [registerLastName, setRegisterLastName] = useState('')
  const [registerPhone, setRegisterPhone] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerCPF, setRegisterCPF] = useState('')

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    if (loginUsername && loginPassword) {
      alert('Login realizado com sucesso!')
    }
  }

  const handleRegister = (e: FormEvent) => {
    e.preventDefault()
    // Simulação de cadastro
    if (registerName && registerEmail && registerPassword) {
      alert('Cadastro realizado com sucesso!')
    }
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

              {/* CPF */}
              <Input
                type="text"
                placeholder="CPF"
                value={registerCPF}
                onChange={(e) => setRegisterCPF(e.target.value)}
                required
                className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
              />

              {/* Botão Cadastro */}
              <Button
                type="submit"
                className="w-full h-12 md:h-14 bg-[#F5B563] hover:bg-[#E8A550] text-[#5C4A1F] font-bold text-lg md:text-xl rounded-2xl border-2 border-[#5C4A1F] shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Cadastro
              </Button>
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
                {/* Login */}
                <Input
                  type="text"
                  placeholder="Login"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                />

                {/* Senha */}
                <Input
                  type="password"
                  placeholder="Senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="h-12 md:h-14 bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-2xl placeholder:text-[#8B6914] text-center font-medium text-[#5C4A1F] focus:ring-2 focus:ring-[#F5B563] focus:border-[#F5B563] transition-all"
                />

                {/* Botão Entre */}
                <Button
                  type="submit"
                  className="w-full h-12 md:h-14 bg-[#F5B563] hover:bg-[#E8A550] text-[#5C4A1F] font-bold text-lg md:text-xl rounded-2xl border-2 border-[#5C4A1F] shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Entre
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
