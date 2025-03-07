import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import assetService, { Asset } from '@/api/assetService';
import { formatDistance } from 'date-fns';

export default function RecentlyScannedAssetsScreen() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentlyScannedAssets();
  }, []);

  const fetchRecentlyScannedAssets = async () => {
    try {
      setLoading(true);
      const response = await assetService.getRecentlyScannedAssets();
      setAssets(response.data);
    } catch (err) {
      console.error('Error fetching recently scanned assets:', err);
      setError('Failed to load recently scanned assets');
    } finally {
      setLoading(false);
    }
  };

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <TouchableOpacity 
      style={styles.assetCard}
      onPress={() => router.push(`/assets/${item.id}`)}
    >
      <View style={styles.assetDetails}>
        <Text style={styles.assetName}>{item.name}</Text>
        <Text style={styles.assetCode}>{item.asset_code}</Text>
        <Text style={styles.assetScanDetails}>
          Scanned {formatDistance(new Date(item.last_scanned_at || ''), new Date(), { addSuffix: true })}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
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
        <Text style={styles.headerTitle}>Recently Scanned Assets</Text>
        <View style={styles.placeholder} />
      </View>
      
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchRecentlyScannedAssets}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={assets}
          renderItem={renderAssetItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.centerContent}>
              <Text>No assets scanned in the last 30 days</Text>
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
    placeholder: {
      width: 40,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: '#D32F2F',
      marginBottom: 16,
      textAlign: 'center',
    },
    retryText: {
      color: '#4A90E2',
      fontWeight: '600',
      marginTop: 10,
    },
    assetCard: {
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    assetDetails: {
      flex: 1,
      marginRight: 16,
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
      marginBottom: 4,
    },
    assetScanDetails: {
      fontSize: 12,
      color: '#999',
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyStateText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      color: '#666',
    }
  });