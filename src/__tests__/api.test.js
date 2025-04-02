const { interviewsAPI } = require('../utils/api');

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
}));

describe('interviewsAPI', () => {
  beforeEach(() => {
    // Clear all mock implementations before each test
    jest.clearAllMocks();
    
    // Reset the API cache
    interviewsAPI._cache = {
      interviews: null,
      timestamp: null,
      expiryTime: 10000
    };
  });

  describe('getInterviews', () => {
    it('should return cached data if valid cache exists', async () => {
      // Set up mock cache data
      const mockData = { data: [{ _id: '1', applicantName: 'Test Person' }] };
      interviewsAPI._cache = {
        interviews: mockData,
        timestamp: Date.now(),
        expiryTime: 10000
      };
      
      // Call the function
      const result = await interviewsAPI.getInterviews();
      
      // Verify the correct data is returned from cache
      expect(result).toEqual(mockData);
    });
  });
}); 