/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaPlus, FaFileInvoice } from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentService from '../services/paymentService';
import ParkingRecordService from '../services/parkingRecordService';

const Payments = ({ action = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const recordIdFromQuery = queryParams.get('recordId');
  const feeFromQuery = queryParams.get('fee');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(action === 'new' || !!recordIdFromQuery);
  const [completedRecords, setCompletedRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    recordId: recordIdFromQuery || '',
    amountPaid: feeFromQuery || ''
  });
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (recordIdFromQuery && !selectedRecord) {
      fetchRecordDetails(recordIdFromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordIdFromQuery]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all payments
      const paymentsResponse = await PaymentService.getAllPayments();
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.payments);
      }
      
      if (showForm) {
        // Fetch completed records with no payments
        const completedResponse = await ParkingRecordService.getCompletedParkingRecords();
        if (completedResponse.success) {
          // Filter out records that already have payments
          const recordsWithNoPayments = completedResponse.completedRecords.filter(
            record => !paymentsResponse.payments.some(payment => 
              payment.recordId._id === record._id
            )
          );
          setCompletedRecords(recordsWithNoPayments);
        }
      }
      
      setLoading(false);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
      setLoading(false);
    }
  };
  
  const fetchRecordDetails = async (recordId) => {
    try {
      const response = await ParkingRecordService.getParkingRecordById(recordId);
      if (response.success) {
        setSelectedRecord(response.parkingRecord);
      } else {
        toast.error('Failed to fetch record details');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch record details');
    }
  };
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleRecordChange = async (e) => {
    const selectedRecordId = e.target.value;
    setFormData({
      ...formData,
      recordId: selectedRecordId
    });
    
    if (selectedRecordId) {
      try {
        const response = await ParkingRecordService.getParkingRecordById(selectedRecordId);
        if (response.success) {
          const record = response.parkingRecord;
          setSelectedRecord(record);
          
          // Calculate fee: 500 Rwf per hour
          const fee = record.duration * 500;
          setFormData(prev => ({
            ...prev,
            amountPaid: fee.toString()
          }));
        }
      } catch (error) {
        toast.error('Failed to fetch record details');
      }
    } else {
      setSelectedRecord(null);
      setFormData(prev => ({
        ...prev,
        amountPaid: ''
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await PaymentService.createPayment({
        recordId: formData.recordId,
        amountPaid: parseFloat(formData.amountPaid)
      });
      
      if (response.success) {
        toast.success('Payment recorded successfully');
        setShowForm(false);
        setFormData({ recordId: '', amountPaid: '' });
        setSelectedRecord(null);
        fetchData();
        
        // Remove query params
        navigate('/payments');
      } else {
        toast.error(response.message || 'Failed to record payment');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to record payment');
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
  
  const formatCurrency = (amount) => {
    return amount.toLocaleString() + ' Rwf';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payments Management</h1>
        <Button 
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              fetchData();
            } else {
              // Remove query params when closing form
              navigate('/payments');
            }
          }}
          className="flex items-center gap-2"
        >
          {showForm ? 'Cancel' : (
            <>
              <FaPlus /> New Payment
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6" title="Record New Payment" titleIcon={<FaMoneyBillWave />}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Parking Record
                </label>
                <select
                  name="recordId"
                  value={formData.recordId}
                  onChange={handleRecordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={!!recordIdFromQuery}
                >
                  <option value="">-- Select Record --</option>
                  {completedRecords.map(record => (
                    <option key={record._id} value={record._id}>
                      {record.carId.plateNumber} - Slot: {record.slotId.slotNumber} - Duration: {record.duration}h
                    </option>
                  ))}
                </select>
              </div>
              <FormInput
                label="Amount (Rwf)"
                id="amountPaid"
                type="number"
                min="0"
                step="100"
                placeholder="e.g., 1000"
                value={formData.amountPaid}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {selectedRecord && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Record Details:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><strong>Car:</strong> {selectedRecord.carId.plateNumber}</p>
                  <p><strong>Driver:</strong> {selectedRecord.carId.driverName}</p>
                  <p><strong>Slot:</strong> {selectedRecord.slotId.slotNumber}</p>
                  <p><strong>Phone:</strong> {selectedRecord.carId.phoneNumber}</p>
                  <p><strong>Entry:</strong> {formatDateTime(selectedRecord.entryTime)}</p>
                  <p><strong>Exit:</strong> {formatDateTime(selectedRecord.exitTime)}</p>
                  <p><strong>Duration:</strong> {selectedRecord.duration} hours</p>
                  <p><strong>Fee:</strong> {formatCurrency(selectedRecord.duration * 500)}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setFormData({ recordId: '', amountPaid: '' });
                  setSelectedRecord(null);
                  // Remove query params
                  navigate('/payments');
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!selectedRecord}
              >
                Record Payment
              </Button>
            </div>
            {completedRecords.length === 0 && !recordIdFromQuery && (
              <p className="mt-2 text-sm text-red-600">
                No unpaid records available. All completed parking records have been paid.
              </p>
            )}
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="w-8 h-8" />
        </div>
      ) : payments.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No payments recorded yet</p>
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
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.recordId.carId.plateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.recordId.slotId.slotNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.recordId.duration} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                      {formatCurrency(payment.amountPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateTime(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => navigate(`/reports/bill/${payment.recordId._id}`)}
                      >
                        <FaFileInvoice /> View Bill
                      </Button>
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

export default Payments;
