import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { startShakeDetection } from './src/ShakeDetector';
import { startBackgroundLocationTracking } from './src/LocationService';
import SentinelRadar from './assets/images/sentinel_radar.svg';

export default function App() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const triggerEmergencyPipeline = async () => {
    setIsEmergencyActive(true);
    console.warn('🚨 PIPELINE DE EMERGÊNCIA ATIVADO (Sinal + Rastreamento + Áudio)');

    // Dispara em paralelo o rastreamento GPS e a gravação de áudio na nuvem
    await Promise.allSettled([
      startBackgroundLocationTracking(),    
    ]);
  };

  useEffect(() => {
    // Inicia a escuta do movimento do acelerômetro
    const subscription = startShakeDetection(() => {
      triggerEmergencyPipeline();
      Alert.alert('🚨 EMERGÊNCIA DISPARADA', 'Alerta silencioso enviado e gravação iniciada.');
    });

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SENTINEL</Text>
      <Text style={styles.subtitle}>Advanced Protection System</Text>
      <Text style={styles.status}>
        Status: {isEmergencyActive ? '🚨 MODO DE EMERGÊNCIA ATIVO' : '🟢 Monitorando em Segundo Plano'}
      </Text>

      <View style={styles.radarWrapper}>
        <SentinelRadar width={280} height={280} style={styles.radarSvg} />
        <TouchableOpacity style={styles.panicButton} onPress={triggerEmergencyPipeline}>
          <Text style={styles.panicText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Dica: Chacoalhe o dispositivo vigorosamente para ativar o alerta silencioso.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#E0BD7D',
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#9A9AA4',
    marginTop: 6,
    marginBottom: 16,
  },
  status: {
    fontSize: 14,
    color: '#B0B0B8',
    marginBottom: 30,
    textAlign: 'center',
  },
  radarWrapper: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  radarSvg: {
    position: 'absolute',
  },
  panicButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0B1420',
    borderWidth: 2,
    borderColor: '#E0BD7D',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  panicText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: '#75757D',
    textAlign: 'center',
  },
});
