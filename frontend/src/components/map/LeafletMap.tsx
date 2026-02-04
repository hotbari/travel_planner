import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../../styles/leaflet-custom.css'

// Custom marker icons with frost theme
const createNumberedMarker = (number: number, isSelected: boolean = false) => {
  const glowColor = isSelected ? '#7dd3fc' : '#38bdf8'
  const bgColor = isSelected ? '#0ea5e9' : '#1e3a5f'

  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="marker-container ${isSelected ? 'marker-selected' : ''}">
        <div class="marker-glow" style="box-shadow: 0 0 20px ${glowColor}, 0 0 40px ${glowColor}33;"></div>
        <div class="marker-body" style="background: ${bgColor};">
          <span class="marker-number">${number}</span>
        </div>
        <div class="marker-pin"></div>
      </div>
    `,
    iconSize: [40, 56],
    iconAnchor: [20, 56],
    popupAnchor: [0, -56],
  })
}

const createAccommodationMarker = () => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="marker-container marker-hotel">
        <div class="marker-glow" style="box-shadow: 0 0 25px #f472b6, 0 0 50px #f472b633;"></div>
        <div class="marker-body marker-hotel-body">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9h18v12H3zM9 21V9M3 9l9-7 9 7"/>
          </svg>
        </div>
        <div class="marker-pin marker-hotel-pin"></div>
      </div>
    `,
    iconSize: [44, 60],
    iconAnchor: [22, 60],
    popupAnchor: [0, -60],
  })
}

interface LeafletMapProps {
  center?: [number, number]
  zoom?: number
  accommodation?: { latitude: number; longitude: number; name: string }
  places?: Array<{ id: number; latitude: number; longitude: number; name: string }>
  routes?: Array<{ geometry: GeoJSON.LineString }>
  onMapClick?: (latlng: { lat: number; lng: number }) => void
  selectedPlaceId?: number
  className?: string
}

// Component to handle map events
function MapEventHandler({ onMapClick }: { onMapClick?: (latlng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    },
  })
  return null
}

// Component to fit bounds when places change
function MapBoundsUpdater({
  accommodation,
  places
}: {
  accommodation?: { latitude: number; longitude: number }
  places?: Array<{ latitude: number; longitude: number }>
}) {
  const map = useMap()

  useEffect(() => {
    const allPoints: LatLngExpression[] = []

    if (accommodation) {
      allPoints.push([accommodation.latitude, accommodation.longitude])
    }

    if (places && places.length > 0) {
      places.forEach(place => {
        allPoints.push([place.latitude, place.longitude])
      })
    }

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints)
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
        duration: 0.8
      })
    }
  }, [map, accommodation, places])

  return null
}

export function LeafletMap({
  center = [37.5665, 126.9780], // Default: Seoul
  zoom = 13,
  accommodation,
  places = [],
  routes = [],
  onMapClick,
  selectedPlaceId,
  className = '',
}: LeafletMapProps) {
  const mapRef = useRef<L.Map>(null)
  const [mapReady, setMapReady] = useState(false)

  // Convert GeoJSON LineString to Leaflet LatLng array
  const convertRouteToLatLngs = (geometry: GeoJSON.LineString): LatLngExpression[] => {
    return geometry.coordinates.map(coord => [coord[1], coord[0]]) // GeoJSON is [lng, lat]
  }

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-lg ${className}`}>
      {/* Map border decoration */}
      <div className="absolute inset-0 pointer-events-none z-[1000]">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent-primary/60" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent-primary/60" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-accent-primary/60" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent-primary/60" />
      </div>

      {/* Map legend overlay */}
      <div className="absolute top-4 left-4 z-[999] bg-slate-900/90 backdrop-blur-sm rounded-lg border border-accent-primary/30 px-4 py-3 shadow-lg">
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-mono">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-pink-600" />
            <span>Accommodation</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-sky-400 to-sky-600" />
            <span>Places</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <div className="w-8 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary" />
            <span>Route</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
        whenReady={() => setMapReady(true)}
      >
        {/* Dark theme tile layer - CartoDB Dark Matter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          className="map-tiles"
        />

        {/* Alternative: Stadia Dark */}
        {/* <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        /> */}

        {/* Accommodation marker */}
        {accommodation && (
          <Marker
            position={[accommodation.latitude, accommodation.longitude]}
            icon={createAccommodationMarker()}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <div className="popup-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9h18v12H3zM9 21V9M3 9l9-7 9 7"/>
                  </svg>
                </div>
                <div>
                  <div className="popup-label">Accommodation</div>
                  <div className="popup-title">{accommodation.name}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Place markers */}
        {places.map((place, index) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={createNumberedMarker(index + 1, place.id === selectedPlaceId)}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <div className="popup-badge">{index + 1}</div>
                <div>
                  <div className="popup-label">Place</div>
                  <div className="popup-title">{place.name}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route polylines */}
        {routes.map((route, index) => (
          <Polyline
            key={index}
            positions={convertRouteToLatLngs(route.geometry)}
            pathOptions={{
              color: '#0ea5e9',
              weight: 4,
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
              className: 'route-line',
            }}
          />
        ))}

        {/* Map event handlers */}
        <MapEventHandler onMapClick={onMapClick} />
        <MapBoundsUpdater accommodation={accommodation} places={places} />
      </MapContainer>

      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm z-[1001]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-mono">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
