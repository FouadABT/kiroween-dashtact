import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateWidgetDto } from './create-widget.dto';

describe('CreateWidgetDto', () => {
  describe('Validation', () => {
    it('should pass validation with all required fields', async () => {
      const dto = plainToClass(CreateWidgetDto, {
        key: 'revenue-chart',
        name: 'Revenue Chart',
        description: 'Displays revenue trends over time',
        component: 'ChartWidget',
        category: 'analytics',
        icon: 'LineChart',
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
          },
        },
        dataRequirements: {
          endpoint: '/api/analytics/revenue',
          permissions: ['analytics:read'],
        },
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with optional fields', async () => {
      const dto = plainToClass(CreateWidgetDto, {
        key: 'revenue-chart',
        name: 'Revenue Chart',
        description: 'Displays revenue trends over time',
        component: 'ChartWidget',
        category: 'analytics',
        icon: 'LineChart',
        defaultGridSpan: 6,
        minGridSpan: 3,
        maxGridSpan: 12,
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
          },
        },
        dataRequirements: {
          endpoint: '/api/analytics/revenue',
          permissions: ['analytics:read'],
          refreshInterval: 300000,
        },
        useCases: ['Show revenue trends', 'Track sales performance'],
        examples: [
          {
            name: 'Monthly Revenue',
            config: { title: 'Monthly Revenue', chartType: 'line' },
          },
        ],
        tags: ['chart', 'revenue', 'analytics'],
        isActive: true,
        isSystemWidget: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    describe('key field', () => {
      it('should fail if key is missing', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('key');
      });

      it('should fail if key is empty string', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: '',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('key');
      });

      it('should fail if key exceeds 100 characters', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'a'.repeat(101),
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('key');
      });
    });

    describe('name field', () => {
      it('should fail if name is missing', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('name');
      });

      it('should fail if name exceeds 200 characters', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'a'.repeat(201),
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('name');
      });
    });

    describe('description field', () => {
      it('should fail if description is missing', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('description');
      });

      it('should fail if description exceeds 1000 characters', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'a'.repeat(1001),
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('description');
      });
    });

    describe('grid span fields', () => {
      it('should fail if defaultGridSpan is less than 1', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          defaultGridSpan: 0,
          configSchema: {},
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('defaultGridSpan');
      });

      it('should fail if defaultGridSpan is greater than 12', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          defaultGridSpan: 13,
          configSchema: {},
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('defaultGridSpan');
      });

      it('should accept valid grid span values (1-12)', async () => {
        for (let span = 1; span <= 12; span++) {
          const dto = plainToClass(CreateWidgetDto, {
            key: 'revenue-chart',
            name: 'Revenue Chart',
            description: 'Displays revenue trends',
            component: 'ChartWidget',
            category: 'analytics',
            icon: 'LineChart',
            defaultGridSpan: span,
            minGridSpan: span,
            maxGridSpan: span,
            configSchema: {},
            dataRequirements: {},
          });

          const errors = await validate(dto);
          expect(errors).toHaveLength(0);
        }
      });
    });

    describe('configSchema field', () => {
      it('should fail if configSchema is missing', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('configSchema');
      });

      it('should accept valid JSON schema', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              chartType: { type: 'string', enum: ['line', 'bar', 'area'] },
              showLegend: { type: 'boolean' },
            },
            required: ['title'],
          },
          dataRequirements: {},
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });

    describe('dataRequirements field', () => {
      it('should fail if dataRequirements is missing', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('dataRequirements');
      });

      it('should accept valid data requirements', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {
            endpoint: '/api/analytics/revenue',
            permissions: ['analytics:read', 'analytics:write'],
            refreshInterval: 300000,
            cacheKey: 'revenue-data',
          },
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });

    describe('array fields', () => {
      it('should accept valid useCases array', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
          useCases: ['Show revenue trends', 'Track sales performance'],
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should accept valid tags array', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
          tags: ['chart', 'revenue', 'analytics'],
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should accept valid examples array', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
          examples: [
            {
              name: 'Monthly Revenue',
              config: { title: 'Monthly Revenue', chartType: 'line' },
            },
            {
              name: 'Yearly Revenue',
              config: { title: 'Yearly Revenue', chartType: 'bar' },
            },
          ],
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });

    describe('boolean fields', () => {
      it('should accept isActive as true', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
          isActive: true,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should accept isActive as false', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
          isActive: false,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should accept isSystemWidget as true', async () => {
        const dto = plainToClass(CreateWidgetDto, {
          key: 'revenue-chart',
          name: 'Revenue Chart',
          description: 'Displays revenue trends',
          component: 'ChartWidget',
          category: 'analytics',
          icon: 'LineChart',
          configSchema: {},
          dataRequirements: {},
          isSystemWidget: true,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('Real-world examples', () => {
    it('should validate analytics widget', async () => {
      const dto = plainToClass(CreateWidgetDto, {
        key: 'revenue-chart',
        name: 'Revenue Chart',
        description: 'Displays revenue trends over time with customizable chart types',
        component: 'ChartWidget',
        category: 'analytics',
        icon: 'LineChart',
        defaultGridSpan: 6,
        minGridSpan: 4,
        maxGridSpan: 12,
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            chartType: { type: 'string', enum: ['line', 'bar', 'area'] },
            timeRange: { type: 'string', enum: ['7d', '30d', '90d', '1y'] },
          },
          required: ['title', 'chartType'],
        },
        dataRequirements: {
          endpoint: '/api/analytics/revenue',
          permissions: ['analytics:read'],
          refreshInterval: 300000,
        },
        useCases: ['Show revenue trends', 'Track sales performance'],
        examples: [
          {
            name: 'Monthly Revenue',
            config: { title: 'Monthly Revenue', chartType: 'line', timeRange: '30d' },
          },
        ],
        tags: ['chart', 'revenue', 'analytics'],
        isActive: true,
        isSystemWidget: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate ecommerce widget', async () => {
      const dto = plainToClass(CreateWidgetDto, {
        key: 'order-stats',
        name: 'Order Statistics',
        description: 'Shows order statistics and trends',
        component: 'OrderStatsWidget',
        category: 'ecommerce',
        icon: 'ShoppingCart',
        defaultGridSpan: 4,
        minGridSpan: 3,
        maxGridSpan: 6,
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            showTrend: { type: 'boolean' },
          },
        },
        dataRequirements: {
          endpoint: '/api/orders/stats',
          permissions: ['orders:read'],
        },
        tags: ['orders', 'ecommerce', 'stats'],
        isActive: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate system widget', async () => {
      const dto = plainToClass(CreateWidgetDto, {
        key: 'system-health',
        name: 'System Health',
        description: 'Displays system health metrics',
        component: 'SystemHealthWidget',
        category: 'system',
        icon: 'Activity',
        defaultGridSpan: 6,
        configSchema: {
          type: 'object',
          properties: {
            refreshRate: { type: 'number' },
          },
        },
        dataRequirements: {
          endpoint: '/api/system/health',
          permissions: ['system:read'],
          refreshInterval: 60000,
        },
        isActive: true,
        isSystemWidget: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
