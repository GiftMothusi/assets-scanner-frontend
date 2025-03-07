// app/reports.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Mock report types
const reportTypes = [
  {
    id: '1',
    title: 'Assets by Department',
    description: 'Shows a breakdown of assets across different departments',
    icon: 'business-outline',
  },
  {
    id: '2',
    title: 'Assets by Condition',
    description: 'Summarizes assets grouped by their current condition',
    icon: 'stats-chart-outline',
  },
  {
    id: '3',
    title: 'Recently Scanned Assets',
    description: 'Lists assets that have been scanned in the past 30 days',
    icon: 'scan-outline',
  },
  {
    id: '4',
    title: 'Assets Nearing End of Life',
    description: 'Shows assets approaching their expected lifetime',
    icon: 'timer-outline',
  },
  {
    id: '5',
    title: 'Assets Requiring Attention',
    description: 'Lists assets marked as damaged or in poor condition',
    icon: 'warning-outline',
  },
];

export default function ReportsScreen() {
  const router = useRouter();

  const handleReportSelect = (reportId: string) => {
    // In a real app, you would navigate to the specific report
    Alert.alert(
      "Generate Report",
      "This would generate and display the selected report. In a full implementation, you would be able to view, export or share this report.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  const renderReportItem = ({ item }: { item: typeof reportTypes[0] }) => (
    <TouchableOpacity 
      style={styles.reportCard}
      onPress={() => handleReportSelect(item.id)}
    >
      <View style={styles.reportIconContainer}>
        <Ionicons name={item.icon as any} size={24} color="#4A90E2" />
      </View>
      <View style={styles.reportContent}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
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
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Asset Reports</Text>
        <Text style={styles.infoText}>
          Select a report type below to generate and view detailed information about your assets.
        </Text>
      </View>
      
      <FlatList
        data={reportTypes}
        renderItem={renderReportItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.reportsList}
      />
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
  infoCard: {
    margin: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    color: '#666',
    lineHeight: 20,
  },
  reportsList: {
    padding: 16,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
  },
});