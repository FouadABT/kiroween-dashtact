export class WidgetInstanceResponseDto {
  id: string;
  layoutId: string;
  widgetKey: string;
  position: number;
  gridSpan: number;
  gridRow?: number;
  config: Record<string, any>;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class LayoutResponseDto {
  id: string;
  pageId: string;
  userId?: string;
  scope: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  widgetInstances: WidgetInstanceResponseDto[];
}
