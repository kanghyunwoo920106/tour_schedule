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
    
    // API 키 확인
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API 키가 설정되지 않았습니다.');
      return NextResponse.json({ error: 'API 키 설정 오류' }, { status: 500 });
    }
    
    // 도시의 좌표를 가져옵니다
    try {
      console.log(`[geocode] 검색 국가/도시: ${country}`);
      const geocodeResponse = await client.geocode({
        params: {
          address: country,
          key: apiKey,
        },
      });

      if (!geocodeResponse.data.results[0]) {
        return NextResponse.json({ error: '도시를 찾을 수 없습니다.' }, { status: 404 });
      }

      const location = geocodeResponse.data.results[0].geometry.location;
      console.log(`[geocode] 위치 정보 확인: ${JSON.stringify(location)}`);
      
      const activities = [];

      try {
        // 관광지 검색
        console.log(`[places] 관광지 검색 중...`);
        const attractionsResponse = await client.placesNearby({
          params: {
            location,
            radius: 5000,
            type: 'tourist_attraction',
            key: apiKey,
          },
        });

        // 레스토랑 검색
        console.log(`[places] 레스토랑 검색 중...`);
        const restaurantsResponse = await client.placesNearby({
          params: {
            location,
            radius: 5000,
            type: 'restaurant',
            key: apiKey,
          },
        });

        // 호텔 검색
        console.log(`[places] 호텔 검색 중...`);
        const hotelsResponse = await client.placesNearby({
          params: {
            location,
            radius: 5000,
            type: 'lodging',
            key: apiKey,
          },
        });

        // 관광지 추가
        console.log(`[places] 발견된 관광지: ${attractionsResponse.data.results.length}`);
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
        console.log(`[places] 발견된 레스토랑: ${restaurantsResponse.data.results.length}`);
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
        console.log(`[places] 발견된 호텔: ${hotelsResponse.data.results.length}`);
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
          { error: `Google Places API 오류: ${apiError.message || '알 수 없는 오류'}` },
          { status: 500 }
        );
      }
    } catch (geocodeError: any) {
      console.error('Geocode API 오류:', geocodeError);
      return NextResponse.json(
        { error: `Geocode API 오류: ${geocodeError.message || '알 수 없는 오류'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API 호출 중 오류 발생:', error);
    return NextResponse.json(
      { error: `서버 오류: ${error.message || '알 수 없는 오류'}` },
      { status: 500 }
    );
  }
} 