import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, useTheme, ActivityIndicator, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import ParticlesBackground from '../../../components/ParticlesBackground';
import MedicalIcon from '../../../components/MedicalIcon';
import ReliefIcon from '../../../components/ReliefIcon';
import FileIcon from '../../../components/FileIcon';
import MedicineIcon from '../../../components/MedicineIcon';

interface Doctor {
  id: string;
  full_name: string;
  email: string;
  specialty: string;
  created_at: string;
}

export default function PatientHome() {
  const theme = useTheme();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profileData) throw new Error('Profile not found');

      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctor_patients')
        .select(`
          doctor:profiles!doctor_patients_doctor_id_fkey (
            id,
            full_name,
            email,
            specialty,
            created_at
          )
        `)
        .eq('patient_id', profileData.id)
        .eq('status', 'active');

      if (doctorsError) throw doctorsError;

      setDoctors(doctorsData.map(d => d.doctor));
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadDoctors();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ParticlesBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.welcome}>
            Welcome back, {userName}
          </Text>
        </View>

        <View style={styles.grid}>
          <Card 
            style={styles.card} 
            mode="elevated" 
            onPress={() => router.push('/(app)/patient/symptom-check')}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MedicalIcon />
              </View>
              <Text variant="titleMedium" style={styles.cardTitle}>AI Symptom Check</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>
                Describe your symptoms to get instant analysis
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/(app)/patient/symptom-check')}
                style={styles.cardButton}
              >
                Start Check
              </Button>
            </Card.Actions>
          </Card>

          <Card 
            style={styles.card} 
            mode="elevated" 
            onPress={() => router.push('/(app)/patient/quick-relief')}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <ReliefIcon />
              </View>
              <Text variant="titleMedium" style={styles.cardTitle}>Quick Relief</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>
                Get immediate relief suggestions
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/(app)/patient/quick-relief')}
                style={styles.cardButton}
              >
                Get Help
              </Button>
            </Card.Actions>
          </Card>

          <Card 
            style={styles.card} 
            mode="elevated" 
            onPress={() => router.push('/(app)/patient/clinical-history')}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <FileIcon />
              </View>
              <Text variant="titleMedium" style={styles.cardTitle}>Clinical History</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>
                View your medical records and visits
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/(app)/patient/clinical-history')}
                style={styles.cardButton}
              >
                View History
              </Button>
            </Card.Actions>
          </Card>

          <Card 
            style={styles.card} 
            mode="elevated" 
            onPress={() => router.push('/(app)/patient/medication')}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MedicineIcon />
              </View>
              <Text variant="titleMedium" style={styles.cardTitle}>Medication Reminder</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>
                Track your medication schedule
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/(app)/patient/medication')}
                style={styles.cardButton}
              >
                View Reminders
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <Text variant="headlineMedium" style={[styles.welcome, styles.sectionTitle]}>
          My Doctors
        </Text>
        
        {loading ? (
          <ActivityIndicator style={styles.loading} />
        ) : error ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            </Card.Content>
          </Card>
        ) : doctors.length === 0 ? (
          <Card style={styles.doctorCard}>
            <Card.Content>
              <Text variant="bodyLarge">No assigned doctors yet</Text>
            </Card.Content>
          </Card>
        ) : (
          doctors.map((doctor) => (
            <Card key={doctor.id} style={styles.doctorCard}>
              <Card.Content>
                <View style={styles.doctorInfo}>
                  <View style={styles.doctorAvatar}>
                    <Ionicons name="person" size={32} color={theme.colors.primary} />
                  </View>
                  <View style={styles.doctorDetails}>
                    <Text variant="titleMedium">{doctor.full_name}</Text>
                    <Text variant="bodyMedium" style={styles.specialty}>{doctor.specialty}</Text>
                    <Text variant="bodySmall" style={styles.email}>{doctor.email}</Text>
                  </View>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="contained"
                  onPress={() => router.push(`/patient/chat/${doctor.id}`)}
                  style={styles.chatButton}
                >
                  Chat with Doctor
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcome: {
    color: '#2196F3',
    fontSize: 28,
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 18,
  },
  cardActions: {
    justifyContent: 'center',
    paddingBottom: 16,
  },
  cardButton: {
    width: '90%',
    borderRadius: 20,
  },
  doctorCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  doctorDetails: {
    flex: 1,
  },
  specialty: {
    color: '#666',
    marginTop: 4,
  },
  email: {
    color: '#666',
    marginTop: 4,
  },
  loading: {
    marginTop: 20,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    marginBottom: 16,
    borderRadius: 16,
  },
  chatButton: {
    borderRadius: 20,
    width: '100%',
  },
});