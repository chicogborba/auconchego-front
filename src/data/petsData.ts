import catImage from '@/assets/cat.png'
import dog1Image from '@/assets/dog1.png'
import dog2Image from '@/assets/dog2.png'

export interface Pet {
  id: number
  type: 'cat' | 'dog'
  name: string
  description: string
  images: string[]
  tags: string[]
  age: string
  size: string
  weight: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  address: string
  vaccinated: boolean
  castrated: boolean
  temperament: string[]
  healthStatus: string
}

export const petsData: Record<string, Pet> = {
  '1': {
    id: 1,
    type: 'cat',
    name: 'Nicko',
    description: 'Nicko é um gato muito carinhoso e brincalhão. Adora ficar no colo e ronronar. É muito sociável com outros animais e crianças. Está castrado, vacinado e vermifugado. Procura um lar cheio de amor onde possa passar seus dias relaxando e recebendo muito carinho.',
    images: [catImage, catImage, catImage, catImage],
    tags: ['Adulto', 'Pequeno', 'Macho'],
    age: '3 anos',
    size: 'Pequeno',
    weight: '4kg',
    location: 'São Paulo, SP',
    coordinates: {
      lat: -23.5505,
      lng: -46.6333
    },
    address: 'Rua Augusta, 1234 - Consolação, São Paulo - SP, CEP 01304-001',
    vaccinated: true,
    castrated: true,
    temperament: ['Carinhoso', 'Brincalhão', 'Sociável', 'Calmo'],
    healthStatus: 'Saudável, vacinado em dia'
  },
  '2': {
    id: 2,
    type: 'dog',
    name: 'Mel',
    description: 'Mel é uma cachorrinha super energética e alegre! Adora brincar, correr e fazer novos amigos. É muito inteligente e aprende comandos rapidamente. Perfeita para famílias ativas que possam dar atenção e exercícios diários. Está castrada, vacinada e pronta para encontrar sua família para sempre.',
    images: [dog1Image, dog1Image, dog1Image, dog1Image],
    tags: ['Filhote', 'Médio', 'Fêmea'],
    age: '8 meses',
    size: 'Médio',
    weight: '12kg',
    location: 'Campinas, SP',
    coordinates: {
      lat: -22.9099,
      lng: -47.0626
    },
    address: 'Av. Norte-Sul, 567 - Cambuí, Campinas - SP, CEP 13025-320',
    vaccinated: true,
    castrated: true,
    temperament: ['Energética', 'Amigável', 'Inteligente', 'Leal'],
    healthStatus: 'Ótima saúde, todas as vacinas em dia'
  },
  '3': {
    id: 3,
    type: 'dog',
    name: 'Perito',
    description: 'Perito é um cachorro dócil e extremamente leal. Adora estar perto de seus humanos e é muito protetor. Perfeito para quem busca um companheiro fiel e amoroso. É calmo dentro de casa mas adora um bom passeio ao ar livre. Está castrado, vacinado e aguardando ansiosamente por uma família.',
    images: [dog2Image, dog2Image, dog2Image, dog2Image],
    tags: ['Adulto', 'Grande', 'Macho'],
    age: '5 anos',
    size: 'Grande',
    weight: '28kg',
    location: 'São Paulo, SP',
    coordinates: {
      lat: -23.5629,
      lng: -46.6544
    },
    address: 'Rua dos Pinheiros, 890 - Pinheiros, São Paulo - SP, CEP 05422-001',
    vaccinated: true,
    castrated: true,
    temperament: ['Dócil', 'Leal', 'Protetor', 'Calmo'],
    healthStatus: 'Saudável, com acompanhamento veterinário regular'
  }
}
