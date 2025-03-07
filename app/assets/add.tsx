// app/assets/add.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Mock department data
interface Department {
  id: number;
  name: string;
}

export default function AddAssetScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [expectedLifetime, setExpectedLifetime] = useState('');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('Select Department');

  useEffect(() => {
    // Fetch departments - in a real app this would be an API call
    setTimeout(() => {
      setDepartments([
        { id: 1, name: 'IT' },
        { id: 2, name: 'HR' },
        { id: 3, name: 'Finance' },
        // app/assets/add.tsx (continued)
        { id: 3, name: 'Finance' },
        { id: 4, name: 'Marketing' },
        { id: 5, name: 'Operations' }
      ]);
      setDepartmentsLoading(false);
    }, 1000);
    
    // Generate a default asset code
    setAssetCode('ASSET-' + Math.floor(Math.random() * 900 + 100)); // Random 3-digit number
  }, []);

  const selectDepartment = (department: Department) => {
    setDepartmentId(department.id);
    setSelectedDepartmentName(department.name);
    setShowDepartments(false);
  };

  const [showDepartments, setShowDepartments] = useState(false);

  const handleSubmit = () => {
    // Validate form
    if (!name) {
      Alert.alert('Error', 'Asset name is required');
      return;
    }
    
    if (!assetCode) {
      Alert.alert('Error', 'Asset code is required');
      return;
    }
    
    setLoading(true);
    
    // In a real app, you would submit to your API here
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        'Asset added successfully',
        [
          { 
            text: 'OK', 
            onPress: () => router.push('/assets')
          }
        ]
      );
    }, 1500);
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
        <Text style={styles.headerTitle}>Add New Asset</Text>
        <View style={styles.placeholder} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Asset Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter asset name"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Asset Code *</Text>
            <TextInput
              style={styles.input}
              value={assetCode}
              onChangeText={setAssetCode}
              placeholder="Enter asset code"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter asset description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Department</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowDepartments(!showDepartments)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedDepartmentName}
              </Text>
              <Ionicons 
                name={showDepartments ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
            
            {showDepartments && (
              <View style={styles.dropdownMenu}>
                {departmentsLoading ? (
                  <ActivityIndicator size="small" color="#4A90E2" style={styles.dropdownLoader} />
                ) : (
                  departments.map(department => (
                    <TouchableOpacity
                      key={department.id}
                      style={styles.dropdownItem}
                      onPress={() => selectDepartment(department)}
                    >
                      <Text style={styles.dropdownItemText}>{department.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Purchase Date</Text>
            <TextInput
              style={styles.input}
              value={purchaseDate}
              onChangeText={setPurchaseDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Purchase Cost ($)</Text>
            <TextInput
              style={styles.input}
              value={purchaseCost}
              onChangeText={setPurchaseCost}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Expected Lifetime (months)</Text>
            <TextInput
              style={styles.input}
              value={expectedLifetime}
              onChangeText={setExpectedLifetime}
              placeholder="36"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Add Asset</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
  },
  dropdownLoader: {
    padding: 12,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});