import { Injectable, Logger } from '@nestjs/common';
import { ProviderService } from '@abstracts';
import { TicketingProduct } from '@types';

@Injectable()
export class TicketingProviderService extends ProviderService {
  private readonly logger = new Logger(TicketingProviderService.name);

  async getProducts(): Promise<TicketingProduct[]> {
    const tickets: TicketingProduct[] = [
      {
        ticketId: `ticket-${Date.now()}`,
        eventName: 'Rock Concert 2024',
        eventDescription: 'Amazing rock concert featuring top artists',
        ticketPrice: Math.round((75.00 + Math.random() * 50) * 100) / 100,
        currency: 'USD',
        isAvailable: Math.random() > 0.4,
        lastModified: new Date().toISOString(),
        venue: 'Madison Square Garden',
        eventDate: '2024-06-15T20:00:00Z',
        ticketType: 'General Admission',
        remainingTickets: Math.floor(Math.random() * 200)
      },
      {
        ticketId: `ticket-${Date.now() + 1}`,
        eventName: 'Broadway Musical',
        eventDescription: 'Award-winning Broadway musical performance',
        ticketPrice: Math.round((120.00 + Math.random() * 80) * 100) / 100,
        currency: 'USD',
        isAvailable: Math.random() > 0.3,
        lastModified: new Date().toISOString(),
        venue: 'Broadway Theater',
        eventDate: '2024-07-20T19:30:00Z',
        ticketType: 'Premium Seating',
        remainingTickets: Math.floor(Math.random() * 100)
      }
    ];

    this.logger.log(`Generated ${tickets.length} ticketing products`);
    return tickets;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
