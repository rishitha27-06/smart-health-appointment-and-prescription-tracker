// server/routes/adminRoutes.js

import express from 'express';
import {
  getAllDoctors,
  getAllPatients,
  deleteUser
} from '../controllers/adminController.js'; // This import will now work
import authMiddleware, { isAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// All routes here are protected and require an admin
router.use(authMiddleware);
router.use(isAdmin);

router.get('/doctors', getAllDoctors);
router.get('/patients', getAllPatients);
router.delete('/users/:id', deleteUser);

export default router;