import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_SAFETY_TASK';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "safety-app-id",
  firestoreDbUrl: "https://safety-app-id.firebaseio.com"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface PoliceDispatcherPayload {
  protocolVersion: string;
  sourceApp: string;
  incidentType: string;
  timestamp: string;
  victimInfo: {
    lat: number;
    lng: number;
    accuracy: number;
  };
}

async function dispatchToLocalPoliceAPI(latitude: number, longitude: number, accuracy: number) {
  const policeEndpoint = 'https://api.seguranca.gov.br/v1/emergencia/cad-dispatch';
  
  const payload: PoliceDispatcherPayload = {
    protocolVersion: '1.0',
    sourceApp: 'SentinelSafetyApp',
    incidentType: 'PANIC_BUTTON_SOS',
    timestamp: new Date().toISOString(),
    victimInfo: {
      lat: latitude,
      lng: longitude,
      accuracy: accuracy
    }
  };

  try {
    const response = await fetch(policeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer API_KEY_GOV_INTEGRATION'
      },
      body: JSON.stringify(payload)
    });
    console.log('[POLICE API] Status Dispatch:', response.status);
  } catch (error) {
    console.error('[POLICE API] Erro ao integrar com API Policial:', error);
  }
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('[BACKGROUND TASK] Erro na task de localização:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const currentLocation = locations[0];

    if (currentLocation) {
      const { latitude, longitude, accuracy } = currentLocation.coords;

      await setDoc(doc(db, "activeIncidents", "CURRENT_USER_INCIDENT_ID"), {
        currentLocation: { lat: latitude, lng: longitude },
        accuracy: accuracy,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await dispatchToLocalPoliceAPI(latitude, longitude, accuracy || 0);
    }
  }
});

export async function startBackgroundLocationTracking() {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    throw new Error('Permissão de localização em primeiro plano negada.');
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    throw new Error('Permissão de localização em segundo plano negada.');
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000,
      distanceInterval: 5,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Sentinel em Proteção Ativa",
        notificationBody: "Sua localização está sendo transmitida com segurança.",
        notificationColor: "#FF1744"
      }
    });
    console.log('[LOCATION SERVICE] Rastreamento em background iniciado.');
  }
}
