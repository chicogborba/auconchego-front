import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import MainPage from './pages/MainPage'
import About from './pages/About'
import Donate from './pages/Donate'
import Transparency from './pages/Transparency'
import Contact from './pages/Contact'
import AnimalDetail from './pages/AnimalDetail'
import List from './pages/List'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/animal/:id" element={<AnimalDetail />} />
        <Route path="/pets" element={<List />} />
        <Route path="/about" element={<About />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
