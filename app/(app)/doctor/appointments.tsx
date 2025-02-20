import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Portal, Modal, ActivityIndicator, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Appointment {
  id: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  notes: string;
  patient: {
    full_name: string;
    email: string;
  };
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadAppointments = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: doctorProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!doctorProfile) throw new Error('Doctor profile not found');

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          status,
          notes,
          patient:profiles!appointments_patient_id_fkey (
            full_name,
            email
          )
        `)
        .eq('doctor_id', doctorProfile.id)
        .order('date', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      setUpdatingStatus(true);
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (updateError) throw updateError;
      
      setSelectedAppointment(null);
      await loadAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    loadAppointments();

    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => loadAppointments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
    };
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadAppointments();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text variant="headlineMedium" style={styles.title}>Appointments</Text>

        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            </Card.Content>
          </Card>
        )}

        {appointments.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyLarge">No appointments found</Text>
            </Card.Content>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">
                  {new Date(appointment.date).toLocaleString()}
                </Text>
                <Text variant="bodyLarge">{appointment.patient.full_name}</Text>
                <Text variant="bodyMedium">{appointment.patient.email}</Text>
                <Text variant="bodySmall" style={styles.status}>
                  Status: {appointment.status}
                </Text>
                {appointment.notes && (
                  <Text variant="bodySmall" style={styles.notes}>
                    Notes: {appointment.notes}
                  </Text>
                )}
              </Card.Content>
              {appointment.status === 'pending' && (
                <Card.Actions>
                  <Button 
                    mode="contained"
                    onPress={() => setSelectedAppointment(appointment)}
                  >
                    Review
                  </Button>
                </Card.Actions>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={!!selectedAppointment}
          onDismiss={() => setSelectedAppointment(null)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedAppointment && (
            <Card>
              <Card.Content>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  Appointment Request
                </Text>
                
                <Text variant="titleMedium" style={styles.modalSubtitle}>
                  Patient Information
                </Text>
                <Text variant="bodyLarge">{selectedAppointment.patient.full_name}</Text>
                <Text variant="bodyMedium">{selectedAppointment.patient.email}</Text>
                
                <Text variant="titleMedium" style={styles.modalSubtitle}>
                  Appointment Details
                </Text>
                <Text variant="bodyMedium">
                  Date: {new Date(selectedAppointment.date).toLocaleString()}
                </Text>
                {selectedAppointment.notes && (
                  <Text variant="bodyMedium" style={styles.modalNotes}>
                    Notes: {selectedAppointment.notes}
                  </Text>
                )}

                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => handleUpdateStatus(selectedAppointment.id, 'accepted')}
                    style={[styles.actionButton, styles.acceptButton]}
                    loading={updatingStatus}
                    disabled={updatingStatus}
                  >
                    Accept
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleUpdateStatus(selectedAppointment.id, 'rejected')}
                    style={[styles.actionButton, styles.rejectButton]}
                    loading={updatingStatus}
                    disabled={updatingStatus}
                  >
                    Reject
                  </Button>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => setSelectedAppointment(null)}>Close</Button>
              </Card.Actions>
            </Card>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 20,
    color: '#2196F3',
  },
  card: {
    marginBottom: 16,
  },
  status: {
    color: '#666',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  notes: {
    color: '#666',
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    marginBottom: 16,
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  modalTitle: {
    color: '#2196F3',
    marginBottom: 20,
  },
  modalSubtitle: {
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  modalNotes: {
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
});