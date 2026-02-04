import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { RouteOverlay, RouteSegment } from './RouteOverlay'
import 'leaflet/dist/leaflet.css'

/**
 * Example usage of RouteOverlay component
 *
 * This demonstrates how to integrate OSRM routes into a Leaflet map
 * with the frost winter theme styling.
 */

// Example route data from OSRM API
const exampleRoutes: RouteSegment[] = [
  {
    geometry: {
      type: 'LineString',
      coordinates: [
        [-122.4194, 37.7749],  // San Francisco start
        [-122.4184, 37.7759],
        [-122.4174, 37.7769],
      ]
    },
    mode: 'walk',
    duration_seconds: 180,
    distance_meters: 250
  },
  {
    geometry: {
      type: 'LineString',
      coordinates: [
        [-122.4174, 37.7769],
        [-122.4094, 37.7849],
        [-122.4014, 37.7929],
      ]
    },
    mode: 'transit',
    duration_seconds: 600,
    distance_meters: 1200
  },
  {
    geometry: {
      type: 'LineString',
      coordinates: [
        [-122.4014, 37.7929],
        [-122.3994, 37.7949],
        [-122.3974, 37.7969],
        [-122.3954, 37.7989],
      ]
    },
    mode: 'bike',
    duration_seconds: 300,
    distance_meters: 800
  },
  {
    geometry: {
      type: 'LineString',
      coordinates: [
        [-122.3954, 37.7989],
        [-122.3854, 37.8089],
        [-122.3754, 37.8189],
      ]
    },
    mode: 'drive',
    duration_seconds: 420,
    distance_meters: 2500
  }
]

export const RouteOverlayExample = () => {
  const center: [number, number] = [37.7849, -122.4094]

  return (
    <div className="h-screen w-full bg-bg-primary">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        {/* Dark mode tile layer for frost winter theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Start marker */}
        <Marker position={[37.7749, -122.4194]}>
          <Popup>
            <div className="font-main text-sm">
              <p className="font-semibold text-accent-primary">Start Point</p>
              <p className="text-text-secondary">Begin your journey here</p>
            </div>
          </Popup>
        </Marker>

        {/* End marker */}
        <Marker position={[37.8189, -122.3754]}>
          <Popup>
            <div className="font-main text-sm">
              <p className="font-semibold text-accent-primary">Destination</p>
              <p className="text-text-secondary">Your final stop</p>
            </div>
          </Popup>
        </Marker>

        {/* Route overlay with animation */}
        <RouteOverlay
          routes={exampleRoutes}
          selectedIndex={undefined}
          animated={true}
        />
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-8 left-8 bg-bg-card/90 backdrop-blur-sm border border-pixel-border/30 rounded-lg p-4 shadow-glow-sky z-[1000]">
        <h3 className="font-main font-semibold text-text-primary mb-3">Route Legend</h3>
        <div className="space-y-2 font-main text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-0.5 bg-sky-400" style={{ borderStyle: 'dashed', borderWidth: '2px 0 0 0', height: '2px' }} />
            <span className="text-text-secondary">Walking</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-sky-500" />
            <span className="text-text-secondary">Transit</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-sky-600 shadow-glow-ice" />
            <span className="text-text-secondary">Driving</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-0.5 bg-sky-400" style={{ borderStyle: 'dotted', borderWidth: '2px 0 0 0', height: '2px' }} />
            <span className="text-text-secondary">Biking</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteOverlayExample
