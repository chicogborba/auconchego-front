import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para ícones padrão do Leaflet
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

// Configurar ícone padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
})

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface LocationMapProps {
  lat: number
  lng: number
  petName: string
  location: string
}

export default function LocationMap({ lat, lng, petName, location }: LocationMapProps) {
  // Coordenadas padrão de Porto Alegre, RS
  const defaultLat = -30.0346
  const defaultLng = -51.2177

  // Validar coordenadas
  const isValidLat = lat && !isNaN(lat) && lat !== 0 && lat >= -90 && lat <= 90
  const isValidLng = lng && !isNaN(lng) && lng !== 0 && lng >= -180 && lng <= 180

  const finalLat = isValidLat ? lat : defaultLat
  const finalLng = isValidLng ? lng : defaultLng
  const hasValidCoordinates = isValidLat && isValidLng

  // Ícone customizado para o marcador (laranja/marrom para combinar com o tema)
  const customIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  // Usar useEffect para garantir que o mapa seja renderizado após o componente montar
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F5E6C3] rounded-xl">
        <p className="text-[#5C4A1F]">Carregando mapa...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {!hasValidCoordinates && (
        <div className="absolute top-2 left-2 z-[1000] bg-[#FFF1BA] border-2 border-[#5C4A1F] rounded-lg px-3 py-2 shadow-md">
          <p className="text-xs text-[#5C4A1F] font-semibold">
            📍 Localização aproximada (coordenadas não disponíveis)
          </p>
        </div>
      )}
      <MapContainer
        center={[finalLat, finalLng]}
        zoom={hasValidCoordinates ? 15 : 12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        className="rounded-xl"
        key={`${finalLat}-${finalLng}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[finalLat, finalLng]} icon={hasValidCoordinates ? customIcon : DefaultIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-[#5C4A1F]">{petName}</p>
              <p className="text-sm text-[#8B6914]">{location || 'Localização não informada'}</p>
              {!hasValidCoordinates && (
                <p className="text-xs text-[#8B6914] mt-1 italic">
                  (Localização aproximada - Porto Alegre, RS)
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
