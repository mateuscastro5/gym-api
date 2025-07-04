const express = require('express');
import { BackupController } from '../controllers/BackupController';
import { verifyToken, requireLevel } from '../middleware/auth';

const router = express.Router();
const backupController = new BackupController();

// Todas as rotas de backup requerem autenticação e nível 3 (admin)
router.use(verifyToken);
router.use(requireLevel(3));

// Rota para realizar backup
router.post('/backup', (req: any, res: any) => backupController.backup(req, res));

// Rota para restaurar backup
router.post('/restore', (req: any, res: any) => backupController.restore(req, res));

// Rota para listar backups disponíveis
router.get('/list', (req: any, res: any) => backupController.listarBackups(req, res));

export default router;
