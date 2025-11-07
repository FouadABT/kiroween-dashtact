"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/PageTransition";
import { UserForm } from "@/components/dashboard/UserForm";
import { UserProfile, CreateUserData, UpdateUserData } from "@/types/user";
import { UserApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/hooks/use-toast";

// Backend response wrapper type
interface BackendResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Users Management Page
 * 
 * Dashboard page for managing users with full CRUD operations
 */
export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | undefined>();

  // Debug log
  useEffect(() => {
    console.log("🔍 UsersPage mounted");
  }, []);

  useEffect(() => {
    console.log("🔄 showForm state changed:", showForm);
  }, [showForm]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching users from API...");
      const response = await UserApi.getUsers();
      console.log("Users fetched:", response);
      
      // Backend returns { statusCode, message, data: { users, total, page, limit } }
      // So we need to access response.data.users
      const backendResponse = response as unknown as BackendResponse<{ users: UserProfile[]; total: number; page: number; limit: number }>;
      const usersData = backendResponse.data?.users || [];
      console.log("Parsed users:", usersData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users. Check if backend is running on port 3001.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (data: CreateUserData) => {
    try {
      setIsLoading(true);
      console.log("Creating user with data:", data);
      const result = await UserApi.createUser(data);
      console.log("User created successfully:", result);
      
      // Backend returns { statusCode, message, data: user }
      const backendResponse = result as unknown as BackendResponse<UserProfile>;
      const userData = backendResponse.data || result;
      console.log("Created user data:", userData);
      
      toast.success("User created successfully");
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create user. Is the backend running?";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (data: UpdateUserData) => {
    try {
      setIsLoading(true);
      console.log("Updating user with data:", data);
      
      // Remove id from the body since it's in the URL
      const { id, ...updateData } = data;
      console.log("Update payload (without id):", updateData);
      
      await UserApi.updateUser(id, updateData);
      toast.success("User updated successfully");
      setShowForm(false);
      setEditingUser(undefined);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      setIsLoading(true);
      await UserApi.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    console.log("Add User button clicked");
    setEditingUser(undefined);
    setShowForm(true);
    console.log("showForm set to true");
  };

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(undefined);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across your application.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Users</h2>
              <p className="text-muted-foreground">
                Manage user accounts and permissions
              </p>
            </div>
            <Button 
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add User {showForm && "✓"}
            </Button>
          </div>

          {/* User Form */}
          {showForm && (
            <Card className="border-2 border-blue-500">
              <CardHeader className="bg-blue-50">
                <CardTitle>{editingUser ? "Edit User" : "Add New User"}</CardTitle>
                <p className="text-sm text-muted-foreground">Form is visible!</p>
              </CardHeader>
              <CardContent className="pt-6">
                <UserForm
                  user={editingUser}
                  onSubmit={(data) => {
                    if (editingUser) {
                      return handleUpdateUser(data as UpdateUserData);
                    } else {
                      return handleCreateUser(data as CreateUserData);
                    }
                  }}
                  onCancel={handleCancelForm}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Debug indicator */}
          {showForm && (
            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
              <p className="text-sm font-bold">DEBUG: Form should be visible above</p>
              <p className="text-xs">showForm = {String(showForm)}</p>
            </div>
          )}

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && !showForm ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No users found. Click &quot;Add User&quot; to create your first user.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name || "No name"}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            user.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                            {user.role.name}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                          disabled={isLoading}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}