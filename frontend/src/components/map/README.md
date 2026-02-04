# RouteOverlay Component

Beautiful, animated route visualization for Leaflet maps with frost winter theme styling.

## Features

- ✨ Animated route drawing with staggered segments
- 🎨 Mode-specific styling (walk, transit, drive, bike)
- ❄️ Frost winter theme colors with glow effects
- 🎯 Highlight selected route segments
- 🚀 Smooth animations with React hooks
- 📍 GeoJSON coordinate support

## Installation

Ensure you have the required dependencies:

```bash
npm install react-leaflet leaflet
npm install -D @types/leaflet
```

## Basic Usage

```tsx
import { MapContainer, TileLayer } from 'react-leaflet'
import { RouteOverlay, RouteSegment } from '@/components/map'

const routes: RouteSegment[] = [
  {
    geometry: {
      type: 'LineString',
      coordinates: [
        [-122.4194, 37.7749],  // [lng, lat] GeoJSON order
        [-122.4184, 37.7759],
      ]
    },
    mode: 'walk',
    duration_seconds: 180,
    distance_meters: 250
  }
]

function MyMap() {
  return (
    <MapContainer center={[37.7749, -122.4194]} zoom={13}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <RouteOverlay routes={routes} animated={true} />
    </MapContainer>
  )
}
```

## Props

### `RouteOverlayProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `routes` | `RouteSegment[]` | required | Array of route segments to display |
| `selectedIndex` | `number` | `undefined` | Index of segment to highlight |
| `animated` | `boolean` | `true` | Enable animated route drawing |

### `RouteSegment`

```typescript
interface RouteSegment {
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]  // [lng, lat] pairs (GeoJSON order)
  }
  mode: 'walk' | 'transit' | 'drive' | 'bike'
  duration_seconds: number
  distance_meters: number
}
```

## Mode Styles

Each transportation mode has distinct visual styling:

### Walking 🚶
- Color: `sky-400` (#38bdf8)
- Style: Dashed line
- Weight: 3-5px
- Use: Pedestrian routes

### Transit 🚇
- Color: `sky-500` (#0ea5e9)
- Style: Solid line
- Weight: 4-6px
- Use: Bus, train, metro routes

### Driving 🚗
- Color: `sky-600` (#0284c7)
- Style: Solid with glow effect
- Weight: 5-7px
- Use: Car routes

### Biking 🚴
- Color: `sky-400` (#38bdf8)
- Style: Dotted line
- Weight: 3-5px
- Use: Bicycle routes

## Advanced Usage

### Highlight Selected Segment

```tsx
const [selectedRoute, setSelectedRoute] = useState<number | undefined>(0)

<RouteOverlay
  routes={routes}
  selectedIndex={selectedRoute}
  animated={true}
/>
```

### Disable Animation

```tsx
<RouteOverlay
  routes={routes}
  animated={false}
/>
```

### Integration with OSRM API

```tsx
import axios from 'axios'

async function fetchRoute(start: [number, number], end: [number, number]) {
  const response = await axios.get(
    `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}`,
    { params: { overview: 'full', geometries: 'geojson' } }
  )

  const geometry = response.data.routes[0].geometry

  const segment: RouteSegment = {
    geometry,
    mode: 'drive',
    duration_seconds: response.data.routes[0].duration,
    distance_meters: response.data.routes[0].distance
  }

  return segment
}
```

## Animation Behavior

- **Staggered Start**: Each segment begins 200ms after the previous
- **Duration**: 1 second per segment
- **Effect**: Smooth point-by-point drawing
- **Performance**: Uses RAF for smooth 60fps animation

## Styling Customization

The component uses Tailwind colors from the frost winter theme. To customize:

1. Edit `getModeStyle()` function in `RouteOverlay.tsx`
2. Modify color values to match your theme
3. Adjust weight, opacity, and dashArray patterns

## Performance Tips

- **Large Routes**: Consider simplifying geometry with tools like Turf.js
- **Many Segments**: Disable animation for 10+ segments
- **Mobile**: Reduce line weights by 1-2px for better visibility

## Dark Mode Support

The component is designed for dark backgrounds. For light mode maps:

1. Use lighter tile layer:
   ```tsx
   <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
   ```

2. Adjust opacity values in `getModeStyle()` for better contrast

## Accessibility

- Use semantic HTML for route legends
- Provide text alternatives for visual route information
- Ensure sufficient color contrast for colorblind users

## Browser Support

- Modern browsers with ES2015+ support
- React 18+
- Leaflet 1.9+

## License

MIT
