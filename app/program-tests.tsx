import { FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService, Test } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EnrollmentModal from '../components/EnrollmentModal';

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

const ProgramTestsScreen = () => {
  const router = useRouter();
  const { programId, programName, programDescription } = useLocalSearchParams();
  const { token, isAuthenticated } = useAuth();
  
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentModal, setEnrollmentModal] = useState({
    visible: false,
    selectedTest: null as Test | null,
  });
  const [enrollmentRequests, setEnrollmentRequests] = useState<Set<number>>(new Set());
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Map<number, 'none' | 'pending' | 'approved' | 'rejected'>>(new Map());
  const [showStartTestModal, setShowStartTestModal] = useState(false);
  const [selectedTestToStart, setSelectedTestToStart] = useState<Test | null>(null);

  useEffect(() => {
    if (programId) {
      fetchTestsByProgram();
    }
  }, [programId]);

  useEffect(() => {
    if (tests.length > 0 && token && isAuthenticated) {
      checkAllEnrollmentStatuses();
    }
  }, [tests, token, isAuthenticated]);

  const fetchTestsByProgram = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the specific endpoint to get tests by program ID
      const response = await apiService.getTestsByProgram(parseInt(programId as string));
      
      if (response.success) {
        // Filter only active tests
        const activeTests = response.data.filter(test => test.status);
        setTests(activeTests);
      } else {
        setError('Failed to fetch tests');
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const checkAllEnrollmentStatuses = async () => {
    if (!token) return;
    
    console.log('🔍 Checking enrollment statuses for all tests...');
    const newStatuses = new Map<number, 'none' | 'pending' | 'approved' | 'rejected'>();
    
    for (const test of tests) {
      try {
        const response = await apiService.checkTestAccess(test.id, token);
        if (response.success && response.data?.has_access) {
          newStatuses.set(test.id, 'approved');
          console.log(`✅ Test ${test.id} is approved for access`);
        } else {
          // Check if there's a pending request by calling getMyEnrollmentRequests
          try {
            const enrollmentResponse = await apiService.getMyEnrollmentRequests(token);
            if (enrollmentResponse.success) {
              const testEnrollment = enrollmentResponse.data.find(
                enrollment => enrollment.test_id === test.id
              );
              if (testEnrollment) {
                newStatuses.set(test.id, testEnrollment.status);
                console.log(`📋 Test ${test.id} enrollment status: ${testEnrollment.status}`);
              } else {
                newStatuses.set(test.id, 'none');
              }
            }
          } catch (err) {
            console.log(`ℹ️ No enrollment found for test ${test.id}`);
            newStatuses.set(test.id, 'none');
          }
        }
      } catch (error) {
        // Handle 403 as expected behavior for new users without access
        if (error instanceof Error && error.message.includes('403')) {
          console.log(`ℹ️ No access for test ${test.id} - user needs to enroll`);
          newStatuses.set(test.id, 'none');
        } else {
          console.log(`ℹ️ Error checking access for test ${test.id}:`, error);
          newStatuses.set(test.id, 'none');
        }
      }
    }
    
    setEnrollmentStatuses(newStatuses);
    console.log('📊 Updated enrollment statuses:', newStatuses);
  };

  const handleTestPress = (test: Test) => {
    console.log('🔥 handleTestPress called for test:', test.id, test.title);
    console.log('🔐 Authentication status:', { isAuthenticated, tokenExists: !!token });
    
    if (!isAuthenticated || !token) {
      console.log('❌ Authentication failed');
      Alert.alert(
        'Authentication Required',
        'Please log in to request access to tests.',
        [{ text: 'OK' }]
      );
      return;
    }

    const enrollmentStatus = enrollmentStatuses.get(test.id) || 'none';
    console.log('📊 Enrollment status for test', test.id, ':', enrollmentStatus);

    switch (enrollmentStatus) {
      case 'approved':
        console.log('✅ Test approved, calling handleStartTest');
        handleStartTest(test);
        break;
      case 'pending':
        Alert.alert(
          'Request Pending',
          `Your enrollment request for "${test.title}" is pending admin approval. Please wait for confirmation.`,
          [{ text: 'OK' }]
        );
        break;
      case 'rejected':
        Alert.alert(
          'Request Rejected',
          `Your enrollment request for "${test.title}" was rejected. Please contact admin for more information.`,
          [{ text: 'OK' }]
        );
        break;
      case 'none':
      default:
        setEnrollmentModal({
          visible: true,
          selectedTest: test,
        });
        break;
    }
  };

  const handleStartTest = (test: Test) => {
    console.log('🎯 handleStartTest called for test:', test);
    
    // Alternative 1: Try direct navigation first for debugging
    console.log('🚀 Attempting direct navigation for debugging...');
    try {
      router.push(`/test-screen?testId=${test.id}&testTitle=${encodeURIComponent(test.title)}&testDuration=${test.duration}&testMarks=${test.total_marks}`);
      console.log('✅ Direct navigation call completed');
      return;
    } catch (error) {
      console.error('❌ Direct navigation failed:', error);
    }
    
    // Alternative 2: Use custom modal instead of Alert
    console.log('🔄 Falling back to custom modal...');
    setSelectedTestToStart(test);
    setShowStartTestModal(true);
  };

  const handleConfirmStartTest = () => {
    if (!selectedTestToStart) return;
    
    console.log('🚀 Confirming test start for:', selectedTestToStart.title);
    setShowStartTestModal(false);
    
    try {
      router.push(`/test-screen?testId=${selectedTestToStart.id}&testTitle=${encodeURIComponent(selectedTestToStart.title)}&testDuration=${selectedTestToStart.duration}&testMarks=${selectedTestToStart.total_marks}`);
      console.log('✅ Navigation after confirmation completed');
    } catch (error) {
      console.error('❌ Navigation after confirmation failed:', error);
    }
    
    setSelectedTestToStart(null);
  };

  const handleEnrollmentSubmit = async (requestMessage: string) => {
    console.log('🎯 Starting enrollment submission...');
    console.log('Selected test:', enrollmentModal.selectedTest);
    console.log('Token:', token);
    console.log('Request message:', requestMessage);

    if (!enrollmentModal.selectedTest || !token) {
      console.log('❌ Missing required data for enrollment');
      Alert.alert(
        'Error',
        'Missing required information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('🚀 Making API request...');
      const response = await apiService.requestEnrollment(
        enrollmentModal.selectedTest.id,
        requestMessage,
        token
      );

      console.log('📥 API Response:', response);

      if (response.success) {
        // Update enrollment status to pending
        const newStatuses = new Map(enrollmentStatuses);
        newStatuses.set(enrollmentModal.selectedTest!.id, 'pending');
        setEnrollmentStatuses(newStatuses);
        
        Alert.alert(
          'Request Sent Successfully! 🎉',
          `Your enrollment request for "${enrollmentModal.selectedTest.title}" has been sent to admin for review.\n\nYou will be notified once the admin approves your request.`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('❌ API returned unsuccessful response');
        Alert.alert(
          'Request Failed',
          response.message || 'Failed to send enrollment request. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('💥 Enrollment request error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Network Error',
        `Unable to connect to server: ${errorMessage}. Please check your internet connection and try again.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleCloseModal = () => {
    setEnrollmentModal({
      visible: false,
      selectedTest: null,
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const renderTestButton = (test: Test) => {
    const enrollmentStatus = enrollmentStatuses.get(test.id) || 'none';
    console.log('🎨 Rendering button for test', test.id, 'with status:', enrollmentStatus);
    
    let buttonText = 'Request Access';
    let buttonIcon = 'arrow-right';
    let buttonColors = [COLORS.primary, COLORS.secondary];
    let isDisabled = false;

    switch (enrollmentStatus) {
      case 'approved':
        buttonText = 'Start Test';
        buttonIcon = 'play';
        buttonColors = [COLORS.success, '#2D7D32'];
        console.log('🟢 Rendering "Start Test" button for test', test.id);
        break;
      case 'pending':
        buttonText = 'Request Sent';
        buttonIcon = 'clock';
        buttonColors = [COLORS.warning, '#F57F17'];
        isDisabled = true;
        break;
      case 'rejected':
        buttonText = 'Request Rejected';
        buttonIcon = 'x-circle';
        buttonColors = [COLORS.danger, '#C62828'];
        isDisabled = true;
        break;
      case 'none':
      default:
        // Default values already set
        break;
    }

    return (
      <TouchableOpacity
        style={[
          styles.requestButton,
          isDisabled && styles.requestButtonDisabled
        ]}
        onPress={() => handleTestPress(test)}
        disabled={isDisabled && enrollmentStatus !== 'approved'}
      >
        <LinearGradient
          colors={buttonColors as [string, string]}
          style={styles.requestButtonGradient}
        >
          <Text style={styles.requestButtonText}>
            {buttonText}
          </Text>
          <Feather 
            name={buttonIcon as any} 
            size={16} 
            color="#FFF" 
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderTestCard = ({ item }: { item: Test }) => (
    <TouchableOpacity
      style={styles.testCard}
      onPress={() => handleTestPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF']}
        style={styles.testCardGradient}
      >
        <View style={styles.testHeader}>
          <View style={styles.testIconContainer}>
            <FontAwesome name="file-text-o" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>Test</Text>
          </View>
        </View>

        <View style={styles.testContent}>
          <Text style={styles.testTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.testDescription} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.testMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color={COLORS.muted} />
              <Text style={styles.metaText}>{formatDuration(item.duration)}</Text>
            </View>
            <View style={styles.metaItem}>
              <FontAwesome name="star-o" size={16} color={COLORS.muted} />
              <Text style={styles.metaText}>{item.total_marks} marks</Text>
            </View>
          </View>

          {renderTestButton(item)}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="inbox" size={64} color={COLORS.muted} />
      <Text style={styles.emptyTitle}>No Tests Available</Text>
      <Text style={styles.emptySubtitle}>
        There are no tests available for {programName} program yet.
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchTestsByProgram}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading tests...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTestsByProgram}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (tests.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={tests}
        renderItem={renderTestCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.testList}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{programName}</Text>
          <Text style={styles.headerSubtitle}>Available Tests</Text>
        </View>
        
        <TouchableOpacity style={styles.refreshIconButton} onPress={() => {
          fetchTestsByProgram();
          if (token && isAuthenticated) {
            checkAllEnrollmentStatuses();
          }
        }}>
          <Feather name="refresh-cw" size={20} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      {/* Program Info */}
      {/* <View style={styles.programInfo}>
        <Text style={styles.programDescription}>{programDescription}</Text>
        <View style={styles.testCount}>
          <Text style={styles.testCountText}>
            {tests.length} {tests.length === 1 ? 'test' : 'tests'} available
          </Text>
        </View>
      </View> */}

      {/* Content */}
      {renderContent()}

      {/* Enrollment Modal */}
      <EnrollmentModal
        visible={enrollmentModal.visible}
        testTitle={enrollmentModal.selectedTest?.title || ''}
        testDescription={enrollmentModal.selectedTest?.description || ''}
        onClose={handleCloseModal}
        onSubmit={handleEnrollmentSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  refreshIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  programInfo: {
    backgroundColor: COLORS.card,
    padding: 16,
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  testCount: {
    alignSelf: 'flex-start',
  },
  testCountText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
  },
  testList: {
    padding: 16,
  },
  testCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  testCardGradient: {
    padding: 20,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  testIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  testBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  testContent: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  testMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: COLORS.muted,
    marginLeft: 6,
    fontWeight: '500',
  },
  requestButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  requestButtonDisabled: {
    opacity: 0.7,
  },
  requestButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  requestButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProgramTestsScreen;
