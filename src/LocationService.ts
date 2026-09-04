import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

async function dispatchToLocalPoliceAPI(latitude: number, longitude: number, accuracy: number | null) {
  try {
    const response = await fetch('http://192.168.0.9:3000/api/alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
        userId: 'Anderson',
        accuracy,
      }),
    });
    const data = await response.json();
    console.log('[SENTINEL] Resposta da API:', data);
  } catch (error) {
    console.error('[SENTINEL] Erro na requisição:', error);
  }
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('[BACKGROUND TASK] Erro na task:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const currentLocation = locations[0];

    if (currentLocation) {
      const { latitude, longitude, accuracy } = currentLocation.coords;
      await dispatchToLocalPoliceAPI(latitude, longitude, accuracy);
    }
  }
});

export async function startBackgroundLocationTracking() {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    throw new Error('Permissão de localização em primeiro plano negada');
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    console.warn('Permissão de localização em segundo plano não concedida');
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 10,
    foregroundService: {
      notificationTitle: 'SentinelApp Ativo',
      notificationBody: 'Monitorando sua localização em segundo plano para emergências.',
    },
  });
}
