import { IsBoolean, IsOptional, IsString, IsArray, IsInt, Matches } from 'class-validator';

export class UpdatePreferenceDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  dndEnabled?: boolean;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'dndStartTime must be in HH:MM format',
  })
  dndStartTime?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'dndEndTime must be in HH:MM format',
  })
  dndEndTime?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  dndDays?: number[];
}
