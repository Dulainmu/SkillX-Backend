import { CareerRecommendation } from '@/types/recommendations';

// Mock API service - replace with real API calls when backend is ready
export const recommendationsApi = {
  async getRecommendations(): Promise<CareerRecommendation[]> {
    const token = localStorage.getItem('skillx-token');
    if (!token) throw new Error('Not authenticated');
    const response = await fetch('http://localhost:4000/api/recommendations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    const data = await response.json();
    return data.recommendations;
  }
};