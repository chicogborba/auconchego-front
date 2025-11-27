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

        // TUTOR / ONG / ROOT → Admin de pets
        if (
            currentUser &&
            (currentUser.role === 'TUTOR' ||
                currentUser.role === 'ONG' ||
                currentUser.role === 'ROOT')
        ) {
            items.push({ label: 'Pets', path: '/pets/admin' })
        } else {
            items.push({ label: 'Pets', path: '/pets' })
        }

        if (currentUser?.role === 'ADOTANTE') {
            items.push({ label: 'Meus adotados', path: '/meus-adotados' })
            items.push({ label: 'Preferências', path: '/preferencias' })
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
        <div className="w-full flex justify-center px-2 md:px-4 py-3 md:py-4">
            <header
                className={`bg-[#FFBD59] px-3 md:px-4 lg:px-6 py-2 md:py-3 shadow-md max-w-7xl w-full transition-all rounded-3xl lg:rounded-full ${
                    mobileMenuOpen ? 'lg:rounded-3xl' : ''
                }`}
            >
                <div className="flex items-center justify-between gap-2 md:gap-4">
                    {/* Logo + título */}
                    <Link to="/main" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <img
                            src={logo}
                            alt="Auconchego Logo"
                            className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full border-2 border-[#8B6914] flex-shrink-0"
                        />
                        <div className="flex flex-col justify-center hidden sm:flex">
                            <span className="font-extrabold text-lg md:text-xl lg:text-2xl text-[#5C4A1F] leading-tight">
                                Auconchego
                            </span>
                            <span className="text-[10px] md:text-xs lg:text-sm text-[#5C4A1F]/80 leading-tight">
                                adoção com carinho
                            </span>
                        </div>
                    </Link>

                    {/* Menu desktop */}
                    <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-1 justify-center min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1 xl:gap-1.5 overflow-x-auto scrollbar-hide max-w-full">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-2 xl:px-2.5 py-1.5 rounded-full text-xs xl:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                                        location.pathname === item.path
                                            ? 'bg-[#F5E6C3] text-[#5C4A1F] font-bold'
                                            : 'text-[#5C4A1F] hover:bg-[#F5E6C3]/60'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Lado direito */}
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        {/* Info usuário */}
                        {currentUser ? (
                            <div className="hidden md:flex items-center gap-2 bg-[#F5E6C3] px-2 md:px-3 py-1.5 md:py-2 rounded-full border-2 border-[#5C4A1F]/20 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col items-end text-right min-w-0">
                                    <span className="text-[#5C4A1F] font-bold text-[10px] md:text-xs leading-tight truncate max-w-[100px] md:max-w-[120px] lg:max-w-[150px]">
                                        {currentUser.nome ?? currentUser.email}
                                    </span>
                                    <span className="text-[#5C4A1F]/70 text-[9px] md:text-[10px] leading-tight capitalize">
                                        {currentUser.role.toLowerCase()}
                                    </span>
                                </div>
                                <div className="h-5 md:h-6 w-px bg-[#5C4A1F]/20"></div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="text-red-700 hover:text-red-800 text-[9px] md:text-[10px] font-medium hover:underline leading-tight whitespace-nowrap"
                                >
                                    sair
                                </button>
                            </div>
                        ) : (
                            <Link to="/" title="Login">
                                <div className="hidden md:flex rounded-full w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-white/80 border-2 border-[#8B6914] items-center justify-center cursor-pointer hover:bg-white flex-shrink-0">
                                    <User className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-[#8B6914]" />
                                </div>
                            </Link>
                        )}

                        {/* Botão menu mobile */}
                        <button
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            className="lg:hidden rounded-full w-9 h-9 md:w-10 md:h-10 bg-white/80 border-2 border-[#8B6914] flex items-center justify-center cursor-pointer flex-shrink-0"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-4 h-4 md:w-5 md:h-5 text-[#8B6914]" />
                            ) : (
                                <Menu className="w-4 h-4 md:w-5 md:h-5 text-[#8B6914]" />
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
                                        ? 'text-[#5C4A1F] font-bold bg-[#F5E6C3]'
                                        : 'text-[#5C4A1F] font-normal hover:bg-[#F5E6C3]/40'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#5C4A1F]/20 pt-3">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full w-9 h-9 bg-white/80 border-2 border-[#8B6914] flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-[#8B6914]" />
                                </div>
                                <div className="flex flex-col text-xs">
                                    {currentUser ? (
                                        <>
                                            <span className="text-[#5C4A1F] font-semibold leading-tight">
                                                {currentUser.nome ?? currentUser.email}
                                            </span>
                                            <span className="text-[#5C4A1F]/80 leading-tight">
                                                {currentUser.role.toLowerCase()}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-[#5C4A1F]/80 leading-tight">Não autenticado</span>
                                    )}
                                </div>
                            </div>

                            {currentUser ? (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="text-xs text-red-700 hover:underline flex-shrink-0"
                                >
                                    sair
                                </button>
                            ) : (
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-xs text-[#5C4A1F] hover:underline flex-shrink-0"
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
