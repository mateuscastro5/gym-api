const express = require('express');
import { InstrutorController } from '../controllers/InstrutorController';
import { verifyToken, requireLevel } from '../middleware/auth';

const router = express.Router();
const instrutorController = new InstrutorController();

// Aplicar autenticação para todas as rotas
router.use(verifyToken);

// Rotas para instrutores (usuários autenticados)
router.get('/', (req, res) => instrutorController.index(req, res));
router.get('/:id', (req, res) => instrutorController.show(req, res));
router.post('/', (req, res) => instrutorController.store(req, res));
router.put('/:id', (req, res) => instrutorController.update(req, res));

// Exclusão requer nível 3 (admin)
router.delete('/:id', requireLevel(3), (req, res) => instrutorController.destroy(req, res));

export default router;
