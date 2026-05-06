import { z } from 'zod';
import { warehouseSchema } from './warehouse.schema';

export type Warehouse = z.infer<typeof warehouseSchema>;
