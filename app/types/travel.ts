export type TravelPurpose = 'family' | 'couple' | 'friends' | 'relaxation' | 'sightseeing';

export interface TravelPreferences {
  startDate: Date;
  endDate: Date;
  country: string;
  purpose: TravelPurpose;
}

export interface TravelSchedule {
  day: number;
  date: Date;
  activities: TravelActivity[];
}

export interface TravelActivity {
  time: string;
  title: string;
  description: string;
  location: string;
  category: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'activity';
  duration: string;
  price?: string;
  bookingUrl?: string;
} 