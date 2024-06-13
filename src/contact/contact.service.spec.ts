import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService, PrismaService],
    }).compile();

    service = module.get<ContactService>(ContactService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reconcile', () => {
    it('should create a new primary contact if none exists', async () => {
      jest.spyOn(prisma.contact, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.contact, 'create').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        phoneNumber: '1234567890',
        linkPrecedence: 'primary',
        createdAt: new Date(),
        updatedAt: new Date(),
        linkedId: null,
        deletedAt: null,
      });

      const result = await service.reconcile({
        email: 'test@example.com',
        phoneNumber: '1234567890',
      });

      expect(result.primaryContactId).toBe(1);
      expect(result.emails).toContain('test@example.com');
      expect(result.phoneNumbers).toContain('1234567890');
    });
  });
});
