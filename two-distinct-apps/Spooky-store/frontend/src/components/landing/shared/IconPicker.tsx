'use client';

/**
 * Icon Picker
 * 
 * Select icons for features and stats.
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Star,
  Zap,
  Shield,
  Heart,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Award,
  Target,
  Rocket,
  Sparkles,
} from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

const icons = [
  { value: 'star', label: 'Star', icon: Star },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'trending-up', label: 'Trending Up', icon: TrendingUp },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'clock', label: 'Clock', icon: Clock },
  { value: 'check-circle', label: 'Check Circle', icon: CheckCircle },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'rocket', label: 'Rocket', icon: Rocket },
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const selectedIcon = icons.find((icon) => icon.value === value);
  const IconComponent = selectedIcon?.icon || Star;

  return (
    <div className="flex items-center gap-2">
      <div className="p-2 border rounded-lg">
        <IconComponent className="h-5 w-5" />
      </div>
      <Select value={value || 'star'} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {icons.map((icon) => {
            const Icon = icon.icon;
            return (
              <SelectItem key={icon.value} value={icon.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {icon.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
