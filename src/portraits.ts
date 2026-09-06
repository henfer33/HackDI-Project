import { ImageSourcePropType } from 'react-native';

/**
 * Portraits bundled into the app so faces still render with no network.
 * A profile stores a key ("m1"), not a path, which keeps the data layer a plain
 * string and lets a real URL work too once profiles carry uploaded photos.
 */
const BUNDLED: Record<string, ImageSourcePropType> = {
  m1: require('../assets/portraits/m1.jpg'),
  m2: require('../assets/portraits/m2.jpg'),
  m3: require('../assets/portraits/m3.jpg'),
  m4: require('../assets/portraits/m4.jpg'),
  m5: require('../assets/portraits/m5.jpg'),
  m6: require('../assets/portraits/m6.jpg'),
};

export function portrait(photo?: string): ImageSourcePropType | null {
  if (!photo) return null;
  if (photo.startsWith('http')) return { uri: photo };
  return BUNDLED[photo] ?? null;
}
