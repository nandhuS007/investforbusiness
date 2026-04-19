export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  subscription?: {
    planId: string;
    active: boolean;
    expiryDate: any;
  };
}

export type BusinessCategory = 'Micro Business' | 'Partnership Sale' | 'Full Business' | 'Investment';
export type BusinessStatus = 'under_review' | 'approved' | 'rejected';

export interface BusinessListing {
  id: string;
  title: string;
  category: BusinessCategory;
  price: number;
  location: string;
  description: string;
  revenue?: number;
  profit?: number;
  yearsOfOperation?: number;
  documents?: string[];
  images?: string[];
  status: BusinessStatus;
  isFeatured?: boolean;
  ownerId: string;
  createdAt: any;
}

export interface Enquiry {
  id: string;
  userId: string;
  businessId: string;
  message: string;
  createdAt: any;
}
