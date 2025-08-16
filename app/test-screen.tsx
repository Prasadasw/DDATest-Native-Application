import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiService, Question } from '../services/api';

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

interface UserAnswer {
  questionId: number;
  selectedOption: 'a' | 'b' | 'c' | 'd' | null;
  isAnswered: boolean;
}

const TestScreen = () => {
  console.log('🚀 TestScreen component function called');
  
  const router = useRouter();
  const { testId, testTitle, testDuration, testMarks } = useLocalSearchParams();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, UserAnswer>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(parseInt(testDuration as string) * 60); // Convert minutes to seconds
  const [testStarted, setTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<{ correctAnswers: number; totalMarks: number } | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  const { token, studentId } = useAuth();

  // Debug logging for component mount
  useEffect(() => {
    console.log('🚀 TestScreen component mounted');
    console.log('🔑 Initial token:', token);
    console.log('👤 Initial studentId:', studentId);
  }, []);

  // Debug logging for authentication values
  useEffect(() => {
    console.log('🔑 TestScreen - Token changed:', token ? 'Present' : 'Missing');
    console.log('🔑 TestScreen - Token value:', token);
  }, [token]);

  useEffect(() => {
    console.log('👤 TestScreen - Student ID changed:', studentId);
    console.log('👤 TestScreen - Student ID value:', studentId);
  }, [studentId]);

  // Debug logging for route parameters
  useEffect(() => {
    console.log('📍 TestScreen - Route params:', { testId, testTitle, testDuration, testMarks });
  }, [testId, testTitle, testDuration, testMarks]);

  // Debug logging for submission ID changes
  useEffect(() => {
    console.log('📊 Submission ID changed:', submissionId);
  }, [submissionId]);

  useEffect(() => {
    if (testId) {
      fetchQuestions();
    }
  }, [testId]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (testStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            console.log('⏰ Time ran out, auto-submitting test...');
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeRemaining]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getQuestionsByTest(parseInt(testId as string));
      
             if (response.success) {
         setQuestions(response.data);
         
         // Reset current question index if it's out of bounds
         if (currentQuestionIndex >= response.data.length) {
           setCurrentQuestionIndex(0);
         }
         
         // Initialize user answers
         const initialAnswers = new Map<number, UserAnswer>();
         response.data.forEach(question => {
           if (question) { // Safety check
             initialAnswers.set(question.id, {
               questionId: question.id,
               selectedOption: null,
               isAnswered: false,
             });
           }
         });
         setUserAnswers(initialAnswers);
       } else {
         setError('Failed to fetch questions');
       }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = async () => {
    console.log('🚀 handleStartTest called');
    console.log('📊 Test ID:', testId);
    console.log('👤 Student ID:', studentId);
    console.log('🎯 Token:', token ? 'Present' : 'Missing');
    console.log('🔑 Token value:', token);
    console.log('👤 Student ID value:', studentId);
    
    if (!token || !studentId) {
      console.log('❌ Missing token or studentId in handleStartTest');
      Alert.alert('Error', 'User not logged in. Please log in to start the test.');
      return;
    }

    try {
      setLoading(true);
      console.log('🌐 Calling startTest API...');
      console.log('🌐 API endpoint:', `/test-submissions/start/${testId}`);
      console.log('🌐 Token being sent:', token);
      
      const response = await apiService.startTest(parseInt(testId as string), token);
      console.log('✅ startTest API response:', response);
      
      if (response.success) {
        const newSubmissionId = response.data.submission_id;
        console.log('📝 New submission ID:', newSubmissionId);
        console.log('📝 Response data:', response.data);
        console.log('📝 About to set submission ID in state...');
        setSubmissionId(newSubmissionId);
        console.log('📝 Submission ID set in state');
        setShowDisclaimer(false);
        setTestStarted(true);
        console.log('🎉 Test started successfully!');
        console.log('📝 Final submission ID in state:', newSubmissionId);
      } else {
        console.error('❌ startTest API error:', response.message);
        Alert.alert('Error', response.message || 'Failed to start test. Please try again.');
      }
    } catch (err) {
      console.error('💥 Error starting test:', err);
      Alert.alert('Error', 'Failed to connect to server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option: 'a' | 'b' | 'c' | 'd') => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Safety check to ensure current question exists
    if (!currentQuestion) {
      console.error('Current question is undefined');
      return;
    }
    
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption: option,
      isAnswered: true,
    };
    
    const newAnswers = new Map(userAnswers);
    newAnswers.set(currentQuestion.id, newAnswer);
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (questions.length > 0 && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    console.log('🔘 Submit button pressed!');
    console.log('🔔 handleSubmitTest called');
    console.log('📊 Current submission ID:', submissionId);
    console.log('👤 Current student ID:', studentId);
    console.log('🎯 Current token:', token ? 'Present' : 'Missing');
    console.log('📝 Current user answers:', userAnswers);
    console.log('❓ Questions count:', questions.length);
    
    // Show custom confirmation modal instead of Alert
    setShowSubmitConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    console.log('✅ User confirmed test submission via custom modal');
    console.log('🚀 About to call submitTest function');
    console.log('📊 Using submission ID:', submissionId);
    console.log('🔑 Using token:', token ? 'Present' : 'Missing');
    console.log('👤 Using student ID:', studentId);
    
    setShowSubmitConfirmation(false);
    
    try {
      console.log('⏰ Calling submitTest...');
      submitTest();
      console.log('✅ submitTest function called successfully');
    } catch (error) {
      console.error('❌ Error calling submitTest:', error);
    }
  };

  const handleCancelSubmit = () => {
    console.log('❌ User cancelled test submission');
    setShowSubmitConfirmation(false);
  };

  const submitTest = async () => {
    console.log('🚀 submitTest function called');
    console.log('🚀 submitTest function execution started');
    console.log('🔑 Token available:', !!token);
    console.log('👤 Student ID available:', !!studentId);
    console.log('📊 Submission ID available:', !!submissionId);
    console.log('🔑 Token value:', token);
    console.log('👤 Student ID value:', studentId);
    console.log('📊 Submission ID value:', submissionId);
    
    if (!token || !studentId) {
      console.log('❌ Missing token or studentId');
      Alert.alert('Error', 'User not logged in. Please log in to submit the test.');
      return;
    }

    if (!submissionId) {
      console.log('❌ Missing submission ID');
      Alert.alert('Error', 'Test session not found. Please restart the test.');
      return;
    }

    try {
      console.log('🚀 Starting test submission...');
      console.log('📊 Submission ID:', submissionId);
      console.log('👤 Student ID:', studentId);
      console.log('🎯 Token:', token ? 'Present' : 'Missing');
      
      setIsLoadingResult(true);
      
      // Convert userAnswers to the format expected by the API
      const answers = Array.from(userAnswers.values())
        .filter(answer => answer.selectedOption !== null) // Only include answered questions
        .map(answer => ({
          question_id: answer.questionId,
          selected_option: answer.selectedOption || ''
        }));

      console.log('📝 Formatted answers:', answers);
      console.log('📊 Total answers to submit:', answers.length);

      if (answers.length === 0) {
        console.log('❌ No answers to submit');
        Alert.alert('No Answers', 'Please answer at least one question before submitting.');
        setIsLoadingResult(false);
        return;
      }

      console.log('🌐 Calling submitTest API...');
      console.log('🌐 API endpoint:', `/test-submissions/submit/${submissionId}`);
      console.log('🌐 Request body:', { answers });
      console.log('🌐 About to call apiService.submitTest...');
      
      let response;
      try {
        console.log('🌐 Making API call to submitTest...');
        response = await apiService.submitTest(submissionId, answers, token);
        console.log('✅ API Response:', response);
      } catch (apiError) {
        console.error('❌ API call failed:', apiError);
        throw apiError;
      }

      if (response.success) {
        console.log('🎉 Test submitted successfully!');
        
        // Calculate results locally for now
        let correctAnswers = 0;
        let totalMarks = 0;
        
        questions.forEach(question => {
          if (!question) return; // Skip if question is undefined
          
          const userAnswer = userAnswers.get(question.id);
          if (userAnswer?.selectedOption === question.correct_option) {
            correctAnswers++;
            totalMarks += question.marks;
          }
        });
        
        console.log('📊 Calculated results:', { correctAnswers, totalMarks });
        
        setTestResult({ correctAnswers, totalMarks });
        setIsTestSubmitted(true);
      } else {
        console.error('❌ API returned error:', response.message);
        Alert.alert('Submission Failed', response.message || 'Failed to submit test. Please try again.');
      }
    } catch (err) {
      console.error('💥 Error submitting test:', err);
      Alert.alert(
        'Submission Failed', 
        err instanceof Error ? err.message : 'Failed to connect to server or submit test. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoadingResult(false);
    }
  };

  const getAnsweredCount = () => {
    let count = 0;
    userAnswers.forEach(answer => {
      if (answer.isAnswered) count++;
    });
    return count;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading test questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchQuestions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showDisclaimer) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        
        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerHeader}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.disclaimerTitle}>Test Instructions</Text>
          </View>

          <ScrollView style={styles.disclaimerContent} showsVerticalScrollIndicator={false}>
            <View style={styles.testInfoCard}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.testInfoGradient}
              >
                <Text style={styles.testInfoTitle}>{testTitle}</Text>
                <View style={styles.testInfoStats}>
                  <View style={styles.testInfoStatItem}>
                    <MaterialIcons name="schedule" size={20} color="#FFF" />
                    <Text style={styles.statText}>{testDuration} minutes</Text>
                  </View>
                  <View style={styles.testInfoStatItem}>
                    <FontAwesome name="star" size={20} color="#FFF" />
                    <Text style={styles.statText}>{testMarks} marks</Text>
                  </View>
                  <View style={styles.testInfoStatItem}>
                    <FontAwesome name="question-circle" size={20} color="#FFF" />
                    <Text style={styles.statText}>{questions.length} questions</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>📋 Important Instructions</Text>
              
              <View style={styles.instruction}>
                <Text style={styles.instructionNumber}>1.</Text>
                <Text style={styles.instructionText}>
                  This test contains <Text style={styles.bold}>{questions.length} multiple choice questions</Text>.
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <Text style={styles.instructionNumber}>2.</Text>
                <Text style={styles.instructionText}>
                  You have <Text style={styles.bold}>{testDuration} minutes</Text> to complete the test.
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <Text style={styles.instructionNumber}>3.</Text>
                <Text style={styles.instructionText}>
                  Each question has only <Text style={styles.bold}>one correct answer</Text>.
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <Text style={styles.instructionNumber}>4.</Text>
                <Text style={styles.instructionText}>
                  You can navigate between questions using <Text style={styles.bold}>Next</Text> and <Text style={styles.bold}>Previous</Text> buttons.
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <Text style={styles.instructionNumber}>5.</Text>
                <Text style={styles.instructionText}>
                  The test will <Text style={styles.bold}>auto-submit</Text> when time runs out.
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <Text style={styles.instructionNumber}>6.</Text>
                <Text style={styles.instructionText}>
                  Make sure you have a <Text style={styles.bold}>stable internet connection</Text>.
                </Text>
              </View>

              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Once you start the test, the timer cannot be paused. Make sure you're ready!
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.startButtonContainer}>
            <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
              <LinearGradient
                colors={[COLORS.success, '#2E7D32']}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Start Test</Text>
                <Feather name="play" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Check if we have questions and current question exists
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>No questions available...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Check if current question exists
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Question not found. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchQuestions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentAnswer = userAnswers.get(currentQuestion.id);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header with timer */}
      <View style={styles.testHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            Alert.alert(
              'Exit Test',
              'Are you sure you want to exit? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', onPress: () => router.back() }
              ]
            );
          }}
        >
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.questionCounter}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <Text style={styles.progressText}>
            {getAnsweredCount()}/{questions.length} answered
          </Text>
        </View>
        
        <View style={[styles.timer, timeRemaining < 300 && styles.timerWarning]}>
          <MaterialIcons 
            name="timer" 
            size={20} 
            color={timeRemaining < 300 ? COLORS.danger : COLORS.primary} 
          />
          <Text style={[styles.timerText, timeRemaining < 300 && styles.timerTextWarning]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>

      {/* Question content */}
      <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Q{currentQuestionIndex + 1}</Text>
            <Text style={styles.questionMarks}>{currentQuestion.marks} marks</Text>
          </View>
          
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          
          {currentQuestion.question_image && (
            <Image 
              source={{ uri: `https://appapi.ddabattalion.com${currentQuestion.question_image}` }}
              style={styles.questionImage}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {['a', 'b', 'c', 'd'].map((option) => {
            const isSelected = currentAnswer?.selectedOption === option;
            const optionText = currentQuestion[`option_${option}` as keyof Question] as string;
            const optionImage = currentQuestion[`option_${option}_image` as keyof Question] as string | null;
            
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                onPress={() => handleAnswerSelect(option as 'a' | 'b' | 'c' | 'd')}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.optionCircle, isSelected && styles.optionCircleSelected]}>
                    <Text style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                      {option.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {optionText}
                    </Text>
                    {optionImage && (
                      <Image 
                        source={{ uri: `https://appapi.ddabattalion.com${optionImage}` }}
                        style={styles.optionImage}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Feather name="chevron-left" size={20} color={currentQuestionIndex === 0 ? COLORS.muted : COLORS.primary} />
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={() => {
              console.log('🔘 Submit button pressed!');
              console.log('🔘 Button onPress event triggered');
              handleSubmitTest();
            }}
          >
            <LinearGradient
              colors={[COLORS.success, '#2E7D32']}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>Submit Test</Text>
              <Feather name="check" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleNextQuestion}>
            <Text style={styles.navButtonText}>Next</Text>
            <Feather name="chevron-right" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Result Modal */}
      <Modal
        visible={isTestSubmitted}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsTestSubmitted(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modernModal}>
            {/* Success Icon */}
            <View style={styles.modernSuccessIcon}>
              <View style={styles.modernIconCircle}>
                <MaterialIcons name="check" size={32} color="#FFF" />
              </View>
            </View>
            
            {/* Success Message */}
            <Text style={styles.modernTitle}>Test Submitted!</Text>
            <Text style={styles.modernMessage}>
              Your test has been submitted successfully. Your result will be declared soon.
            </Text>
            
            {/* Action Button */}
            <TouchableOpacity
              style={styles.modernButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.modernButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitConfirmation}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelSubmit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Submission</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to submit your test? This action cannot be undone.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleConfirmSubmit}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleCancelSubmit}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Disclaimer styles
  disclaimerContainer: {
    flex: 1,
    padding: 20,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  disclaimerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 16,
  },
  disclaimerContent: {
    flex: 1,
  },
  testInfoCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  testInfoGradient: {
    padding: 20,
  },
  testInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  testInfoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testInfoStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  instructionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  instruction: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
    minWidth: 20,
  },
  instructionText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  startButtonContainer: {
    paddingTop: 20,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  
  // Test interface styles
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerWarning: {
    backgroundColor: '#FFEBEE',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 6,
  },
  timerTextWarning: {
    color: COLORS.danger,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  questionMarks: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 26,
  },
  questionImage: {
    width: '100%',
    height: 200,
    marginTop: 16,
    borderRadius: 8,
  },
  
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.muted,
  },
  optionLetterSelected: {
    color: '#FFF',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  optionImage: {
    width: '100%',
    height: 100,
    marginTop: 8,
    borderRadius: 8,
  },
  
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  navButtonDisabled: {
    borderColor: COLORS.muted,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  navButtonTextDisabled: {
    color: COLORS.muted,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 18,
    color: COLORS.muted,
    marginBottom: 24,
  },
  modalLoadingIndicator: {
    marginTop: 20,
  },
  modalButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Result stats styles
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  debugInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#333',
  },

  // New styles for congratulations modal
  congratulationsModal: {
    width: '90%',
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  congratulationsGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    position: 'relative',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  congratulationsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  congratulationsSubtitle: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  resultsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  resultCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  resultCardGradient: {
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  homeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  homeButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  viewResultsButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  viewResultsButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  viewResultsButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  decorativeElements: {
    flexDirection: 'row',
    marginTop: 20,
  },
  decorativeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  
  // Modern Modal Styles
  modernModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  modernSuccessIcon: {
    marginBottom: 24,
  },
  modernIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modernTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  modernMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  modernButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestScreen;
