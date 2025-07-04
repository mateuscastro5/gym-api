const express = require('express');
import { AlunoController } from '../controllers/AlunoController';
import { verifyToken, requireLevel } from '../middleware/auth';

const router = express.Router();
const alunoController = new AlunoController();

// Aplicar autenticação para todas as rotas
router.use(verifyToken);

// Rotas para CRUD de alunos (usuários autenticados)
router.get('/', (req, res) => alunoController.index(req, res));
router.get('/:id', (req, res) => alunoController.show(req, res));
router.post('/', (req, res) => alunoController.store(req, res));
router.put('/:id', (req, res) => alunoController.update(req, res));

// Exclusão requer nível 3 (admin)
router.delete('/:id', requireLevel(3), (req, res) => alunoController.destroy(req, res));

export default router;
