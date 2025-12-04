/**
 * UI Components
 * 
 * Reusable UI components built with shadcn/ui and custom enhancements.
 * These components provide consistent styling and behavior across the application.
 */

// shadcn/ui base components
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Badge, badgeVariants } from './badge';
export { Button, buttonVariants } from './button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Checkbox } from './checkbox';
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from './form';
export { Input } from './input';
export { Label } from './label';
export { Progress } from './progress';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';
export { Separator } from './separator';
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';
export { Switch } from './switch';
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

// Custom enhanced components
export { AnimatedButton } from './AnimatedButton';
export { LoadingSpinner } from './LoadingSpinner';
export { PageTransition } from './PageTransition';

// Re-export types for external use
export type { AnimatedButtonProps } from './AnimatedButton';
export type { LoadingSpinnerProps } from './LoadingSpinner';
export type { PageTransitionProps } from './PageTransition';