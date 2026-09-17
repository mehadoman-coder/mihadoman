export interface Contractor {
  id: string;
  name: string;
  companyName: string;
  category: 'general' | 'infrastructure' | 'finishing' | 'steel' | 'residential' | 'commercial';
  rating: number;
  reviewsCount: number;
  verified: boolean;
  featured?: boolean;
  location: string;
  experienceYears: number;
  completedProjectsCount: number;
  bio: string;
  phone: string;
  email: string;
  services: string[];
  startingPricePerMeter: number;
  licenseNumber: string;
  avatarUrl?: string;
  portfolioImages?: string[];
  classificationGrade: 'درجة ممتازة' | 'درجة أولى' | 'درجة ثانية' | 'درجة ثالثة' | 'درجة رابعة' | 'درجة أولى - مجلس المناقصات' | 'معتمد حكومي';
  coordinates?: { lat: number; lng: number };
  distanceKm?: number;
  createdAt?: any;
}

export interface Consultant {
  id: string;
  name: string;
  officeName: string;
  specialty: 'architectural' | 'structural' | 'mep' | 'project_management' | 'interior_design' | 'cost_control';
  rating: number;
  reviewsCount: number;
  verified: boolean;
  featured?: boolean;
  location: string;
  experienceYears: number;
  accreditedProjectsCount: number;
  bio: string;
  phone: string;
  email: string;
  services: string[];
  consultationFeePerHour: number;
  accreditationBody: string;
  avatarUrl?: string;
  portfolioImages?: string[];
  coordinates?: { lat: number; lng: number };
  distanceKm?: number;
  createdAt?: any;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  category: 'residential' | 'commercial' | 'industrial' | 'renovation' | 'consultancy' | 'tender';
  location: string;
  budgetRange: string;
  projectArea: number; // in m2
  authorName: string;
  authorType: 'client' | 'contractor' | 'consultant' | 'platform' | 'admin';
  contactPhone: string;
  contactEmail?: string;
  status: 'active' | 'closed' | 'in_progress';
  urgency: 'high' | 'medium' | 'low';
  featured: boolean;
  createdAt: any;
  deadline?: string;
  bidsCount?: number;
}

export interface CostCalculationResult {
  totalEstimatedCost: number;
  costPerMeter: number;
  skeletonCost: number; // العظم
  finishingCost: number; // التشطيب
  consultancyAndPermitsCost: number; // الإشراف والتراخيص
  hvacAndElectricalCost: number;
  contingencyReserve: number; // احتياطي الطوارئ
  estimatedDurationMonths: number;
  breakdown: {
    item: string;
    cost: number;
    percentage: number;
    details: string;
  }[];
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'client' | 'contractor' | 'consultant' | 'admin';
  phone?: string;
  avatarUrl?: string;
  companyName?: string;
}
