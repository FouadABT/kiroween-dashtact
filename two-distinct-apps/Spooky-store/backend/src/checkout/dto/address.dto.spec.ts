import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AddressDto } from './address.dto';

describe('AddressDto', () => {
  describe('validation', () => {
    it('should validate a complete address', async () => {
      const dto = plainToClass(AddressDto, {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate address without optional address2', async () => {
      const dto = plainToClass(AddressDto, {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when required fields are missing', async () => {
      const dto = plainToClass(AddressDto, {
        firstName: 'John',
        // Missing required fields
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when address1 is missing', async () => {
      const dto = plainToClass(AddressDto, {
        firstName: 'John',
        lastName: 'Doe',
        // address1 missing
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'address1')).toBe(true);
    });

    it('should fail validation when phone is missing', async () => {
      const dto = plainToClass(AddressDto, {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        // phone missing
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    it('should validate international address', async () => {
      const dto = plainToClass(AddressDto, {
        firstName: 'Jane',
        lastName: 'Smith',
        address1: '10 Downing Street',
        city: 'London',
        state: 'England',
        postalCode: 'SW1A 2AA',
        country: 'GB',
        phone: '+44 20 7946 0958',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate address with special characters', async () => {
      const dto = plainToClass(AddressDto, {
        firstName: 'José',
        lastName: "O'Brien",
        address1: '123 Rue de l\'Église',
        address2: 'Bâtiment A',
        city: 'Montréal',
        state: 'QC',
        postalCode: 'H2X 1Y7',
        country: 'CA',
        phone: '+1 514 555 0123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('field compatibility', () => {
    it('should accept address1 field (backend format)', async () => {
      const dto = plainToClass(AddressDto, {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St', // Backend format
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.address1).toBe('123 Main St');
    });

    it('should handle transformation from frontend format', () => {
      // Simulate frontend sending addressLine1/addressLine2
      const frontendData = {
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      };

      // Transform to backend format (this happens in CheckoutForm.tsx)
      const backendData = {
        firstName: frontendData.firstName,
        lastName: frontendData.lastName,
        address1: frontendData.addressLine1,
        address2: frontendData.addressLine2,
        city: frontendData.city,
        state: frontendData.state,
        postalCode: frontendData.postalCode,
        country: frontendData.country,
        phone: frontendData.phone,
      };

      const dto = plainToClass(AddressDto, backendData);
      expect(dto.address1).toBe('123 Main St');
      expect(dto.address2).toBe('Apt 4B');
    });
  });

  describe('edge cases', () => {
    it('should handle empty address2', async () => {
      const dto = plainToClass(AddressDto, {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle very long address lines', async () => {
      const longAddress = 'A'.repeat(200);
      const dto = plainToClass(AddressDto, {
        firstName: 'John',
        lastName: 'Doe',
        address1: longAddress,
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle various phone formats', async () => {
      const phoneFormats = [
        '+1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '1234567890',
        '+44 20 7946 0958',
      ];

      for (const phone of phoneFormats) {
        const dto = plainToClass(AddressDto, {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
          phone,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });
});
