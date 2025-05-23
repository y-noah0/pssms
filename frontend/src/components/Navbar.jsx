import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaCar, 
  FaParking, 
  FaClipboardList, 
  FaMoneyBillWave, 
  FaChartBar, 
  FaSignOutAlt 
} from 'react-icons/fa';

const Navbar = () => {
  const { logout } = useAuth();

  const navItems = [
    { icon: <FaHome className="mr-2" />, text: 'Home', path: '/' },
    { icon: <FaCar className="mr-2" />, text: 'Cars', path: '/cars' },
    { icon: <FaParking className="mr-2" />, text: 'Parking Slots', path: '/parking-slots' },
    { icon: <FaClipboardList className="mr-2" />, text: 'Parking Records', path: '/parking-records' },
    { icon: <FaMoneyBillWave className="mr-2" />, text: 'Payments', path: '/payments' },
    { icon: <FaChartBar className="mr-2" />, text: 'Reports', path: '/reports' }
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600">PSSMS</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.path}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  {item.icon}
                  {item.text}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              type="button"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600"
              onClick={logout}
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
          <div className="flex items-center sm:hidden">
            {/* Mobile menu button - would require more code for functionality */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary-600"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
