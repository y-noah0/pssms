import api from './api';

const ParkingRecordService = {
  getAllParkingRecords: async () => {
    try {
      const response = await api.get('/parking-records');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  getActiveParkingRecords: async () => {
    try {
      const response = await api.get('/parking-records/active');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  getCompletedParkingRecords: async () => {
    try {
      const response = await api.get('/parking-records/completed');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  getParkingRecordById: async (id) => {
    try {
      const response = await api.get(`/parking-records/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  getParkingRecordsByCarId: async (carId) => {
    try {
      const response = await api.get(`/parking-records/car/${carId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  getDailyParkingRecords: async (date) => {
    try {
      const response = await api.get(`/parking-records/daily/${date}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  createParkingRecord: async (recordData) => {
    try {
      const response = await api.post('/parking-records', recordData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
    recordExit: async (id, customDuration = null) => {
    try {
      const url = customDuration 
        ? `/parking-records/exit/${id}?customDuration=${customDuration}`
        : `/parking-records/exit/${id}`;
        
      const response = await api.put(url);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
};

export default ParkingRecordService;
