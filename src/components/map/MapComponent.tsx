import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Loading from '../common/Loading';

interface MapPoint {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description: string;
  category: string;
}

interface MapComponentProps {
  initialCenter?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  points?: MapPoint[];
  height?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const MapComponent = ({
  initialCenter = defaultCenter,
  zoom = 10,
  points = [],
  height = '500px'
}: MapComponentProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <div style={{ height, width: '100%' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        }}
      >
        {points.map((point) => (
          <Marker
            key={point.id}
            position={point.position}
            title={point.title}
            onClick={() => setSelectedPoint(point)}
          />
        ))}
        
        {selectedPoint && (
          <InfoWindow
            position={selectedPoint.position}
            onCloseClick={() => setSelectedPoint(null)}
          >
            <div className="max-w-xs">
              <h3 className="text-lg font-semibold">{selectedPoint.title}</h3>
              <p className="text-sm text-neutral-600 mb-1">{selectedPoint.category}</p>
              <p className="text-sm">{selectedPoint.description}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;