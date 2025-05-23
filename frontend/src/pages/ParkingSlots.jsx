import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaParking, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import ParkingSlotService from '../services/parkingSlotService';

const ParkingSlots = () => {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [slotNumber, setSlotNumber] = useState('');
  
  useEffect(() => {
    fetchParkingSlots();
  }, []);
  
  const fetchParkingSlots = async () => {
    try {
      setLoading(true);
      const response = await ParkingSlotService.getAllParkingSlots();
      if (response.success) {
        setParkingSlots(response.parkingSlots);
      } else {
        toast.error(response.message || 'Failed to fetch parking slots');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch parking slots');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await ParkingSlotService.createParkingSlot({ slotNumber });
      if (response.success) {
        toast.success('Parking slot created successfully');
        fetchParkingSlots();
        setShowForm(false);
        setSlotNumber('');
      } else {
        toast.error(response.message || 'Failed to create parking slot');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create parking slot');
    }
  };
  
  const handleStatusChange = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'occupied' : 'available';
      const response = await ParkingSlotService.updateParkingSlotStatus(id, newStatus);
      if (response.success) {
        toast.success(`Slot status updated to ${newStatus}`);
        fetchParkingSlots();
      } else {
        toast.error(response.message || 'Failed to update slot status');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update slot status');
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking slot?')) {
      return;
    }
    
    try {
      const response = await ParkingSlotService.deleteParkingSlot(id);
      if (response.success) {
        toast.success('Parking slot deleted successfully');
        fetchParkingSlots();
      } else {
        toast.error(response.message || 'Failed to delete parking slot');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete parking slot');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parking Slots Management</h1>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          {showForm ? 'Cancel' : (
            <>
              <FaPlus /> Add New Slot
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6" title="Create New Parking Slot" titleIcon={<FaParking />}>
          <form onSubmit={handleSubmit}>
            <div className="max-w-md">
              <FormInput
                label="Slot Number"
                id="slotNumber"
                placeholder="e.g., A1, B2, etc."
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value)}
                required
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setSlotNumber('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Slot
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-green-500 rounded-full"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-red-500 rounded-full"></span>
            <span>Occupied</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="w-8 h-8" />
        </div>
      ) : parkingSlots.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No parking slots created yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {parkingSlots.map((slot) => (
            <Card key={slot._id} className="text-center">
              <div 
                className={`inline-flex items-center justify-center rounded-full w-16 h-16 mb-2 mx-auto
                  ${slot.slotStatus === 'available' ? 'bg-green-100' : 'bg-red-100'}`}
              >
                <FaParking 
                  className={`h-8 w-8 
                    ${slot.slotStatus === 'available' ? 'text-green-500' : 'text-red-500'}`} 
                />
              </div>
              <h3 className="text-lg font-medium">{slot.slotNumber}</h3>
              <p className={`text-sm capitalize ${
                slot.slotStatus === 'available' ? 'text-green-600' : 'text-red-600'
              }`}>
                {slot.slotStatus}
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <Button
                  variant={slot.slotStatus === 'available' ? 'danger' : 'success'}
                  className="p-2"
                  onClick={() => handleStatusChange(slot._id, slot.slotStatus)}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="danger"
                  className="p-2"
                  onClick={() => handleDelete(slot._id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParkingSlots;
