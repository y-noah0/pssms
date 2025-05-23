import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCar, FaParking, FaClipboardList, FaMoneyBillWave, FaSignOutAlt } from 'react-icons/fa';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import ParkingRecordService from '../services/parkingRecordService';
import ParkingSlotService from '../services/parkingSlotService';
import CarService from '../services/carService';
import PaymentService from '../services/paymentService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeRecords, setActiveRecords] = useState([]);
  const [stats, setStats] = useState({
    activeParkingCount: 0,
    availableSlotsCount: 0,
    carsCount: 0,
    todayPayments: {
      count: 0,
      total: 0
    }
  });

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch active parking records
      const activeRecordsResponse = await ParkingRecordService.getActiveParkingRecords();
      
      // Fetch available parking slots
      const availableSlotsResponse = await ParkingSlotService.getAvailableParkingSlots();
      
      // Fetch all cars
      const carsResponse = await CarService.getAllCars();
      
      // Fetch today's payments
      const today = new Date().toISOString().split('T')[0];
      const paymentsResponse = await PaymentService.getDailyPayments(today);
      
      // Calculate today's payments total
      const todayPaymentsTotal = paymentsResponse.success
        ? paymentsResponse.dailyPayments.reduce((sum, payment) => sum + payment.amountPaid, 0)
        : 0;
      
      // Set active records for display
      if (activeRecordsResponse.success) {
        setActiveRecords(activeRecordsResponse.activeRecords);
      }
      
      setStats({
        activeParkingCount: activeRecordsResponse.success ? activeRecordsResponse.activeRecords.length : 0,
        availableSlotsCount: availableSlotsResponse.success ? availableSlotsResponse.availableSlots.length : 0,
        carsCount: carsResponse.success ? carsResponse.cars.length : 0,
        todayPayments: {
          count: paymentsResponse.success ? paymentsResponse.dailyPayments.length : 0,
          total: todayPaymentsTotal
        }
      });
      
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  // Handle record exit
  const handleRecordExit = async (recordId) => {
    try {
      setLoading(true);
      
      // Prompt for user-specified duration (optional)
      const useCustomDuration = window.confirm('Do you want to specify a custom parking duration? If not, system will calculate automatically.');
      
      let response;
      if (useCustomDuration) {
        let hours = prompt('Enter parking duration in hours:', '1');
        hours = parseInt(hours);
        
        if (isNaN(hours) || hours <= 0) {
          toast.error('Invalid duration. Using system-calculated duration.');
          response = await ParkingRecordService.recordExit(recordId);
        } else {
          // Use custom duration if provided
          response = await ParkingRecordService.recordExit(recordId, hours);
        }
      } else {
        response = await ParkingRecordService.recordExit(recordId);
      }
      
      if (response.success) {
        toast.success('Car exit recorded successfully');
        // Show fee information
        toast.info(`Parking fee: ${response.fee.toLocaleString()} Rwf`);
        // Navigate to payment page
        window.location.href = `/payments/new?recordId=${recordId}&fee=${response.fee}`;
      } else {
        toast.error(response.message || 'Failed to record exit');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while recording exit');
      setLoading(false);
    }
  };
  
  const statsCards = [
    {
      title: 'Active Parking',
      value: stats.activeParkingCount,
      icon: <FaClipboardList className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-100',
      onClick: () => navigate('/parking-records')
    },
    {
      title: 'Available Slots',
      value: stats.availableSlotsCount,
      icon: <FaParking className="h-8 w-8 text-green-500" />,
      color: 'bg-green-100',
      onClick: () => navigate('/parking-slots')
    },
    {
      title: 'Registered Cars',
      value: stats.carsCount,
      icon: <FaCar className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-100',
      onClick: () => navigate('/cars')
    },
    {
      title: "Today's Revenue",
      value: `${stats.todayPayments.total.toLocaleString()} Rwf`,
      icon: <FaMoneyBillWave className="h-8 w-8 text-emerald-500" />,
      color: 'bg-emerald-100',
      onClick: () => navigate('/payments')
    }
  ];

  // Calculate time elapsed
  const calculateTimeElapsed = (entryTime) => {
    const now = new Date();
    const entry = new Date(entryTime);
    const diffMs = now - entry;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  // Calculate estimated fee (500 Rwf per hour, rounded up)
  const calculateEstimatedFee = (entryTime) => {
    const now = new Date();
    const entry = new Date(entryTime);
    let durationHours = (now - entry) / (1000 * 60 * 60);
    
    // Round up to the next hour if less than 1 hour
    durationHours = durationHours < 1 ? 1 : Math.ceil(durationHours);
    
    return durationHours * 500;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="w-10 h-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <div key={index} onClick={card.onClick} className="cursor-pointer">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="text-2xl font-semibold mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
      
      {/* Active Parking Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Active Parking</h2>
          <Button 
            onClick={() => navigate('/cars')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            New Car Entry
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="w-10 h-10" />
          </div>
        ) : activeRecords.length === 0 ? (
          <Card>
            <div className="p-6 text-center text-gray-500">
              No cars currently parked
            </div>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Plate Number</th>
                  <th className="py-3 px-4 text-left">Driver</th>
                  <th className="py-3 px-4 text-left">Slot</th>
                  <th className="py-3 px-4 text-left">Entry Time</th>
                  <th className="py-3 px-4 text-left">Time Elapsed</th>
                  <th className="py-3 px-4 text-left">Est. Fee</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeRecords.map((record) => (
                  <tr key={record._id} className="border-t">
                    <td className="py-3 px-4">{record.carId?.plateNumber}</td>
                    <td className="py-3 px-4">{record.carId?.driverName}</td>
                    <td className="py-3 px-4">{record.slotId?.slotNumber}</td>
                    <td className="py-3 px-4">
                      {new Date(record.entryTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {calculateTimeElapsed(record.entryTime)}
                    </td>
                    <td className="py-3 px-4">
                      {calculateEstimatedFee(record.entryTime).toLocaleString()} Rwf
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        onClick={() => handleRecordExit(record._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded flex items-center justify-center mx-auto"
                      >
                        <FaSignOutAlt className="mr-1" />
                        Exit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
