export type UserRole = 'acquirer' | 'seller' | 'admin';
export type MembershipPlan = 'Basic' | 'Intermediate' | 'Platinum' | 'Diamond';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Location {
  country: 'UAE' | 'Qatar' | 'Singapore' | 'Malaysia';
  city: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'blocked';
  businessName?: string;
  location?: Location;
  subscription?: {
    planId: MembershipPlan;
    active: boolean;
    expiryDate: any;
  };
  createdAt: any;
}

export type BusinessCategory = 'Micro Business' | 'Partnership Sale' | 'Full Business Sale' | 'Investment Opportunity';
export type BusinessStatus = 'under_review' | 'approved' | 'rejected';

export interface Favorite {
  id: string;
  userId: string;
  businessId: string;
  createdAt: any;
}

export interface BusinessListing {
  id: string;
  title: string;
  category: BusinessCategory;
  price: number;
  location: Location;
  description: string;
  revenue?: number;
  profit?: number;
  yearsOfOperation?: number;
  documents?: string[];
  images?: string[];
  status: BusinessStatus;
  planApproved: boolean; // Dual approval logic
  planType: MembershipPlan;
  isFeatured?: boolean;
  ownerId: string;
  createdAt: any;
}

export interface PlanRequest {
  id: string;
  assetOwnerId: string;
  businessId: string;
  planName: MembershipPlan;
  status: ApprovalStatus;
  createdAt: any;
  notes?: string;
}

export interface Enquiry {
  id: string;
  acquirerId: string;
  ownerId: string;
  businessId: string;
  message: string;
  createdAt: any;
}

export interface ChatMessage {
  id: string;
  enquiryId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export type NotificationType = 'plan_update' | 'listing_update' | 'new_enquiry' | 'new_message';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  relatedId?: string; // listingId, enquiryId, etc.
  createdAt: any;
}
