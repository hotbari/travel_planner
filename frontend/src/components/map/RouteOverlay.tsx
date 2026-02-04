import { useEffect, useState } from 'react'
import { Polyline } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'

export interface RouteSegment {
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]  // [lng, lat] pairs (GeoJSON order)
  }
  mode: 'walk' | 'transit' | 'drive' | 'bike'
  duration_seconds: number
  distance_meters: number
}

export interface RouteOverlayProps {
  routes: RouteSegment[]
  selectedIndex?: number
  animated?: boolean
}

interface RouteStyle {
  color: string
  weight: number
  opacity: number
  dashArray?: string
  shadowColor?: string
  shadowBlur?: number
}

const getModeStyle = (
  mode: RouteSegment['mode'],
  isSelected: boolean
): RouteStyle => {
  const baseStyles: Record<RouteSegment['mode'], RouteStyle> = {
    walk: {
      color: '#38bdf8',      // sky-400
      weight: isSelected ? 5 : 3,
      opacity: isSelected ? 1 : 0.8,
      dashArray: '8, 12',
    },
    transit: {
      color: '#0ea5e9',      // sky-500
      weight: isSelected ? 6 : 4,
      opacity: isSelected ? 1 : 0.85,
    },
    drive: {
      color: '#0284c7',      // sky-600
      weight: isSelected ? 7 : 5,
      opacity: isSelected ? 1 : 0.9,
      shadowColor: '#7dd3fc',
      shadowBlur: isSelected ? 15 : 8,
    },
    bike: {
      color: '#38bdf8',      // sky-400
      weight: isSelected ? 5 : 3,
      opacity: isSelected ? 1 : 0.8,
      dashArray: '3, 9',
    },
  }

  return baseStyles[mode]
}

interface AnimatedPolylineProps {
  positions: LatLngExpression[]
  style: RouteStyle
  delay?: number
}

const AnimatedPolyline = ({
  positions,
  style,
  delay = 0
}: AnimatedPolylineProps) => {
  const [visiblePositions, setVisiblePositions] = useState<LatLngExpression[]>([])
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    // Reset animation when positions change
    setVisiblePositions([])
    setAnimationComplete(false)

    const totalPoints = positions.length
    if (totalPoints === 0) return

    // Animation duration: 1 second total
    const animationDuration = 1000
    const intervalTime = animationDuration / totalPoints

    const startTime = Date.now() + delay

    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime

      if (elapsed < 0) return // Wait for delay

      const progress = Math.min(elapsed / animationDuration, 1)
      const pointsToShow = Math.ceil(progress * totalPoints)

      setVisiblePositions(positions.slice(0, pointsToShow))

      if (progress >= 1) {
        setAnimationComplete(true)
        clearInterval(animationInterval)
      }
    }, intervalTime)

    return () => clearInterval(animationInterval)
  }, [positions, delay])

  if (visiblePositions.length < 2) return null

  return (
    <>
      {/* Shadow/Glow layer for drive mode */}
      {style.shadowColor && animationComplete && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: style.shadowColor,
            weight: style.weight + 4,
            opacity: 0.3,
            dashArray: style.dashArray,
          }}
        />
      )}

      {/* Main route line */}
      <Polyline
        positions={visiblePositions}
        pathOptions={{
          color: style.color,
          weight: style.weight,
          opacity: style.opacity,
          dashArray: style.dashArray,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </>
  )
}

export const RouteOverlay = ({
  routes,
  selectedIndex,
  animated = true
}: RouteOverlayProps) => {
  // Convert GeoJSON coordinates [lng, lat] to Leaflet LatLng [lat, lng]
  const convertCoordinates = (coords: [number, number][]): LatLngExpression[] => {
    return coords.map(([lng, lat]) => [lat, lng] as LatLngExpression)
  }

  return (
    <>
      {routes.map((route, index) => {
        const positions = convertCoordinates(route.geometry.coordinates)
        const style = getModeStyle(route.mode, selectedIndex === index)
        const delay = animated ? index * 200 : 0 // Stagger animation by 200ms per segment

        if (positions.length < 2) return null

        return animated ? (
          <AnimatedPolyline
            key={`route-${index}`}
            positions={positions}
            style={style}
            delay={delay}
          />
        ) : (
          <>
            {/* Shadow/Glow layer for drive mode */}
            {style.shadowColor && (
              <Polyline
                key={`route-shadow-${index}`}
                positions={positions}
                pathOptions={{
                  color: style.shadowColor,
                  weight: style.weight + 4,
                  opacity: 0.3,
                  dashArray: style.dashArray,
                }}
              />
            )}

            {/* Main route line */}
            <Polyline
              key={`route-${index}`}
              positions={positions}
              pathOptions={{
                color: style.color,
                weight: style.weight,
                opacity: style.opacity,
                dashArray: style.dashArray,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )
      })}
    </>
  )
}

export default RouteOverlay
