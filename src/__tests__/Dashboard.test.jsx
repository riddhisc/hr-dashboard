const React = require('react');
const { render, screen, act } = require('@testing-library/react');
const { Provider } = require('react-redux');
const { BrowserRouter } = require('react-router-dom');
const configureMockStore = require('redux-mock-store');
const thunk = require('redux-thunk');
const Dashboard = require('../pages/Dashboard').default;

// Create mock store
const mockStore = configureMockStore([thunk]);

// Mock dayjs to control date behavior
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  const fixedDate = new Date('2024-04-01T12:00:00Z');
  
  const mockDayjs = (...args) => {
    if (args.length === 0) {
      return originalDayjs(fixedDate);
    }
    return originalDayjs(...args);
  };
  
  // Add all the dayjs methods
  Object.keys(originalDayjs).forEach(key => {
    mockDayjs[key] = originalDayjs[key];
  });
  
  // Add the plugin methods
  mockDayjs.extend = originalDayjs.extend;
  
  return mockDayjs;
});

// Mock the useRef implementation for caching
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useRef: jest.fn(val => ({ current: val })),
  };
});

describe('Dashboard Component', () => {
  let store;
  
  beforeEach(() => {
    // Reset the React useRef mock
    React.useRef.mockImplementation(val => ({ current: val }));
    
    // Set up a mock store with sample data
    store = mockStore({
      auth: {
        user: { name: 'Test User', email: 'test@example.com' }
      },
      jobs: {
        jobs: [{ _id: '1', title: 'Test Job', status: 'open' }]
      },
      applicants: {
        applicants: [{ _id: '1', name: 'Test Applicant', jobId: '1' }]
      },
      interviews: {
        interviews: [
          { 
            _id: '1', 
            applicantName: 'Test Applicant', 
            jobTitle: 'Test Job',
            date: new Date(Date.now() + 86400000).toISOString(), // 1 day in future
            status: 'scheduled'
          },
          { 
            _id: '2', 
            applicantName: 'Past Interview', 
            jobTitle: 'Test Job',
            date: new Date(Date.now() - 86400000).toISOString(), // 1 day in past
            status: 'completed'
          }
        ],
        status: 'succeeded',
        error: null,
        filters: { status: 'all', type: 'all', date: null, search: '' }
      }
    });
  });
  
  test('should render and display upcoming interviews', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Dashboard />
          </BrowserRouter>
        </Provider>
      );
    });
    
    // Check if the Dashboard title is rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Verify upcoming interviews section exists
    expect(screen.getByText('Upcoming Interviews')).toBeInTheDocument();
    
    // Should display the future interview but not the past one
    expect(screen.getByText('Test Applicant')).toBeInTheDocument();
    expect(screen.queryByText('Past Interview')).not.toBeInTheDocument();
  });
}); 