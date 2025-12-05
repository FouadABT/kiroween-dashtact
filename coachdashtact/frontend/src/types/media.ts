export enum UploadType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  AVATAR = 'AVATAR',
  EDITOR_IMAGE = 'EDITOR_IMAGE',
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  ROLE_BASED = 'ROLE_BASED',
}

export interface Upload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  type: UploadType;
  category?: string;
  uploadedById: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  visibility: Visibility;
  allowedRoles: string[];
  usedIn?: Record<string, string[]>;
  usageCount: number;
  altText?: string;
  title?: string;
  description?: string;
  tags: string[];
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedById?: string;
}

export interface GetUploadsQuery {
  type?: UploadType;
  visibility?: Visibility;
  uploadedBy?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'size' | 'filename' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface GetUploadsResponse {
  data: Upload[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUploadDto {
  title?: string;
  description?: string;
  altText?: string;
  tags?: string[];
  visibility?: Visibility;
  allowedRoles?: string[];
}
