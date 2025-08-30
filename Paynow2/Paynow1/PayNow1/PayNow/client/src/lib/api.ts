
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;
  private isDevelopmentMode: boolean = true; // Enable mock mode for development

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Mock responses for development
  private getMockResponse(endpoint: string, method: string, data?: any): ApiResponse<any> | null {
    if (!this.isDevelopmentMode) return null;

    if (endpoint === '/v1/auth/login' && method === 'POST') {
      const bipayId = `BP${data.mobile.slice(-4)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      return {
        success: true,
        data: {
          user: {
            id: 'user123',
            name: data.mobile,
            full_name: `User ${data.mobile}`,
            mobile: data.mobile,
            balance: 5000,
            wallet_id: 'wallet_' + Date.now(),
            bipay_id: bipayId,
            biometric_enabled: true,
            biometric_data: 'mock_biometric_hash'
          },
          token: 'mock_token_' + Date.now(),
          device_id: 'web_device_' + Date.now()
        }
      };
    }

    if (endpoint === '/v1/auth/register' && method === 'POST') {
      const bipayId = `BP${data.mobile.slice(-4)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      return {
        success: true,
        data: {
          user: {
            id: 'user123',
            name: data.name,
            full_name: data.name,
            mobile: data.mobile,
            balance: 1000,
            wallet_id: 'wallet_' + Date.now(),
            bipay_id: bipayId,
            biometric_enabled: false,
            biometric_data: null
          },
          token: 'mock_token_' + Date.now(),
          device_id: 'web_device_' + Date.now()
        }
      };
    }

    if (endpoint.startsWith('/v1/users/find-by-bipay-id/') && method === 'GET') {
      const bipayId = endpoint.split('/').pop();
      if (bipayId && bipayId.startsWith('BP')) {
        return {
          success: true,
          data: {
            id: 'found_user',
            name: 'John Doe',
            bipay_id: bipayId,
            avatar: '👨‍💻',
            biometric_enabled: true
          }
        };
      }
      return { success: false, error: 'User not found' };
    }

    if (endpoint === '/v1/payments/request-with-bipay-id' && method === 'POST') {
      return {
        success: true,
        data: {
          request_id: 'req_' + Date.now(),
          status: 'pending',
          expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      };
    }

    if (endpoint === '/v1/payments/pay-with-bipay-id' && method === 'POST') {
      return {
        success: true,
        data: {
          transaction_id: 'txn_' + Date.now(),
          status: 'completed',
          amount: data.amount,
          receiver: data.receiver_bipay_id
        }
      };
    }

    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Check for mock response first
    const mockResponse = this.getMockResponse(endpoint, options.method || 'GET', 
      options.body ? JSON.parse(options.body as string) : undefined);
    
    if (mockResponse) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockResponse;
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // BiPay specific methods following the backend API
  async login(mobile: string, password: string): Promise<ApiResponse<any>> {
    return this.post('/v1/auth/login', { mobile, password });
  }

  async register(name: string, mobile: string, password: string): Promise<ApiResponse<any>> {
    return this.post('/v1/auth/register', { name, mobile, password });
  }

  async getNonce(deviceId: string): Promise<ApiResponse<{ nonce: string }>> {
    return this.get(`/v1/nonce?device_id=${deviceId}`);
  }

  async getWalletBalance(walletId: string): Promise<ApiResponse<{ balance: number }>> {
    return this.get(`/v1/accounts/${walletId}`);
  }

  async sendP2PPayment(data: {
    receiver_wallet_id: string;
    amount: number;
    signature: string;
    nonce: string;
    device_id: string;
  }): Promise<ApiResponse<{ transaction_id: string }>> {
    const headers: HeadersInit = {
      'X-Biometric-Signature': data.signature,
      'X-Device-Id': data.device_id,
      'X-Nonce': data.nonce,
    };

    return this.request('/v1/payments/p2p', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        receiver_wallet_id: data.receiver_wallet_id,
        amount: data.amount,
      }),
    });
  }

  async getTransactionHistory(ownerId: string): Promise<ApiResponse<any[]>> {
    return this.get(`/v1/transactions?owner_id=${ownerId}`);
  }

  async addMoney(amount: number): Promise<ApiResponse<any>> {
    return this.post('/v1/accounts/add-money', { amount });
  }

  async getContacts(): Promise<ApiResponse<any[]>> {
    return this.get('/v1/contacts/list');
  }

  async addContact(data: { name: string; wallet_id: string }): Promise<ApiResponse<any>> {
    return this.post('/v1/contacts/add', data);
  }

  async downloadReceipt(transactionId: string): Promise<string> {
    return `${this.baseURL}/v1/receipts/${transactionId}.pdf`;
  }

  // BiPay ID specific methods
  async findUserByBipayId(bipayId: string): Promise<ApiResponse<any>> {
    return this.get(`/v1/users/find-by-bipay-id/${bipayId}`);
  }

  async requestPaymentWithBipayId(data: {
    receiver_bipay_id: string;
    amount: number;
    note?: string;
    signature: string;
    device_id: string;
  }): Promise<ApiResponse<any>> {
    const headers: HeadersInit = {
      'X-Biometric-Signature': data.signature,
      'X-Device-Id': data.device_id,
    };

    return this.request('/v1/payments/request-with-bipay-id', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        receiver_bipay_id: data.receiver_bipay_id,
        amount: data.amount,
        note: data.note || ''
      }),
    });
  }

  async payWithBipayId(data: {
    receiver_bipay_id: string;
    amount: number;
    note?: string;
    signature: string;
    device_id: string;
    nonce: string;
  }): Promise<ApiResponse<any>> {
    const headers: HeadersInit = {
      'X-Biometric-Signature': data.signature,
      'X-Device-Id': data.device_id,
      'X-Nonce': data.nonce,
    };

    return this.request('/v1/payments/pay-with-bipay-id', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        receiver_bipay_id: data.receiver_bipay_id,
        amount: data.amount,
        note: data.note || ''
      }),
    });
  }

  async enableBiometric(biometricData: string): Promise<ApiResponse<any>> {
    return this.post('/v1/users/enable-biometric', { biometric_data: biometricData });
  }

  async verifyBiometric(signature: string, deviceId: string): Promise<ApiResponse<any>> {
    return this.post('/v1/biometric/verify', { signature, device_id: deviceId });
  }
}

export const apiClient = new ApiClient();
