import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator, HelperText, Portal, Modal, IconButton, List, Divider, Tooltip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { createAIService } from '../../../lib/ai-service';
import MedicalIcon from '../../../components/MedicalIcon';

const aiService = createAIService(process.env.EXPO_PUBLIC_GITHUB_TOKEN!);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  messages: Message[];
  created_at: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hello! I'm here to help analyze your symptoms. Please describe what you're experiencing."
};

export default function SymptomCheck() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [finalReport, setFinalReport] = useState<string | null>(null);
  const [isConsultationComplete, setIsConsultationComplete] = useState(false);
  const [showConsultButton, setShowConsultButton] = useState(false);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [previousChats, setPreviousChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadPreviousChats(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const loadPreviousChats = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreviousChats(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    }
  };

  const startNewChat = () => {
    setChatHistory([INITIAL_MESSAGE]);
    setCurrentChatId(null);
    setMessage('');
    setShowConsultButton(false);
    setIsConsultationComplete(false);
    setFinalReport(null);
    setError(null);
    setShowHistoryModal(false);
  };

  const loadChatSession = (session: ChatSession) => {
    setChatHistory(session.messages);
    setCurrentChatId(session.id);
    setShowHistoryModal(false);
    setShowConsultButton(false);
    setIsConsultationComplete(false);
    setFinalReport(null);
    setError(null);
  };

  const deleteChat = async (chatId: string) => {
    try {
      setDeleteLoading(chatId);
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      if (chatId === currentChatId) {
        startNewChat();
      }

      if (userId) {
        await loadPreviousChats(userId);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !userId || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      const userMessage = message.trim();
      setMessage('');

      if (userMessage.toLowerCase().includes('i want a doctor') || 
          userMessage.toLowerCase().includes('need a doctor') ||
          userMessage.toLowerCase().includes('see a doctor')) {
        setShowConsultButton(true);
      }

      const updatedHistory = [...chatHistory, { role: 'user', content: userMessage }];
      setChatHistory(updatedHistory);

      const aiResponse = await aiService.analyzeSymptoms(updatedHistory);
      
      let finalHistory: Message[];
      if (aiResponse.startsWith('CONSULTATION_REQUESTED')) {
        setShowConsultButton(true);
        const cleanResponse = aiResponse.replace('CONSULTATION_REQUESTED', '').trim();
        finalHistory = [...updatedHistory, { role: 'assistant', content: cleanResponse }];
      } else {
        finalHistory = [...updatedHistory, { role: 'assistant', content: aiResponse }];
      }

      setChatHistory(finalHistory);

      if (aiResponse.toLowerCase().includes('final report') || 
          aiResponse.toLowerCase().includes('consultation complete')) {
        setIsConsultationComplete(true);
        setFinalReport(aiResponse);
      }

      const { data, error } = await supabase
        .from('chat_history')
        .upsert({
          id: currentChatId || undefined,
          user_id: userId,
          messages: finalHistory,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      if (data?.[0]?.id) {
        setCurrentChatId(data[0].id);
      }

      await loadPreviousChats(userId);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestConsultation = async () => {
    if (!userId || !chatHistory.length) return;

    try {
      setIsLoading(true);
      const lastAIResponse = chatHistory[chatHistory.length - 1].content;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!profileData) throw new Error('Profile not found');

      const { error } = await supabase
        .from('symptom_reports')
        .insert({
          patient_id: profileData.id,
          report_content: lastAIResponse,
          chat_history: chatHistory,
          status: 'pending_review'
        });

      if (error) throw error;
      setShowSummary(true);
      setReportStatus('pending');
      setShowConsultButton(false);
    } catch (error) {
      console.error('Error requesting consultation:', error);
      setError('Failed to request consultation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <MedicalIcon />
              <Text variant="headlineMedium" style={styles.title}>AI Symptom Analyzer</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Describe your symptoms and I'll help analyze them
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <Tooltip title="Load Previous Chat">
                <IconButton
                  icon="history"
                  mode="contained-tonal"
                  size={24}
                  onPress={() => setShowHistoryModal(true)}
                  style={styles.headerButton}
                  iconColor="#2196F3"
                />
              </Tooltip>
              <Tooltip title="Start New Chat">
                <IconButton
                  icon="plus"
                  mode="contained-tonal"
                  size={24}
                  onPress={startNewChat}
                  style={styles.headerButton}
                  iconColor="#2196F3"
                />
              </Tooltip>
            </View>
          </View>
        </View>

        {showConsultButton && (
          <Card style={styles.consultCard}>
            <Card.Content style={styles.consultContent}>
              <MedicalIcon size={32} color="#2196F3" />
              <Text variant="titleMedium" style={styles.consultTitle}>
                Would you like to consult with a doctor?
              </Text>
              <Text variant="bodyMedium" style={styles.consultText}>
                A doctor will review your symptoms and provide professional medical advice.
              </Text>
              <Button 
                mode="contained"
                onPress={handleRequestConsultation}
                style={styles.consultButton}
                loading={isLoading}
                disabled={isLoading}
              >
                Request Doctor Consultation
              </Button>
            </Card.Content>
          </Card>
        )}

        <ScrollView 
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {error && (
            <Card style={styles.errorCard}>
              <Card.Content>
                <HelperText type="error" visible={true}>
                  {error}
                </HelperText>
              </Card.Content>
            </Card>
          )}

          {chatHistory.map((msg, index) => (
            <Card 
              key={index} 
              style={[
                styles.messageCard,
                msg.role === 'user' ? styles.userMessage : styles.aiMessage
              ]}
            >
              <Card.Content>
                <Text variant="bodyMedium">{msg.content}</Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your symptoms..."
            mode="outlined"
            multiline
            style={styles.input}
            right={isLoading ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
          />
          <Button 
            mode="contained"
            onPress={handleSendMessage}
            disabled={isLoading || !message.trim()}
            style={styles.sendButton}
            loading={isLoading}
          >
            Send
          </Button>
        </View>

        <Portal>
          <Modal
            visible={showSummary}
            onDismiss={() => setShowSummary(false)}
            contentContainerStyle={styles.modalContent}
          >
            <Card>
              <Card.Content>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  Consultation Request Sent
                </Text>
                <Text variant="bodyLarge" style={styles.modalText}>
                  Your symptom report has been sent to our doctors for review. You will be notified when a doctor accepts your case.
                </Text>
                <Text variant="bodyMedium" style={styles.modalSummary}>
                  {finalReport}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => setShowSummary(false)}>Close</Button>
              </Card.Actions>
            </Card>
          </Modal>

          <Modal
            visible={showHistoryModal}
            onDismiss={() => setShowHistoryModal(false)}
            contentContainerStyle={styles.modalContent}
          >
            <Card>
              <Card.Content>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  Chat History
                </Text>
                <ScrollView style={styles.historyList}>
                  {previousChats.length === 0 ? (
                    <Text variant="bodyLarge" style={styles.noHistoryText}>
                      No previous chats found
                    </Text>
                  ) : (
                    previousChats.map((chat, index) => (
                      <React.Fragment key={chat.id}>
                        <List.Item
                          title={`Chat ${index + 1}`}
                          description={new Date(chat.created_at).toLocaleString()}
                          right={props => (
                            <View style={styles.chatActions}>
                              <Button
                                mode="contained-tonal"
                                onPress={() => loadChatSession(chat)}
                              >
                                Load
                              </Button>
                              <IconButton
                                icon="delete"
                                mode="contained-tonal"
                                size={20}
                                onPress={() => deleteChat(chat.id)}
                                loading={deleteLoading === chat.id}
                                disabled={deleteLoading !== null}
                                style={styles.deleteButton}
                                iconColor="#F44336"
                              />
                            </View>
                          )}
                        />
                        {index < previousChats.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  )}
                </ScrollView>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => setShowHistoryModal(false)}>Close</Button>
              </Card.Actions>
            </Card>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 16,
  },
  headerButton: {
    margin: 0,
    backgroundColor: '#E3F2FD',
  },
  title: {
    color: '#2196F3',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  consultCard: {
    margin: 16,
    backgroundColor: '#E3F2FD',
  },
  consultContent: {
    alignItems: 'center',
    padding: 16,
  },
  consultTitle: {
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  consultText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  consultButton: {
    width: '100%',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  messageCard: {
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#E3F2FD',
    marginLeft: 40,
  },
  aiMessage: {
    backgroundColor: '#fff',
    marginRight: 40,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    marginBottom: 8,
  },
  sendButton: {
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    marginBottom: 16,
  },
  modalContent: {
    padding: 20,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#2196F3',
    marginBottom: 16,
  },
  modalText: {
    marginBottom: 16,
  },
  modalSummary: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  historyList: {
    maxHeight: 400,
  },
  noHistoryText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  chatActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    margin: 0,
    backgroundColor: '#FFEBEE',
  },
});