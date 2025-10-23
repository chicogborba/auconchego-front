import { Link, useLocation } from 'react-router-dom'
import { User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import logo from '../assets/icon.png'

export default function TopBar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { label: 'Principal', path: '/main' },
    { label: 'Pets', path: '/pets' },
    { label: 'Admin', path: '/pets/admin' },
    { label: 'Sobre nós', path: '/about' },
    { label: 'Como doar', path: '/donate' },
    { label: 'Transparência', path: '/transparency' },
    { label: 'Contato', path: '/contact' },
  ]

  return (
    <div className='w-screen flex justify-center'>
      <header className={`bg-[#FFBD59] mx-4 my-4 px-6 py-3 shadow-md max-w-5xl w-full transition-all rounded-3xl lg:rounded-full ${
        mobileMenuOpen ? 'lg:rounded-3xl' : ''
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-12 h-auto md:w-16" />
          </div>

          {/* Desktop Menu Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-base transition-colors ${
                  location.pathname === item.path
                    ? 'text-[#5C4A1F] font-bold'
                    : 'text-[#5C4A1F] font-normal hover:text-[#8B6914]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3">
            {/* User Icon */}
            <Link to="/">
              <div className="rounded-full w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-white/80 border-2 border-[#8B6914] flex items-center justify-center cursor-pointer transition-colors" title="Login">
                <User className="w-5 h-5 md:w-6 md:h-6 text-[#8B6914]" />
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-full w-10 h-10 bg-white hover:bg-white/80 border-2 border-[#8B6914] flex items-center justify-center cursor-pointer transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#8B6914]" />
              ) : (
                <Menu className="w-5 h-5 text-[#8B6914]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t-2 border-[#5C4A1F]/20 flex flex-col gap-3">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base py-2 px-4 rounded-xl transition-colors ${
                  location.pathname === item.path
                    ? 'text-[#5C4A1F] font-bold bg-white/50'
                    : 'text-[#5C4A1F] font-normal hover:bg-white/30'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </div>
  )
}
