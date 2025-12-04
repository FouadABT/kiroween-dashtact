import { PartialType } from '@nestjs/swagger';
import { CreateEcommerceSettingsDto } from './create-ecommerce-settings.dto';

export class UpdateEcommerceSettingsDto extends PartialType(
  CreateEcommerceSettingsDto,
) {}
