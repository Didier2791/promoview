import axios from 'axios';
import { API_URL } from '../../config';  //
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchUserPdfPlan = async (userId: number) => {
  const token = await AsyncStorage.getItem("token");

  const res = await axios.get(`${API_URL}/api/admin/plan/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.pdfPlan; // ex: /uploadsPdf/plan-123.pdf
};