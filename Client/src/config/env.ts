import { Platform } from 'react-native';

// ============================================================
// 🔧 CHANGE THESE TWO VALUES ONLY — everything else is auto-generated
// ============================================================

/** Your machine's Wi-Fi / LAN IP (run `ipconfig` to find it) */
export const API_HOST_IP = '10.150.250.203';

/** Backend server port (must match Server/.env PORT) */
export const API_PORT = 5000;

// ============================================================
// ⚙️ Auto-generated from the above — DO NOT edit below
// ============================================================

/** Base API URL using your Wi-Fi IP */
export const API_BASE_URL = `http://${API_HOST_IP}:${API_PORT}/api`;

/** Connection timeout per endpoint attempt (ms) */
export const API_TIMEOUT_MS = 4000;

/**
 * Ordered list of base URLs the client tries to connect to.
 * Built dynamically from API_HOST_IP and API_PORT above.
 *
 * Physical device → Wi-Fi IP | Android Emulator → 10.0.2.2 | iOS Simulator → localhost
 */
export const API_ENDPOINTS: string[] = Platform.select({
  android: [
    `http://${API_HOST_IP}:${API_PORT}/api`,
    `http://10.0.2.2:${API_PORT}/api`,
    `http://localhost:${API_PORT}/api`,
  ],
  ios: [
    `http://${API_HOST_IP}:${API_PORT}/api`,
    `http://localhost:${API_PORT}/api`,
  ],
  default: [
    `http://${API_HOST_IP}:${API_PORT}/api`,
    `http://localhost:${API_PORT}/api`,
  ],
}) as string[];
