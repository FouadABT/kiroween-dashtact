import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto';

describe('InventoryController - Adjustment Operations', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    adjustQuantity: jest.fn(),
    getAdjustmentHistory: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    roleId: 'role-1',
  };

  const mockInventoryResponse = {
    id: 'inv-1',
    productVariantId: 'variant-1',
    quantity: 150,
    reserved: 20,
    available: 130,
    lowStockThreshold: 10,
    trackInventory: true,
    allowBackorder: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastRestockedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);

    jest.clearAllMocks();
  });

  describe('adjustQuantity', () => {
    it('should adjust inventory quantity and add userId from current user', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: 50,
        reason: 'Restock',
        notes: 'New shipment',
      };

      mockInventoryService.adjustQuantity.mockResolvedValue(
        mockInventoryResponse,
      );

      const result = await controller.adjustQuantity(dto, mockUser);

      expect(result).toEqual(mockInventoryResponse);
      expect(dto.userId).toBe('user-1');
      expect(mockInventoryService.adjustQuantity).toHaveBeenCalledWith(dto);
    });
  });
});
