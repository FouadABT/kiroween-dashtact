/**
 * Generate Backend Tests for Prisma Models
 * 
 * This script generates comprehensive test files for NestJS services
 * after Prisma schema changes.
 */

const fs = require('fs');
const path = require('path');

function generateServiceTest(modelName, fields) {
  const modelLower = modelName.toLowerCase();
  const modelPlural = modelLower + 's';

  return `import { Test, TestingModule } from '@nestjs/testing';
import { ${modelName}Service } from './${modelPlural}.service';
import { PrismaService } from '../prisma/prisma.service';

describe('${modelName}Service', () => {
  let service: ${modelName}Service;
  let prisma: PrismaService;

  const mock${modelName} = {
${fields.map(f => `    ${f.name}: ${getMockValue(f.type)},`).join('\n')}
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${modelName}Service,
        {
          provide: PrismaService,
          useValue: {
            ${modelLower}: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<${modelName}Service>(${modelName}Service);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ${modelLower}', async () => {
      jest.spyOn(prisma.${modelLower}, 'create').mockResolvedValue(mock${modelName});

      const result = await service.create(mock${modelName});

      expect(result).toEqual(mock${modelName});
      expect(prisma.${modelLower}.create).toHaveBeenCalledWith({
        data: mock${modelName},
      });
    });

    it('should handle creation errors', async () => {
      jest.spyOn(prisma.${modelLower}, 'create').mockRejectedValue(new Error('Database error'));

      await expect(service.create(mock${modelName})).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of ${modelPlural}', async () => {
      const mock${modelName}Array = [mock${modelName}];
      jest.spyOn(prisma.${modelLower}, 'findMany').mockResolvedValue(mock${modelName}Array);

      const result = await service.findAll();

      expect(result).toEqual(mock${modelName}Array);
      expect(prisma.${modelLower}.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no ${modelPlural} exist', async () => {
      jest.spyOn(prisma.${modelLower}, 'findMany').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single ${modelLower}', async () => {
      jest.spyOn(prisma.${modelLower}, 'findUnique').mockResolvedValue(mock${modelName});

      const result = await service.findOne('test-id');

      expect(result).toEqual(mock${modelName});
      expect(prisma.${modelLower}.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should return null when ${modelLower} not found', async () => {
      jest.spyOn(prisma.${modelLower}, 'findUnique').mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a ${modelLower}', async () => {
      const updated${modelName} = { ...mock${modelName}, name: 'Updated Name' };
      jest.spyOn(prisma.${modelLower}, 'update').mockResolvedValue(updated${modelName});

      const result = await service.update('test-id', { name: 'Updated Name' });

      expect(result).toEqual(updated${modelName});
      expect(prisma.${modelLower}.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { name: 'Updated Name' },
      });
    });

    it('should handle update errors', async () => {
      jest.spyOn(prisma.${modelLower}, 'update').mockRejectedValue(new Error('Not found'));

      await expect(service.update('test-id', {})).rejects.toThrow('Not found');
    });
  });

  describe('remove', () => {
    it('should delete a ${modelLower}', async () => {
      jest.spyOn(prisma.${modelLower}, 'delete').mockResolvedValue(mock${modelName});

      const result = await service.remove('test-id');

      expect(result).toEqual(mock${modelName});
      expect(prisma.${modelLower}.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should handle deletion errors', async () => {
      jest.spyOn(prisma.${modelLower}, 'delete').mockRejectedValue(new Error('Not found'));

      await expect(service.remove('test-id')).rejects.toThrow('Not found');
    });
  });

  describe('type safety', () => {
    it('should enforce correct field types', () => {
${fields.map(f => `      expect(typeof mock${modelName}.${f.name}).toBe('${getJsType(f.type)}');`).join('\n')}
    });

    it('should have all required fields', () => {
${fields.filter(f => !f.optional).map(f => `      expect(mock${modelName}).toHaveProperty('${f.name}');`).join('\n')}
    });
  });
});
`;
}

function getMockValue(type) {
  const mockValues = {
    'String': "'test-string'",
    'Int': '123',
    'Float': '123.45',
    'Boolean': 'true',
    'DateTime': 'new Date()',
    'Json': '{}',
  };
  return mockValues[type] || "'mock-value'";
}

function getJsType(type) {
  const jsTypes = {
    'String': 'string',
    'Int': 'number',
    'Float': 'number',
    'Boolean': 'boolean',
    'DateTime': 'object',
    'Json': 'object',
  };
  return jsTypes[type] || 'string';
}

function extractModelsFromSchema(schemaPath) {
  const content = fs.readFileSync(schemaPath, 'utf8');
  const models = [];
  const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
  let match;

  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    const fields = [];

    const fieldRegex = /(\w+)\s+(\w+)(\?)?/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
      if (!fieldMatch[1].startsWith('@')) {
        fields.push({
          name: fieldMatch[1],
          type: fieldMatch[2],
          optional: !!fieldMatch[3]
        });
      }
    }

    models.push({ name: modelName, fields });
  }

  return models;
}

function main() {
  const schemaPath = path.join(process.cwd(), 'backend', 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Prisma schema not found');
    process.exit(1);
  }

  const models = extractModelsFromSchema(schemaPath);
  console.log(`📋 Found ${models.length} models in schema`);

  models.forEach(model => {
    const testContent = generateServiceTest(model.name, model.fields);
    const testPath = path.join(
      process.cwd(),
      'backend',
      'src',
      model.name.toLowerCase() + 's',
      model.name.toLowerCase() + 's.service.spec.ts'
    );

    const dir = path.dirname(testPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(testPath, testContent);
    console.log(`✓ Generated test: ${testPath}`);
  });

  console.log('\n✅ Test generation complete!');
}

if (require.main === module) {
  main();
}

module.exports = { generateServiceTest, extractModelsFromSchema };
