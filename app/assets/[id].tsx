// app/assets/[id].tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface Asset {
  id: number;
  asset_code: string;
  name: string;
  description: string;
  department_name: string;
  purchase_date: string;
  purchase_cost: number;
  expected_lifetime_months: number;
  current_condition: 'good' | 'fair' | 'poor' | 'damaged';
}

export default function AssetDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the asset by ID from your API
    setTimeout(() => {
      setAsset({
        id: parseInt(id as string),
        asset_code: `ASSET-${id.toString().padStart(3, '0')}`,
        name: 'Dell XPS Laptop',
        description: 'High-performance laptop for developers with 16GB RAM and 512GB SSD',
        department_name: 'IT',
        purchase_date: '2024-01-15',
        purchase_cost: 1299.99,
        expected_lifetime_months: 36,
        current_condition: 'good',
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const getConditionColor = (condition: string) => {
    switch(condition) {
      case 'good': return '#4CAF50'; // Green
      case 'fair': return '#FFC107'; // Yellow
      case 'poor': return '#FF9800'; // Orange
      case 'damaged': return '#F44336'; // Red
      default: return '#9E9E9E'; // Grey
    }
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
        <Text style={styles.headerTitle}>Asset Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/assets/edit/${id}`)}
        >
          <Ionicons name="create-outline" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading asset details...</Text>
        </View>
      ) : asset ? (
        <ScrollView style={styles.content}>
          <View style={styles.assetHeader}>
            <Text style={styles.assetName}>{asset.name}</Text>
            <View style={styles.assetCodeContainer}>
              <Text style={styles.assetCodeLabel}>Asset Code:</Text>
              <Text style={styles.assetCode}>{asset.asset_code}</Text>
            </View>
          </View>
          
          <View style={styles.imageSection}>
            <View style={styles.assetImage}>
              <Ionicons name="laptop-outline" size={100} color="#999" />
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          </View>
          
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Asset Information</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Department:</Text>
              <Text style={styles.detailValue}>{asset.department_name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition:</Text>
              <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(asset.current_condition) }]}>
                <Text style={styles.conditionText}>
                  {asset.current_condition.charAt(0).toUpperCase() + asset.current_condition.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Purchase Date:</Text>
              <Text style={styles.detailValue}>{asset.purchase_date}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Purchase Cost:</Text>
              <Text style={styles.detailValue}>${asset.purchase_cost.toFixed(2)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expected Lifetime:</Text>
              <Text style={styles.detailValue}>{asset.expected_lifetime_months} months</Text>
            </View>
          </View>
          
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{asset.description}</Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={() => router.push(`/assets/scan/${id}`)}
            >
              <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Scan Asset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => router.push(`/assets/history/${id}`)}
            >
              <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>View History</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>Asset not found</Text>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => router.push('/assets')}
          >
            <Text style={styles.backToListText}>Back to Asset List</Text>
          </TouchableOpacity>
        </View>
      )}
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
  editButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  assetHeader: {
    marginBottom: 16,
  },
  assetName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  assetCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetCodeLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  assetCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A90E2',
  },
  imageSection: {
    marginBottom: 16,
  },
  assetImage: {
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noImageText: {
    marginTop: 8,
    color: '#999',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  conditionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  scanButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  historyButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#5C6BC0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginVertical: 16,
  },
  backToListButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backToListText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});