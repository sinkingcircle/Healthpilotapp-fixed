import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import ParticlesBackground from '../../../components/ParticlesBackground';

export default function DoctorHome() {
  const theme = useTheme();
  const [userName, setUserName] = useState('');

  useEffect(() => {
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

    loadUserProfile();
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
            onPress={() => router.push('/(app)/doctor/appointments')}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={32} color={theme.colors.primary} />
              </View>
              <Text variant="titleMedium" style={styles.cardTitle}>Appointments</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>
                Manage your appointments and schedule
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/(app)/doctor/appointments')}
                style={styles.cardButton}
              >
                View Schedule
              </Button>
            </Card.Actions>
          </Card>

          <Card 
            style={styles.card} 
            mode="elevated" 
            onPress={() => router.push('/(app)/doctor/patients')}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={32} color={theme.colors.primary} />
              </View>
              <Text variant="titleMedium" style={styles.cardTitle}>My Patients</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>
                View and manage patient records
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/(app)/doctor/patients')}
                style={styles.cardButton}
              >
                View Patients
              </Button>
            </Card.Actions>
          </Card>

          <Card 
            style={styles.card} 
            mode="elevated" 
            onPress={() => router.push('/(app)/doctor/prescriptions')}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={32} color={theme.colors.primary} />
              </View>
              <Text variant="titleMedium" style={styles.cardTitle}>Prescriptions</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>
                Write and manage prescriptions
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/(app)/doctor/prescriptions')}
                style={styles.cardButton}
              >
                View All
              </Button>
            </Card.Actions>
          </Card>

          <Card 
            style={styles.card} 
            mode="elevated"
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="stats-chart" size={32} color={theme.colors.primary} />
              </View>
              <Text variant="titleMedium" style={styles.cardTitle}>Analytics</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>
                View insights and statistics
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained-tonal" 
                style={styles.cardButton}
              >
                View Stats
              </Button>
            </Card.Actions>
          </Card>
        </View>
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
});