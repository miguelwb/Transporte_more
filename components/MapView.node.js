import React from 'react';
import { View } from 'react-native';

export default function MapView({ style }) {
  // SSR/Node: render placeholder to avoid window/document usage
  return <View style={style} />;
}

export const Marker = ({ children }) => null;
Marker.displayName = 'WebMarker';
export const Callout = ({ children }) => null;