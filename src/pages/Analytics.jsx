import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  fetchJobs, 
  selectAllJobs 
} from '../features/jobs/jobsSlice'
import { 
  selectAllApplicants,
  fetchApplicants 
} from '../features/applicants/applicantsSlice'
import { 
  selectAllInterviews,
  fetchInterviews,
  selectFilteredInterviews
} from '../features/interviews/interviewsSlice'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  Area
} from 'recharts'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  PaperClipIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

function Analytics() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const isGoogleUser = user?.isGoogleUser || false
  
  // For Google users, we need local state to hold localStorage data
  const [googleUserApplicants, setGoogleUserApplicants] = useState([])
  
  const jobs = useSelector(selectAllJobs) || []
  const regularApplicants = useSelector(selectAllApplicants) || []
  const interviews = useSelector(selectFilteredInterviews) || []
  
  // Use the appropriate data source based on user type
  const applicants = isGoogleUser ? googleUserApplicants : regularApplicants
  
  // Add loading status selectors
  const jobsLoading = useSelector(state => state.jobs.status === 'loading')
  const applicantsLoading = useSelector(state => state.applicants.status === 'loading')
  const interviewsLoading = useSelector(state => state.interviews.status === 'loading')
  const isLoading = isGoogleUser ? false : (jobsLoading || applicantsLoading || interviewsLoading)

  // Function to load Google user data from localStorage
  const loadGoogleUserData = () => {
    // Load Google user applicants from localStorage
    const googleApplicantsJSON = localStorage.getItem('google_user_applicants') || '[]'
    try {
      const applicantsData = JSON.parse(googleApplicantsJSON)
      setGoogleUserApplicants(applicantsData)
    } catch (error) {
      console.error('Error loading Google user applicants from localStorage:', error)
      setGoogleUserApplicants([])
    }
  }

  useEffect(() => {
    if (isGoogleUser) {
      // For Google users, load data from localStorage
      loadGoogleUserData()
    } else {
      // For regular users, fetch data from backend
    dispatch(fetchJobs())
    dispatch(fetchApplicants())
    dispatch(fetchInterviews())
    }
    
    // Set up an interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      if (isGoogleUser) {
        loadGoogleUserData()
      }
    }, 30000)
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [dispatch, isGoogleUser])

  // Log job statuses for debugging
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      console.log('Total jobs:', jobs.length);
      console.log('Jobs with open status:', jobs.filter(job => job.status === 'open').length);
      console.log('Job statuses:', jobs.map(job => ({ title: job.title, status: job.status })));
    }
  }, [jobs]);

  // Log applicant data for debugging
  useEffect(() => {
    if (jobs.length > 0 && applicants.length > 0) {
      console.log('Jobs data:', jobs);
      console.log('Applicants data:', applicants);
      
      // Log job-applicant relationships for debugging
      jobs.forEach(job => {
        const jobId = job._id?.toString ? job._id.toString() : job._id;
        console.log(`Job ID: ${jobId}, Type: ${typeof jobId}`);
        
        applicants.forEach(app => {
          const appJobId = app.jobId?.toString ? app.jobId.toString() : app.jobId;
          console.log(`  Comparing with applicant jobId: ${appJobId}, Type: ${typeof appJobId}, Match: ${appJobId === jobId}`);
        });
        
        const jobApplicants = applicants.filter(app => {
          const appJobId = app.jobId?.toString ? app.jobId.toString() : app.jobId;
          return appJobId === jobId;
        });
        console.log(`Job ${job.title} (${jobId}) has ${jobApplicants.length} applicants`);
      });
    }
  }, [jobs, applicants]);

  // Calculate metrics
  const totalJobs = jobs.length
  const totalApplicants = applicants.length
  const totalInterviews = interviews.length
  
  const activeJobs = jobs.filter(job => job.status === 'open').length
  const shortlistedApplicants = Array.isArray(applicants) ? applicants.filter(app => app.status === 'shortlisted').length : 0
  const scheduledInterviews = Array.isArray(interviews) ? interviews.filter(int => int.status === 'scheduled').length : 0
  
  const applicantsPerJob = totalJobs > 0 ? (totalApplicants / totalJobs).toFixed(1) : 0
  const interviewsPerJob = totalJobs > 0 ? (totalInterviews / totalJobs).toFixed(1) : 0
  
  // Calculate time to hire (in days) - mock data
  const timeToHire = 18.5

  // Prepare data for charts
  const applicantsBySource = Array.isArray(applicants) ? [
    { name: 'LinkedIn', value: applicants.filter(app => app.source === 'linkedin').length },
    { name: 'Indeed', value: applicants.filter(app => app.source === 'indeed').length },
    { name: 'Company Website', value: applicants.filter(app => app.source === 'company').length }
  ] : []

  const applicantsByStatus = Array.isArray(applicants) ? [
    { name: 'Pending', value: applicants.filter(app => app.status === 'pending').length },
    { name: 'Shortlisted', value: applicants.filter(app => app.status === 'shortlisted').length },
    { name: 'Interview', value: applicants.filter(app => app.status === 'interview').length },
    { name: 'Hired', value: applicants.filter(app => app.status === 'hired').length },
    { name: 'Rejected', value: applicants.filter(app => app.status === 'rejected').length }
  ] : []

  // Function to normalize IDs for comparison
  const normalizeId = (id) => {
    if (!id) return '';
    // Handle ObjectId from MongoDB which might be in different formats
    if (typeof id === 'object' && id._id) return id._id.toString();
    return id.toString();
  };

  // Calculate applicants by job using only real backend data with ID normalization
  const applicantsByJob = useMemo(() => {
    if (!Array.isArray(jobs) || jobs.length === 0) return [];
    if (!Array.isArray(applicants) || applicants.length === 0) return jobs.map(job => ({
      name: job.title.length > 15 ? job.title.substring(0, 15) + '...' : job.title,
      applicants: 0,
      _id: normalizeId(job._id)
    }));
    
    return jobs.map(job => {
      const normalizedJobId = normalizeId(job._id);
      const jobApplicants = applicants.filter(app => normalizeId(app.jobId) === normalizedJobId);
      
      return {
        name: job.title.length > 15 ? job.title.substring(0, 15) + '...' : job.title,
        applicants: jobApplicants.length,
        _id: normalizedJobId
      };
    });
  }, [jobs, applicants]);
  
  // Log applicantsByJob data after it's defined
  useEffect(() => {
    if (applicantsByJob.length > 0) {
      console.log('Calculated applicantsByJob data:', applicantsByJob);
    }
  }, [applicantsByJob]);

  // Colors for pie charts
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0EA5E9', '#14B8A6']
  
  // Custom tooltip formatter for better presentation
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label formatter for pie charts
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Calculate applicant trend over time (based on appliedDate for real data)
  const applicantTrend = useMemo(() => {
    if (applicants.length === 0) {
      // Return mock data if no applicants
      return [
    { name: 'Jan', applicants: 12 },
    { name: 'Feb', applicants: 19 },
    { name: 'Mar', applicants: 25 },
    { name: 'Apr', applicants: 32 },
    { name: 'May', applicants: 30 },
    { name: 'Jun', applicants: 27 }
      ];
    }
    
    // For Google users with real applicant data, generate trend based on applied dates
    const now = dayjs();
    const sixMonthsAgo = now.subtract(6, 'month');
    
    // Create array of last 6 months
    const months = [];
    for (let i = 0; i < 6; i++) {
      const month = now.subtract(i, 'month');
      months.unshift({
        name: month.format('MMM'),
        month: month.month(), // 0-11
        year: month.year(),
        applicants: 0
      });
    }
    
    // Count applicants by month they applied
    applicants.forEach(applicant => {
      if (!applicant.appliedDate) return;
      
      const appliedDate = dayjs(applicant.appliedDate);
      // Only count if within last 6 months
      if (appliedDate.isAfter(sixMonthsAgo)) {
        const appliedMonth = appliedDate.month();
        const appliedYear = appliedDate.year();
        
        // Find matching month in our array
        const monthData = months.find(m => m.month === appliedMonth && m.year === appliedYear);
        if (monthData) {
          monthData.applicants++;
        }
      }
    });
    
    return months;
  }, [applicants]);
  
  // Calculate interview stats from real data
  const interviewStats = useMemo(() => {
    return {
      scheduled: interviews.filter(i => i.status === 'scheduled').length,
      completed: interviews.filter(i => i.status === 'completed').length,
      cancelled: interviews.filter(i => i.status === 'cancelled').length
    };
  }, [interviews]);

  // If there are no applicants mapped to jobs, show a message
  const NoDataMessage = ({ message }) => (
    <div className="flex items-center justify-center h-full w-full flex-col">
      <svg className="w-16 h-16 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p className="text-gray-500">{message}</p>
    </div>
  );

  // Return loading state if data is still being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data is available
  if ((isGoogleUser && applicants.length === 0) || (!isGoogleUser && (jobs.length === 0 || applicants.length === 0))) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        <p className="text-gray-600 mb-4">No data available to display</p>
        {isGoogleUser ? (
          <div>
            <p className="text-gray-500 mb-4">Please add some applicants and schedule interviews to see analytics</p>
            <div className="flex justify-center space-x-4">
              <Link to="/applicants/add" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 inline-flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Applicant
              </Link>
              <Link to="/interviews" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Schedule Interview
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Please add some jobs and applicants to see analytics</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button 
          onClick={isGoogleUser ? loadGoogleUserData : () => {
            dispatch(fetchJobs());
            dispatch(fetchApplicants());
            dispatch(fetchInterviews());
          }}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors flex items-center"
          title="Refresh analytics data"
        >
          <ArrowPathIcon className="w-5 h-5 mr-1" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">Total Applicants</p>
          <p className="text-3xl font-semibold mt-2 text-gray-800">{totalApplicants}</p>
          <p className="text-sm text-gray-500 mt-2 flex items-center">
            {applicantsPerJob} applicants per job
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 border-l-4 border-emerald-500">
          <p className="text-sm font-medium text-gray-500">Active Jobs</p>
          <p className="text-3xl font-semibold mt-2 text-gray-800">{activeJobs}</p>
          <p className="text-sm text-gray-500 mt-2 flex items-center">
            Out of {totalJobs} total jobs
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 border-l-4 border-amber-500">
          <p className="text-sm font-medium text-gray-500">Interviews Scheduled</p>
          <p className="text-3xl font-semibold mt-2 text-gray-800">{scheduledInterviews}</p>
          <p className="text-sm text-gray-500 mt-2 flex items-center">
            {interviewsPerJob} interviews per job
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 border-l-4 border-sky-500">
          <p className="text-sm font-medium text-gray-500">Avg. Time to Hire</p>
          <p className="text-3xl font-semibold mt-2 text-gray-800">{timeToHire} days</p>
          <p className="text-sm text-gray-500 mt-2 flex items-center">
            From application to offer
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Applicants by Job */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Applicants by Job</h2>
          <div className="h-80">
            {applicantsByJob.length === 0 ? (
              <NoDataMessage message="No applicant data available for jobs" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={applicantsByJob}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                barSize={30}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  domain={[0, 'dataMax + 1']}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0.6}/>
                    </linearGradient>
                  ))}
                </defs>
                <Bar 
                  dataKey="applicants" 
                  name="Applicants" 
                  fill="#4F46E5" 
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  isAnimationActive={true}
                >
                  {applicantsByJob.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#colorGradient${index % COLORS.length})`}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Applicant Trend */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Applicant Trend</h2>
          <div className="h-80">
            {applicantTrend.length === 0 ? (
              <NoDataMessage message="No applicant trend data available" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={applicantTrend}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <defs>
                  <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="applicants" 
                  name="Applicants"
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4F46E5', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#4F46E5', strokeWidth: 1, stroke: '#fff' }}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="applicants"
                  fill="url(#colorApplicants)"
                  fillOpacity={0.3}
                  stroke="none"
                />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applicants by Source */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Applicants by Source</h2>
          <div className="h-80">
            {applicantsBySource.every(item => item.value === 0) ? (
              <NoDataMessage message="No source data available for applicants" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicantsBySource}
                  cx="50%"
                  cy="50%"
                    labelLine={false}
                  outerRadius={80}
                    innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                    label={renderCustomizedLabel}
                    animationDuration={1500}
                >
                  {applicantsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    iconSize={10}
                  />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Applicants by Status */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Applicants by Status</h2>
          <div className="h-80">
            {applicantsByStatus.every(item => item.value === 0) ? (
              <NoDataMessage message="No status data available for applicants" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicantsByStatus}
                  cx="50%"
                  cy="50%"
                    labelLine={false}
                  outerRadius={80}
                    innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                    label={renderCustomizedLabel}
                    animationDuration={1500}
                >
                  {applicantsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    iconSize={10}
                  />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Hiring Funnel */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Hiring Funnel</h2>
        <div className="h-80">
          {totalApplicants === 0 ? (
            <NoDataMessage message="No hiring funnel data available" />
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Applied', value: totalApplicants },
                { name: 'Shortlisted', value: shortlistedApplicants },
                  { name: 'Interviewed', value: interviewStats.completed + interviewStats.scheduled },
                { name: 'Hired', value: applicants.filter(app => app.status === 'hired').length }
              ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              layout="vertical"
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Bar 
                  dataKey="value" 
                  name="Candidates" 
                  fill="#4F46E5" 
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                >
                  {[0, 1, 2, 3].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics 