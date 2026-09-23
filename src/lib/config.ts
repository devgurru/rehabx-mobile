import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3000;

/**
 * Resolves the API base URL:
 * 1. EXPO_PUBLIC_API_URL when set;
 * 2. otherwise the host running `expo start` (works on simulators and on physical devices
 *    over the same Wi-Fi), falling back to the Android emulator's host alias.
 */
function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');

  if (Platform.OS === 'web') return `http://localhost:${API_PORT}`;

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}`;

  return Platform.OS === 'android' ? `http://10.0.2.2:${API_PORT}` : `http://localhost:${API_PORT}`;
}

export const API_URL = resolveApiUrl();
