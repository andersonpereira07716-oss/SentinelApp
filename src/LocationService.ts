import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

async function dispatchToLocalPoliceAPI(latitude: number, longitude: number, accuracy: number | null) {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/alert', {
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
    console.log('[SENTINEL] Resposta do Servidor:', data);
  } catch (error) {
    console.error('[SENTINEL] Erro ao enviar alerta para a API:', error);
  }
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('[BACKGROUND TASK] Erro na task de localização:', error);
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
