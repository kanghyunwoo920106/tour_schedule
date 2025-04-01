import { TravelPreferences, TravelSchedule, TravelActivity, TravelPurpose } from '../types/travel';

// 개발 모드 설정 (API 키 문제로 테스트가 어려울 때 true로 설정)
const DEV_MODE = false;

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
      
      let activities;
      
      if (DEV_MODE) {
        // 개발 모드: 모의 데이터 사용
        activities = this.getMockActivities(country, purpose, currentDate);
      } else {
        // 실제 API 모드
        activities = await this.getActivitiesForDay(currentDate, country, purpose);
      }
      
      schedule.push({
        day,
        date: currentDate,
        activities,
      });
    }

    return schedule;
  }

  private getMockActivities(country: string, purpose: string, date: Date): TravelActivity[] {
    // 날짜에 따른 활동 변화를 위한 기본 활동 목록
    const attractions: TravelActivity[] = [
      {
        time: '09:00',
        title: `${country} 대표 관광지`,
        description: `${country}의 가장 유명한 관광지`,
        location: `${country} 중심부`,
        category: 'attraction' as const,
        duration: '2시간',
      },
      {
        time: '09:00',
        title: `${country} 역사 박물관`,
        description: `${country}의 역사와 문화를 한눈에 볼 수 있는 박물관`,
        location: `${country} 문화 지구`,
        category: 'attraction' as const,
        duration: '2시간',
      },
      {
        time: '09:00',
        title: `${country} 공원`,
        description: `${country}의 아름다운 자연을 감상할 수 있는 공원`,
        location: `${country} 공원 지구`,
        category: 'attraction' as const,
        duration: '2시간',
      }
    ];

    const restaurants: TravelActivity[] = [
      {
        time: '12:00',
        title: '현지 맛집',
        description: `${country}의 전통 요리를 맛볼 수 있는 레스토랑`,
        location: `${country} 음식 지구`,
        category: 'restaurant' as const,
        duration: '1시간 30분',
      },
      {
        time: '12:00',
        title: '현대식 레스토랑',
        description: `${country}의 현대적인 요리를 맛볼 수 있는 레스토랑`,
        location: `${country} 현대 지구`,
        category: 'restaurant' as const,
        duration: '1시간 30분',
      },
      {
        time: '12:00',
        title: '전통 시장',
        description: `${country}의 현지 음식을 맛볼 수 있는 전통 시장`,
        location: `${country} 전통 시장`,
        category: 'restaurant' as const,
        duration: '1시간 30분',
      }
    ];

    // 날짜에 따른 활동 변화를 위한 특별 활동 목록
    const specificActivities: Record<TravelPurpose, TravelActivity[]> = {
      family: [
        {
          time: '14:00',
          title: '가족 친화적 테마파크',
          description: `${country}의 가족 모두가 즐길 수 있는 테마파크`,
          location: `${country} 시내`,
          category: 'activity' as const,
          duration: '3시간',
        },
        {
          time: '14:00',
          title: '동물원 방문',
          description: `${country}의 다양한 동물을 볼 수 있는 동물원`,
          location: `${country} 동물원`,
          category: 'activity' as const,
          duration: '3시간',
        },
        {
          time: '14:00',
          title: '과학 박물관',
          description: `${country}의 과학과 기술을 체험할 수 있는 박물관`,
          location: `${country} 과학 지구`,
          category: 'activity' as const,
          duration: '3시간',
        }
      ],
      couple: [
        {
          time: '18:00',
          title: '로맨틱 디너',
          description: `${country}의 로맨틱한 레스토랑에서 저녁 식사`,
          location: `${country} 강변`,
          category: 'restaurant' as const,
          duration: '2시간',
        },
        {
          time: '18:00',
          title: '와이너리 투어',
          description: `${country}의 와이너리에서 와인 시음과 투어`,
          location: `${country} 와인 지역`,
          category: 'activity' as const,
          duration: '2시간',
        },
        {
          time: '18:00',
          title: '스파 데이트',
          description: `${country}의 프리미엄 스파에서 커플 마사지`,
          location: `${country} 스파 지구`,
          category: 'activity' as const,
          duration: '2시간',
        }
      ],
      friends: [
        {
          time: '19:00',
          title: '현지 펍 투어',
          description: `${country}의 인기 있는 펍과 바를 체험`,
          location: `${country} 나이트라이프 지역`,
          category: 'activity' as const,
          duration: '3시간',
        },
        {
          time: '19:00',
          title: '클럽 투어',
          description: `${country}의 유명한 클럽에서 파티`,
          location: `${country} 클럽 지구`,
          category: 'activity' as const,
          duration: '3시간',
        },
        {
          time: '19:00',
          title: '게임 센터',
          description: `${country}의 최신 게임 센터에서 게임`,
          location: `${country} 게임 지구`,
          category: 'activity' as const,
          duration: '3시간',
        }
      ],
      relaxation: [
        {
          time: '14:00',
          title: '스파 & 웰니스',
          description: `${country}의 프리미엄 스파에서 휴식`,
          location: `${country} 리조트 지역`,
          category: 'activity' as const,
          duration: '2시간',
        },
        {
          time: '14:00',
          title: '요가 클래스',
          description: `${country}의 전문 요가 센터에서 요가 수업`,
          location: `${country} 웰니스 센터`,
          category: 'activity' as const,
          duration: '2시간',
        },
        {
          time: '14:00',
          title: '해변 휴식',
          description: `${country}의 아름다운 해변에서 휴식`,
          location: `${country} 해변 지역`,
          category: 'activity' as const,
          duration: '2시간',
        }
      ],
      sightseeing: [
        {
          time: '13:00',
          title: '관광 명소 투어',
          description: `${country}의 주요 관광 명소 가이드 투어`,
          location: `${country} 역사 지구`,
          category: 'attraction' as const,
          duration: '3시간',
        },
        {
          time: '13:00',
          title: '문화 유산 투어',
          description: `${country}의 세계 문화 유산 방문`,
          location: `${country} 문화 유산 지구`,
          category: 'attraction' as const,
          duration: '3시간',
        },
        {
          time: '13:00',
          title: '도시 하이킹',
          description: `${country}의 도시 명소를 도보로 탐방`,
          location: `${country} 도시 중심부`,
          category: 'attraction' as const,
          duration: '3시간',
        }
      ]
    };

    // 날짜를 기반으로 활동 선택 (날짜의 일자에 따라 다른 활동 선택)
    const dayOfMonth = date.getDate();
    const attractionIndex = dayOfMonth % attractions.length;
    const restaurantIndex = (dayOfMonth + 1) % restaurants.length;
    const specificActivityIndex = (dayOfMonth + 2) % specificActivities[purpose as keyof typeof specificActivities].length;

    return [
      attractions[attractionIndex],
      restaurants[restaurantIndex],
      specificActivities[purpose as keyof typeof specificActivities][specificActivityIndex],
      {
        time: '19:00',
        title: `${country} 럭셔리 호텔`,
        description: `${country}의 중심부에 위치한 고급 호텔`,
        location: `${country} 비즈니스 지구`,
        category: 'hotel' as const,
        duration: '체크인',
      },
    ];
  }

  public async getActivitiesForDay(
    date: Date,
    country: string,
    purpose: string
  ): Promise<TravelActivity[]> {
    try {
      console.log(`[travelService] API 호출: ${country}, ${purpose}`);
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
        console.error('[travelService] API 응답 오류:', data.error);
        throw new Error(data.error || 'API 호출 실패');
      }

      console.log(`[travelService] 활동 데이터 수신: ${data.activities.length}개`);
      return data.activities;
    } catch (error: any) {
      console.error('[travelService] API 호출 중 오류 발생:', error);
      
      // 폴백 활동을 국가 및 목적에 맞게 커스터마이즈
      return [
        {
          time: '09:00',
          title: `${country} 관광지 방문`,
          description: `${country}의 대표적인 관광지 방문`,
          location: `${country} 중심부`,
          category: 'attraction' as const,
          duration: '2시간',
        },
        {
          time: '12:00',
          title: `${country} 현지 음식 체험`,
          description: `${country}의 현지 맛집에서 식사`,
          location: `${country} 음식 지구`,
          category: 'restaurant' as const,
          duration: '1시간',
        },
        {
          time: '14:00',
          title: `${country} 문화 체험`,
          description: `${country}의 현지 문화 체험 활동`,
          location: `${country} 문화 센터`,
          category: 'activity',
          duration: '3시간',
        },
      ];
    }
  }
} 