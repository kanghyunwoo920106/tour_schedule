import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { TravelPreferences } from '@/app/types/travel';

const client = new Client({});

export async function POST(request: Request) {
  try {
    const preferences: TravelPreferences = await request.json();
    const { startDate, endDate, country, purpose } = preferences;

    if (!country) {
      return NextResponse.json({ error: '여행지를 입력해주세요.' }, { status: 400 });
    }
    
    // 도시의 좌표를 가져옵니다
    const geocodeResponse = await client.geocode({
      params: {
        address: country,
        key: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    });

    if (!geocodeResponse.data.results[0]) {
      return NextResponse.json({ error: '도시를 찾을 수 없습니다.' }, { status: 404 });
    }

    const location = geocodeResponse.data.results[0].geometry.location;
    const activities = [];

    try {
      // 관광지 검색
      const attractionsResponse = await client.placesNearby({
        params: {
          location,
          radius: 5000,
          type: 'tourist_attraction',
          key: process.env.GOOGLE_MAPS_API_KEY || '',
        },
      });

      // 레스토랑 검색
      const restaurantsResponse = await client.placesNearby({
        params: {
          location,
          radius: 5000,
          type: 'restaurant',
          key: process.env.GOOGLE_MAPS_API_KEY || '',
        },
      });

      // 호텔 검색
      const hotelsResponse = await client.placesNearby({
        params: {
          location,
          radius: 5000,
          type: 'lodging',
          key: process.env.GOOGLE_MAPS_API_KEY || '',
        },
      });

      // 관광지 추가
      if (attractionsResponse.data.results.length > 0) {
        const attraction = attractionsResponse.data.results[0];
        activities.push({
          time: '09:00',
          title: attraction.name,
          description: attraction.vicinity || '위치 정보 없음',
          location: attraction.vicinity || '위치 정보 없음',
          category: 'attraction',
          duration: '2시간',
          price: attraction.price_level ? '💰'.repeat(attraction.price_level) : undefined,
        });
      }

      // 레스토랑 추가
      if (restaurantsResponse.data.results.length > 0) {
        const restaurant = restaurantsResponse.data.results[0];
        activities.push({
          time: '12:00',
          title: restaurant.name,
          description: restaurant.vicinity || '위치 정보 없음',
          location: restaurant.vicinity || '위치 정보 없음',
          category: 'restaurant',
          duration: '1시간',
          price: restaurant.price_level ? '💰'.repeat(restaurant.price_level) : undefined,
        });
      }

      // 호텔 추가
      if (hotelsResponse.data.results.length > 0) {
        const hotel = hotelsResponse.data.results[0];
        activities.push({
          time: '15:00',
          title: hotel.name,
          description: hotel.vicinity || '위치 정보 없음',
          location: hotel.vicinity || '위치 정보 없음',
          category: 'hotel',
          duration: '체크인',
          price: hotel.price_level ? '💰'.repeat(hotel.price_level) : undefined,
        });
      }

      // 활동 시간에 따라 정렬
      activities.sort((a: any, b: any) => {
        const timeA = parseInt(a.time.split(':')[0]);
        const timeB = parseInt(b.time.split(':')[0]);
        return timeA - timeB;
      });

      return NextResponse.json({ activities });
    } catch (apiError: any) {
      console.error('Google Places API 오류:', apiError);
      return NextResponse.json(
        { error: `Google Places API 오류: ${apiError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API 호출 중 오류 발생:', error);
    return NextResponse.json(
      { error: `서버 오류: ${error.message}` },
      { status: 500 }
    );
  }
} 