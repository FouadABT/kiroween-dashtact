import { PartialType } from '@nestjs/mapped-types';
import { CreatePageRedirectDto } from './create-page-redirect.dto';

export class UpdatePageRedirectDto extends PartialType(CreatePageRedirectDto) {}
