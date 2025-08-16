import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

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

interface NDACourse {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  price: string;
  level: string;
  description: string;
}

const NDAScreen = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<NDACourse | null>(null);

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'english', name: 'English' },
    { id: 'gk', name: 'General Knowledge' },
    { id: 'science', name: 'Science' },
  ];

  const ndaCourses: NDACourse[] = [
    {
      id: '1',
      title: "NDA Mathematics Crash Course",
      instructor: "Capt. R. Sharma",
      rating: 4.8,
      students: 1245,
      duration: "12 hours",
      price: "₹2,999",
      level: "Beginner",
      description: "Complete mathematics preparation for NDA entrance exam"
    },
    {
      id: '2',
      title: "NDA English Mastery",
      instructor: "Dr. S. Patel",
      rating: 4.7,
      students: 892,
      duration: "8 hours",
      price: "₹1,999",
      level: "Intermediate",
      description: "Comprehensive English preparation for NDA"
    },
    {
      id: '3',
      title: "NDA General Knowledge",
      instructor: "Col. A. Singh",
      rating: 4.9,
      students: 1567,
      duration: "10 hours",
      price: "₹2,499",
      level: "All Levels",
      description: "Current affairs and GK for NDA exam"
    },
    {
      id: '4',
      title: "NDA Science & Technology",
      instructor: "Prof. M. Kumar",
      rating: 4.6,
      students: 734,
      duration: "6 hours",
      price: "₹1,799",
      level: "Intermediate",
      description: "Science and technology concepts for NDA"
    },
  ];

  const renderCourseCard = ({ item }: { item: NDACourse }) => (
    <TouchableOpacity style={styles.courseCard}>
      <LinearGradient
        colors={["#FF7E5F", "#FEB47B"]}
        style={styles.courseHeader}
      >
        <Text style={styles.courseLevel}>{item.level}</Text>
        <Text style={styles.coursePrice}>{item.price}</Text>
      </LinearGradient>
      
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.courseInstructor}>{item.instructor}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.courseMeta}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.studentsText}>({item.students})</Text>
          </View>
          <View style={styles.durationContainer}>
            <Feather name="clock" size={14} color={COLORS.muted} />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.enrollButton}
          onPress={() => {
            setSelectedCourse(item);
            setShowEnrollModal(true);
          }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.enrollGradient}
          >
            <Text style={styles.enrollText}>Enroll Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.categoryTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#FF7E5F", "#FEB47B"]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>NDA Courses</Text>
          <Text style={styles.headerSubtitle}>National Defence Academy Preparation</Text>
        </View>
        
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Total Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>15K+</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryButton}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Courses */}
        <View style={styles.coursesContainer}>
          <Text style={styles.sectionTitle}>Available Courses</Text>
          <FlatList
            data={ndaCourses}
            renderItem={renderCourseCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Enrollment Modal */}
      <Modal
        visible={showEnrollModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEnrollModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#FF7E5F", "#FEB47B"]}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <MaterialIcons name="school" size={32} color="#FFF" />
                <Text style={styles.modalTitle}>Course Enrollment</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowEnrollModal(false)}
              >
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <View style={styles.successIcon}>
                  <Feather name="check-circle" size={48} color={COLORS.success} />
                </View>
              </View>

              <Text style={styles.modalCourseTitle}>
                {selectedCourse?.title}
              </Text>

              <Text style={styles.modalMessage}>
                🎉 Excellent choice! You've selected "{selectedCourse?.title}" for enrollment.
              </Text>

              <Text style={styles.modalDescription}>
                Our dedicated team will contact you within 24 hours to discuss your enrollment details, payment options, and answer any questions you may have about the course.
              </Text>

              <View style={styles.modalInfoContainer}>
                <View style={styles.modalInfoItem}>
                  <Feather name="phone" size={16} color={COLORS.primary} />
                  <Text style={styles.modalInfoText}>We'll call you soon</Text>
                </View>
                <View style={styles.modalInfoItem}>
                  <Feather name="mail" size={16} color={COLORS.primary} />
                  <Text style={styles.modalInfoText}>Email confirmation sent</Text>
                </View>
                <View style={styles.modalInfoItem}>
                  <Feather name="clock" size={16} color={COLORS.primary} />
                  <Text style={styles.modalInfoText}>24-hour response time</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowEnrollModal(false)}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>Got it, Thanks!</Text>
                </LinearGradient>
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  categoriesContainer: {
    marginVertical: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  coursesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  courseLevel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coursePrice: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  courseContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 4,
  },
  studentsText: {
    fontSize: 12,
    color: COLORS.muted,
    marginLeft: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: COLORS.muted,
    marginLeft: 4,
  },
  enrollButton: {
    alignSelf: 'stretch',
  },
  enrollGradient: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrollText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    margin: 20,
    maxWidth: 400,
    width: '90%',
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(75, 181, 67, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCourseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalInfoContainer: {
    width: '100%',
    marginBottom: 24,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  modalButton: {
    width: '100%',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NDAScreen; 