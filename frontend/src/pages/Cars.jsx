import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCar, FaPlus, FaEdit, FaTrash, FaParking } from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import CarService from '../services/carService';
import ParkingSlotService from '../services/parkingSlotService';
import ParkingRecordService from '../services/parkingRecordService';

const Cars = () => {  const [cars, setCars] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    driverName: '',
    phoneNumber: ''
  });
  const [assignSlot, setAssignSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  
  useEffect(() => {
    fetchCars();
  }, []);
    const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await CarService.getAllCars();
      if (response.success) {
        setCars(response.cars);
      } else {
        toast.error(response.message || 'Failed to fetch cars');
      }
      
      // Fetch available parking slots
      const slotsResponse = await ParkingSlotService.getAvailableParkingSlots();
      if (slotsResponse.success) {
        setAvailableSlots(slotsResponse.availableSlots);
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
    const resetForm = () => {
    setFormData({
      plateNumber: '',
      driverName: '',
      phoneNumber: ''
    });
    setEditingCar(null);
    setAssignSlot(false);
    setSelectedSlot('');
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCar) {
        // Update existing car
        const response = await CarService.updateCar(editingCar._id, formData);
        if (response.success) {
          toast.success('Car updated successfully');
          fetchCars();
          setShowForm(false);
          resetForm();
        } else {
          toast.error(response.message || 'Failed to update car');
        }
      } else {
        // Create new car
        const response = await CarService.createCar(formData);
        if (response.success) {
          toast.success('Car registered successfully');
          
          // If user wants to assign a parking slot
          if (assignSlot && selectedSlot) {
            const parkingData = {
              carId: response.car._id,
              slotId: selectedSlot
            };
            
            // Create parking record
            const recordResponse = await ParkingRecordService.createParkingRecord(parkingData);
            if (recordResponse.success) {
              toast.success('Car assigned to parking slot successfully');
            } else {
              toast.error(recordResponse.message || 'Failed to assign parking slot');
            }
          }
          
          fetchCars();
          setShowForm(false);
          resetForm();
        } else {
          toast.error(response.message || 'Failed to register car');
        }
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };
  
  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      plateNumber: car.plateNumber,
      driverName: car.driverName,
      phoneNumber: car.phoneNumber
    });
    setShowForm(true);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }
    
    try {
      const response = await CarService.deleteCar(id);
      if (response.success) {
        toast.success('Car deleted successfully');
        fetchCars();
      } else {
        toast.error(response.message || 'Failed to delete car');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete car');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cars Management</h1>
        <Button 
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2"
        >
          {showForm ? 'Cancel' : (
            <>
              <FaPlus /> Add New Car
            </>
          )}
        </Button>
      </div>      {showForm && (
        <Card className="mb-6" title={editingCar ? "Edit Car" : "Register New Car"} titleIcon={<FaCar />}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Plate Number"
                id="plateNumber"
                placeholder="e.g., RAE 123A"
                value={formData.plateNumber}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label="Driver Name"
                id="driverName"
                placeholder="e.g., John Doe"
                value={formData.driverName}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label="Phone Number"
                id="phoneNumber"
                placeholder="e.g., +250 791 234 567"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {!editingCar && ( /* Show parking slot assignment only for new cars */
              <div className="mt-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="assignSlot"
                    checked={assignSlot}
                    onChange={() => setAssignSlot(!assignSlot)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="assignSlot" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                    <FaParking className="mr-1 text-blue-600" /> Assign a Parking Slot
                  </label>
                </div>
                
                {assignSlot && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Parking Slot
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      required={assignSlot}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">-- Select Slot --</option>
                      {availableSlots.map(slot => (
                        <option key={slot._id} value={slot._id}>
                          {slot.slotNumber}
                        </option>
                      ))}
                    </select>
                    
                    {availableSlots.length === 0 && (
                      <p className="mt-2 text-sm text-red-600">
                        No available parking slots. Please create new slots first.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant={editingCar ? "success" : "primary"}
                disabled={assignSlot && !selectedSlot && availableSlots.length > 0}
              >
                {editingCar ? "Update Car" : "Register Car"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="w-8 h-8" />
        </div>
      ) : cars.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No cars registered yet</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.map((car) => (
                  <tr key={car._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCar className="mr-2 text-gray-400" />
                        <span>{car.plateNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {car.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {car.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button 
                          className="p-2"
                          onClick={() => handleEdit(car)}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          className="p-2"
                          variant="danger"
                          onClick={() => handleDelete(car._id)}
                        >
                          <FaTrash />
                        </Button>
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

export default Cars;
