import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

export const GEOFENCE_TASK_NAME = 'SENTINEL_GEOFENCE_TASK';

TaskManager.defineTask(GEOFENCE_TASK_NAME, ({ data: { eventType, region }, error }) => {
  if (error) {
    console.error('Erro no Geofencing:', error.message);
    return;
  }

  if (eventType === Location.GeofencingEventType.Enter) {
    console.log(`[SENTINEL] Entrou na Zona Segura: ${region.identifier}`);
  } else if (eventType === Location.GeofencingEventType.Exit) {
    console.warn(`[SENTINEL] SAINDO DA ZONA SEGURA: ${region.identifier}`);
  }
});

export async function startGeofencing(safeZones) {
  const hasStarted = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK_NAME);
  if (hasStarted) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
  }

  await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, safeZones);
  console.log('Monitoramento de zonas seguras ativado!');
}
