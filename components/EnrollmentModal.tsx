import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Premium color palette
const COLORS = {
  primary: "#4361EE",
  secondary: "#3A0CA3",
  accent: "#4CC9F0",
  background: "#F8F9FA",
  card: "#FFFFFF",
  text: "#212529",
  muted: "#6C757D",
  border: "#E9ECEF",
  success: "#4BB543",
  warning: "#FFD166",
  danger: "#EF476F",
  info: "#118AB2",
  dark: "#1A1A2E",
  light: "#F8F9FA",
};

interface EnrollmentModalProps {
  visible: boolean;
  testTitle: string;
  testDescription: string;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  visible,
  testTitle,
  testDescription,
  onClose,
  onSubmit,
}) => {
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log('🎯 Modal handleSubmit called');
    console.log('📝 Request message:', requestMessage);
    console.log('📏 Message length:', requestMessage.trim().length);

    if (requestMessage.trim().length < 10) {
      console.log('❌ Message too short');
      Alert.alert(
        'Message Required',
        'Please provide a detailed message (at least 10 characters) explaining why you want to take this test.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('🔄 Setting loading to true');
      setLoading(true);
      console.log('📞 Calling onSubmit function...');
      await onSubmit(requestMessage.trim());
      console.log('✅ onSubmit completed successfully');
      setRequestMessage('');
      onClose();
    } catch (error) {
      console.error('💥 Error in modal handleSubmit:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRequestMessage('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={styles.headerTitle}>Request Test Access</Text>
                  <Text style={styles.headerSubtitle}>Send request to admin</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Feather name="x" size={24} color={COLORS.muted} />
                </TouchableOpacity>
              </View>

              {/* Test Info */}
              <View style={styles.testInfo}>
                <View style={styles.testIconContainer}>
                  <Feather name="file-text" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.testDetails}>
                  <Text style={styles.testTitle} numberOfLines={2}>
                    {testTitle}
                  </Text>
                  <Text style={styles.testSubtitle} numberOfLines={2}>
                    {testDescription}
                  </Text>
                </View>
              </View>

              {/* Message Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                  Why do you want to take this test? <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Example: I am preparing for NDA entrance exam and need practice tests to improve my performance..."
                  placeholderTextColor={COLORS.muted}
                  value={requestMessage}
                  onChangeText={setRequestMessage}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                  editable={!loading}
                />
                <Text style={styles.characterCount}>
                  {requestMessage.length}/500 characters
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading || requestMessage.trim().length < 10}
                >
                  <LinearGradient
                    colors={loading ? [COLORS.muted, COLORS.muted] : [COLORS.primary, COLORS.secondary]}
                    style={styles.submitButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>Send Request</Text>
                        <Feather name="send" size={16} color="#FFF" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  testIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testDetails: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  testSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.danger,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'right',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.muted,
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default EnrollmentModal;
