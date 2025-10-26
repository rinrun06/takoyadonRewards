export interface Franchise {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface CompanyOwned {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  franchise_id: number | null;
  company_owned_id: number | null;
  is_active: boolean;
}

export interface PendingUser {
  id: number;
  user_id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  franchise_id: number | null;
  branch_id: number | null;
  created_at: string;
}

export interface UserProfile {
  id: number;
  user_id: string;
  full_name: string;
  loyalty_points: number;
  total_visits: number;
  influencer_status: string;
  points: number;
}

export interface InfluencerApplication {
    id: number;
    user_id: string;
    platform: string;
    handle: string;
    followers: number;
    status: string;
    document_url?: string;
}

export interface CreateInfluencerApplication {
    user_id: string;
    platform: string;
    handle: string;
    followers: number;
    status: string;
    document_url: string;
}

export interface User {
    id: string;
    email: string;
    google_user_data: any;
}

export interface Feedback {
    id: number;
    created_at: string;
    type: 'general' | 'complaint' | 'suggestion';
    rating: number | null;
    message: string;
    photo_url: string | null;
    branch_id: number;
    user_id: string;
}
