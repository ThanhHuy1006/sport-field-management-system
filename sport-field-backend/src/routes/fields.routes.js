
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as ctrl from '../controllers/fields.controller.js';

const r = Router();

r.get('/', ctrl.listFields);
r.get('/:id', ctrl.getField);

r.post('/', auth(['owner', 'admin']), ctrl.createField);
r.put('/:id', auth(['owner', 'admin']), ctrl.updateField);
r.delete('/:id', auth(['owner', 'admin']), ctrl.deleteField);

export default r;
