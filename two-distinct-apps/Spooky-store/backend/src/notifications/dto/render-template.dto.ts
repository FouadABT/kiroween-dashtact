import { IsObject, IsNotEmpty } from 'class-validator';

export class RenderTemplateDto {
  @IsObject()
  @IsNotEmpty()
  variables: Record<string, any>;
}
