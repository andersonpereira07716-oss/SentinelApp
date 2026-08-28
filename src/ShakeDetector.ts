import { Accelerometer } from 'expo-sensors';
import { startBackgroundLocationTracking } from './LocationService';

const THRESHOLD = 2.5; // Limiar de aceleração (força G) para detectar sacudida vigorosa
const TIME_INTERVAL = 1000; // Intervalo mínimo de 1 segundo entre acionamentos
let lastShakeTime = 0;

export function startShakeDetection(onShakeCallback?: () => void) {
  Accelerometer.setUpdateInterval(100);

  const subscription = Accelerometer.addListener(accelerometerData => {
    const { x, y, z } = accelerometerData;

    // Cálculo do vetor de aceleração total
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    const currentTime = Date.now();

    if (acceleration > THRESHOLD && (currentTime - lastShakeTime) > TIME_INTERVAL) {
      lastShakeTime = currentTime;
      console.warn('🚨 GESTO SILENCIOSO DETECTADO: SACUDIDA DE EMERGÊNCIA!');

      // Dispara o rastreamento de localização imediatamente
      startBackgroundLocationTracking().catch(err => {
        console.error('Erro ao iniciar rastreamento via Gesto:', err);
      });

      if (onShakeCallback) {
        onShakeCallback();
      }
    }
  });

  return subscription;
}
