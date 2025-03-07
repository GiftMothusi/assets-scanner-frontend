// index.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import assetService, { AssetCounts, ConditionCounts } from '@/api/assetService';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [totalAssets, setTotalAssets] = useState<number | null>(null);
  const [departmentCounts, setDepartmentCounts] = useState<AssetCounts[]>([]);
  const [conditionCounts, setConditionCounts] = useState<ConditionCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [total, deptCounts, condCounts] = await Promise.all([
          assetService.getTotalAssetCount(),
          assetService.getAssetCountsByDepartment(),
          assetService.getAssetCountsByCondition(),
        ]);
        
        setTotalAssets(total);
        setDepartmentCounts(deptCounts);
        setConditionCounts(condCounts);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to get condition color
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
        <Text style={styles.greeting}>Welcome, {user?.name}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
          <Ionicons name="log-out-outline" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.sectionTitle}>User Information</Text>
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Name:</Text>
              <Text style={styles.userInfoValue}>{user?.name}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Email:</Text>
              <Text style={styles.userInfoValue}>{user?.email}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Role:</Text>
              <Text style={styles.userInfoValue}>{user?.role}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Department ID:</Text>
              <Text style={styles.userInfoValue}>{user?.department_id || 'Not assigned'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Asset Statistics</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <View style={styles.totalAssetCard}>
                <Text style={styles.totalAssetLabel}>Total Assets</Text>
                <Text style={styles.totalAssetValue}>{totalAssets}</Text>
              </View>
              
              {departmentCounts.length > 0 && (
                <View style={styles.statsCard}>
                  <Text style={styles.statsCardTitle}>Assets by Department</Text>
                  {departmentCounts.map((dept, index) => (
                    <View key={index} style={styles.statRow}>
                      <Text style={styles.statLabel}>{dept.department_name}</Text>
                      <Text style={styles.statValue}>{dept.total}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {conditionCounts.length > 0 && (
                <View style={styles.statsCard}>
                  <Text style={styles.statsCardTitle}>Assets by Condition</Text>
                  {conditionCounts.map((condition, index) => (
                    <View key={index} style={styles.statRow}>
                      <View style={styles.conditionLabelContainer}>
                        <View 
                          style={[
                            styles.conditionDot, 
                            {backgroundColor: getConditionColor(condition.current_condition)}
                          ]} 
                        />
                        <Text style={styles.statLabel}>
                          {condition.current_condition.charAt(0).toUpperCase() + condition.current_condition.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.statValue}>{condition.total}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => router.push('/assets/scan')}
            >
                <Ionicons name="scan-outline" size={24} color="#4A90E2" />
                <Text style={styles.actionText}>Scan Asset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => router.push('/assets')}
            >
                <Ionicons name="list-outline" size={24} color="#4A90E2" />
                <Text style={styles.actionText}>View Assets</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => router.push('/assets/add')}
            >
                <Ionicons name="add-circle-outline" size={24} color="#4A90E2" />
                <Text style={styles.actionText}>Add Asset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => router.push('/reports')}
                >
                <Ionicons name="document-text-outline" size={24} color="#4A90E2" />
                <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#4A90E2',
    fontWeight: '500',
    marginRight: 5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfoContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  userInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfoLabel: {
    width: 120,
    fontWeight: '500',
    color: '#666',
  },
  userInfoValue: {
    flex: 1,
    color: '#333',
  },
  statsContainer: {
    marginBottom: 24,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginVertical: 20,
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
  },
  totalAssetCard: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  totalAssetLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  totalAssetValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    color: '#666',
  },
  statValue: {
    fontWeight: '500',
    color: '#333',
  },
  conditionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});