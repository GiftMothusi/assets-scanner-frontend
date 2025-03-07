// app/assets/scan/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Camera, CameraType, BarcodeScanningResult } from 'expo-camera';
import apiClient, { checkAuthStatus } from '@/api/apiClient';
import * as SecureStore from 'expo-secure-store';

// Condition options for the update
const CONDITIONS = ['good', 'fair', 'poor', 'damaged'];

export default function ScannerScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  
  // Scanner states
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Asset update states
  const [assetCode, setAssetCode] = useState('');
  const [assetFound, setAssetFound] = useState(false);
  const [assetDetails, setAssetDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Condition update modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      try {
        console.log("Requesting camera permissions...");
        const { status } = await Camera.requestCameraPermissionsAsync();
        console.log("Camera permission status:", status);
        setHasPermission(status === 'granted');
        
        if (status !== 'granted') {
          setCameraError('Camera permission was denied');
        } else {
          setCameraError(null);
        }
      } catch (error) {
        console.error("Error requesting camera permission:", error);
        setCameraError('Failed to request camera permission');
      }
    })();
  }, []);
  
  // Check authentication status
  useEffect(() => {
    const verifyAuth = async () => {
      setAuthChecking(true);
      try {
        const isAuthed = await checkAuthStatus();
        console.log('Authentication status:', isAuthed);
        setIsAuthenticated(isAuthed);
        
        if (!isAuthed) {
          // For testing purposes, we'll set a mock token
          // In a real app, you would redirect to login
          console.log('Setting test token for development');
          await SecureStore.setItemAsync('auth_token', 'test_token_for_development_1234567890');
          
          // Check again with the test token
          const rechecked = await checkAuthStatus();
          setIsAuthenticated(rechecked);
          console.log('Authentication status after setting test token:', rechecked);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    };
    
    verifyAuth();
  }, []);

  const simulateScan = (mockAssetCode: string = "ASSET-444701") => {
    console.log("Simulating scan with code:", mockAssetCode);
    
    // Simulate the same behavior as if the barcode was scanned
    setScanned(true);
    setScanning(false);
    
    // Create a mock scan result similar to what the barcode scanner would produce
    const mockScanResult: BarcodeScanningResult = {
      type: 'qr',
      data: mockAssetCode,
      cornerPoints: [],
      bounds: { 
        origin: { x: 0, y: 0 }, 
        size: { width: 0, height: 0 } 
      }
    };
    
    // Process the mock scan result
    handleBarCodeScanned(mockScanResult);
  };

  // Modify your existing handleScanButtonPress function
const handleScanButtonPress = () => {
    console.log("Scan button pressed, current scanning state:", scanning);
    
    // Check if running on iOS simulator
    if (Platform.OS === 'ios' && Platform.isTV === false && !('nativeEvent' in Camera)) {
      Alert.alert(
        "Simulator Detected",
        "Camera doesn't work in iOS simulator. Would you like to enter a code manually or simulate a scan?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Manual Entry", onPress: () => handleManualEntry() },
          { text: "Simulate Scan", onPress: () => simulateScan("ASSET-444701") }
        ]
      );
      return;
    }
    
    // Existing code for web platform
    if (Platform.OS === 'web') {
      Alert.alert(
        "Simulated Scan",
        "Enter an asset code to simulate scanning",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Enter Code", onPress: () => handleManualEntry() },
          { text: "Simulate Scan", onPress: () => simulateScan() }
        ]
      );
      return;
    }
    
    // Check for camera permissions (your existing code)
    if (hasPermission !== true) {
      Alert.alert(
        "Camera Permission Required",
        "Please grant camera permission to scan asset codes.",
        [
          {
            text: "OK",
            onPress: async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            }
          }
        ]
      );
      return;
    }
    
    if (!scanning) {
      setScanned(false);
      setAssetFound(false);
      setAssetDetails(null);
      setAssetCode('');
    }
    
    setScanning(!scanning);
    console.log("Scanning state updated to:", !scanning);
  };
  

// Update your handleBarCodeScanned function
const handleBarCodeScanned = async (scanResult: BarcodeScanningResult) => {
    if (scanned) return;
    
    console.log("Barcode scanned:", scanResult.data);
    setScanned(true);
    setScanning(false);
    setLoading(true);
    
    // Get just the asset code from the scanned data
    const scannedAssetCode = scanResult.data.trim();
    
    // Save the scanned asset code
    setAssetCode(scannedAssetCode);
    
    try {
      // For testing purposes, bypass the API call and use simulated data when asset code is ASSET-444701
      if (scannedAssetCode === "ASSET-444701") {
        console.log("Using simulated asset data for testing");
        setAssetFound(true);
        setAssetDetails({
          id: 1,
          name: "Test Laptop",
          asset_code: scannedAssetCode,
          current_condition: "good",
          description: "Dell XPS 13 for development team"
        });
        setModalVisible(true);
        setLoading(false);
        return;
      }
      
      // Normal API call for real usage
      console.log("Fetching asset with code:", scannedAssetCode);
      const response = await apiClient.get(`/assets/scan/${scannedAssetCode}`);
      
      if (response.data) {
        console.log("Asset found:", response.data);
        setAssetFound(true);
        setAssetDetails(response.data);
        
        // Show condition update modal
        setModalVisible(true);
      }
    } catch (error: any) {
      console.error('Error fetching asset:', error);
      
      // Handle asset not found
      if (error.response && error.response.status === 404) {
        Alert.alert(
          "Asset Not Found",
          `No asset found with code ${scannedAssetCode}`,
          [{ text: "OK", onPress: () => setScanned(false) }]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to check asset. Please try again.",
          [{ text: "OK", onPress: () => setScanned(false) }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle manual entry of asset code
  const handleManualEntry = () => {
    Alert.prompt(
      "Enter Asset Code",
      "Please enter the asset code manually",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Submit",
          onPress: (code: string | undefined) => {
            if (code && code.trim()) {
              console.log("Manual code entered:", code.trim());
              setScanned(true);
              setScanning(false);
              
              // Simulate a barcode scan with manual entry
              handleBarCodeScanned({ 
                type: 'manual', 
                data: code.trim(),
                cornerPoints: [],
                bounds: { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } }
              });
            }
          }
        }
      ],
      "plain-text"
    );
  };

  // Submit updated condition
  const handleSubmitCondition = async () => {
    if (!assetCode || !selectedCondition) {
      Alert.alert("Error", "Please select a condition");
      return;
    }
    
    // Check authentication before proceeding
    if (!isAuthenticated && !authChecking) {
      try {
        const isAuthed = await checkAuthStatus();
        if (!isAuthed) {
          Alert.alert(
            "Authentication Required",
            "You need to be logged in to update asset conditions.",
            [
              { 
                text: "OK", 
                onPress: () => {
                  // In a real app, you would redirect to login
                  // For testing, we'll try to set a test token
                  SecureStore.setItemAsync('auth_token', 'test_token_for_development_1234567890')
                    .then(() => {
                      Alert.alert("Test Token Set", "Try again with the test token");
                    });
                }
              }
            ]
          );
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        Alert.alert("Error", "Failed to verify authentication status");
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      // Log the request details for debugging
      console.log("Updating asset condition:", {
        assetCode,
        condition: selectedCondition,
        notes
      });
      
      // For testing with our simulated asset
      if (assetCode === "ASSET-444701" && !isAuthenticated) {
        // Simulate a successful API response for testing
        setTimeout(() => {
          setModalVisible(false);
          Alert.alert(
            "Success",
            "Asset condition updated successfully (Simulated)",
            [
              {
                text: "Scan Another",
                onPress: () => {
                  setScanned(false);
                  setAssetFound(false);
                  setAssetDetails(null);
                  setNotes('');
                }
              }
            ]
          );
          setSubmitting(false);
        }, 1000);
        return;
      }
      
      // Verify token before making the request
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create the request payload exactly matching the backend validation requirements
      const payload = {
        condition: selectedCondition,
        notes: notes
      };
      
      console.log(`Sending request to /assets/scan/${assetCode} with payload:`, payload);
      console.log('Using authorization token:', token.substring(0, 10) + '...');
      
      // Make the API call with the correct payload structure and explicit auth header
      const response = await apiClient.post(
        `/assets/scan/${assetCode}`, 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Update condition response:', response.data);
      
      // Close modal and show success
      setModalVisible(false);
      
      Alert.alert(
        "Success",
        "Asset condition updated successfully",
        [
          {
            text: "Scan Another",
            onPress: () => {
              setScanned(false);
              setAssetFound(false);
              setAssetDetails(null);
              setNotes('');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error updating asset condition:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        Alert.alert(
          "Authentication Error",
          "Your session has expired. Please log in again.",
          [
            { 
              text: "OK", 
              onPress: async () => {
                // Clear the invalid token
                await SecureStore.deleteItemAsync('auth_token');
                setIsAuthenticated(false);
                
                // For testing, set a new test token
                await SecureStore.setItemAsync('auth_token', 'new_test_token_for_development_' + Date.now());
                Alert.alert("New Test Token Set", "Try again with the new test token");
              }
            }
          ]
        );
        return;
      }
      
      // Provide more detailed error information for other errors
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update asset condition';
                          
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      });
      
      Alert.alert(
        "Error",
        `${errorMessage}. Please try again.`,
        [{ text: "OK" }]
      );
    } finally {
      setSubmitting(false);
    }
  };
  // Handle camera errors
  const handleCameraError = (error: any) => {
    console.error("Camera error:", error);
    setCameraError(`Camera error: ${error.message || 'Unknown error'}`);
    setScanning(false);
  };

  // Render camera permission handling
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons size={64} color="#F44336" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan asset codes. Please grant permission in your device settings.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
          >
            <Text style={styles.permissionButtonText}>Request Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        {scanning ? (
          <View style={styles.scanFrame}>
            {cameraError ? (
              <View style={styles.cameraErrorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
                <Text style={styles.cameraErrorText}>Camera unavailable</Text>
                <Text style={styles.cameraErrorSubtext}>{cameraError}</Text>
                <TouchableOpacity 
                  style={styles.manualEntryButton}
                  onPress={handleManualEntry}
                >
                  <Text style={styles.manualEntryText}>Enter Code Manually</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Camera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFillObject}
                  type={CameraType.back}
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barCodeScannerSettings={{
                    barCodeTypes: ['qr', 'code128', 'code39', 'code93', 'codabar', 'ean13', 'ean8'],
                  }}
                  onError={handleCameraError}
                />
                <View style={styles.scanOverlay}>
                  <View style={styles.scanCorners}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                  </View>
                  {scanned && (
                    <View style={styles.scanAgainContainer}>
                      <TouchableOpacity
                        style={styles.scanAgainButton}
                        onPress={() => setScanned(false)}
                      >
                        <Text style={styles.scanAgainText}>Scan Again</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.scanFrame}>
            <Ionicons name="scan-outline" size={100} color="#4A90E2" />
            <Text style={styles.scanText}>Position the QR code within the frame to scan</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={scanning ? styles.stopScanButton : styles.scanButton} 
          onPress={handleScanButtonPress}
        >
          <Text style={styles.scanButtonText}>
            {scanning ? 'Stop Scanning' : 'Tap to Scan'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.manualEntryButton}
          onPress={handleManualEntry}
        >
          <Text style={styles.manualEntryText}>Enter Asset Code Manually</Text>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Instructions:</Text>
          <Text style={styles.infoText}>1. Position the device camera so the QR code is visible within the frame</Text>
          <Text style={styles.infoText}>2. Hold steady until the code is recognized</Text>
          <Text style={styles.infoText}>3. After scanning, you'll be able to update the asset's condition</Text>
        </View>
      </View>
      
      {/* Condition Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Asset Condition</Text>
            
            {assetDetails && (
              <View style={styles.assetInfo}>
                <Text style={styles.assetName}>{assetDetails.name}</Text>
                <Text style={styles.assetCode}>{assetDetails.asset_code}</Text>
                <Text style={styles.currentCondition}>
                  Current condition: <Text style={styles.conditionText}>{assetDetails.current_condition}</Text>
                </Text>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>Select New Condition:</Text>
            <View style={styles.conditionOptions}>
              {CONDITIONS.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.conditionOption,
                    selectedCondition === condition && styles.selectedCondition,
                    { backgroundColor: getConditionColor(condition, 0.2) }
                  ]}
                  onPress={() => setSelectedCondition(condition)}
                >
                  <View 
                    style={[
                      styles.conditionDot, 
                      { backgroundColor: getConditionColor(condition) }
                    ]} 
                  />
                  <Text style={styles.conditionOptionText}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Notes (Optional):</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter notes about the asset condition..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitCondition}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Update Condition</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingOverlayText}>Checking asset...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Helper function to get condition color
const getConditionColor = (condition: string, opacity: number = 1) => {
  let color;
  switch(condition) {
    case 'good': color = `rgba(76, 175, 80, ${opacity})`; break; // Green
    case 'fair': color = `rgba(255, 193, 7, ${opacity})`; break; // Yellow
    case 'poor': color = `rgba(255, 152, 0, ${opacity})`; break; // Orange
    case 'damaged': color = `rgba(244, 67, 54, ${opacity})`; break; // Red
    default: color = `rgba(158, 158, 158, ${opacity})`; break; // Grey
  }
  return color;
};

const styles = StyleSheet.create({
  // Existing styles
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  placeholder: { width: 40 },
  scanContainer: { flex: 1, padding: 20, alignItems: 'center' },
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
    overflow: 'hidden',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCorners: { width: 200, height: 200, position: 'relative' },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 10,
  },
  
  // Adding new styles for camera error
  cameraErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraErrorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 10,
  },
  cameraErrorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  
  // Remaining styles
  scanAgainContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  scanAgainButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanAgainText: { color: '#4A90E2', fontWeight: 'bold' },
  scanText: { marginTop: 20, color: '#666', textAlign: 'center' },
  scanButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  stopScanButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  scanButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  manualEntryButton: { paddingVertical: 10, marginBottom: 20 },
  manualEntryText: { color: '#4A90E2', fontSize: 14, fontWeight: '500' },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  infoTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  infoText: { color: '#666', marginBottom: 6, lineHeight: 20 },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  assetInfo: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  assetName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  assetCode: { fontSize: 14, color: '#666', marginBottom: 5 },
  currentCondition: { fontSize: 14, color: '#666' },
  conditionText: { fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 10,
  },
  conditionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  conditionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCondition: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  conditionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  conditionOptionText: { fontSize: 14, fontWeight: '500' },
  notesInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: { color: '#666', fontWeight: '600' },
  submitButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: { color: '#fff', fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 16, color: '#666' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '600' },
});