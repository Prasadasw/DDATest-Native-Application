import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { apiService, Program } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const EducationScreen: React.FC = () => {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [enquiryModalVisible, setEnquiryModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPrograms();
      if (response.success) {
        setPrograms(response.data);
      } else {
        setError('Failed to fetch programs');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrograms();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPrograms();
    }
  }, [isAuthenticated, token]);

  const handleProgramPress = (program: Program) => {
    router.push({
      pathname: '/program-tests',
      params: { programId: program.id.toString() }
    });
  };

  const handleBannerPress = (type: string) => {
    setSelectedService(type);
    setEnquiryModalVisible(true);
  };

  const handleEnquirySubmit = async () => {
    // Validate form
    if (!enquiryForm.name.trim() || !enquiryForm.mobile.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Prevent multiple submissions
    if (isSubmittingEnquiry) {
      return;
    }

    setIsSubmittingEnquiry(true);

    try {
      // Submit enquiry to backend
      const response = await apiService.submitEnquiry({
        full_name: enquiryForm.name.trim(),
        mobile_number: enquiryForm.mobile.trim(),
        email_address: enquiryForm.email.trim() || undefined,
        message: enquiryForm.message.trim() || undefined,
        program_name: selectedService
      });

      if (response.success) {
        // Close modal immediately on success
        setEnquiryModalVisible(false);
        setEnquiryForm({ name: '', mobile: '', email: '', message: '' });
        
        // Show success message
        Alert.alert(
          'Success!', 
          `Thank you for your enquiry about ${selectedService}. We'll get back to you soon!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to submit enquiry');
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      Alert.alert('Error', 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const closeEnquiryModal = () => {
    setEnquiryModalVisible(false);
    setEnquiryForm({ name: '', mobile: '', email: '', message: '' });
  };

  // Color schemes for test cards
  // const cardColors = [
  //   { primary: '#8b5cf6', secondary: '#7c3aed', icon: 'palette' },
  //   { primary: 'rgb(56, 239, 125)', secondary: 'rgb(34, 197, 94)', icon: 'group' },
  //   { primary: '#8b5cf6', secondary: '#7c3aed', icon: 'mic' },
  //   { primary: 'rgb(56, 239, 125)', secondary: 'rgb(34, 197, 94)', icon: 'code' },
  //   { primary: '#8b5cf6', secondary: '#7c3aed', icon: 'psychology' },
  // ];
    // Color schemes for test cards
    // colors={['#019f8c', '#007b80']}

    const cardColors = [
      { primary: '#019f8c', secondary: '#007b80', icon: 'palette' },
      { primary: '#019f8c', secondary: '#007b80', icon: 'group' },
      { primary: '#019f8c', secondary: '#007b80', icon: 'mic' },
      { primary: '#019f8c', secondary: '#007b80', icon: 'code' },
      { primary: '#019f8c', secondary: '#007b80', icon: 'psychology' },
    ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading programs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPrograms}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Education</Text>
          <Text style={styles.headerSubtitle}>Discover learning opportunities</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <MaterialIcons name="refresh" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Available Tests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Tests</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testsContainer}
            nestedScrollEnabled={true}
          >
            {programs.map((program, index) => {
              const colorScheme = cardColors[index % cardColors.length];
              return (
                <TouchableOpacity
                  key={program.id}
                  style={styles.testCard}
                  onPress={() => handleProgramPress(program)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[colorScheme.primary, colorScheme.secondary]}
                    style={styles.testCardGradient}
                  >
                    {/* Background decorative element */}
                    <View style={[styles.decorativeShape, { backgroundColor: `${colorScheme.primary}20` }]} />
                    
                    {/* Card Content */}
                    <View style={styles.testCardContent}>
                      {/* Icon */}
                      <View style={styles.testIconContainer}>
                        <MaterialIcons name={colorScheme.icon as any} size={24} color="#fff" />
                      </View>
                      
                      {/* Text Content */}
                      <View style={styles.testTextContainer}>
                        <Text style={styles.testName}>{program.name}</Text>
                        {/* <Text style={styles.testCount}>{program.test_count || 0} Tests</Text> */}
                      </View>
                      
                      {/* Action Button */}
                      <View style={styles.testActionContainer}>
                        
                        <View style={[styles.arrowContainer, { backgroundColor: colorScheme.primary }]}>
                          <Text style={styles.arrowText}>{'>>>'}</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Educational Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educational Services</Text>
          
          {/* Scholarship Enrollment Banner */}
          <TouchableOpacity 
            style={styles.serviceBanner}
            onPress={() => handleBannerPress('Scholarship Enrollment')}
          >
            <LinearGradient
              colors={['#019f8c', '#007b80']}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerIconContainer}>
                  <MaterialIcons name="school" size={24} color="#007b80" />
                </View>
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>Scholarship Enrollment</Text>
                  <Text style={styles.bannerSubtitle}>Apply for educational scholarships</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* NDA Training Banner */}
          <TouchableOpacity 
            style={styles.serviceBanner}
            onPress={() => handleBannerPress('NDA Training')}
          >
            <LinearGradient
               colors={['#019f8c', '#007b80']}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerIconContainer}>
                  <MaterialIcons name="security" size={24} color="#007b80" />
                </View>
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>NDA Training</Text>
                  <Text style={styles.bannerSubtitle}>Prepare for NDA examination</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Training Services Banner */}
          <TouchableOpacity 
            style={styles.serviceBanner}
            onPress={() => handleBannerPress('Training Services')}
           >
            <LinearGradient
            colors={['#019f8c', '#007b80']}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerIconContainer}>
                  <MaterialIcons name="psychology" size={24} color="#007b80" />
                </View>
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>Training Services</Text>
                  <Text style={styles.bannerSubtitle}>Professional development programs</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Enquiry Modal */}
      <Modal
        visible={enquiryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEnquiryModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enquire About {selectedService}</Text>
              <TouchableOpacity onPress={closeEnquiryModal} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter your full name"
                  value={enquiryForm.name}
                  onChangeText={(text) => setEnquiryForm({...enquiryForm, name: text})}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mobile Number *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter your mobile number"
                  value={enquiryForm.mobile}
                  onChangeText={(text) => setEnquiryForm({...enquiryForm, mobile: text})}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter your email address"
                  value={enquiryForm.email}
                  onChangeText={(text) => setEnquiryForm({...enquiryForm, email: text})}
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Message</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Tell us more about your interest..."
                  value={enquiryForm.message}
                  onChangeText={(text) => setEnquiryForm({...enquiryForm, message: text})}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.cancelButton, isSubmittingEnquiry && styles.disabledButton]} 
                onPress={closeEnquiryModal}
                disabled={isSubmittingEnquiry}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmittingEnquiry && styles.disabledButton]} 
                onPress={handleEnquirySubmit}
                disabled={isSubmittingEnquiry}
              >
                {isSubmittingEnquiry ? (
                  <View style={styles.modalLoadingContainer}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.submitButtonText}>Submitting...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Submit Enquiry</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 5, // Add small top padding for mobile devices
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20, // Increased from 10 to 20 for proper mobile spacing
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Increased from 80 to 100 to ensure content is fully visible above navigation
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  testsContainer: {
    paddingRight: 20,
  },
  testCard: {
    width: 200,
    height: 160,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  testCardGradient: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  decorativeShape: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },
  testCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  testIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  testTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  testName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 24,
  },
  testCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  testActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  joinButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  arrowContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  arrowText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceBanner: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerGradient: {
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#f3f4f6',
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100, // Increased from 20 to 100 to ensure content is fully visible above navigation
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default EducationScreen;

