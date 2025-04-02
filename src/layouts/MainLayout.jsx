import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { 
  HomeIcon, 
  BriefcaseIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { name: 'Job Postings', to: '/jobs', icon: BriefcaseIcon },
  { name: 'Applicants', to: '/applicants', icon: UserGroupIcon },
  { name: 'Interviews', to: '/interviews', icon: CalendarIcon },
  // { name: 'Scheduler', to: '/scheduler', icon: ClockIcon, exact: true },
  { name: 'Question Bank', to: '/question-bank', icon: QuestionMarkCircleIcon },
  { name: 'Analytics', to: '/analytics', icon: ChartBarIcon },
]

function MainLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">ATS System</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
                {item.name === 'Scheduler' && <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">New</span>}
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex flex-col px-6 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 mt-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout 