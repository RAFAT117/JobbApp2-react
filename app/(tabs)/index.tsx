import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search, MapPin, Building2, GraduationCap, Filter, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';

const jobCategories = [
  { id: 'apaJ_8Ge_QHH', title: 'Administration, ekonomi, juridik', color: '#E3F2FD', icon: '💼' },
  { id: 'apaJ_2ja_LuF', title: 'Data/IT', color: '#E8F5E9', icon: '💻' },
  { id: 'apaJ_Uxh_cPq', title: 'Försäljning, inköp, marknadsföring', color: '#FFF3E0', icon: '📊' },
  { id: 'apaJ_mP3_vMG', title: 'Hälso- och sjukvård', color: '#F3E5F5', icon: '🏥' },
  { id: 'apaJ_XR2_CXu', title: 'Pedagogiskt arbete', color: '#E1F5FE', icon: '📚' },
  { id: 'apaJ_nRf_9KZ', title: 'Tekniskt arbete', color: '#FAFAFA', icon: '⚙️' },
  { id: 'apaJ_oZ3_nXt', title: 'Transport', color: '#EFEBE9', icon: '🚚' },
  { id: 'apaJ_dYF_QHq', title: 'Bygg och anläggning', color: '#FBE9E7', icon: '🏗️' },
  { id: 'apaJ_Eat_27X', title: 'Hotell, restaurang, storhushåll', color: '#F1F8E9', icon: '🍽️' },
  { id: 'apaJ_GTR_qVS', title: 'Kultur, media, design', color: '#E0F7FA', icon: '🎨' },
];

interface JobAd {
  id: string;
  headline: string;
  employer: {
    name: string;
  };
  workplace_address: {
    municipality: string;
  };
  employment_type: {
    label: string;
  };
  application_deadline: string;
  description: {
    text: string;
  };
}

async function searchJobs(query: string = '', occupationField?: string) {
  const baseUrl = 'https://jobsearch.api.jobtechdev.se/search';
  const params = new URLSearchParams({
    q: query,
    limit: '10',
  });

  if (occupationField) {
    params.append('occupation-field', occupationField);
  }

  const response = await fetch(`${baseUrl}?${params}`, {
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Kunde inte hämta jobb');
  }

  const data = await response.json();
  return data.hits as JobAd[];
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs', searchQuery, selectedCategory],
    queryFn: () => searchJobs(searchQuery, selectedCategory),
    enabled: true,
  });

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[1]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hitta ditt drömjobb 🇸🇪</Text>
        <Text style={styles.subtitle}>Över 100 000 lediga tjänster</Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Sök jobb, företag eller plats"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#0B4F6C" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => setIsCategoriesExpanded(!isCategoriesExpanded)}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Yrkesområden</Text>
            {selectedCategory && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSelectedCategory(undefined)}>
                <Text style={styles.clearButtonText}>Rensa</Text>
              </TouchableOpacity>
            )}
          </View>
          {isCategoriesExpanded ? (
            <ChevronUp size={20} color="#0B4F6C" />
          ) : (
            <ChevronDown size={20} color="#0B4F6C" />
          )}
        </TouchableOpacity>
        {isCategoriesExpanded && (
          <View style={styles.categoriesGrid}>
            {jobCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.color },
                  selectedCategory === category.id && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.id ? undefined : category.id
                )}>
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
                <Text style={[
                  styles.categoryTitle,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lediga jobb</Text>
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0B4F6C" />
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Kunde inte ladda jobb. Försök igen senare.</Text>
          </View>
        )}

        {jobs?.map(job => (
          <Link href={`/job/${job.id}`} key={job.id} asChild>
            <TouchableOpacity style={styles.jobCard}>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.headline}</Text>
                <Text style={styles.companyName}>{job.employer.name}</Text>
                <View style={styles.jobDetails}>
                  <View style={styles.detailItem}>
                    <MapPin size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{job.workplace_address.municipality}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Building2 size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{job.employer.name}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <GraduationCap size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{job.employment_type?.label || 'Heltid'}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
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
  greeting: {
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
  searchWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    marginBottom: 16,
    color: '#0B4F6C',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#0B4F6C',
    transform: [{ scale: 1.02 }],
  },
  selectedCategoryText: {
    color: '#0B4F6C',
    fontFamily: 'Inter_600SemiBold',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0B4F6C',
    lineHeight: 20,
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 8,
    color: '#0B4F6C',
  },
  companyName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  jobDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8E8E93',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    color: '#FF3B30',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#0B4F6C',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
});