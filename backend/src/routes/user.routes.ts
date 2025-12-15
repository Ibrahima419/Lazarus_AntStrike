/**
 * 👤 User Routes
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAdmin } from '../middleware/rbac.middleware';

const router = Router();

// All routes here require Admin privileges (enforced by middleware in server.ts or here)
// Adding requireAdmin just to be explicit/safe

router.get('/', requireAdmin, UserController.getUsers);
router.post('/', requireAdmin, UserController.createUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);

export default router;
