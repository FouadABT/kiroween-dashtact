'use client';

/**
 * NewConversationDialog Component
 * Dialog for creating new conversations (direct or group)
 */

import { useState, useEffect } from 'react';
import { Search, X, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useMessaging } from '@/contexts/MessagingContext';
import { UserApi } from '@/lib/api';
import { UserProfile } from '@/types/user';
import { cn } from '@/lib/utils';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationDialog({ open, onOpenChange }: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { createConversation, selectConversation } = useMessaging();

  // Load initial users and handle search
  useEffect(() => {
    if (!open) return;

    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const response = await UserApi.getUsers({ 
          search: searchQuery || undefined,
          limit: 50,
          page: 1
        });
        // Handle nested response structure: { data: { users: [...] } }
        const usersList = response.data?.users || response.users || [];
        setUsers(usersList);
      } catch (error) {
        console.error('Failed to load users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timeout = setTimeout(loadUsers, searchQuery ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [searchQuery, open]);

  const handleToggleUser = (user: UserProfile) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.filter(u => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;

    setIsCreating(true);
    try {
      const conversation = await createConversation({
        type: selectedUsers.length === 1 ? 'DIRECT' : 'GROUP',
        participantIds: selectedUsers.map(u => u.id),
        name: selectedUsers.length > 1 ? groupName : undefined,
      });

      // Select the new conversation
      selectConversation(conversation.id);
      
      // Close dialog and reset
      onOpenChange(false);
      setSearchQuery('');
      setSelectedUsers([]);
      setGroupName('');
      setUsers([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const isGroupConversation = selectedUsers.length > 1;
  const canCreate = selectedUsers.length > 0 && (!isGroupConversation || groupName.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Search for users and create a new conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <Badge
                  key={user.id}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 flex items-center gap-2"
                >
                  <span className="text-sm">{user.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Group name input */}
          {isGroupConversation && (
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}

          {/* User search */}
          <div className="space-y-2">
            <Label htmlFor="user-search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="user-search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* User list */}
          <div className="max-h-[400px] overflow-y-auto space-y-2 border border-border rounded-lg p-2 bg-muted/30">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {searchQuery ? 'No users found' : 'No users available'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'Search for users to start a conversation'}
                </p>
              </div>
            ) : (
              users.map(user => {
                const isSelected = selectedUsers.some(u => u.id === user.id);
                
                return (
                  <div
                    key={user.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors border border-transparent',
                      isSelected && 'bg-accent border-primary'
                    )}
                    onClick={() => handleToggleUser(user)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleUser(user)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.name || user.email} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{user.name || 'Unknown User'}</p>
                        {user.role && (
                          <Badge variant="secondary" className="text-xs">
                            {user.role.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!canCreate || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
