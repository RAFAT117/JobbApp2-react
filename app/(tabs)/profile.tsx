import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Settings, FileText, Briefcase, Award, ChevronRight, Upload, CheckCircle, XCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserDocuments {
  cv?: {
    uri: string;
    name: string;
  };
  personalLetter?: {
    uri: string;
    name: string;
  };
}

export default function ProfileScreen() {
  const [documents, setDocuments] = useState<UserDocuments>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const storedDocuments = await AsyncStorage.getItem('userDocuments');
        if (storedDocuments) {
          setDocuments(JSON.parse(storedDocuments));
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    };
    loadDocuments();
  }, []);

  const pickDocument = async (type: 'cv' | 'personalLetter') => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newDocuments = { 
          ...documents, 
          [type]: { 
            uri: asset.uri, 
            name: asset.name || 'Document' 
          } 
        };
        setDocuments(newDocuments);
        await AsyncStorage.setItem('userDocuments', JSON.stringify(newDocuments));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Fel', 'Kunde inte ladda upp dokumentet. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeDocument = async (type: 'cv' | 'personalLetter') => {
    try {
      setIsLoading(true);
      const newDocuments = { ...documents };
      delete newDocuments[type];
      setDocuments(newDocuments);
      await AsyncStorage.setItem('userDocuments', JSON.stringify(newDocuments));
    } catch (error) {
      console.error('Error removing document:', error);
      Alert.alert('Fel', 'Kunde inte ta bort dokumentet. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mina Dokument</Text>
        <Text style={styles.subtitle}>Ladda upp ditt CV och personligt brev</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <FileText size={24} color="#0B4F6C" />
            <Text style={styles.documentTitle}>CV</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator color="#0B4F6C" />
          ) : documents.cv ? (
            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{documents.cv.name}</Text>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeDocument('cv')}>
                <XCircle size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => pickDocument('cv')}>
              <Upload size={20} color="#0B4F6C" />
              <Text style={styles.uploadButtonText}>Ladda upp CV</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <FileText size={24} color="#0B4F6C" />
            <Text style={styles.documentTitle}>Personligt Brev</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator color="#0B4F6C" />
          ) : documents.personalLetter ? (
            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{documents.personalLetter.name}</Text>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeDocument('personalLetter')}>
                <XCircle size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => pickDocument('personalLetter')}>
              <Upload size={20} color="#0B4F6C" />
              <Text style={styles.uploadButtonText}>Ladda upp Personligt Brev</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    marginBottom: 8,
    color: '#0B4F6C',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    padding: 20,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  documentTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#0B4F6C',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0B4F6C',
  },
});