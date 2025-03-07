// app/scanner.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ScannerScreen() {
  const router = useRouter();
  
  // This would normally use the device camera with expo-barcode-scanner
  // For now, we'll just display a placeholder
  
  const handleScan = () => {
    Alert.alert(
      "Scan Feature",
      "In a production app, this would activate the camera to scan a QR code or barcode. After scanning, you would be directed to the asset details.",
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Asset</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.scanContainer}>
        <View style={styles.scanFrame}>
          <Ionicons name="scan-outline" size={100} color="#4A90E2" />
          <Text style={styles.scanText}>Position the QR code within the frame to scan</Text>
        </View>
        
        <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
          <Text style={styles.scanButtonText}>Tap to Scan</Text>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Instructions:</Text>
          <Text style={styles.infoText}>1. Position the device camera so the QR code is visible within the frame</Text>
          <Text style={styles.infoText}>2. Hold steady until the code is recognized</Text>
          <Text style={styles.infoText}>3. After scanning, you'll be able to view and update asset information</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scanContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: '100%',
    height: 300,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  scanText: {
    marginTop: 20,
    color: '#666',
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
});