import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MapPin, DollarSign, Clock, Heart, ArrowLeft, Building2, Share2, ExternalLink, Sparkles } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateApplicationEmail, generateWebFormResponses, analyzeJobMatch } from '../../services/templates';
import { JobAd, UserDocuments } from '../../types';

interface JobAd {
  id: string;
  headline: string;
  description: {
    text: string;
    text_formatted: string;
  };
  employer: {
    name: string;
    website?: string;
  };
  workplace_address: {
    municipality: string;
    street_address?: string;
    postcode?: string;
    city?: string;
  };
  employment_type: {
    label: string;
  };
  salary_type?: {
    label: string;
  };
  salary_description?: string;
  application_deadline: string;
  working_hours_type?: {
    label: string;
  };
  must_have?: {
    skills?: Array<{ label: string }>;
    experience?: Array<{ label: string }>;
  };
  application_details: {
    url?: string;
    email?: string;
    reference?: string;
    information?: string;
  };
}

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

async function fetchJobDetails(id: string) {
  const response = await fetch(`https://jobsearch.api.jobtechdev.se/ad/${id}`, {
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Kunde inte hämta jobbannonsen');
  }

  return response.json() as Promise<JobAd>;
}

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [documents, setDocuments] = useState<UserDocuments>({});
  const [isApplying, setIsApplying] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const storedDocuments = await AsyncStorage.getItem('userDocuments');
        if (storedDocuments) {
          const parsedDocuments = JSON.parse(storedDocuments);
          if (parsedDocuments.cv && parsedDocuments.personalLetter) {
            setDocuments(parsedDocuments);
          }
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    };
    loadDocuments();
  }, []);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => fetchJobDetails(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (job && documents.cv && documents.personalLetter) {
      analyzeJobMatch(job, documents)
        .then(setMatchAnalysis)
        .catch(error => {
          console.error('Error analyzing job match:', error);
          setMatchAnalysis(null);
        });
    }
  }, [job, documents]);

  const handleShare = async () => {
    if (job) {
      try {
        await Share.share({
          title: job.headline,
          message: `Kolla in det här jobbet: ${job.headline} hos ${job.employer.name}\n\n${job.application_details.url || ''}`,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openWebsite = async () => {
    if (job?.application_details.url) {
      await Linking.openURL(job.application_details.url);
    }
  };

  const handleApply = async () => {
    if (!documents.cv || !documents.personalLetter) {
      Alert.alert(
        'Saknade dokument',
        'Du behöver ladda upp både CV och personligt brev innan du kan ansöka.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/profile'),
          },
        ],
      );
      return;
    }

    setIsApplying(true);
    try {
      if (job?.application_details.url) {
        const formResponses = await generateWebFormResponses(job, documents);
        Alert.alert(
          'AI Application',
          'Din ansökan kommer att skickas via AI. Vill du fortsätta?',
          [
            {
              text: 'Avbryt',
              style: 'cancel',
            },
            {
              text: 'Fortsätt',
              onPress: async () => {
                try {
                  await Linking.openURL(job.application_details.url!);
                } catch (error) {
                  Alert.alert('Fel', 'Kunde inte öppna ansökningssidan. Försök igen senare.');
                }
              },
            },
          ],
        );
      } else if (job?.application_details.email) {
        const emailContent = await generateApplicationEmail(job, documents);
        Alert.alert(
          'AI Application',
          'Din ansökan kommer att skickas via AI. Vill du fortsätta?',
          [
            {
              text: 'Avbryt',
              style: 'cancel',
            },
            {
              text: 'Fortsätt',
              onPress: async () => {
                try {
                  const subject = `Ansökan: ${job.headline}`;
                  await Linking.openURL(
                    `mailto:${job.application_details.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent || '')}`
                  );
                } catch (error) {
                  Alert.alert('Fel', 'Kunde inte öppna e-postklienten. Försök igen senare.');
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error processing application:', error);
      Alert.alert(
        'Fel',
        error.message === 'Hugging Face API key is not configured'
          ? 'AI-tjänsten är inte konfigurerad. Kontakta support.'
          : 'Det gick inte att skicka ansökan. Försök igen senare.'
      );
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B4F6C" />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Kunde inte hitta jobbannonsen</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0B4F6C" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Share2 size={24} color="#0B4F6C" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.actionButton}>
            <Heart 
              size={24} 
              color={isFavorite ? '#FF3B30' : '#8E8E93'} 
              fill={isFavorite ? '#FF3B30' : 'none'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.companyHeader}>
          <View style={styles.companyInfo}>
            <Text style={styles.jobTitle}>{job.headline}</Text>
            <Text style={styles.companyName}>{job.employer.name}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MapPin size={20} color="#0B4F6C" />
            <Text style={styles.detailLabel}>Plats</Text>
            <Text style={styles.detailValue}>{job.workplace_address.municipality}</Text>
          </View>
          {job.salary_type && (
            <View style={styles.detailItem}>
              <DollarSign size={20} color="#0B4F6C" />
              <Text style={styles.detailLabel}>Lön</Text>
              <Text style={styles.detailValue}>{job.salary_type.label}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Building2 size={20} color="#0B4F6C" />
            <Text style={styles.detailLabel}>Anställning</Text>
            <Text style={styles.detailValue}>{job.employment_type.label}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={20} color="#0B4F6C" />
            <Text style={styles.detailLabel}>Sista ansökningsdag</Text>
            <Text style={styles.detailValue}>{new Date(job.application_deadline).toLocaleDateString('sv-SE')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beskrivning</Text>
          <Text style={styles.description}>{job.description.text}</Text>
        </View>

        {job.must_have?.skills && job.must_have.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kvalifikationer</Text>
            {job.must_have.skills.map((skill, index) => (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{skill.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ansökan</Text>
          <Text style={styles.description}>
            {job.application_details.information || 'Ansök via länken nedan'}
          </Text>
          {job.application_details.reference && (
            <Text style={styles.reference}>
              Referensnummer: {job.application_details.reference}
            </Text>
          )}
        </View>

        {matchAnalysis && (
          <View style={styles.analysisSection}>
            <TouchableOpacity 
              style={styles.analysisHeader}
              onPress={() => setShowAnalysis(!showAnalysis)}>
              <View style={styles.analysisTitleContainer}>
                <Sparkles size={20} color="#0B4F6C" />
                <Text style={styles.analysisTitle}>AI Matchning</Text>
              </View>
              <Text style={styles.analysisToggle}>
                {showAnalysis ? 'Dölj' : 'Visa'}
              </Text>
            </TouchableOpacity>
            {showAnalysis && (
              <Text style={styles.analysisText}>{matchAnalysis}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.websiteButton}
          onPress={openWebsite}>
          <Text style={styles.websiteButtonText}>Gå till hemsidan</Text>
          <ExternalLink size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.applyButton, isApplying && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={isApplying}>
          {isApplying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.applyButtonText}>Ansök Nu</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  companyHeader: {
    marginBottom: 24,
  },
  companyInfo: {
    flex: 1,
  },
  jobTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#0B4F6C',
    marginBottom: 8,
  },
  companyName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#8E8E93',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  detailValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#000000',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#0B4F6C',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#0B4F6C',
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  reference: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    flexDirection: 'row',
    gap: 12,
  },
  websiteButton: {
    flex: 1,
    backgroundColor: '#0B4F6C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  websiteButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#00A86B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
  applyButtonDisabled: {
    opacity: 0.7,
  },
  analysisSection: {
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
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0B4F6C',
  },
  analysisToggle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0B4F6C',
  },
  analysisText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#000000',
    marginTop: 12,
    lineHeight: 20,
  },
});