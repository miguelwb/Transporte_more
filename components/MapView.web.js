import React from 'react';
import { View, Text } from 'react-native';

export default function MapView({ style, initialRegion }) {
  const lat = initialRegion?.latitude ?? 0;
  const lng = initialRegion?.longitude ?? 0;
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=${initialRegion?.latitudeDelta ? Math.max(1, Math.round(14 / initialRegion.latitudeDelta)) : 14}&output=embed`;

  return (
    <View style={style}>
      <iframe
        title="Mapa"
        src={src}
        style={{ border: 0, width: '100%', height: '100%' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </View>
  );
}

export const Marker = ({ children }) => null;
export const Callout = ({ children }) => null;