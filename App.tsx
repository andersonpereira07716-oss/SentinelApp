import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { startShakeDetection } from './src/ShakeDetector';
import { startBackgroundLocationTracking } from './src/LocationService';
import { startStealthAudioRecording } from './src/AudioRecorder';

export default function App() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const triggerEmergencyPipeline = async () => {
    setIsEmergencyActive(true);
    console.warn('🚨 PIPELINE DE EMERGÊNCIA ATIVADO (Sinal + Rastreamento + Áudio)');
    
    // Dispara em paralelo o rastreamento GPS e a gravação de áudio na nuvem
    await Promise.allSettled([
      startBackgroundLocationTracking(),
      startStealthAudioRecording()
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
      <Text style={styles.title}>SENTINEL SAFETY</Text>
      <Text style={styles.status}>
        Status: {isEmergencyActive ? '🚨 MODO DE EMERGÊNCIA ATIVO' : '🟢 Monitorando em Segundo Plano'}
      </Text>

      <TouchableOpacity style={styles.panicButton} onPress={triggerEmergencyPipeline}>
        <Text style={styles.panicText}>SOS</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Dica: Chacoalhe o dispositivo vigorosamente para ativar o alerta silencioso.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F12',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 40,
    textAlign: 'center',
  },
  panicButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF1744',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  panicText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  hint: {
    marginTop: 40,
    fontSize: 12,
    color: '#636366',
    textAlign: 'center',
  },
});
