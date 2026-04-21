import { create } from 'zustand';
import { BusinessListing, Location, MembershipPlan, BusinessCategory } from './types';

interface ListingForm {
  title: string;
  category: BusinessCategory;
  price: number;
  location: Location;
  description: string;
  revenue?: number;
  profit?: number;
  yearsOfOperation?: number;
  images: string[];
  documents: string[];
  planType: MembershipPlan;
}

interface ListingState {
  currentStep: number;
  form: ListingForm;
  setStep: (step: number) => void;
  updateForm: (data: Partial<ListingForm>) => void;
  resetForm: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const initialForm: ListingForm = {
  title: '',
  category: 'Micro Business',
  price: 0,
  location: { country: 'UAE', city: '' },
  description: '',
  images: [],
  documents: [],
  planType: 'Basic'
};

export const useListingStore = create<ListingState>((set) => ({
  currentStep: 1,
  form: initialForm,
  setStep: (step) => set({ currentStep: step }),
  updateForm: (data) => set((state) => ({ 
    form: { 
      ...state.form, 
      ...data,
      location: { ...state.form.location, ...(data.location || {}) }
    } 
  })),
  resetForm: () => set({ currentStep: 1, form: initialForm }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
}));
