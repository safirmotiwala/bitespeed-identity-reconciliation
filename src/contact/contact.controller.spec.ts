import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

describe('ContactController', () => {
  let controller: ContactController;
  let service: ContactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: {
            reconcile: jest.fn().mockResolvedValue({
              primaryContactId: 1,
              emails: ['test@example.com'],
              phoneNumbers: ['1234567890'],
              secondaryContactIds: [],
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('/POST identify', () => {
    it('should return consolidated contact', async () => {
      const result = await controller.identify({
        email: 'test@example.com',
        phoneNumber: '1234567890',
      });

      expect(result.contact.primaryContactId).toBe(1);
      expect(result.contact.emails).toContain('test@example.com');
      expect(result.contact.phoneNumbers).toContain('1234567890');
    });
  });
});
