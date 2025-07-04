const jwt = require('jsonwebtoken');
import { Usuario } from '../models';
import { LogUtils } from '../utils/LogUtils';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    nome: string;
    nivel_acesso: number;
  };
}

/**
 * Middleware para verificar token JWT
 */
export const verifyToken = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      await LogUtils.logAction({
        acao: 'AUTH_FAILED',
        tabela: 'usuarios',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'ERRO',
        detalhes: 'Token não fornecido',
      });

      return res.status(401).json({ message: 'Token de acesso não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario || usuario.status !== 'ATIVO') {
      await LogUtils.logAction({
        acao: 'AUTH_FAILED',
        tabela: 'usuarios',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'ERRO',
        detalhes: `Usuário inválido ou inativo. ID: ${decoded.id}`,
      });

      return res.status(401).json({ message: 'Token inválido ou usuário inativo' });
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      nivel_acesso: usuario.nivel_acesso,
    };

    next();
  } catch (error) {
    await LogUtils.logAction({
      acao: 'AUTH_FAILED',
      tabela: 'usuarios',
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'ERRO',
      detalhes: `Erro na verificação do token: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    });

    return res.status(401).json({ message: 'Token inválido' });
  }
};

/**
 * Middleware para verificar nível de acesso
 */
export const requireLevel = (minLevel: number) => {
  return async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (req.user.nivel_acesso < minLevel) {
      await LogUtils.logAction({
        usuario_id: req.user.id,
        acao: 'ACCESS_DENIED',
        tabela: 'usuarios',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'ERRO',
        detalhes: `Nível insuficiente. Requerido: ${minLevel}, Atual: ${req.user.nivel_acesso}`,
      });

      return res.status(403).json({ 
        message: 'Nível de acesso insuficiente',
        required: minLevel,
        current: req.user.nivel_acesso,
      });
    }

    next();
  };
};

/**
 * Gera token JWT
 */
export const generateToken = (user: { id: number; email: string; nome: string; nivel_acesso: number }): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      nome: user.nome,
      nivel_acesso: user.nivel_acesso,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};
