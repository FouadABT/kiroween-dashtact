import 'reflect-metadata';

export interface CronJobOptions {
  name: string;
  description?: string;
  schedule: string;
  isLocked?: boolean;
  notifyOnFailure?: boolean;
}

export const CRON_JOB_METADATA_KEY = 'cronJob:options';
export const CRON_JOB_HANDLER_KEY = 'cronJob:handler';

export const RegisterCronJob = (options: CronJobOptions): MethodDecorator => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    // Store metadata for discovery
    Reflect.defineMetadata(
      CRON_JOB_METADATA_KEY,
      options,
      target,
      propertyKey,
    );
    Reflect.defineMetadata(
      CRON_JOB_HANDLER_KEY,
      `${target.constructor.name}.${String(propertyKey)}`,
      target,
      propertyKey,
    );

    return descriptor;
  };
};
