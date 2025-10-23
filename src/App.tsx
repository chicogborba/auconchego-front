import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PetsProvider } from './contexts/PetsContext'
import Login from './pages/Login'
import MainPage from './pages/MainPage'
import About from './pages/About'
import Donate from './pages/Donate'
import Transparency from './pages/Transparency'
import Contact from './pages/Contact'
import AnimalDetail from './pages/AnimalDetail'
import List from './pages/List'
import PetsAdmin from './pages/PetsAdmin'

function App() {
  return (
    <BrowserRouter>
      <PetsProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/animal/:id" element={<AnimalDetail />} />
          <Route path="/pets" element={<List />} />
          <Route path="/pets/admin" element={<PetsAdmin />} />
          <Route path="/about" element={<About />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </PetsProvider>
    </BrowserRouter>
  )
}

export default App
