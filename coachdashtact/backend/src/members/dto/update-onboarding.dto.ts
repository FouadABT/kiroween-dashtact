import { IsEnum } from 'class-validator';

export class UpdateOnboardingDto {
  @IsEnum(['pending', 'in_progress', 'completed'])
  status: 'pending' | 'in_progress' | 'completed';
}
