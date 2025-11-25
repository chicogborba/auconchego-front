import { Link, useLocation } from 'react-router-dom'
import { User, Menu, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import logo from '../assets/icon.png'

type Role = 'ADOTANTE' | 'TUTOR' | 'ONG' | 'ROOT'

interface CurrentUser {
    id: number
    role: Role
    nome?: string
    email?: string
    idOng?: number
}

function readCurrentUser(): CurrentUser | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem('currentUser')
        if (!raw) return null
        return JSON.parse(raw) as CurrentUser
    } catch {
        return null
    }
}

export default function TopBar() {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

    useEffect(() => {
        setCurrentUser(readCurrentUser())
    }, [])

    const menuItems = useMemo(() => {
        const items: { label: string; path: string }[] = []

        // sempre visíveis
        items.push({ label: 'Principal', path: '/main' })
        items.push({ label: 'Pets', path: '/pets' })

        // ADOTANTE
        if (currentUser?.role === 'ADOTANTE') {
            items.push({ label: 'Meus adotados', path: '/meus-adotados' })
        }

        // TUTOR / ONG / ROOT → Admin de pets
        if (
            currentUser &&
            (currentUser.role === 'TUTOR' ||
                currentUser.role === 'ONG' ||
                currentUser.role === 'ROOT')
        ) {
            items.push({ label: 'Admin', path: '/pets/admin' })
        }

        // ROOT → gestão de ONGs e Tutores
        if (currentUser?.role === 'ROOT') {
            items.push({ label: 'ONGs', path: '/ongs/admin' })
            items.push({ label: 'Tutores', path: '/tutores/admin' })
        }

        // páginas institucionais (todo mundo vê)
        items.push({ label: 'Sobre nós', path: '/about' })
        items.push({ label: 'Como doar', path: '/donate' })
        items.push({ label: 'Transparência', path: '/transparency' })
        items.push({ label: 'Contato', path: '/contact' })

        return items
    }, [currentUser])

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('currentUser')
            localStorage.removeItem('adotanteId')
            setCurrentUser(null)
            window.location.href = '/'
        }
    }

    return (
        <div className="w-screen flex justify-center">
            <header
                className={`bg-[#FFBD59] mx-4 my-4 px-6 py-3 shadow-md max-w-5xl w-full transition-all rounded-3xl lg:rounded-full ${
                    mobileMenuOpen ? 'lg:rounded-3xl' : ''
                }`}
            >
                <div className="flex items-center justify-between gap-4">
                    {/* Logo + título */}
                    <Link to="/main" className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="Auconchego Logo"
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#8B6914]"
                        />
                        <div className="flex flex-col">
              <span className="font-extrabold text-xl md:text-2xl text-[#5C4A1F]">
                Auconchego
              </span>
                            <span className="text-xs md:text-sm text-[#5C4A1F]/80">
                adoção com carinho
              </span>
                        </div>
                    </Link>

                    {/* Menu desktop */}
                    <nav className="hidden lg:flex items-center gap-4">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3 py-2 rounded-full text-sm md:text-base transition-colors ${
                                    location.pathname === item.path
                                        ? 'bg-white text-[#5C4A1F] font-bold'
                                        : 'text-[#5C4A1F] hover:bg-white/60'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Lado direito */}
                    <div className="flex items-center gap-3">
                        {/* Info usuário */}
                        {currentUser ? (
                            <div className="hidden md:flex flex-col items-end text-xs md:text-sm">
                <span className="text-[#5C4A1F] font-semibold">
                  {currentUser.nome ?? currentUser.email}
                </span>
                                <span className="text-[#5C4A1F]/80">
                  {currentUser.role.toLowerCase()}
                </span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="text-red-700 text-[11px] mt-1 hover:underline"
                                >
                                    sair
                                </button>
                            </div>
                        ) : (
                            <Link to="/" title="Login">
                                <div className="hidden md:flex rounded-full w-10 h-10 md:w-11 md:h-11 bg-white/80 border-2 border-[#8B6914] items-center justify-center cursor-pointer hover:bg-white">
                                    <User className="w-5 h-5 md:w-6 md:h-6 text-[#8B6914]" />
                                </div>
                            </Link>
                        )}

                        {/* Botão menu mobile */}
                        <button
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            className="lg:hidden rounded-full w-10 h-10 bg-white/80 border-2 border-[#8B6914] flex items-center justify-center cursor-pointer"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-[#8B6914]" />
                            ) : (
                                <Menu className="w-5 h-5 text-[#8B6914]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Menu mobile */}
                {mobileMenuOpen && (
                    <nav className="lg:hidden mt-4 pt-4 border-t-2 border-[#5C4A1F]/20 flex flex-col gap-3">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-3 py-2 rounded-xl text-sm ${
                                    location.pathname === item.path
                                        ? 'text-[#5C4A1F] font-bold bg-white/70'
                                        : 'text-[#5C4A1F] font-normal hover:bg-white/40'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#5C4A1F]/20 pt-3">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full w-9 h-9 bg-white/80 border-2 border-[#8B6914] flex items-center justify-center">
                                    <User className="w-5 h-5 text-[#8B6914]" />
                                </div>
                                <div className="flex flex-col text-xs">
                                    {currentUser ? (
                                        <>
                      <span className="text-[#5C4A1F] font-semibold">
                        {currentUser.nome ?? currentUser.email}
                      </span>
                                            <span className="text-[#5C4A1F]/80">
                        {currentUser.role.toLowerCase()}
                      </span>
                                        </>
                                    ) : (
                                        <span className="text-[#5C4A1F]/80">Não autenticado</span>
                                    )}
                                </div>
                            </div>

                            {currentUser ? (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="text-xs text-red-700 hover:underline"
                                >
                                    sair
                                </button>
                            ) : (
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-xs text-[#5C4A1F] hover:underline"
                                >
                                    entrar
                                </Link>
                            )}
                        </div>
                    </nav>
                )}
            </header>
        </div>
    )
}
