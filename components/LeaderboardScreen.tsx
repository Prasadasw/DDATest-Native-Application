import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Student {
  id: number;
  name: string;
  rank: number;
  score: number;
  avatar: any;
  country: string;
  countryFlag: string;
  testsTaken: number;
  accuracy: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'allTime'>('weekly');

  // Dummy data for top 3 students with more engaging details
  const topStudents: Student[] = [
    // {
    //   id: 1,
    //   name: "Davis Curtis",
    //   rank: 1,
    //   score: 2569,
    //   avatar: require('../assets/icons/user.png'),
    //   country: "Portugal",
    //   countryFlag: "🇵🇹",
    //   testsTaken: 45,
    //   accuracy: 94
    // },
    // {
    //   id: 2,
    //   name: "Alena Donin",
    //   rank: 2,
    //   score: 1469,
    //   avatar: require('../assets/icons/user.png'),
    //   country: "France",
    //   countryFlag: "🇫🇷",
    //   testsTaken: 38,
    //   accuracy: 91
    // },
    // {
    //   id: 3,
    //   name: "Craig Gouse",
    //   rank: 3,
    //   score: 1053,
    //   avatar: require('../assets/icons/user.png'),
    //   country: "Canada",
    //   countryFlag: "🇨🇦",
    //   testsTaken: 32,
    //   accuracy: 89
    // }
  ];

  // Dummy data for remaining students (4-10)
  const remainingStudents: Student[] = [
    {
      id: 4,
      name: "Madelyn Dias",
      rank: 4,
      score: 590,
      avatar: require('../assets/icons/user.png'),
      country: "India",
      countryFlag: "🇮🇳",
      testsTaken: 28,
      accuracy: 87
    },
    {
      id: 5,
      name: "Zain Vaccaro",
      rank: 5,
      score: 487,
      avatar: require('../assets/icons/user.png'),
      country: "USA",
      countryFlag: "🇺🇸",
      testsTaken: 25,
      accuracy: 85
    },
    {
      id: 6,
      name: "Sarah Johnson",
      rank: 6,
      score: 423,
      avatar: require('../assets/icons/user.png'),
      country: "UK",
      countryFlag: "🇬🇧",
      testsTaken: 22,
      accuracy: 83
    },
    {
      id: 7,
      name: "Michael Chen",
      rank: 7,
      score: 398,
      avatar: require('../assets/icons/user.png'),
      country: "China",
      countryFlag: "🇨🇳",
      testsTaken: 20,
      accuracy: 81
    },
    {
      id: 8,
      name: "Emma Wilson",
      rank: 8,
      score: 356,
      avatar: require('../assets/icons/user.png'),
      country: "Australia",
      countryFlag: "🇦🇺",
      testsTaken: 18,
      accuracy: 79
    },
    {
      id: 9,
      name: "Alex Rodriguez",
      rank: 9,
      score: 312,
      avatar: require('../assets/icons/user.png'),
      country: "Spain",
      countryFlag: "🇪🇸",
      testsTaken: 16,
      accuracy: 77
    },
    {
      id: 10,
      name: "Lisa Thompson",
      rank: 10,
      score: 289,
      avatar: require('../assets/icons/user.png'),
      country: "Germany",
      countryFlag: "🇩🇪",
      testsTaken: 15,
      accuracy: 75
    }
  ];

  // Achievements to motivate students
  const achievements: Achievement[] = [
    {
      id: 1,
      title: "First Test",
      description: "Complete your first test",
      icon: "🎯",
      color: "#10B981",
      unlocked: true
    },
    {
      id: 2,
      title: "Streak Master",
      description: "Take tests for 7 days in a row",
      icon: "🔥",
      color: "#F59E0B",
      unlocked: false
    },
    {
      id: 3,
      title: "Accuracy King",
      description: "Achieve 95% accuracy in any test",
      icon: "👑",
      color: "#8B5CF6",
      unlocked: false
    },
    {
      id: 4,
      title: "Speed Demon",
      description: "Complete a test in under 10 minutes",
      icon: "⚡",
      color: "#EF4444",
      unlocked: false
    }
  ];

  const renderTopStudent = (student: Student, index: number) => {
    const podiumHeights = [120, 100, 80];
    const podiumWidths = [100, 90, 80];
    
    return (
      <View key={student.id} style={styles.podiumItem}>
        {/* Crown for 1st place */}
        {student.rank === 1 && (
          <View style={styles.crownContainer}>
            <FontAwesome name="star" size={24} color="#FFD700" />
          </View>
        )}
        
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image source={student.avatar} style={styles.avatar} />
        </View>
        
        {/* Name */}
        <Text style={styles.studentName} numberOfLines={1}>
          {student.name}
        </Text>
        
        {/* Country flag */}
        <Text style={styles.countryFlag}>{student.countryFlag}</Text>
        
        {/* Score */}
        <Text style={styles.score}>
          {student.score.toLocaleString()} QP
        </Text>

        {/* Additional stats */}
        <View style={styles.studentStats}>
          <Text style={styles.statText}>{student.testsTaken} tests</Text>
          <Text style={styles.statText}>{student.accuracy}% accuracy</Text>
        </View>
        
        {/* Podium base */}
        <View style={[styles.podiumBase, { 
          height: podiumHeights[index], 
          width: podiumWidths[index] 
        }]}>
          <Text style={styles.podiumNumber}>{student.rank}</Text>
        </View>
      </View>
    );
  };

  const renderStudentItem = (student: Student) => (
    <View key={student.id} style={styles.studentItem}>
      <View style={styles.studentLeft}>
        <View style={styles.rankCircle}>
          <Text style={styles.rankText}>{student.rank}</Text>
        </View>
        <Image source={student.avatar} style={styles.studentAvatar} />
        <Text style={styles.countryFlagSmall}>{student.countryFlag}</Text>
      </View>
      <View style={styles.studentCenter}>
        <Text style={styles.studentNameSmall} numberOfLines={1}>
          {student.name}
        </Text>
        <View style={styles.studentDetails}>
          <Text style={styles.studentDetail}>{student.testsTaken} tests</Text>
          <Text style={styles.studentDetail}>•</Text>
          <Text style={styles.studentDetail}>{student.accuracy}% accuracy</Text>
        </View>
      </View>
      <View style={styles.studentRight}>
        <Text style={styles.studentScore}>{student.score} QP</Text>
      </View>
    </View>
  );

  const renderAchievement = (achievement: Achievement) => (
    <View key={achievement.id} style={[styles.achievementCard, { opacity: achievement.unlocked ? 1 : 0.5 }]}>
      <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
        <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
      </View>
      <View style={styles.achievementContent}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
      </View>
      {achievement.unlocked && (
        <View style={styles.unlockBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 Leaderboard </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Motivational Banner */}
        <View style={styles.motivationalBanner}>
          <View style={styles.motivationalContent}>
            <Text style={styles.motivationalTitle}>Ready to climb the ranks? 🚀</Text>
            <Text style={styles.motivationalSubtitle}>
              Take tests, earn points, and compete with students worldwide!
            </Text>
            <TouchableOpacity style={styles.startTestButton}>
              <Text style={styles.startTestButtonText}>Start Your First Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'weekly' && styles.activeTab]}
            onPress={() => setActiveTab('weekly')}
          >
            <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>
              📅 Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'allTime' && styles.activeTab]}
            onPress={() => setActiveTab('allTime')}
          >
            <Text style={[styles.tabText, activeTab === 'allTime' && styles.activeTabText]}>
              🏆 All Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Performance Banner */}
        <View style={styles.performanceBanner}>
          <View style={styles.performanceLeft}>
            <Text style={styles.performanceRank}>#4</Text>
            <Text style={styles.performanceSubtitle}>Your Current Rank</Text>
          </View>
          <View style={styles.performanceRight}>
            <Text style={styles.performanceText}>
              You're doing better than 60% of students! Keep going! 💪
            </Text>
            <TouchableOpacity style={styles.improveButton}>
              <Text style={styles.improveButtonText}>Improve Rank</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top 3 Podium */}
        <View style={styles.podiumContainer}>
          <View style={styles.podiumHeader}>
            <View style={styles.podiumTitleContainer}>
              <Text style={styles.podiumTitle}>🏅 Top Performers</Text>
              <Text style={styles.podiumSubtitle}>This week's champions</Text>
            </View>
            {/* <View style={styles.timeContainer}>
              <MaterialIcons name="access-time" size={20} color="#FFF" />
              <Text style={styles.timeRemaining}>06d 23h 00m</Text>
            </View> */}
          </View>
          
          <View style={styles.podium}>
            {topStudents.map((student, index) => renderTopStudent(student, index))}
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎖️ Achievements</Text>
            <Text style={styles.sectionSubtitle}>Unlock rewards by taking tests</Text>
          </View>
          {achievements.map(achievement => renderAchievement(achievement))}
        </View>

        {/* Remaining Students List */}
        {/* <View style={styles.studentsListContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 All Participants</Text>
            <Text style={styles.sectionSubtitle}>See where you stand among {remainingStudents.length + 3} students</Text>
          </View>
          {remainingStudents.map(student => renderStudentItem(student))}
        </View> */}

        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          {/* <Text style={styles.ctaTitle}>Ready to join the competition? 🚀</Text>
          <Text style={styles.ctaSubtitle}>
            Take tests, improve your skills, and climb the leaderboard!
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Start Learning Now</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  motivationalBanner: {
    backgroundColor: '#667EEA',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  motivationalContent: {
    alignItems: 'center',
  },
  motivationalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  startTestButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
  },
  startTestButtonText: {
    color: '#667EEA',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F4',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  activeTabText: {
    color: '#495057',
  },
  performanceBanner: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceLeft: {
    alignItems: 'center',
    marginRight: 20,
  },
  performanceRank: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  performanceSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  performanceRight: {
    flex: 1,
  },
  performanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
    lineHeight: 22,
  },
  improveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  improveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  podiumContainer: {
    backgroundColor: '#6F42C1',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    paddingBottom: 0,
  },
  podiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  podiumTitleContainer: {
    flex: 1,
  },
  podiumTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  podiumSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRemaining: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  podiumItem: {
    alignItems: 'center',
    position: 'relative',
  },
  crownContainer: {
    position: 'absolute',
    top: -30,
    zIndex: 10,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
  },
  studentName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    maxWidth: 80,
  },
  countryFlag: {
    fontSize: 16,
    marginBottom: 4,
  },
  score: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  studentStats: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  podiumBase: {
    backgroundColor: '#E9D5FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  podiumNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6F42C1',
  },
  achievementsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
  unlockBadge: {
    marginLeft: 12,
  },
  studentsListContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C757D',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F3F4',
    marginRight: 12,
  },
  countryFlagSmall: {
    fontSize: 14,
  },
  studentCenter: {
    flex: 1,
  },
  studentNameSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentDetail: {
    fontSize: 12,
    color: '#6C757D',
    marginRight: 8,
  },
  studentRight: {
    alignItems: 'flex-end',
  },
  studentScore: {
    fontSize: 16,
    color: '#6F42C1',
    fontWeight: '700',
  },
  ctaContainer: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#6F42C1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 2,
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LeaderboardScreen;
