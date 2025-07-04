const express = require('express');
import { UsuarioController } from '../controllers/UsuarioController';
import { verifyToken, requireLevel } from '../middleware/auth';

const router = express.Router();
const usuarioController = new UsuarioController();

// Rotas públicas (sem autenticação)
router.post('/register', (req: any, res: any) => usuarioController.store(req, res));
router.post('/', (req: any, res: any) => usuarioController.store(req, res)); // Adicionar rota padrão
router.post('/login', (req: any, res: any) => usuarioController.login(req, res));
router.post('/ativar/:codigo', (req: any, res: any) => usuarioController.ativarConta(req, res));
router.post('/ativar', (req: any, res: any) => usuarioController.ativarConta(req, res)); // Via body
router.post('/recuperar-senha/solicitar', (req: any, res: any) => usuarioController.solicitarRecuperacaoSenha(req, res));
router.post('/redefinir-senha', (req: any, res: any) => usuarioController.recuperarSenha(req, res));
router.post('/recuperar-senha/confirmar', (req: any, res: any) => usuarioController.recuperarSenha(req, res));

// Rotas protegidas (com autenticação)
router.use(verifyToken); // Aplicar middleware de autenticação para todas as rotas abaixo

// Rotas para usuários autenticados
router.post('/alterar-senha', (req: any, res: any) => usuarioController.alterarSenha(req, res));

// Rotas para administradores (nível 3)
router.get('/', requireLevel(3), (req: any, res: any) => usuarioController.index(req, res));

export default router;
