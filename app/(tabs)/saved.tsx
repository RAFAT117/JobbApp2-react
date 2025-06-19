import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { MapPin, DollarSign, Clock, Heart, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Link } from 'expo-router';

const savedJobs = [
  {
    id: 1,
    title: 'Senior React Developer',
    company: 'Google',
    location: 'Stockholm',
    salary: '65 000 - 85 000 kr',
    postedTime: '2h sedan',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200&h=200&fit=crop',
    applied: true,
    applicationStatus: 'Under granskning',
  },
  {
    id: 2,
    title: 'Product Designer',
    company: 'Apple',
    location: 'Göteborg',
    salary: '45 000 - 65 000 kr',
    postedTime: '5h sedan',
    logo: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=200&h=200&fit=crop',
    applied: false,
  },
];

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState<'saved' | 'applications'>('saved');

  const filteredJobs = savedJobs.filter(job => 
    activeTab === 'applications' ? job.applied : !job.applied
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sparade Jobb</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}>
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
              Sparade
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
            onPress={() => setActiveTab('applications')}>
            <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
              Ansökningar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/job/${item.id}`} asChild>
            <TouchableOpacity style={styles.jobCard}>
              <Image source={{ uri: item.logo }} style={styles.companyLogo} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.companyName}>{item.company}</Text>
                <View style={styles.jobDetails}>
                  <View style={styles.detailItem}>
                    <MapPin size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{item.location}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <DollarSign size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{item.salary}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Clock size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{item.postedTime}</Text>
                  </View>
                </View>
                {item.applied && (
                  <View style={styles.applicationStatus}>
                    <Text style={styles.statusText}>{item.applicationStatus}</Text>
                  </View>
                )}
              </View>
              <View style={styles.rightContent}>
                <Heart size={20} color="#FF3B30" fill="#FF3B30" />
                <ChevronRight size={20} color="#8E8E93" style={styles.chevron} />
              </View>
            </TouchableOpacity>
          </Link>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {activeTab === 'saved' ? 'Inga sparade jobb än' : 'Inga ansökningar än'}
            </Text>
          </View>
        }
      />
    </View>
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
    fontSize: 24,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#0B4F6C',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 4,
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
  rightContent: {
    alignItems: 'center',
    gap: 12,
  },
  chevron: {
    marginTop: 8,
  },
  applicationStatus: {
    marginTop: 8,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#0B4F6C',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyStateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#8E8E93',
  },
});