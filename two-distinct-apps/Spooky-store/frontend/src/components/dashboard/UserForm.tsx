'use client';

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserRole, UserProfile, CreateUserData, UpdateUserData } from "@/types/user";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { UserApi } from "@/lib/api";

interface UserFormProps {
  user?: UserProfile;
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isLoading = false }: UserFormProps) {
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: user?.name || "",
    password: "",
    roleId: user?.roleId || "",
    isActive: user?.isActive ?? true,
  });

  const isEditing = !!user;

  // Fetch available roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await UserApi.getRoles();
        setAvailableRoles(roles);
        
        // Set default role if creating new user
        if (!isEditing && roles.length > 0) {
          const defaultRole = roles.find(r => r.name === 'USER') || roles[0];
          setFormData(prev => ({ ...prev, roleId: defaultRole.id }));
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && user) {
        const updateData: UpdateUserData & { password?: string } = {
          id: user.id,
          email: formData.email,
          name: formData.name,
          roleId: formData.roleId,
          isActive: formData.isActive,
        };
        
        // Only include password if it's provided
        if (formData.password && formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        await onSubmit(updateData);
      } else {
        const createData: CreateUserData = {
          email: formData.email,
          name: formData.name,
          password: formData.password,
          roleId: formData.roleId,
        };
        
        await onSubmit(createData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password {!isEditing && "*"}
            {isEditing && (
              <span className="text-sm text-muted-foreground ml-1">
                (leave blank to keep current)
              </span>
            )}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={isEditing ? "New password (optional)" : "Password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={isLoading}
            required={!isEditing}
          />
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.roleId}
            onValueChange={(value) => setFormData({ ...formData, roleId: value })}
            disabled={isLoading || loadingRoles}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Select role"} />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                  {role.description && (
                    <span className="text-xs text-muted-foreground ml-2">
                      - {role.description}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          disabled={isLoading}
        />
        <Label htmlFor="isActive">Active User</Label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading && (
            <LoadingSpinner size="sm" className="mr-2" />
          )}
          {isEditing ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
