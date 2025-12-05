import { IsString, Matches } from 'class-validator';

export class UpdateScheduleDto {
  @IsString()
  @Matches(
    /^(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})$/,
    {
      message: 'Invalid cron expression',
    },
  )
  schedule: string;
}
