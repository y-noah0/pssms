import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { FaFileDownload, FaCalendarAlt, FaFileInvoice, FaArrowLeft } from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentService from '../services/paymentService';
import ParkingRecordService from '../services/parkingRecordService';

const Reports = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [dailyPayments, setDailyPayments] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    if (type === 'bill' && id) {
      fetchRecordAndPayment(id);
    }
  }, [type, id]);

  const fetchRecordAndPayment = async (recordId) => {
    try {
      setLoading(true);
      
      // Fetch the parking record
      const recordResponse = await ParkingRecordService.getParkingRecordById(recordId);
      if (!recordResponse.success) {
        toast.error('Failed to fetch parking record');
        return;
      }
      
      setSelectedRecord(recordResponse.parkingRecord);
      
      // Fetch the payment for this record
      const paymentResponse = await PaymentService.getPaymentByRecordId(recordId);
      if (!paymentResponse.success) {
        toast.error('No payment found for this record');
        return;
      }
      
      setSelectedPayment(paymentResponse.payment);
      
      setLoading(false);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const fetchDailyReport = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Fetch daily parking records
      const recordsResponse = await ParkingRecordService.getDailyParkingRecords(date);
      setDailyRecords(recordsResponse.success ? recordsResponse.dailyRecords : []);
      
      // Fetch daily payments
      const paymentsResponse = await PaymentService.getDailyPayments(date);
      setDailyPayments(paymentsResponse.success ? paymentsResponse.dailyPayments : []);
      
      setLoading(false);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch daily report');
      setLoading(false);
    }
  };

  const generateBillPDF = () => {
    if (!selectedRecord || !selectedPayment) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('PARKING RECEIPT', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Parking Space Sales Management System', 105, 30, { align: 'center' });
    doc.text('-----------------------------------------------------', 105, 40, { align: 'center' });
    
    // Add receipt details
    doc.setFontSize(12);
    const startY = 50;
    const lineHeight = 10;
    
    doc.text(`Receipt #: ${selectedPayment._id.substring(0, 8)}`, 20, startY);
    doc.text(`Date: ${formatDateTime(selectedPayment.paymentDate)}`, 20, startY + lineHeight);
    doc.text('-----------------------------------------------------', 105, startY + lineHeight * 2, { align: 'center' });
    
    // Car and customer details
    doc.text('Car Details:', 20, startY + lineHeight * 3);
    doc.text(`Plate Number: ${selectedRecord.carId.plateNumber}`, 30, startY + lineHeight * 4);
    doc.text(`Driver Name: ${selectedRecord.carId.driverName}`, 30, startY + lineHeight * 5);
    doc.text(`Phone Number: ${selectedRecord.carId.phoneNumber}`, 30, startY + lineHeight * 6);
    
    // Parking details
    doc.text('Parking Details:', 20, startY + lineHeight * 7);
    doc.text(`Slot Number: ${selectedRecord.slotId.slotNumber}`, 30, startY + lineHeight * 8);
    doc.text(`Entry Time: ${formatDateTime(selectedRecord.entryTime)}`, 30, startY + lineHeight * 9);
    doc.text(`Exit Time: ${formatDateTime(selectedRecord.exitTime)}`, 30, startY + lineHeight * 10);
    doc.text(`Duration: ${selectedRecord.duration} hours`, 30, startY + lineHeight * 11);
    
    // Payment details
    doc.text('Payment Details:', 20, startY + lineHeight * 12);
    doc.text(`Rate: 500 Rwf per hour`, 30, startY + lineHeight * 13);
    doc.text(`Amount: ${selectedRecord.duration} × 500 = ${selectedRecord.duration * 500} Rwf`, 30, startY + lineHeight * 14);
    doc.text(`Amount Paid: ${selectedPayment.amountPaid} Rwf`, 30, startY + lineHeight * 15);
    
    doc.text('-----------------------------------------------------', 105, startY + lineHeight * 17, { align: 'center' });
    doc.text('Thank you for using our parking service!', 105, startY + lineHeight * 18, { align: 'center' });
    
    // Save the PDF
    const filename = `RECEIPT-${selectedRecord.carId.plateNumber}-${new Date().toISOString().substring(0, 10)}.pdf`;
    doc.save(filename);
    toast.success('Receipt downloaded successfully');
  };

  const generateDailyReportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('DAILY PARKING REPORT', 105, 20, { align: 'center' });
    
    const reportDate = new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    doc.setFontSize(14);
    doc.text(`Report Date: ${reportDate}`, 105, 30, { align: 'center' });
    doc.text('-----------------------------------------------------', 105, 40, { align: 'center' });
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Total Cars Parked: ${dailyRecords.length}`, 20, 50);
    doc.text(`Total Payments: ${dailyPayments.length}`, 20, 60);
    
    const totalRevenue = dailyPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
    doc.text(`Total Revenue: ${totalRevenue.toLocaleString()} Rwf`, 20, 70);
    
    doc.text('-----------------------------------------------------', 105, 80, { align: 'center' });
    
    // Parking Records Table
    if (dailyRecords.length > 0) {
      doc.setFontSize(14);
      doc.text('Parking Records', 20, 95);
      
      doc.setFontSize(10);
      const headers = ['Plate Number', 'Slot', 'Entry Time', 'Exit Time', 'Duration', 'Status'];
      const data = dailyRecords.map(record => [
        record.carId.plateNumber,
        record.slotId.slotNumber,
        formatShortDateTime(record.entryTime),
        record.exitTime ? formatShortDateTime(record.exitTime) : '-',
        record.exitTime ? `${record.duration}h` : 'Active',
        record.exitTime ? 'Completed' : 'Active'
      ]);
      
      let y = 100;
      
      // Print headers
      doc.setFont('helvetica', 'bold');
      headers.forEach((header, i) => {
        const x = 20 + i * 30;
        doc.text(header, i === 0 ? x : x - 10, y);
      });
      
      doc.setFont('helvetica', 'normal');
      // Print data
      data.forEach((row, i) => {
        y += 10;
        if (y > 270) { // Check if we need a new page
          doc.addPage();
          y = 20;
          // Reprint headers on new page
          doc.setFont('helvetica', 'bold');
          headers.forEach((header, i) => {
            const x = 20 + i * 30;
            doc.text(header, i === 0 ? x : x - 10, y);
          });
          doc.setFont('helvetica', 'normal');
          y += 10;
        }
        row.forEach((cell, j) => {
          const x = 20 + j * 30;
          doc.text(cell.toString(), j === 0 ? x : x - 10, y);
        });
      });
      
      y += 20;
      if (y > 270) { // Check if we need a new page
        doc.addPage();
        y = 20;
      }
    }
    
    // Payments Table
    if (dailyPayments.length > 0) {
      let y = dailyRecords.length > 0 ? 200 : 100;
      
      if (y > 240) { // If close to the end of page, start a new one
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Payment Records', 20, y);
      
      doc.setFontSize(10);
      const headers = ['Plate Number', 'Slot', 'Duration', 'Amount', 'Payment Time'];
      y += 15;
      
      // Print headers
      doc.setFont('helvetica', 'bold');
      headers.forEach((header, i) => {
        const x = 20 + i * 35;
        doc.text(header, i === 0 ? x : x - 15, y);
      });
      
      doc.setFont('helvetica', 'normal');
      // Print data
      dailyPayments.forEach((payment, i) => {
        y += 10;
        if (y > 270) { // Check if we need a new page
          doc.addPage();
          y = 20;
          // Reprint headers on new page
          doc.setFont('helvetica', 'bold');
          headers.forEach((header, i) => {
            const x = 20 + i * 35;
            doc.text(header, i === 0 ? x : x - 15, y);
          });
          doc.setFont('helvetica', 'normal');
          y += 10;
        }
        
        const row = [
          payment.recordId.carId.plateNumber,
          payment.recordId.slotId.slotNumber,
          `${payment.recordId.duration}h`,
          `${payment.amountPaid.toLocaleString()} Rwf`,
          formatShortDateTime(payment.paymentDate)
        ];
        
        row.forEach((cell, j) => {
          const x = 20 + j * 35;
          doc.text(cell.toString(), j === 0 ? x : x - 15, y);
        });
      });
    }
    
    // Save the PDF
    const filename = `DailyReport-${date}.pdf`;
    doc.save(filename);
    toast.success('Daily report downloaded successfully');
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
  
  const formatShortDateTime = (dateString) => {
    const options = { 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Bill view
  if (type === 'bill' && id) {
    return (
      <div>
        <Button 
          variant="outline" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate('/payments')}
        >
          <FaArrowLeft /> Back to Payments
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">Parking Receipt</h1>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="w-8 h-8" />
          </div>
        ) : !selectedRecord || !selectedPayment ? (
          <Card className="text-center py-8">
            <p className="text-red-500">Failed to load receipt data</p>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-4">
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold">PARKING RECEIPT</h2>
                  <p className="text-gray-500">Receipt #{selectedPayment._id.substring(0, 8)}</p>
                </div>
                <Button
                  variant="primary"
                  className="flex items-center gap-2"
                  onClick={generateBillPDF}
                >
                  <FaFileDownload /> Download
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Car Details:</h3>
                  <p><strong>Plate Number:</strong> {selectedRecord.carId.plateNumber}</p>
                  <p><strong>Driver Name:</strong> {selectedRecord.carId.driverName}</p>
                  <p><strong>Phone Number:</strong> {selectedRecord.carId.phoneNumber}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Parking Details:</h3>
                  <p><strong>Slot Number:</strong> {selectedRecord.slotId.slotNumber}</p>
                  <p><strong>Entry Time:</strong> {formatDateTime(selectedRecord.entryTime)}</p>
                  <p><strong>Exit Time:</strong> {formatDateTime(selectedRecord.exitTime)}</p>
                  <p><strong>Duration:</strong> {selectedRecord.duration} hours</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-2">Payment Details:</h3>
                <p><strong>Rate:</strong> 500 Rwf per hour</p>
                <p><strong>Amount:</strong> {selectedRecord.duration} × 500 = {selectedRecord.duration * 500} Rwf</p>
                <p className="text-lg font-bold mt-2">
                  <strong>Amount Paid:</strong> {selectedPayment.amountPaid} Rwf
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Payment Date: {formatDateTime(selectedPayment.paymentDate)}
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Default reports page
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      
      <Card title="Generate Daily Report" titleIcon={<FaCalendarAlt />} className="mb-6">
        <form onSubmit={fetchDailyReport} className="max-w-md">
          <FormInput
            label="Select Date"
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div className="mt-4 flex gap-2">
            <Button type="submit">
              Generate Report
            </Button>
          </div>
        </form>
      </Card>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="w-8 h-8" />
        </div>
      ) : dailyRecords.length > 0 || dailyPayments.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Report for {new Date(date).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <Button 
              variant="success"
              className="flex items-center gap-2"
              onClick={generateDailyReportPDF}
            >
              <FaFileDownload /> Download Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50">
              <div className="text-center">
                <p className="text-sm text-blue-600 font-medium">Total Cars Parked</p>
                <p className="text-3xl font-bold">{dailyRecords.length}</p>
              </div>
            </Card>
            <Card className="bg-green-50">
              <div className="text-center">
                <p className="text-sm text-green-600 font-medium">Total Payments</p>
                <p className="text-3xl font-bold">{dailyPayments.length}</p>
              </div>
            </Card>
            <Card className="bg-purple-50">
              <div className="text-center">
                <p className="text-sm text-purple-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">
                  {dailyPayments.reduce((sum, p) => sum + p.amountPaid, 0).toLocaleString()} Rwf
                </p>
              </div>
            </Card>
          </div>
          
          {dailyRecords.length > 0 && (
            <Card className="mb-6" title="Parking Records" titleIcon={<FaClipboardList />}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plate Number
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
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyRecords.map((record) => (
                      <tr key={record._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{record.carId.plateNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.slotId.slotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(record.entryTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.exitTime ? formatDateTime(record.exitTime) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.exitTime ? `${record.duration} hours` : 'Active'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${record.exitTime 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {record.exitTime ? 'Completed' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          
          {dailyPayments.length > 0 && (
            <Card title="Payment Records" titleIcon={<FaMoneyBillWave />}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plate Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyPayments.map((payment) => (
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
                          {payment.amountPaid.toLocaleString()} Rwf
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
      ) : (
        <Card className="text-center py-8 mt-4">
          <p className="text-gray-500">No data available for the selected date</p>
        </Card>
      )}
    </div>
  );
};

export default Reports;
