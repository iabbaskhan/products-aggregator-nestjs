import { Product, PriceHistory } from '@prisma/client';

export interface ECommerceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  availability: boolean;
  lastUpdated: string;
  category: string;
  brand: string;
  stock: number;
}

export interface TicketingProduct {
  ticketId: string;
  eventName: string;
  eventDescription: string;
  ticketPrice: number;
  currency: string;
  isAvailable: boolean;
  lastModified: string;
  venue: string;
  eventDate: string;
  ticketType: string;
  remainingTickets: number;
}

export interface EventProduct {
  eventId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  available: boolean;
  updatedAt: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  maxAttendees: number;
  currentAttendees: number;
}

export interface NormalizedProduct {
  externalId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  availability: boolean;
  lastUpdated: Date;
  providerId: string;
}

export interface ProductFilters {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: boolean;
  providerId?: string;
  currency?: string;
}

export interface ProductWithHistory extends Product {
  provider: {
    id: string;
    name: string;
  };
  priceHistory: PriceHistory[];
}

export interface PriceChange {
  productId: string;
  productName: string;
  providerName: string;
  oldPrice: number;
  newPrice: number;
  currency: string;
  changePercentage: number;
  timestamp: Date;
}

