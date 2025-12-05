import { IsBoolean, IsString, IsArray, IsInt, Matches } from 'class-validator';

export class DNDSettingsDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string;

  @IsArray()
  @IsInt({ each: true })
  days: number[];
}
