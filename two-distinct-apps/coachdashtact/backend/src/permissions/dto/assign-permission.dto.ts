import { IsString, IsNotEmpty } from 'class-validator';

export class AssignPermissionDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  permissionId: string;
}
