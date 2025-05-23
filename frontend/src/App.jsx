import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cars from './pages/Cars';
import ParkingSlots from './pages/ParkingSlots';
import ParkingRecords from './pages/ParkingRecords';
import Payments from './pages/Payments';
import Reports from './pages/Reports';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="cars" element={<Cars />} />
              <Route path="parking-slots" element={<ParkingSlots />} />
              <Route path="parking-records" element={<ParkingRecords />} />
              <Route path="parking-records/new" element={<ParkingRecords action="new" />} />
              <Route path="parking-records/exit" element={<ParkingRecords action="exit" />} />
              <Route path="payments" element={<Payments />} />
              <Route path="payments/new" element={<Payments action="new" />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/bill/:id" element={<Reports type="bill" />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App
