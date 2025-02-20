import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Modal, Portal, Text, Button, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AppointmentModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (date: Date, notes: string) => void;
  loading?: boolean;
}

export default function AppointmentModal({ visible, onDismiss, onSubmit, loading }: AppointmentModalProps) {
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = () => {
    onSubmit(date, notes);
    setDate(new Date());
    setNotes('');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text variant="titleLarge" style={styles.title}>Schedule Appointment</Text>
        
        <View style={styles.dateContainer}>
          <Text variant="bodyMedium">Selected Date: {date.toLocaleString()}</Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={date}
              mode="datetime"
              onChange={handleDateChange}
              minimumDate={new Date()}
              style={styles.datePicker}
            />
          ) : (
            <>
              <Button onPress={() => setShowPicker(true)}>
                Select Date and Time
              </Button>
              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </>
          )}
        </View>

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.notes}
        />

        <View style={styles.actions}>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button 
            mode="contained" 
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Request Appointment
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 20,
    color: '#2196F3',
  },
  dateContainer: {
    marginBottom: 20,
  },
  datePicker: {
    marginTop: 10,
  },
  notes: {
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});