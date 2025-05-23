import api from './api';

const ParkingSlotService = {
  getAllParkingSlots: async () => {
    try {
      const response = await api.get('/parking-slots');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  getAvailableParkingSlots: async () => {
    try {
      const response = await api.get('/parking-slots/available');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  getParkingSlotById: async (id) => {
    try {
      const response = await api.get(`/parking-slots/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  createParkingSlot: async (slotData) => {
    try {
      const response = await api.post('/parking-slots', slotData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  updateParkingSlotStatus: async (id, slotStatus) => {
    try {
      const response = await api.put(`/parking-slots/${id}`, { slotStatus });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  deleteParkingSlot: async (id) => {
    try {
      const response = await api.delete(`/parking-slots/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
};

export default ParkingSlotService;
