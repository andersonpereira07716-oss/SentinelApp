import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import SentinelRadar from './assets/images/sentinel_radar.svg';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SENTINEL</Text>
        <Text style={styles.subtitle}>Advanced Protection</Text>
        <Text style={styles.status}>Status: 🚨 MODO DE EMERGÊNCIA</Text>
      </View>

      <View style={styles.radarContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.button}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.tipText}>
          Dica: Chacoalhe o dispositivo vigorosamente para ativar o alerta silencioso.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 4,
    marginBottom: 16,
  },
  status: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  button: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tipText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
  },
});
