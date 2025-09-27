import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_CONFIG, API_ENDPOINTS } from '../constants/ApiConfig';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { resetIntroForTesting } from '../utils/introUtils';

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  dob: string;
  mobile: string;
  alternate_mobile: string;
  qualification: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface TestResult {
  id: number;
  test_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  status: 'completed' | 'reviewed' | 'released';
  submitted_at: string;
  reviewed_at?: string;
}

interface CompletedTest {
  test_id: number;
  test_title: string;
  program_name?: string;
  submission_id: number;
  status: string;
  submitted_at: string;
  total_score: number;
  max_score: number;
  percentage: number;
  time_taken: number;
}

interface StudentWithCompletedTests {
  student: {
    id: number;
    first_name: string;
    last_name: string;
    mobile: string;
    qualification: string;
  };
  completed_tests: CompletedTest[];
}

const ProfileScreen: React.FC = () => {
  const { token, studentId } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [completedTests, setCompletedTests] = useState<StudentWithCompletedTests[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResultsLoading, setTestResultsLoading] = useState(false);
  const [completedTestsLoading, setCompletedTestsLoading] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [certificationModalVisible, setCertificationModalVisible] = useState(false);
  const [certificationForm, setCertificationForm] = useState({
    name: '',
    email: '',
    mobile: '',
    selectedTests: [] as string[]
  });

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchTestResults();
      fetchCompletedTests();
    }
  }, [token]);

  // Debug effect to log userData changes
  useEffect(() => {
    console.log('userData state changed:', userData);
  }, [userData]);

  const fetchUserProfile = async () => {
    try {
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.STUDENT_PROFILE}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Profile API response:', result);

      if (result.success) {
        console.log('Setting user data:', result.data.student);
        setUserData(result.data.student);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResults = async () => {
    try {
      if (!token) {
        return; // Don't show error for test results
      }

      setTestResultsLoading(true);
      const response = await apiService.getMyTestResults(token);

      if (response.success) {
        setTestResults(response.data);
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
      // Don't show error for test results
    } finally {
      setTestResultsLoading(false);
    }
  };

  const fetchCompletedTests = async () => {
    try {
      if (!token) {
        return;
      }

      setCompletedTestsLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.COMPLETED_TESTS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Completed tests API response:', result);

      if (result.success) {
        setCompletedTests(result.data);
      } else {
        console.error('Failed to fetch completed tests:', result.message);
      }
    } catch (error) {
      console.error('Error fetching completed tests:', error);
      // Don't show error for completed tests
    } finally {
      setCompletedTestsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Check if student has released test results
  const hasReleasedResults = () => {
    // Check test results
    const hasReleasedTestResults = testResults.some(result => result.status === 'released');
    
    // Check completed tests
    const hasReleasedCompletedTests = completedTests.some(studentData => 
      studentData.completed_tests.some(test => test.status === 'result_released')
    );
    
    return hasReleasedTestResults || hasReleasedCompletedTests;
  };

  // Get released test names for certification
  const getReleasedTestNames = () => {
    const releasedTests: string[] = [];
    
    // From test results
    testResults.forEach(result => {
      if (result.status === 'released') {
        releasedTests.push(result.test_title);
      }
    });
    
    // From completed tests
    completedTests.forEach(studentData => {
      studentData.completed_tests.forEach(test => {
        if (test.status === 'result_released') {
          releasedTests.push(test.test_title);
        }
      });
    });
    
    return [...new Set(releasedTests)]; // Remove duplicates
  };

  const handleCertificationSubmit = () => {
    if (!certificationForm.name.trim() || !certificationForm.email.trim() || !certificationForm.mobile.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (certificationForm.selectedTests.length === 0) {
      Alert.alert('Error', 'Please select at least one test for certification');
      return;
    }

    // Here you would typically send the certification request to the backend
    console.log('Certification application:', certificationForm);
    
    Alert.alert(
      'Application Submitted! 🎉',
      'Your certification application has been submitted successfully. You will be contacted within 2-3 business days.',
      [{ text: 'OK', onPress: () => setCertificationModalVisible(false) }]
    );

    // Reset form
    setCertificationForm({
      name: '',
      email: '',
      mobile: '',
      selectedTests: []
    });
  };

  const toggleTestSelection = (testName: string) => {
    setCertificationForm(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(testName)
        ? prev.selectedTests.filter(test => test !== testName)
        : [...prev.selectedTests, testName]
    }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#013fc4', '#000046']}
          style={styles.header}
        >
          <View style={styles.profileSection}>
            <LinearGradient
              colors={['#A1C4FD', '#C2E9FB']}
              style={styles.profileImageContainer}
            >
              <Image 
                source={require('../assets/icons/nda.png')} 
                style={styles.profileImage} 
              />
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Loading...</Text>
              <Text style={styles.profileEmail}>Loading...</Text>
              <Text style={styles.profileStatus}>Loading...</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#019f8c', '#007b80']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <LinearGradient
            colors={['#A1C4FD', '#C2E9FB']}
            style={styles.profileImageContainer}
          >
            <Image 
              source={require('../assets/icons/nda.png')} 
              style={styles.profileImage} 
            />
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userData && userData.first_name && userData.last_name 
                ? `${userData.first_name} ${userData.last_name}` 
                : 'User Name'}
            </Text>
            <Text style={styles.profileEmail}>
              {userData && userData.mobile 
                ? `+91 ${userData.mobile}` 
                : 'Mobile Number'}
            </Text>
            <Text style={styles.profileStatus}>
              {userData?.is_verified ? 'Verified Member' : 'Unverified Member'}
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.content}>
        {/* Debug section - remove this after fixing */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Info</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Raw userData:</Text>
            <Text style={styles.infoValue}>
              {userData ? JSON.stringify(userData, null, 2) : 'No data'}
            </Text>
          </View>
        </View> */}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>
              {userData && userData.first_name && userData.last_name 
                ? `${userData.first_name} ${userData.last_name}` 
                : 'Not available'}
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>
              {userData && userData.dob ? formatDate(userData.dob) : 'Not available'}
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Mobile Number</Text>
            <Text style={styles.infoValue}>
              {userData && userData.mobile ? `+91 ${userData.mobile}` : 'Not available'}
            </Text>
          </View>
          
          {/* <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Alternate Mobile</Text>
            <Text style={styles.infoValue}>
              {userData && userData.alternate_mobile ? `+91 ${userData.alternate_mobile}` : 'Not provided'}
            </Text>
          </View> */}
          
          {/* <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Qualification</Text>
            <Text style={styles.infoValue}>
              {userData && userData.qualification ? userData.qualification : 'Not available'}
            </Text>
          </View> */}
          
          {/* <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {userData && userData.created_at ? formatDate(userData.created_at) : 'Not available'}
            </Text>
          </View> */}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          
          {testResultsLoading ? (
            <View style={styles.testResultsCard}>
              <Text style={styles.testResultsTitle}>Loading Test Results...</Text>
            </View>
          ) : testResults.length > 0 ? (
            testResults.map((result) => (
              <View key={result.id} style={styles.testResultCard}>
                <View style={styles.testResultHeader}>
                  <Text style={styles.testResultTitle}>{result.test_title}</Text>
                  <Text style={[
                    styles.testResultStatus,
                    { color: result.status === 'released' ? '#38EF7D' : '#FFD166' }
                  ]}>
                    {result.status === 'released' ? '✅ Released' : '⏳ Under Review'}
                  </Text>
                </View>
                
                <View style={styles.testResultStats}>
                  <View style={styles.testResultStat}>
                    <Text style={styles.testResultStatLabel}>Score</Text>
                    <Text style={styles.testResultStatValue}>{result.score}/{result.total_marks}</Text>
                  </View>
                  <View style={styles.testResultStat}>
                    <Text style={styles.testResultStatLabel}>Percentage</Text>
                    <Text style={styles.testResultStatValue}>{result.percentage}%</Text>
                  </View>
                  <View style={styles.testResultStat}>
                    <Text style={styles.testResultStatLabel}>Submitted</Text>
                    <Text style={styles.testResultStatValue}>{formatDate(result.submitted_at)}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.testResultsCard}>
              <Text style={styles.testResultsTitle}>No Test Results Yet</Text>
              <Text style={styles.testResultsSubtitle}>Your test results will appear here once reviewed by admin</Text>
              
              <View style={styles.testResultsInfo}>
                <Text style={styles.testResultsInfoText}>
                  📊 Test results are typically reviewed and released within 24-48 hours after submission.
                </Text>
                <Text style={styles.testResultsInfoText}>
                  🎯 Check back here to see your detailed performance analysis and improvement suggestions.
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Tests Overview</Text>
          
          {completedTestsLoading ? (
            <View style={styles.testResultsCard}>
              <Text style={styles.testResultsTitle}>Loading Completed Tests...</Text>
            </View>
          ) : (() => {
            // Filter to show only current student's completed tests
            const currentStudentTests = completedTests.find(studentData => 
              studentData.student.id === studentId
            );
            
            if (currentStudentTests && currentStudentTests.completed_tests.length > 0) {
              return (
                <View style={styles.completedTestsCard}>
                  <View style={styles.completedTestsHeader}>
                    <Text style={styles.completedTestsTitle}>
                      My Completed Tests
                    </Text>
                    <Text style={styles.completedTestsSubtitle}>
                      {currentStudentTests.completed_tests.length} tests completed
                    </Text>
                  </View>
                  
                  {currentStudentTests.completed_tests.map((test) => (
                    <View key={test.submission_id} style={styles.completedTestItem}>
                      <View style={styles.completedTestHeader}>
                        <Text style={styles.completedTestTitle}>{test.test_title}</Text>
                        <Text style={[
                          styles.completedTestStatus,
                          { 
                            color: test.status === 'result_released' ? '#38EF7D' : 
                                   test.status === 'under_review' ? '#FFD166' : '#FF6B6B'
                          }
                        ]}>
                          {test.status === 'result_released' ? '✅ Released' : 
                           test.status === 'under_review' ? '⏳ Reviewing' : '📝 Submitted'}
                        </Text>
                      </View>
                      
                      <View style={styles.completedTestStats}>
                        <View style={styles.completedTestStat}>
                          <Text style={styles.completedTestStatLabel}>Score</Text>
                          <Text style={styles.completedTestStatValue}>
                            {test.total_score || 0}/{test.max_score}
                          </Text>
                        </View>
                        <View style={styles.completedTestStat}>
                          <Text style={styles.completedTestStatLabel}>Percentage</Text>
                          <Text style={styles.completedTestStatValue}>
                            {test.percentage ? `${test.percentage}%` : 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.completedTestStat}>
                          <Text style={styles.completedTestStatLabel}>Time</Text>
                          <Text style={styles.completedTestStatValue}>
                            {test.time_taken ? `${test.time_taken} min` : 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.completedTestStat}>
                          <Text style={styles.completedTestStatLabel}>Date</Text>
                          <Text style={styles.completedTestStatValue}>
                            {formatDate(test.submitted_at)}
                          </Text>
                        </View>
                      </View>
                      
                      {test.program_name && (
                        <Text style={styles.completedTestProgram}>
                          📚 {test.program_name}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              );
            } else {
              return (
                <View style={styles.testResultsCard}>
                  <Text style={styles.testResultsTitle}>No Completed Tests Found</Text>
                  <Text style={styles.testResultsSubtitle}>
                    Your completed tests will appear here once you finish taking tests
                  </Text>
                </View>
              );
            }
          })()}
        </View>

        {/* Apply for Certification Section - Only show if student has released results */}
        {hasReleasedResults() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certification</Text>
            
            <TouchableOpacity 
              style={styles.certificationCard}
              onPress={() => {
                // Pre-fill form with user data
                setCertificationForm(prev => ({
                  ...prev,
                  name: userData ? `${userData.first_name} ${userData.last_name}` : '',
                  email: userData?.mobile ? `+91${userData.mobile}@example.com` : '',
                  mobile: userData?.mobile ? `+91 ${userData.mobile}` : ''
                }));
                setCertificationModalVisible(true);
              }}
            >
              <View style={styles.certificationIcon}>
                <Text style={styles.certificationIconText}>🏆</Text>
              </View>
              <View style={styles.certificationContent}>
                <Text style={styles.certificationTitle}>Apply for Certification</Text>
                <Text style={styles.certificationSubtitle}>
                  Get certified for your completed tests
                </Text>
                <Text style={styles.certificationDescription}>
                  You have {getReleasedTestNames().length} test(s) eligible for certification
                </Text>
              </View>
              <Text style={styles.certificationArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👤</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Edit Profile</Text>
              <Text style={styles.menuSubtitle}>Update your personal information</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Privacy Settings</Text>
              <Text style={styles.menuSubtitle}>Manage your privacy preferences</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuSubtitle}>Configure notification settings</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          {/* Development Only - Reset Intro */}
          {/* {__DEV__ && (
            <TouchableOpacity 
              style={[styles.menuItem, { backgroundColor: '#fff3cd' }]} 
              onPress={async () => {
                Alert.alert(
                  'Reset Intro',
                  'This will reset the intro screens so they show again on next app launch. This is for development testing only.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Reset', 
                      style: 'destructive',
                      onPress: async () => {
                        await resetIntroForTesting();
                        Alert.alert('Success', 'Intro has been reset! Restart the app to see intro screens again.');
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.menuIcon}>🔄</Text>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: '#856404' }]}>Reset Intro (Dev Only)</Text>
                <Text style={[styles.menuSubtitle, { color: '#856404' }]}>Reset intro screens for testing</Text>
              </View>
              <Text style={[styles.menuArrow, { color: '#856404' }]}>›</Text>
            </TouchableOpacity>
          )} */}
        </View>
        
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>NDA Preparation</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressText}>75% Complete</Text>
          </View>
          
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>SSP Test Training</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '45%' }]} />
            </View>
            <Text style={styles.progressText}>45% Complete</Text>
          </View>
        </View> */}

        
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setHelpModalVisible(true)}
          >
            <Text style={styles.menuIcon}>❓</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Help Center</Text>
              <Text style={styles.menuSubtitle}>Get help and support</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📧</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Contact Us</Text>
              <Text style={styles.menuSubtitle}>Reach out to our team</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Safe Area */}
        <View style={styles.bottomSafeArea} />
      </ScrollView>

      {/* Certification Application Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={certificationModalVisible}
        onRequestClose={() => setCertificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Certification</Text>
              <TouchableOpacity 
                onPress={() => setCertificationModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={certificationForm.name}
                  onChangeText={(text) => setCertificationForm(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your full name"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Email Address *</Text>
                <TextInput
                  style={styles.formInput}
                  value={certificationForm.email}
                  onChangeText={(text) => setCertificationForm(prev => ({ ...prev, email: text }))}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Mobile Number *</Text>
                <TextInput
                  style={styles.formInput}
                  value={certificationForm.mobile}
                  onChangeText={(text) => setCertificationForm(prev => ({ ...prev, mobile: text }))}
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Select Tests for Certification *</Text>
                <Text style={styles.formSubLabel}>Choose the tests you want to get certified for:</Text>
                {getReleasedTestNames().map((testName, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.testOption,
                      certificationForm.selectedTests.includes(testName) && styles.testOptionSelected
                    ]}
                    onPress={() => toggleTestSelection(testName)}
                  >
                    <Text style={[
                      styles.testOptionText,
                      certificationForm.selectedTests.includes(testName) && styles.testOptionTextSelected
                    ]}>
                      {certificationForm.selectedTests.includes(testName) ? '✓' : '○'} {testName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setCertificationModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleCertificationSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Application</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Help Center Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help Center</Text>
              <TouchableOpacity 
                onPress={() => setHelpModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.helpSection}>
                <Text style={styles.helpIcon}>📞</Text>
                <Text style={styles.helpTitle}>Call Support</Text>
                <Text style={styles.helpDescription}>
                  For immediate assistance, please call our support team
                </Text>
                <Text style={styles.contactInfo}>+91 98765 43210</Text>
              </View>
              
              <View style={styles.helpSection}>
                <Text style={styles.helpIcon}>✉️</Text>
                <Text style={styles.helpTitle}>Email Support</Text>
                <Text style={styles.helpDescription}>
                  Send us an email and we'll get back to you within 24 hours
                </Text>
                <Text style={styles.contactInfo}>support@testapp.com</Text>
              </View>
              
              <View style={styles.helpSection}>
                <Text style={styles.helpIcon}>💬</Text>
                <Text style={styles.helpTitle}>Live Chat</Text>
                <Text style={styles.helpDescription}>
                  Chat with our support team during business hours
                </Text>
                <Text style={styles.contactInfo}>Available 9 AM - 6 PM IST</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setHelpModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    marginRight: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 12,
    color: '#d3af27',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Increased from 80 to 100 to ensure content is fully visible above navigation
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  menuArrow: {
    fontSize: 18,
    color: '#ccc',
    fontWeight: '300',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#013fc4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#013fc4',
    fontWeight: '500',
  },
  testResultsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  testResultsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  testResultsInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  testResultsInfoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  testResultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  testResultStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  testResultStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testResultStat: {
    alignItems: 'center',
    flex: 1,
  },
  testResultStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  testResultStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  helpSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  helpIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  helpDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#013fc4',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#013fc4',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Completed tests styles
  completedTestsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  completedTestsHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  completedTestsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  completedTestsSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  completedTestItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  completedTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedTestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  completedTestStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  completedTestStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completedTestStat: {
    alignItems: 'center',
    flex: 1,
  },
  completedTestStatLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
  },
  completedTestStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  completedTestProgram: {
    fontSize: 12,
    color: '#013fc4',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  bottomSafeArea: {
    height: 100, // Adjust as needed for safe area
  },
  // Certification styles
  certificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  certificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  certificationIconText: {
    fontSize: 24,
  },
  certificationContent: {
    flex: 1,
  },
  certificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  certificationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  certificationDescription: {
    fontSize: 12,
    color: '#013fc4',
    fontWeight: '600',
  },
  certificationArrow: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  // Form styles
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  formSubLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  testOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  testOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#013fc4',
  },
  testOptionText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 8,
  },
  testOptionTextSelected: {
    color: '#013fc4',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#013fc4',
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen; 