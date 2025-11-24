const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3333/api'

type BackendPet = any

function mapBackendToFrontend(b: BackendPet) {
  // Map minimal fields from backend pet to frontend Pet shape used by UI
  return {
    id: b.id,
    type: (b.especie || '').toLowerCase().includes('gato') ? 'cat' : 'dog',
    name: b.nome ?? `Pet ${b.id}`,
    description: b.descricao ?? b.descricaoSaude ?? '',
    images: (b.imagens && Array.isArray(b.imagens) && b.imagens.length > 0)
      ? b.imagens
      : ["/assets/icon.png"],
    tags: [b.porte ?? '', b.sexo ?? ''].filter(Boolean),
    age: b.idade ?? '',
    size: b.porte ? (b.porte === 'PEQUENO' ? 'Pequeno' : b.porte === 'MEDIO' ? 'Médio' : 'Grande') : '',
    weight: b.peso ?? '',
    // Prefer local, then ong.cidade, finally empty string
    location: b.local ?? b.ong?.cidade ?? '',
    coordinates: b.coordenadas ?? { lat: 0, lng: 0 },
    address: b.endereco ?? '',
    vaccinated: !!b.vacinado,
    castrated: !!b.castrado,
    temperament: (b.temperamento && Array.isArray(b.temperamento)) ? b.temperamento : [],
    healthStatus: b.descricaoSaude ?? ''
  }
}

export async function getPets() {
  const res = await fetch(`${API_BASE}/pets`)
  if (!res.ok) throw new Error('Failed to fetch pets')
  const data = await res.json()
  return data.map(mapBackendToFrontend)
}

export async function getPetById(id: number) {
  const res = await fetch(`${API_BASE}/pets/${id}`)
  if (!res.ok) throw new Error('Failed to fetch pet')
  const data = await res.json()
  return mapBackendToFrontend(data)
}

// payload should contain fields coming from the form. We'll map to backend create shape
export async function createPet(payload: Record<string, any>) {
  // If payload is a FormData (contains files), send multipart/form-data
  if (payload instanceof FormData) {
    const res = await fetch(`${API_BASE}/pets`, {
      method: 'POST',
      body: payload,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Create pet failed: ${res.status} ${text}`)
    }
    const data = await res.json()
    return mapBackendToFrontend(data)
  }

  // Map some common fields for JSON payloads
  const body = {
    // Accept both frontend keys (`name`/`type`) or already-mapped backend keys (`nome`/`especie`)
    nome: payload.nome ?? payload.name,
    especie: payload.especie ?? (payload.type === 'cat' ? 'Gato' : payload.type === 'dog' ? 'Cachorro' : undefined),
    raca: payload.raca ?? payload.breed ?? payload.Raca ?? 'SRD',
    porte: (payload.porte || '').toUpperCase() || 'MEDIO',
    sexo: (payload.sexo || 'MACHO').toUpperCase(),
    necessidadesEspeciais: !!payload.necessidadesEspeciais,
    tratamentoContinuo: !!payload.tratamentoContinuo,
    doencaCronica: !!payload.doencaCronica,
    idOng: payload.idOng ?? undefined,
    // Optional extended fields from the form
    descricao: payload.description ?? undefined,
    descricaoSaude: payload.healthStatus ?? undefined,
    dataResgate: payload.dataResgate ? new Date(payload.dataResgate).toISOString() : undefined,
    status: payload.status ?? undefined,
    idTutorOrigem: payload.idTutorOrigem ?? undefined,
    idTutorAdotante: payload.idTutorAdotante ?? undefined
  }

  // Basic client-side check: nome is required by the backend schema.
  if (!body.nome) {
    throw new Error('Missing required field: nome (or name)')
  }

  const res = await fetch(`${API_BASE}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create pet failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return mapBackendToFrontend(data)
}

export async function updatePet(id: number, payload: Record<string, any>) {
  // Support FormData (with files) or JSON
  if (payload instanceof FormData) {
    const res = await fetch(`${API_BASE}/pets/${id}`, {
      method: 'PUT',
      body: payload,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Update pet failed: ${res.status} ${text}`)
    }
    const data = await res.json()
    return mapBackendToFrontend(data)
  }

  const body: Record<string, any> = {}
  if (payload.name) body.nome = payload.name
  if (payload.type) body.especie = payload.type === 'cat' ? 'Gato' : 'Cachorro'
  if (payload.raca) body.raca = payload.raca
  if (payload.porte) body.porte = (payload.porte || '').toUpperCase()
  if (payload.sexo) body.sexo = (payload.sexo || '').toUpperCase()
  if (typeof payload.necessidadesEspeciais !== 'undefined') body.necessidadesEspeciais = payload.necessidadesEspeciais
  if (typeof payload.tratamentoContinuo !== 'undefined') body.tratamentoContinuo = payload.tratamentoContinuo
  if (typeof payload.doencaCronica !== 'undefined') body.doencaCronica = payload.doencaCronica
  if (payload.idOng) body.idOng = payload.idOng
  if (typeof payload.description !== 'undefined') body.descricao = payload.description
  if (typeof payload.healthStatus !== 'undefined') body.descricaoSaude = payload.healthStatus
  if (typeof payload.dataResgate !== 'undefined') body.dataResgate = new Date(payload.dataResgate).toISOString()
  if (typeof payload.status !== 'undefined') body.status = payload.status
  if (typeof payload.idTutorOrigem !== 'undefined') body.idTutorOrigem = payload.idTutorOrigem
  if (typeof payload.idTutorAdotante !== 'undefined') body.idTutorAdotante = payload.idTutorAdotante

  const res = await fetch(`${API_BASE}/pets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Update pet failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return mapBackendToFrontend(data)
}

export async function deletePet(id: number) {
  const res = await fetch(`${API_BASE}/pets/${id}`, { method: 'DELETE' })
  if (res.status === 204) return true
  const text = await res.text()
  throw new Error(`Delete pet failed: ${res.status} ${text}`)
}

// ONG endpoints
export async function getOngs() {
  const res = await fetch(`${API_BASE}/ongs`)
  if (!res.ok) throw new Error('Failed to fetch ongs')
  const data = await res.json()
  return data
}

// List adopters
export async function getAdotantes() {
  const res = await fetch(`${API_BASE}/adotantes`)
  if (!res.ok) throw new Error('Failed to fetch adotantes')
  return res.json()
}

export async function getOngById(id: number) {
  const res = await fetch(`${API_BASE}/ongs/${id}`)
  if (!res.ok) throw new Error('Failed to fetch ong')
  return res.json()
}

export async function createOng(payload: { cnpj: string; nome: string; endereco?: string; telefone?: string; email?: string }) {
  const res = await fetch(`${API_BASE}/ongs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create ONG failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function updateOng(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/ongs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Update ONG failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function deleteOng(id: number) {
  const res = await fetch(`${API_BASE}/ongs/${id}`, { method: 'DELETE' })
  if (res.status === 204) return true
  const text = await res.text()
  throw new Error(`Delete ONG failed: ${res.status} ${text}`)
}

// TUTOR endpoints
export async function getTutors() {
  const res = await fetch(`${API_BASE}/tutores`)
  if (!res.ok) throw new Error('Failed to fetch tutors')
  return res.json()
}

export async function getTutorById(id: number) {
  const res = await fetch(`${API_BASE}/tutores/${id}`)
  if (!res.ok) throw new Error('Failed to fetch tutor')
  return res.json()
}

export async function createTutor(payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/tutores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create tutor failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function updateTutor(id: number, payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/tutores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Update tutor failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function deleteTutor(id: number) {
  const res = await fetch(`${API_BASE}/tutores/${id}`, { method: 'DELETE' })
  if (res.status === 204) return true
  const text = await res.text()
  throw new Error(`Delete tutor failed: ${res.status} ${text}`)
}

// ADOTANTE endpoints
export async function createAdotante(payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/adotantes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create adotante failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function getAdotanteCompatibility(adotanteId: number) {
  const res = await fetch(`${API_BASE}/compatibilidade/adotante/${adotanteId}/pets`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to fetch compatibilidade: ${res.status} ${text}`)
  }
  return res.json()
}

// list adopted pets for an adotante
export async function getMyAdopted(adotanteId: number) {
  const res = await fetch(`${API_BASE}/adotantes/${adotanteId}/adotados`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to fetch adotados: ${res.status} ${text}`)
  }
  return res.json()
}

// Adoption
export async function adoptPet(petId: number, adotanteId?: number) {
  const res = await fetch(`${API_BASE}/pets/${petId}/adopt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idAdotante: adotanteId }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to adopt pet: ${res.status} ${text}`)
  }
  return res.json()
}

export default {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getOngs,
  getOngById,
  createOng,
  updateOng,
  deleteOng,
  getTutors,
  getTutorById,
  createTutor,
  updateTutor,
  deleteTutor,
  getAdotantes,
  createAdotante,
  getAdotanteCompatibility,
  adoptPet,
  getMyAdopted,
}
