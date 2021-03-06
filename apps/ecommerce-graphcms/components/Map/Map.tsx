import L from 'leaflet';
import iconMarker2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconMarkerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import styles from './Map.module.scss';

const Map = ({
  className,
  children,
  ...rest
}: L.MapOptions & {
  className?: string;
  children?: (ReactLeaflet: {
    Marker: typeof Marker;
    Popup: typeof Popup;
    TileLayer: typeof TileLayer;
  }) => React.ReactNode;
}) => {
  let mapClassName = styles.map;

  if (className) {
    mapClassName = `${mapClassName} ${className}`;
  }

  useEffect(() => {
    delete L.Icon.Default.prototype['_getIconUrl'];

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconMarker2x.src,
      iconUrl: iconMarker.src,
      shadowUrl: iconMarkerShadow.src,
    });
  }, []);

  return (
    <MapContainer className={mapClassName} {...rest}>
      {children ? children({ Marker, Popup, TileLayer }) : null}
    </MapContainer>
  );
};

export default Map;
