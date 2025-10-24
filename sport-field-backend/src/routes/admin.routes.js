
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as ctrl from '../controllers/admin.controller.js';

const r = Router();

r.get('/dashboard', auth(['admin']), ctrl.dashboard);
r.get('/users', auth(['admin']), ctrl.listUsers);
r.patch('/users/:id/status', auth(['admin']), ctrl.updateUserStatus);
r.get('/fields', auth(['admin']), ctrl.listFieldsForAdmin);
r.patch('/fields/:id/approve', auth(['admin']), ctrl.approveField);

export default r;
