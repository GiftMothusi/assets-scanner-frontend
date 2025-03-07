// app/assets/index.tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Create a simple Asset interface for mock data
interface Asset {
  id: number;
  asset_code: string;
  name: string;
  description: string;
  department_name: string;
  current_condition: 'good' | 'fair' | 'poor' | 'damaged';
}

export default function AssetsScreen() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In a real app, you would fetch from your API
    setTimeout(() => {
      setAssets([
        {
          id: 1,
          asset_code: 'ASSET-001',
          name: 'Dell XPS Laptop',
          description: 'Developer laptop',
          department_name: 'IT',
          current_condition: 'good',
        },
        {
          id: 2,
          asset_code: 'ASSET-002',
          name: 'HP Printer',
          description: 'Office printer',
          department_name: 'HR',
          current_condition: 'fair',
        },
        {
          id: 3,
          asset_code: 'ASSET-003',
          name: 'MacBook Pro',
          description: 'Designer laptop',
          department_name: 'Marketing',
          current_condition: 'good',
        },
        {
          id: 4,
          asset_code: 'ASSET-004',
          name: 'Logitech Webcam',
          description: 'Conference room camera',
          department_name: 'Operations',
          current_condition: 'poor',
        },
        {
          id: 5,
          asset_code: 'ASSET-005',
          name: 'Projector',
          description: 'Meeting room projector',
          department_name: 'IT',
          current_condition: 'damaged',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = () => {
    // Filter assets based on search query
    console.log('Searching for:', searchQuery);
  };

  const renderConditionBadge = (condition: string) => {
    let color = '#4CAF50'; // Default green for 'good'
    
    switch(condition) {
      case 'fair':
        color = '#FFC107'; // Yellow
        break;
      case 'poor':
        color = '#FF9800'; // Orange
        break;
      case 'damaged':
        color = '#F44336'; // Red
        break;
    }
    
    return (
      <View style={[styles.conditionBadge, { backgroundColor: color }]}>
        <Text style={styles.conditionText}>
          {condition.charAt(0).toUpperCase() + condition.slice(1)}
        </Text>
      </View>
    );
  };

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <TouchableOpacity 
      style={styles.assetCard}
      onPress={() => router.push(`/assets/${item.id}`)}
    >
      <View style={styles.assetCardContent}>
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{item.name}</Text>
          <Text style={styles.assetCode}>{item.asset_code}</Text>
          <View style={styles.assetDetails}>
            <Text style={styles.assetDepartment}>{item.department_name}</Text>
            {renderConditionBadge(item.current_condition)}
          </View>
        </View>
        <View style={styles.assetActions}>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Assets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/assets/add')}
        >
          <Ionicons name="add" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search assets..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading assets...</Text>
        </View>
      ) : (
        <FlatList
          data={assets}
          renderItem={renderAssetItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.assetsList}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="albums-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>No assets found</Text>
            </View>
          )}
        />
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
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  assetsList: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  assetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assetCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  assetCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  assetDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assetDepartment: {
    fontSize: 14,
    color: '#666',
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  conditionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  assetActions: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});