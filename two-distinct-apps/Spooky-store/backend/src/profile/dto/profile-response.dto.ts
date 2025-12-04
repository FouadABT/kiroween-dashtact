export class ProfileResponseDto {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastPasswordChange: Date | null;
}
