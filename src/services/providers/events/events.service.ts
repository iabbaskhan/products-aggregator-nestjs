import { Injectable, Logger } from '@nestjs/common';
import { ProviderService } from '@abstracts';
import { EventProduct } from '@types';

@Injectable()
export class EventsProviderService extends ProviderService {
  private readonly logger = new Logger(EventsProviderService.name);

  async getProducts(): Promise<EventProduct[]> {
    const events: EventProduct[] = [
      {
        eventId: `event-${Date.now()}`,
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring industry leaders',
        price: Math.round((299.99 + Math.random() * 200) * 100) / 100,
        currency: 'USD',
        available: Math.random() > 0.2,
        updatedAt: new Date().toISOString(),
        location: 'Convention Center',
        startDate: '2024-08-15T09:00:00Z',
        endDate: '2024-08-17T18:00:00Z',
        category: 'Technology',
        maxAttendees: 500,
        currentAttendees: Math.floor(Math.random() * 500)
      },
      {
        eventId: `event-${Date.now() + 1}`,
        title: 'Cooking Workshop',
        description: 'Learn advanced cooking techniques from professional chefs',
        price: Math.round((89.99 + Math.random() * 50) * 100) / 100,
        currency: 'USD',
        available: Math.random() > 0.3,
        updatedAt: new Date().toISOString(),
        location: 'Culinary Institute',
        startDate: '2024-06-22T10:00:00Z',
        endDate: '2024-06-22T16:00:00Z',
        category: 'Education',
        maxAttendees: 30,
        currentAttendees: Math.floor(Math.random() * 30)
      }
    ];

    this.logger.log(`Generated ${events.length} events products`);
    return events;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
