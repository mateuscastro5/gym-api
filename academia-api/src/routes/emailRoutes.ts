const express = require('express');
import { EmailController } from '../controllers/EmailController';

const router = express.Router();
const emailController = new EmailController();

// Rotas para envio de emails
router.post('/aluno/:id/relatorio', (req: any, res: any) => emailController.enviarRelatorioAluno(req, res));
router.post('/instrutor/:id/relatorio', (req: any, res: any) => emailController.enviarRelatorioInstrutor(req, res));

export default router;
