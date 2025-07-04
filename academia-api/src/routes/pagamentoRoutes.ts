const express = require('express');
import { PagamentoController } from '../controllers/PagamentoController';
import { verifyToken, requireLevel } from '../middleware/auth';

const router = express.Router();
const pagamentoController = new PagamentoController();

// Aplicar autenticação para todas as rotas
router.use(verifyToken);

// Rotas para pagamentos (usuários autenticados)
router.get('/', (req: any, res: any) => pagamentoController.index(req, res));
router.get('/:id', (req: any, res: any) => pagamentoController.show(req, res));
router.post('/', (req: any, res: any) => pagamentoController.store(req, res));
router.put('/:id', (req: any, res: any) => pagamentoController.update(req, res));

// Rota para confirmar pagamento
router.patch('/:id/confirmar', (req: any, res: any) => pagamentoController.confirmarPagamento(req, res));

// Exclusão requer nível 3 (admin)
router.delete('/:id', requireLevel(3), (req: any, res: any) => pagamentoController.destroy(req, res));

export default router;
