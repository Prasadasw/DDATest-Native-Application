  import { API_CONFIG, API_ENDPOINTS } from '../constants/ApiConfig';

// Types
export interface Program {
  id: number;
  name: string;
  description: string;
  status: boolean;
  test_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  program_id: number;
  duration: number;
  total_marks: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  test_id: number;
  question_text: string;
  question_image: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_image: string | null;
  option_b_image: string | null;
  option_c_image: string | null;
  option_d_image: string | null;
  correct_option: 'a' | 'b' | 'c' | 'd';
  marks: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
}

// Base API class
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('🌐 Making API request to:', url);
    console.log('📤 Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? JSON.parse(options.body as string) : null
    });
    
    try {
      console.log('🌐 Sending HTTP request...');
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;
    } catch (error) {
      console.error('💥 API request failed:', error);
      throw error;
    }
  }

  // Program API methods
  async getPrograms(): Promise<ApiResponse<Program[]>> {
    return this.makeRequest<ApiResponse<Program[]>>(API_ENDPOINTS.PROGRAMS);
  }

  // Test API methods
  async getAllTests(): Promise<ApiResponse<Test[]>> {
    return this.makeRequest<ApiResponse<Test[]>>(API_ENDPOINTS.TESTS);
  }

  async getAvailableTests(token: string): Promise<ApiResponse<Test[]>> {
    return this.makeRequest<ApiResponse<Test[]>>(API_ENDPOINTS.TESTS_AVAILABLE, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getTestsByProgram(programId: number): Promise<ApiResponse<Test[]>> {
    return this.makeRequest<ApiResponse<Test[]>>(`${API_ENDPOINTS.TESTS_BY_PROGRAM}/${programId}`);
  }

  // Enrollment API methods
  async requestEnrollment(testId: number, requestMessage: string, token: string): Promise<ApiResponse<any>> {
    return this.makeRequest<ApiResponse<any>>(API_ENDPOINTS.ENROLLMENT_REQUEST, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        test_id: testId,
        request_message: requestMessage,
      }),
    });
  }

  async getMyEnrollmentRequests(token: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<ApiResponse<any[]>>(API_ENDPOINTS.ENROLLMENT_MY_REQUESTS, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async checkTestAccess(testId: number, token: string): Promise<ApiResponse<any>> {
    return this.makeRequest<ApiResponse<any>>(`${API_ENDPOINTS.ENROLLMENT_CHECK_ACCESS}/${testId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Question API methods
  async getQuestionsByTest(testId: number): Promise<ApiResponse<Question[]>> {
    return this.makeRequest<ApiResponse<Question[]>>(`${API_ENDPOINTS.QUESTIONS_BY_TEST}/${testId}/questions`);
  }

  // Test submission API methods
  async startTest(testId: number, token: string): Promise<ApiResponse<any>> {
    console.log('🌐 API Service - startTest called');
    console.log('🌐 API Service - testId:', testId);
    console.log('🌐 API Service - token:', token ? 'Present' : 'Missing');
    
    const endpoint = `${API_ENDPOINTS.TEST_SUBMISSION_START}/${testId}`;
    console.log('🌐 API Service - endpoint:', endpoint);
    
    return this.makeRequest<ApiResponse<any>>(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async submitTest(submissionId: number, answers: Array<{question_id: number, selected_option: string}>, token: string): Promise<ApiResponse<any>> {
    console.log('🌐 API Service - submitTest called');
    console.log('🌐 API Service - submissionId:', submissionId);
    console.log('🌐 API Service - answers:', answers);
    console.log('🌐 API Service - token:', token ? 'Present' : 'Missing');
    
    const endpoint = `${API_ENDPOINTS.TEST_SUBMISSION_SUBMIT}/${submissionId}`;
    console.log('🌐 API Service - endpoint:', endpoint);
    
    return this.makeRequest<ApiResponse<any>>(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ answers }),
    });
  }

  async getSubmissionStatus(testId: number, token: string): Promise<ApiResponse<any>> {
    return this.makeRequest<ApiResponse<any>>(`${API_ENDPOINTS.TEST_SUBMISSION_STATUS}/${testId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getSubmittedAnswers(submissionId: number, token: string): Promise<ApiResponse<any>> {
    return this.makeRequest<ApiResponse<any>>(`${API_ENDPOINTS.TEST_SUBMISSION_ANSWERS}/${submissionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Test results API methods
  async getMyTestResults(token: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<ApiResponse<any[]>>(API_ENDPOINTS.TEST_RESULTS, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Enquiry API methods
  async submitEnquiry(enquiryData: {
    full_name: string;
    mobile_number: string;
    email_address?: string;
    message?: string;
    program_name: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest<ApiResponse<any>>(API_ENDPOINTS.ENQUIRIES, {
      method: 'POST',
      body: JSON.stringify(enquiryData),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
