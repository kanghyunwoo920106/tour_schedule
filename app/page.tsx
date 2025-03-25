'use client';

import { useState } from 'react';
import { TravelPreferences, TravelSchedule } from './types/travel';
import { TravelService } from './services/travelService';

export default function Home() {
  const [preferences, setPreferences] = useState<TravelPreferences>({
    startDate: new Date(),
    endDate: new Date(),
    country: '',
    purpose: 'sightseeing',
  });
  const [schedule, setSchedule] = useState<TravelSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const travelService = TravelService.getInstance();
      const generatedSchedule = await travelService.generateTravelSchedule(preferences);
      setSchedule(generatedSchedule);
    } catch (error) {
      console.error('여행 일정 생성 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">맞춤 여행 코스 추천</h1>
        <p className="text-gray-600 text-center mb-8">당신의 여행 스타일에 맞는 최적의 일정을 만들어드립니다</p>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 mb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출발일</label>
              <input
                type="date"
                value={preferences.startDate.toISOString().split('T')[0]}
                onChange={(e) => setPreferences({ ...preferences, startDate: new Date(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">도착일</label>
              <input
                type="date"
                value={preferences.endDate.toISOString().split('T')[0]}
                onChange={(e) => setPreferences({ ...preferences, endDate: new Date(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">여행지</label>
              <input
                type="text"
                value={preferences.country}
                onChange={(e) => setPreferences({ ...preferences, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="예: 일본, 프랑스"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">여행 목적</label>
              <select
                value={preferences.purpose}
                onChange={(e) => setPreferences({ ...preferences, purpose: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="family">가족 여행</option>
                <option value="couple">연인과 함께</option>
                <option value="friends">친구들과 함께</option>
                <option value="relaxation">휴식</option>
                <option value="sightseeing">관광</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                일정 생성 중...
              </span>
            ) : (
              '여행 일정 생성하기'
            )}
          </button>
        </form>

        {schedule.length > 0 && (
          <div className="space-y-6">
            {schedule.map((day, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">Day {day.day}</span>
                  {day.date.toLocaleDateString()}
                </h2>
                <div className="space-y-4">
                  {day.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors">
                      <div className="font-semibold text-blue-600">{activity.time}</div>
                      <div className="text-lg font-medium text-gray-800">{activity.title}</div>
                      <div className="text-gray-600">{activity.description}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {activity.location}
                        <span className="mx-2">•</span>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {activity.duration}
                        {activity.price && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-blue-600">{activity.price}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
