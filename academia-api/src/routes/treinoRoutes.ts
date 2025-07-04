const express = require('express');
import { TreinoController } from '../controllers/TreinoController';
import { verifyToken, requireLevel } from '../middleware/auth';

const router = express.Router();
const treinoController = new TreinoController();

// Aplicar autenticação para todas as rotas
router.use(verifyToken);

// Rotas para treinos (usuários autenticados)
router.get('/', (req, res) => treinoController.index(req, res));
router.get('/:id', (req, res) => treinoController.show(req, res));
router.post('/', (req, res) => treinoController.store(req, res));
router.put('/:id', (req, res) => treinoController.update(req, res));

// Rota especial para finalizar treino com transação
router.patch('/:id/finalizar', (req, res) => treinoController.finalizarTreino(req, res));

// Rotas que requerem nível 3 (admin) para exclusão
router.delete('/:id', requireLevel(3), (req, res) => treinoController.destroy(req, res));

export default router;
