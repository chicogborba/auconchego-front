# 🐾 Auconchego

Plataforma de adoção de pets que conecta pessoas a ONGs e protetores independentes.

## 🚀 Como rodar

### Pré-requisitos
- Node.js (v18+)
- npm

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse: `http://localhost:5173`

## 🛠️ Stack

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** v3.4.1
- **shadcn/ui** (componentes)
- **React Router** (navegação)
- **Leaflet** (mapas)
- **Lucide React** (ícones)

## 📦 Build

```bash
npm run build
```

---

**Auconchego** - Mais do que uma plataforma, uma rede de amor. 💛
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# auconchego-front
