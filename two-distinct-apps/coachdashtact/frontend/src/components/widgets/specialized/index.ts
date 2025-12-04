/**
 * Specialized Widgets
 * 
 * Domain-specific widgets for common use cases.
 */

export { UserCard } from './UserCard';
export type { UserCardProps, UserCardUser, UserCardAction } from './UserCard';

export { PricingCard } from './PricingCard';
export type { PricingCardProps, PricingFeature } from './PricingCard';

export { ComparisonTable } from './ComparisonTable';
export type {
  ComparisonTableProps,
  ComparisonColumn,
  ComparisonFeatureItem,
  ComparisonFeatureCategory,
} from './ComparisonTable';

export { MapWidget } from './MapWidget';
export type { MapWidgetProps, MapCoordinates, MapMarker } from './MapWidget';

export { ChatWidget } from './ChatWidget';
export type { ChatWidgetProps, ChatUser, ChatMessage } from './ChatWidget';
