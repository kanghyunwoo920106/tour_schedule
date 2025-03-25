import { TravelPreferences, TravelSchedule, TravelActivity } from '../types/travel';

// 여행 목적에 따른 활동 추천 가중치
const purposeWeights = {
  family: { attraction: 0.4, activity: 0.3, restaurant: 0.2, hotel: 0.1 },
  couple: { attraction: 0.3, activity: 0.3, restaurant: 0.3, hotel: 0.1 },
  friends: { attraction: 0.3, activity: 0.4, restaurant: 0.2, hotel: 0.1 },
  relaxation: { attraction: 0.2, activity: 0.2, restaurant: 0.2, hotel: 0.4 },
  sightseeing: { attraction: 0.5, activity: 0.2, restaurant: 0.2, hotel: 0.1 },
};

export class TravelService {
  private static instance: TravelService;

  private constructor() {}

  public static getInstance(): TravelService {
    if (!TravelService.instance) {
      TravelService.instance = new TravelService();
    }
    return TravelService.instance;
  }

  async generateTravelSchedule(preferences: TravelPreferences): Promise<TravelSchedule[]> {
    const { startDate, endDate, country, purpose } = preferences;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const schedule: TravelSchedule[] = [];
    
    for (let day = 1; day <= days; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day - 1);
      
      const activities = await this.getActivitiesForDay(currentDate, country, purpose);
      
      schedule.push({
        day,
        date: currentDate,
        activities,
      });
    }

    return schedule;
  }

  private async getActivitiesForDay(
    date: Date,
    country: string,
    purpose: string
  ): Promise<TravelActivity[]> {
    try {
      const response = await fetch('/api/travel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: date,
          endDate: date,
          country,
          purpose,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API 호출 실패');
      }

      return data.activities;
    } catch (error: any) {
      console.error('API 호출 중 오류 발생:', error);
      // API 호출 실패 시 기본 데이터 반환
      return [
        {
          time: '09:00',
          title: '관광지 방문',
          description: '도시의 대표적인 관광지 방문',
          location: '도시 중심부',
          category: 'attraction',
          duration: '2시간',
        },
        {
          time: '12:00',
          title: '점심 식사',
          description: '현지 맛집에서 식사',
          location: '시내',
          category: 'restaurant',
          duration: '1시간',
        },
        {
          time: '14:00',
          title: '문화 체험',
          description: '현지 문화 체험 활동',
          location: '문화 센터',
          category: 'activity',
          duration: '3시간',
        },
      ];
    }
  }
} 