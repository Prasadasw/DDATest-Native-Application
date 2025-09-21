// API Configuration
export const API_CONFIG = {
  // For development (when running on localhost)
  BASE_URL: 'https://api.ddabattalion.com/api',
  
  // For production (replace with your actual production URL)
  // BASE_URL: 'https://your-production-domain.com/api',
  
  // For Android emulator (if localhost doesn't work)
  // BASE_URL: 'http://10.0.2.2:5000/api',
  
  // For iOS simulator (if localhost doesn't work)
  // BASE_URL: 'http://127.0.0.1:5000/api',
};

export const API_ENDPOINTS = {
  STUDENT_PROFILE: '/students/profile',
  STUDENT_LOGIN: '/students/login',
  STUDENT_REGISTER: '/students/register',
  GET_ALL_STUDENTS: '/students',
  
  // Program endpoints
  PROGRAMS: '/programs',
  
  // Test endpoints
  TESTS: '/tests',
  TESTS_AVAILABLE: '/tests/available',
  TESTS_BY_PROGRAM: '/tests/program',
  
  // Enrollment endpoints
  ENROLLMENT_REQUEST: '/enrollments/request',
  ENROLLMENT_MY_REQUESTS: '/enrollments/my-requests',
  ENROLLMENT_CHECK_ACCESS: '/enrollments/check-access',
  
  // Question endpoints
  QUESTIONS_BY_TEST: '/questions/test',
  
  // Test submission endpoints
  TEST_SUBMISSION_START: '/test-submissions/start',
  TEST_SUBMISSION_SUBMIT: '/test-submissions/submit',
  TEST_SUBMISSION_STATUS: '/test-submissions/status',
  TEST_SUBMISSION_ANSWERS: '/test-submissions/answers',
  
  // Test results endpoints
  TEST_RESULTS: '/test-submissions/my-results',
  
  // Completed tests endpoints
  COMPLETED_TESTS: '/students/completed-tests',
  
  // Enquiry endpoints
  ENQUIRIES: '/enquiries',
};
