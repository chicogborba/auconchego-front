const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3333/api'

type BackendPet = any

function mapBackendToFrontend(b: BackendPet) {
    // normaliza imagens vindo do backend
    let images: string[] = ['/assets/icon.png']

    if (Array.isArray(b.imagens) && b.imagens.length > 0) {
        images = b.imagens
    } else if (typeof b.imagens === 'string' && b.imagens.trim() !== '') {
        // se o back estiver mandando uma string simples em vez de array
        images = [b.imagens.trim()]
    }

    return {
        id: b.id,
        type: (b.especie || '').toLowerCase().includes('gato') ? 'cat' : 'dog',
        name: b.nome ?? `Pet ${b.id}`,
        description: b.descricao ?? b.descricaoSaude ?? '',
        images, // 👉 usa a variável normalizada
        tags: [
            b.porte ?? '',
            b.raca ?? '',
            b.sexo ?? '',
            b.necessidadesEspeciais ? 'Necessidades especiais' : '',
            b.tratamentoContinuo ? 'Tratamento contínuo' : '',
            b.doencaCronica ? 'Doença crônica' : '',
            b.status ?? '',
            b.peso ? `${b.peso} kg` : '',
        ]
            .filter(Boolean)
            .map(tag => typeof tag === 'string' ? tag.trim() : tag)
            .filter(tag => tag && tag.length > 0),
        age: b.idade ?? '',
        size: b.porte
            ? b.porte === 'PEQUENO'
                ? 'Pequeno'
                : b.porte === 'MEDIO'
                    ? 'Médio'
                    : 'Grande'
            : '',
        weight: b.peso ?? '',
        location: b.local ?? b.ong?.endereco ?? '',
        coordinates: b.coordenadas ?? { lat: 0, lng: 0 },
        address: b.endereco ?? '',
        vaccinated: !!b.vacinado,
        castrated: !!b.castrado,
        temperament:
            b.temperamento && Array.isArray(b.temperamento)
                ? b.temperamento
                : [],
        healthStatus: b.descricaoSaude ?? '',

        tutorId: b.tutorId ?? null,
        adopterId: b.adotanteId ?? null,
        idOng: b.idOng ?? null,
        status: b.status ?? '',
    }
}



/* ========= PETS ========= */

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
    const body: Record<string, any> = {
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
        descricao: payload.descricao ?? payload.description ?? undefined,
        descricaoSaude: payload.descricaoSaude ?? payload.healthStatus ?? undefined,
        dataResgate: payload.dataResgate ? new Date(payload.dataResgate).toISOString() : undefined,
        status: payload.status ?? undefined,
        tutorId: payload.tutorId ?? undefined,
        adotanteId: payload.adotanteId ?? undefined,
    }

    // ---- NOVOS CAMPOS DO SCHEMA ----
    if (payload.idade !== undefined && payload.idade !== '') {
        body.idade = Number(payload.idade)
    }
    if (payload.peso !== undefined && payload.peso !== '') {
        body.peso = Number(payload.peso)
    }
    if (payload.local !== undefined && payload.local !== '') {
        body.local = payload.local
    }
    if (payload.vacinado !== undefined) {
        body.vacinado = !!payload.vacinado
    }
    if (payload.castrado !== undefined) {
        body.castrado = !!payload.castrado
    }

    if (typeof payload.temperamento !== 'undefined') {
        if (Array.isArray(payload.temperamento)) {
            body.temperamento = payload.temperamento
        } else if (typeof payload.temperamento === 'string') {
            body.temperamento = payload.temperamento
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean)
        }
    } else if (typeof payload.temperamentText === 'string') {
        body.temperamento = payload.temperamentText
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
    }

    // 🔥 NOVO: garantir que imagens do front cheguem no back
    if (Array.isArray(payload.imagens) && payload.imagens.length > 0) {
        body.imagens = payload.imagens
    } else if (typeof payload.imagem === 'string' && payload.imagem.trim() !== '') {
        body.imagens = [payload.imagem]
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

export async function uploadPetImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_BASE}/upload/pet-image`, {
        method: 'POST',
        body: formData,
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(
            `Failed to upload pet image: ${res.status} ${text}`,
        )
    }

    return res.json() // { url }
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
    if (typeof payload.description !== 'undefined' || typeof payload.descricao !== 'undefined') {
        body.descricao = payload.description ?? payload.descricao
    }
    if (typeof payload.healthStatus !== 'undefined' || typeof payload.descricaoSaude !== 'undefined') {
        body.descricaoSaude = payload.healthStatus ?? payload.descricaoSaude
    }
    if (typeof payload.dataResgate !== 'undefined') {
        body.dataResgate = new Date(payload.dataResgate).toISOString()
    }
    if (typeof payload.status !== 'undefined') body.status = payload.status
    if (typeof payload.tutorId !== 'undefined') body.tutorId = payload.tutorId
    if (typeof payload.adotanteId !== 'undefined') body.adotanteId = payload.adotanteId

    // ---- NOVOS CAMPOS DO SCHEMA ----
    if (typeof payload.idade !== 'undefined' && payload.idade !== '') {
        body.idade = Number(payload.idade)
    }
    if (typeof payload.peso !== 'undefined' && payload.peso !== '') {
        body.peso = Number(payload.peso)
    }
    if (typeof payload.local !== 'undefined') {
        body.local = payload.local
    }
    if (typeof payload.vacinado !== 'undefined') {
        body.vacinado = !!payload.vacinado
    }
    if (typeof payload.castrado !== 'undefined') {
        body.castrado = !!payload.castrado
    }
    if (typeof payload.temperamento !== 'undefined') {
        if (Array.isArray(payload.temperamento)) {
            body.temperamento = payload.temperamento
        } else if (typeof payload.temperamento === 'string') {
            body.temperamento = payload.temperamento
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean)
        }
    } else if (typeof payload.temperamentText === 'string') {
        body.temperamento = payload.temperamentText
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
    }

    // 🔥 NOVO: mesma regra de imagens no update
    if (Array.isArray(payload.imagens) && payload.imagens.length > 0) {
        body.imagens = payload.imagens
    } else if (typeof payload.imagem === 'string' && payload.imagem.trim() !== '') {
        body.imagens = [payload.imagem]
    }

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

/* ========= ONG ========= */

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

/* ========= TUTOR ========= */

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

/* ========= ADOTANTE ========= */

export async function createAdotante(payload: Record<string, any>) {
    const res = await fetch(`${API_BASE}/adotantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        let errorMessage = `Erro ao criar adotante (${res.status})`
        try {
            const errorData = await res.json()
            errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
            const text = await res.text()
            errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
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

/* ========= ADOPTION ========= */

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

// Criar pedido de adoção (ADOTANTE)
export async function createAdoptionRequest(
    petId: number,
    adotanteId: number,
    message?: string,
) {
    const res = await fetch(`${API_BASE}/pets/${petId}/adoption-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idAdotante: adotanteId,
            message: message ?? '',
        }),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(
            `Failed to create adoption request: ${res.status} ${text}`,
        )
    }
    return res.json()
}

// Listar pedidos de adoção (com filtros opcionais)
export async function getAdoptionRequests(params?: {
    petId?: number
    adotanteId?: number
    status?: string
}) {
    const qs = new URLSearchParams()
    if (params?.petId) qs.append('petId', String(params.petId))
    if (params?.adotanteId) qs.append('adotanteId', String(params.adotanteId))
    if (params?.status) qs.append('status', params.status)

    const res = await fetch(
        `${API_BASE}/adoption-requests${qs.toString() ? `?${qs.toString()}` : ''}`,
    )
    if (!res.ok) {
        const text = await res.text()
        throw new Error(
            `Failed to fetch adoption requests: ${res.status} ${text}`,
        )
    }
    return res.json()
}

// Aprovar pedido (TUTOR ou ONG)
export async function approveAdoptionRequest(
    requestId: number,
    payload: { responderId: number; responderType: 'TUTOR' | 'ONG' },
) {
    const res = await fetch(
        `${API_BASE}/adoption-requests/${requestId}/approve`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        },
    )
    if (!res.ok) {
        const text = await res.text()
        throw new Error(
            `Failed to approve adoption request: ${res.status} ${text}`,
        )
    }
    return res.json()
}

// Rejeitar pedido (TUTOR ou ONG)
export async function rejectAdoptionRequest(
    requestId: number,
    payload: {
        responderId: number
        responderType: 'TUTOR' | 'ONG'
        reason?: string
    },
) {
    const res = await fetch(
        `${API_BASE}/adoption-requests/${requestId}/reject`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        },
    )
    if (!res.ok) {
        const text = await res.text()
        throw new Error(
            `Failed to reject adoption request: ${res.status} ${text}`,
        )
    }
    return res.json()
}


/* ========= HISTÓRICO DE LOCALIZAÇÃO ========= */

export interface LocationHistoryEntry {
    id?: number
    petId?: number
    endereco?: string
    cidade?: string
    estado?: string
    criadoEm?: string
    atualizadoEm?: string
    [key: string]: any
}

// GET /historico-localizacao/pet/:petId
export async function getLocationHistoryByPet(petId: number): Promise<LocationHistoryEntry[]> {
    const res = await fetch(`${API_BASE}/historico-localizacao/pet/${petId}`)
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to fetch location history: ${res.status} ${text}`)
    }
    return res.json()
}

// POST /historico-localizacao
export async function createLocationEntry(data: Partial<LocationHistoryEntry>) {
    const res = await fetch(`${API_BASE}/historico-localizacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to create location entry: ${res.status} ${text}`)
    }
    return res.json()
}

// 🔁 Alias mais semântico para o resto do front
export async function createLocationHistory(data: Partial<LocationHistoryEntry>) {
    return createLocationEntry(data)
}

// PUT /historico-localizacao/:id
export async function updateLocationEntry(id: number, data: Partial<LocationHistoryEntry>) {
    const res = await fetch(`${API_BASE}/historico-localizacao/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to update location entry: ${res.status} ${text}`)
    }
    return res.json()
}

// DELETE /historico-localizacao/:id
export async function deleteLocationEntry(id: number) {
    const res = await fetch(`${API_BASE}/historico-localizacao/${id}`, {
        method: 'DELETE',
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to delete location entry: ${res.status} ${text}`)
    }
}

/* ========= VISITAS DE ACOMPANHAMENTO ========= */

export interface VisitEntry {
    id?: number
    petId?: number
    tutorId?: number
    dataVisita?: string
    observacoes?: string
    [key: string]: any
}

// GET /visitas-acompanhamento
export async function getAllVisits(): Promise<VisitEntry[]> {
    const res = await fetch(`${API_BASE}/visitas-acompanhamento`)
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to fetch visits: ${res.status} ${text}`)
    }
    return res.json()
}

// GET /visitas-acompanhamento/pet/:petId
export async function getVisitsByPet(petId: number): Promise<VisitEntry[]> {
    const res = await fetch(`${API_BASE}/visitas-acompanhamento/pet/${petId}`)
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to fetch pet visits: ${res.status} ${text}`)
    }
    return res.json()
}

// GET /visitas-acompanhamento/tutor/:tutorId (se existir no back)
export async function getVisitsByTutor(tutorId: number): Promise<VisitEntry[]> {
    const res = await fetch(`${API_BASE}/visitas-acompanhamento/tutor/${tutorId}`)
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to fetch tutor visits: ${res.status} ${text}`)
    }
    return res.json()
}

// POST /visitas-acompanhamento
export async function createVisit(data: Partial<VisitEntry>) {
    const res = await fetch(`${API_BASE}/visitas-acompanhamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to create visit: ${res.status} ${text}`)
    }
    return res.json()
}

// PUT /visitas-acompanhamento/:id
export async function updateVisit(id: number, data: Partial<VisitEntry>) {
    const res = await fetch(`${API_BASE}/visitas-acompanhamento/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to update visit: ${res.status} ${text}`)
    }
    return res.json()
}

// DELETE /visitas-acompanhamento/:id
export async function deleteVisit(id: number) {
    const res = await fetch(`${API_BASE}/visitas-acompanhamento/${id}`, {
        method: 'DELETE',
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to delete visit: ${res.status} ${text}`)
    }
}

/* ========= ACOMPANHAMENTO & ALERTAS ========= */

export interface AcompanhamentoRelatorio {
    id?: number
    petId?: number
    tutorId?: number
    status?: string
    observacoes?: string
    criadoEm?: string
    [key: string]: unknown
}

export interface AcompanhamentoAlerta {
    id?: number
    petId?: number
    tipo?: string
    mensagem?: string
    nivel?: string
    [key: string]: any
}

// POST /acompanhamento/relatorio
export async function createAcompanhamentoRelatorio(data: AcompanhamentoRelatorio) {
    const res = await fetch(`${API_BASE}/acompanhamento/relatorio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to create acompanhamento report: ${res.status} ${text}`)
    }
    return res.json()
}

// GET /acompanhamento/tutor/:tutorId
export async function getAcompanhamentoByTutor(tutorId: number): Promise<AcompanhamentoRelatorio[]> {
    const res = await fetch(`${API_BASE}/acompanhamento/tutor/${tutorId}`)
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to fetch acompanhamento by tutor: ${res.status} ${text}`)
    }
    return res.json()
}

// GET /acompanhamento/pet/:petId
export async function getAcompanhamentoByPet(petId: number): Promise<AcompanhamentoRelatorio[]> {
    const res = await fetch(`${API_BASE}/acompanhamento/pet/${petId}`)
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to fetch acompanhamento by pet: ${res.status} ${text}`)
    }
    return res.json()
}

// GET /acompanhamento/alertas
export async function getAcompanhamentoAlertas(): Promise<AcompanhamentoAlerta[]> {
    const res = await fetch(`${API_BASE}/acompanhamento/alertas`)
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Failed to fetch acompanhamento alerts: ${res.status} ${text}`)
    }
    return res.json()
}

/* ========= DEFAULT EXPORT ========= */

export default {
    getPets,
    getPetById,
    createPet,
    updatePet,
    deletePet,
    uploadPetImage,
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
    getLocationHistoryByPet,
    createLocationEntry,
    createLocationHistory,
    updateLocationEntry,
    deleteLocationEntry,
    getAllVisits,
    getVisitsByPet,
    getVisitsByTutor,
    createVisit,
    updateVisit,
    deleteVisit,
    createAcompanhamentoRelatorio,
    getAcompanhamentoByTutor,
    getAcompanhamentoByPet,
    getAcompanhamentoAlertas,
    createAdoptionRequest,
    getAdoptionRequests,
    approveAdoptionRequest,
    rejectAdoptionRequest,
}
