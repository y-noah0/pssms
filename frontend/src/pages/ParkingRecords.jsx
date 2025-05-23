import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaClipboardList, FaPlus, FaSignInAlt, FaSignOutAlt, FaMoneyBillWave, FaFilter } from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ParkingRecordService from '../services/parkingRecordService';
import CarService from '../services/carService';
import ParkingSlotService from '../services/parkingSlotService';
import FormInput from '../components/FormInput';
import { useNavigate } from 'react-router-dom';

const ParkingRecords = ({ action = null }) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(action === 'new');
  const [cars, setCars] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filter, setFilter] = useState(action === 'exit' ? 'active' : 'all'); // all, active, completed
  const [formData, setFormData] = useState({
    carId: '',
    slotId: ''
  });
  
  // Auto focus on specific content based on action
  useEffect(() => {
    if (action === 'new') {
      setShowForm(true);
    } else if (action === 'exit') {
      setFilter('active');
    }
  }, [action]);
    useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, action]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch records based on filter
      let recordsResponse;
      
      if (filter === 'active') {
        recordsResponse = await ParkingRecordService.getActiveParkingRecords();
        setRecords(recordsResponse.success ? recordsResponse.activeRecords : []);
      } else if (filter === 'completed') {
        recordsResponse = await ParkingRecordService.getCompletedParkingRecords();
        setRecords(recordsResponse.success ? recordsResponse.completedRecords : []);
      } else {
        recordsResponse = await ParkingRecordService.getAllParkingRecords();
        setRecords(recordsResponse.success ? recordsResponse.parkingRecords : []);
      }
      
      if (showForm) {
        // Fetch cars
        const carsResponse = await CarService.getAllCars();
        setCars(carsResponse.success ? carsResponse.cars : []);
        
        // Fetch available slots
        const slotsResponse = await ParkingSlotService.getAvailableParkingSlots();
        setAvailableSlots(slotsResponse.success ? slotsResponse.availableSlots : []);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await ParkingRecordService.createParkingRecord(formData);
      if (response.success) {
        toast.success('Car entry recorded successfully');
        setShowForm(false);
        setFormData({ carId: '', slotId: '' });
        fetchData();
      } else {
        toast.error(response.message || 'Failed to record car entry');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to record car entry');
    }
  };
    const handleExit = async (recordId) => {
    try {
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
        toast.success(`Car exit recorded. Fee: ${response.fee} Rwf`);
        fetchData();
        
        // Navigate to payment page with record ID
        navigate(`/payments/new?recordId=${recordId}&fee=${response.fee}`);
      } else {
        toast.error(response.message || 'Failed to record exit');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to record exit');
    }
  };
  
  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  const calculateDuration = (entryTime, exitTime) => {
    if (!exitTime) return 'Active';
    
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const durationMs = exit - entry;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parking Records</h1>
        <div className="flex gap-2">
          <div className="inline-flex rounded-md shadow-sm">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              className="rounded-r-none"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'primary' : 'outline'}
              className="rounded-none border-l-0 border-r-0"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'outline'}
              className="rounded-l-none"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
          </div>
          <Button 
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                fetchData();
              }
            }}
            className="flex items-center gap-2"
          >
            {showForm ? 'Cancel' : (
              <>
                <FaPlus /> New Entry
              </>
            )}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6" title="Record New Car Entry" titleIcon={<FaSignInAlt />}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Car
                </label>
                <select
                  name="carId"
                  value={formData.carId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Select Car --</option>
                  {cars.map(car => (
                    <option key={car._id} value={car._id}>
                      {car.plateNumber} - {car.driverName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Parking Slot
                </label>
                <select
                  name="slotId"
                  value={formData.slotId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Select Slot --</option>
                  {availableSlots.map(slot => (
                    <option key={slot._id} value={slot._id}>
                      {slot.slotNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setFormData({ carId: '', slotId: '' });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={availableSlots.length === 0}
              >
                Record Entry
              </Button>
            </div>
            {availableSlots.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                No available parking slots. Please create new slots or free up occupied ones.
              </p>
            )}
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="w-8 h-8" />
        </div>
      ) : records.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No parking records found</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exit Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record._id} className={record.exitTime ? '' : 'bg-green-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.carId.plateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.slotId.slotNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateTime(record.entryTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.exitTime ? formatDateTime(record.exitTime) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {calculateDuration(record.entryTime, record.exitTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {!record.exitTime ? (
                          <Button 
                            variant="danger" 
                            className="flex items-center gap-1"
                            onClick={() => handleExit(record._id)}
                          >
                            <FaSignOutAlt /> Exit
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            className="flex items-center gap-1"
                            onClick={() => navigate(`/payments/new?recordId=${record._id}`)}
                          >
                            <FaMoneyBillWave /> Payment
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ParkingRecords;
