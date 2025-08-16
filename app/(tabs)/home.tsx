import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Image,
  Modal
} from "react-native";
import BottomNavigation from "../../components/BottomNavigation";
import EducationScreen from "../../components/EducationScreen";
import ProfileScreen from "../../components/ProfileScreen";
import { apiService, Program, Test } from "../../services/api";

const { width } = Dimensions.get("window");

// Modern color palette
const COLORS = {
  primary: "#6366f1",
  secondary: "#4f46e5",
  accent: "#06b6d4",
  background: "#f8fafc",
  card: "#ffffff",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  dark: "#0f172a",
  light: "#f1f5f9",
};

// Icons - Using valid FontAwesome icon names
const ICONS = {
  home: "home" as const,
  learn: "book" as const,
  progress: "bar-chart" as const,
  profile: "user" as const,
  search: "search" as const,
  bell: "bell" as const,
  star: "star" as const,
  medal: "certificate" as const,
  trophy: "trophy" as const,
  book: "book" as const,
  video: "play-circle" as const,
  clock: "clock-o" as const,
  users: "users" as const,
  award: "certificate" as const,
  chevronRight: "chevron-right" as const,
};

interface StreamItem {
  id: string;
  name: string;
  icon: keyof typeof ICONS;
  gradient: string[];
  description: string;
  courses: number;
}

interface CourseItem {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
}

interface PromotionItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof ICONS;
  color: string;
}

interface EducationItem {
  id: string;
  title: string;
  type: string;
  icon: keyof typeof ICONS;
}

interface AcademyCard {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  backgroundImage: any;
}

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'home' | 'education' | 'profile'>('home');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allTests, setAllTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enquiryModalVisible, setEnquiryModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Academy cards data
  const academyCards: AcademyCard[] = [
    {
      id: '1',
      title: "India's Best NDA Academy",
      description: "We have the India's best institute of NDA academy",
      buttonText: "Enquire Now",
      backgroundImage: require('../../assets/Nda.jpg'),
    },
    {
      id: '2',
      title: "Scholarship Program",
      description: "We also run the scholarship program",
      buttonText: "Enquire Now",
      backgroundImage: require('../../assets/scollership.jpg'),
    },
  ];
  
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const router = useRouter();

  // Fetch programs from API
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both programs and tests
      const [programsResponse, testsResponse] = await Promise.all([
        apiService.getPrograms(),
        apiService.getAllTests()
      ]);
      
      if (programsResponse.success) {
        setPrograms(programsResponse.data);
      } else {
        setError('Failed to fetch programs');
      }

      if (testsResponse.success) {
        setAllTests(testsResponse.data);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Map program names to gradients and icons
  const getProgramGradient = (programName: string): [string, string] => {
    const name = programName.toLowerCase();
    if (name.includes('nda')) return ["#f97316", "#ea580c"];
    if (name.includes('ssp')) return ["#10b981", "#059669"];
    if (name.includes('scholarship')) return ["#8b5cf6", "#7c3aed"];
    return ["#6366f1", "#4f46e5"]; // default gradient
  };

  const getProgramIcon = (programName: string): keyof typeof ICONS => {
    const name = programName.toLowerCase();
    if (name.includes('nda')) return "medal";
    if (name.includes('ssp')) return "trophy";
    if (name.includes('scholarship')) return "award";
    return "book"; // default icon
  };

  // Helper function to count tests per program
  const getTestCountForProgram = (programId: number): number => {
    return allTests.filter(test => test.program_id === programId && test.status).length;
  };

  // Convert API programs to StreamItem format
  const streams: StreamItem[] = programs.map((program) => ({
    id: program.id.toString(),
    name: program.name,
    icon: getProgramIcon(program.name),
    gradient: getProgramGradient(program.name),
    description: program.description || `${program.name} Program`,
    courses: getTestCountForProgram(program.id),
  }));

  // Fallback hardcoded streams (for when API is not available or loading)
  const fallbackStreams: StreamItem[] = [
    {
      id: '1',
      name: "NDA",
      icon: "medal",
      gradient: ["#f97316", "#ea580c"],
      description: "National Defence Academy",
      courses: 24,
    },
    {
      id: '2',
      name: "SSP",
      icon: "trophy",
      gradient: ["#10b981", "#059669"],
      description: "Sainik School Preparation",
      courses: 18,
    },
    {
      id: '3',
      name: "Scholarship",
      icon: "award",
      gradient: ["#8b5cf6", "#7c3aed"],
      description: "Competitive Scholarships",
      courses: 12,
    },
    {
      id: '4',
      name: "Other",
      icon: "book",
      gradient: ["#6366f1", "#4f46e5"],
      description: "Additional Courses",
      courses: 8,
    },
  ];

  // Use API data if available, otherwise use fallback
  const displayStreams = streams.length > 0 ? streams : fallbackStreams;

  const recommendedCourses: CourseItem[] = [
    {
      id: '1',
      title: "NDA Mathematics Crash Course",
      instructor: "Capt. R. Sharma",
      rating: 4.8,
      students: 1245,
      duration: "12 hours",
    },
    {
      id: '2',
      title: "SSP Interview Techniques",
      instructor: "Col. A. Singh",
      rating: 4.9,
      students: 876,
      duration: "8 hours",
    },
    {
      id: '3',
      title: "Scholarship English Mastery",
      instructor: "Dr. S. Patel",
      rating: 4.7,
      students: 1562,
      duration: "15 hours",
    },
  ];

  const promotions: PromotionItem[] = [
    {
      id: '1',
      title: "Premium Membership",
      description: "Unlock all courses and features",
      icon: "star",
      color: "#f59e0b",
    },
    {
      id: '2',
      title: "Referral Bonus",
      description: "Earn credits for each friend",
      icon: "users",
      color: "#06b6d4",
    },
    {
      id: '3',
      title: "Weekly Challenge",
      description: "Test your knowledge",
      icon: "trophy",
      color: "#ef4444",
    },
  ];

  const educationalContent: EducationItem[] = [
    {
      id: '1',
      title: "Defence Career Guide",
      type: "ebook",
      icon: "book",
    },
    {
      id: '2',
      title: "Success Stories",
      type: "video",
      icon: "video",
    },
    {
      id: '3',
      title: "Study Tips",
      type: "article",
      icon: "book",
    },
  ];

  const renderStreamCard = ({ item, index }: { item: StreamItem; index: number }) => {
    const scaleValue = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    };

    const handlePress = () => {
      router.push({
        pathname: '/program-tests',
        params: {
          programId: item.id,
          programName: item.name,
          programDescription: item.description,
        },
      });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
      >
        <Animated.View
          style={[
            styles.streamCard,
            {
              transform: [{ scale: scaleValue }],
              marginLeft: index === 0 ? 20 : 0,
            },
          ]}
        >
          <LinearGradient
            colors={item.gradient as [string, string]}
            style={styles.streamGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.streamIconContainer}>
              <FontAwesome name={ICONS[item.icon]} size={28} color="#FFF" />
            </View>
            <Text style={styles.streamText}>{item.name}</Text>
            <Text style={styles.streamDescription}>{item.description}</Text>
            <View style={styles.courseCount}>
              <Text style={styles.courseCountText}>
                {item.courses} {item.courses === 1 ? 'Test' : 'Tests'}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderCourseCard = ({ item }: { item: CourseItem }) => (
    <TouchableOpacity style={styles.courseCard}>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.courseInstructor}>{item.instructor}</Text>
        <View style={styles.courseMeta}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.courseStudents}>({item.students})</Text>
          <Text style={styles.courseDuration}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPromotionCard = ({ item }: { item: PromotionItem }) => (
    <View style={[styles.promotionCard, { borderLeftColor: item.color }]}>
      <View style={styles.promotionIconContainer}>
        <FontAwesome name={ICONS[item.icon]} size={20} color={item.color} />
      </View>
      <View style={styles.promotionContent}>
        <Text style={styles.promotionTitle}>{item.title}</Text>
        <Text style={styles.promotionDescription}>{item.description}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={COLORS.muted} />
    </View>
  );

  const renderEducationCard = ({ item }: { item: EducationItem }) => (
    <View style={styles.educationCard}>
      <View style={styles.educationIcon}>
        <Feather name={ICONS[item.icon] as any} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.educationContent}>
        <Text style={styles.educationTitle}>{item.title}</Text>
        <Text style={styles.educationType}>{item.type}</Text>
      </View>
    </View>
  );

  const renderAcademyCard = ({ item }: { item: AcademyCard }) => (
    <View style={styles.academyCard}>
      <Image source={item.backgroundImage} style={styles.academyBackground} />
      <View style={styles.academyOverlay}>
        <View style={styles.academyContent}>
          <Text style={styles.academyTitle}>{item.title}</Text>
          <Text style={styles.academyDescription}>{item.description}</Text>
          <TouchableOpacity 
            style={styles.academyButton}
            onPress={() => {
              setSelectedProgram(item.title);
              setEnquiryModalVisible(true);
            }}
          >
            <Text style={styles.academyButtonText}>{item.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHomeContent = () => (
    <>
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: opacity,
          },
        ]}
      >
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            <FontAwesome name="user" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.userName}>Prasad Aswar</Text>
            <Text style={styles.userStatus}>Premium Member</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <View style={styles.notificationBadge} />
          <FontAwesome name="bell" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, streams..."
            placeholderTextColor={COLORS.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.searchButtonGradient}
            >
              <FontAwesome name="search" size={16} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Streams Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Programs</Text>
            <TouchableOpacity onPress={fetchPrograms} style={styles.refreshButton}>
              <MaterialIcons name="refresh" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading programs...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchPrograms}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={displayStreams}
              renderItem={renderStreamCard}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.streamList}
            />
          )}
        </View>

        {/* Academy Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Programs</Text>
          </View>
          <FlatList
            data={academyCards}
            renderItem={renderAcademyCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.academyList}
          />
        </View>

        {/* Recommended Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recommendedCourses}
            renderItem={renderCourseCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.courseList}
          />
        </View>

        {/* Promotions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Promotions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={promotions}
            renderItem={renderPromotionCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Educational Resources */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Educational Resources</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={educationalContent}
            renderItem={renderEducationCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Ads Section */}
        <View style={styles.adBanner}>
          <Text style={styles.adText}>Advertisement</Text>
          <View style={styles.adContent}>
            <Text style={styles.adTitle}>Premium Learning Experience</Text>
            <Text style={styles.adDescription}>Upgrade now for exclusive content</Text>
            <TouchableOpacity style={styles.adButton}>
              <Text style={styles.adButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'education':
        return <EducationScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return renderHomeContent();
    }
  };

  const handleTabPress = (tab: 'home' | 'education' | 'profile') => {
    setActiveTab(tab);
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
        program_name: selectedProgram
      });

      if (response.success) {
        // Close modal immediately on success
        setEnquiryModalVisible(false);
        setEnquiryForm({ name: '', mobile: '', email: '', message: '' });
        
        // Show success message
        Alert.alert(
          'Success!', 
          `Thank you for your enquiry about ${selectedProgram}. We'll get back to you soon!`,
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

  return (
    <View style={styles.container}>
      {renderContent()}
      
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
              <Text style={styles.modalTitle}>Enquire About {selectedProgram}</Text>
              <TouchableOpacity onPress={closeEnquiryModal} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color={COLORS.muted} />
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
      
      <BottomNavigation 
        activeTab={activeTab} 
        onTabPress={handleTabPress} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 44,
    zIndex: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileTextContainer: {
    flex: 1,
  },
  userName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 1,
  },
  userStatus: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "500",
  },
  notificationButton: {
    position: "relative",
    padding: 6,
    backgroundColor: COLORS.light,
    borderRadius: 10,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.danger,
    zIndex: 1,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 100,
    marginBottom: 24,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingHorizontal: 20,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchButton: {
    position: "absolute",
    right: 4,
  },
  searchButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  refreshButton: {
    padding: 8,
    backgroundColor: COLORS.light,
    borderRadius: 12,
  },
  streamList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  streamCard: {
    width: 160,
    height: 180,
    borderRadius: 20,
    marginRight: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  streamGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  streamIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  streamText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  streamDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  courseCount: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  courseCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  courseList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  courseCard: {
    width: 220,
    marginRight: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  courseInstructor: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  courseStudents: {
    color: COLORS.muted,
    fontSize: 12,
    marginRight: 8,
  },
  courseDuration: {
    color: COLORS.muted,
    fontSize: 12,
  },
  promotionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  promotionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  promotionContent: {
    flex: 1,
  },
  promotionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  promotionDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  educationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  educationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  educationContent: {
    flex: 1,
  },
  educationTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  educationType: {
    color: COLORS.muted,
    fontSize: 14,
  },
  adBanner: {
    backgroundColor: COLORS.card,
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adText: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  adContent: {
    alignItems: 'center',
  },
  adTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  adDescription: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  adButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  adButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Loading and Error states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
  // Academy carousel styles
  academyList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  academyCard: {
    width: 280,
    height: 200,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  academyBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  academyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  academyContent: {
    alignItems: 'flex-start',
  },
  academyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  academyDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  academyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  academyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: COLORS.card,
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
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.light,
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
    color: COLORS.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
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

export default HomeScreen;