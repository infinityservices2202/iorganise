export type UserRole = 'customer' | 'organizer' | 'admin';

export type ViewName =
  | 'auth'
  | 'customer-home'
  | 'customer-categories'
  | 'customer-bookings'
  | 'customer-favorites'
  | 'customer-profile'
  | 'customer-search'
  | 'organizer-profile'
  | 'organizer-dashboard'
  | 'organizer-services'
  | 'organizer-bookings'
  | 'organizer-earnings'
  | 'organizer-profile-edit'
  | 'admin-panel'
  | 'service-detail'
  | 'booking-form'
  | 'payment-page'
  | 'chat';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface OrganizerProfile {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  city?: string;
  state?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  experience: number;
  user: User;
  services: Service[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Service {
  id: string;
  organizerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'per_person';
  images: string[];
  duration?: string;
  maxGuests?: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  organizer: OrganizerProfile;
  category: Category;
}

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ongoing' | 'completed' | 'cancelled';
  eventDate: string;
  eventTime: string;
  guestCount?: number;
  notes?: string;
  totalAmount: number;
  advancePaid: number;
  createdAt: string;
  service: Service;
  customer: User;
  payments: Payment[];
  review?: Review;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  rating: number;
  comment?: string;
  images: string[];
  createdAt: string;
  user: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'booking' | 'payment' | 'promotion';
  isRead: boolean;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  serviceId: string;
  service: Service;
}

export interface Earning {
  id: string;
  organizerId: string;
  bookingId?: string;
  amount: number;
  type: 'booking' | 'withdrawal';
  status: 'available' | 'withdrawn' | 'pending';
  createdAt: string;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  city?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  organizerId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}
