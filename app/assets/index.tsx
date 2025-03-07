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
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import assetService, { Asset, AssetPagination } from '@/api/assetService';

export default function AssetsScreen() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      let response: AssetPagination;
      
      if (search) {
        response = await assetService.searchAssets(search);
      } else {
        response = await assetService.getAssets({ page });
      }
      
      setAssets(response.data);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSearch = () => {
    fetchAssets(1, searchQuery);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssets(1, searchQuery);
  };

  const loadMoreAssets = () => {
    if (currentPage < totalPages && !loading) {
      fetchAssets(currentPage + 1, searchQuery);
    }
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
            <Text style={styles.assetDepartment}>
              {item.department ? item.department.name : 'No Department'}
            </Text>
            {renderConditionBadge(item.current_condition)}
          </View>
        </View>
        <View style={styles.assetActions}>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4A90E2" />
        <Text style={styles.footerText}>Loading more assets...</Text>
      </View>
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
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchAssets(1, searchQuery)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {loading && assets.length === 0 ? (
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
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={loadMoreAssets}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="albums-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>No assets found</Text>
              {searchQuery ? (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={() => {
                    setSearchQuery('');
                    fetchAssets();
                  }}
                >
                  <Text style={styles.clearSearchText}>Clear search</Text>
                </TouchableOpacity>
              ) : null}
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
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
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
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
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
  clearSearchButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontWeight: '500',
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