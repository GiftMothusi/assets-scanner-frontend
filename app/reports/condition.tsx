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

export default function ConditionReportScreen() {
  const router = useRouter();
  const conditions = ['good', 'fair', 'poor', 'damaged'];
  const conditionColors = {
    'good': '#4CAF50',
    'fair': '#FFC107',
    'poor': '#FF9800',
    'damaged': '#F44336'
  };

  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssetsByCondition = async (condition: string) => {
    try {
      setLoading(true);
      const response = await assetService.getAssetsByCondition(condition);
      setAssets(response.data);
      setSelectedCondition(condition);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const renderConditionButton = (condition: string) => (
    <TouchableOpacity
      style={[
        styles.conditionButton, 
        { 
          backgroundColor: conditionColors[condition as keyof typeof conditionColors],
          opacity: selectedCondition === condition ? 1 : 0.6
        }
      ]}
      onPress={() => fetchAssetsByCondition(condition)}
    >
      <Text style={styles.conditionButtonText}>
        {condition.charAt(0).toUpperCase() + condition.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <TouchableOpacity 
      style={styles.assetCard}
      onPress={() => router.push(`/assets/${item.id}`)}
    >
      <View style={styles.assetDetails}>
        <Text style={styles.assetName}>{item.name}</Text>
        <Text style={styles.assetCode}>{item.asset_code}</Text>
        <Text style={styles.assetDepartment}>
          {item.department?.name || 'No Department'}
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
        <Text style={styles.headerTitle}>Assets by Condition</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.conditionButtonContainer}>
        {conditions.map(condition => (
          <React.Fragment key={condition}>
            {renderConditionButton(condition)}
          </React.Fragment>
        ))}
      </View>
      
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : selectedCondition ? (
        <FlatList
          data={assets}
          renderItem={renderAssetItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.centerContent}>
              <Text>No assets found for this condition</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.centerContent}>
          <Text>Select a condition to view assets</Text>
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
    placeholder: {
      width: 40,
    },
    conditionButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    conditionButton: {
      padding: 10,
      borderRadius: 8,
      width: '22%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    conditionButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
      textTransform: 'capitalize',
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
    assetDepartment: {
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
    selectionPromptContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectionPromptText: {
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