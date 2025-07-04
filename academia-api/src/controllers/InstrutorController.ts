import { Request, Response } from 'express';
import { Instrutor } from '../models';
import { LogUtils } from '../utils/LogUtils';

export class InstrutorController {
  // Listar todos os instrutores
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const instrutores = await Instrutor.findAll({
        order: [['created_at', 'DESC']],
      });
      return res.json(instrutores);
    } catch (error) {
      console.error('Erro ao listar instrutores:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Buscar instrutor por ID
  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const instrutor = await Instrutor.findByPk(id, {
        include: ['treinos'],
      });

      if (!instrutor) {
        return res.status(404).json({ message: 'Instrutor não encontrado' });
      }

      return res.json(instrutor);
    } catch (error) {
      console.error('Erro ao buscar instrutor:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Criar novo instrutor
  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, email, telefone, especialidade, salario } = req.body;

      // Validações básicas
      if (!nome || !email || !telefone || !especialidade || !salario) {
        return res.status(400).json({ 
          message: 'Todos os campos obrigatórios devem ser preenchidos' 
        });
      }

      const instrutor = await Instrutor.create({
        nome,
        email,
        telefone,
        especialidade,
        salario: parseFloat(salario),
        status: 'ATIVO',
      });

      // Registrar log de criação
      await LogUtils.logCreate({
        usuario_id: (req as any).user?.id,
        tabela: 'instrutores',
        registro_id: instrutor.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        detalhes: `Instrutor criado: ${instrutor.nome} (${instrutor.email})`,
      });

      return res.status(201).json(instrutor);
    } catch (error: any) {
      console.error('Erro ao criar instrutor:', error);
      
      // Verificar se é erro de email duplicado
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          message: 'Email já está em uso' 
        });
      }

      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Atualizar instrutor
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome, email, telefone, especialidade, salario, status } = req.body;

      const instrutor = await Instrutor.findByPk(id);

      if (!instrutor) {
        return res.status(404).json({ message: 'Instrutor não encontrado' });
      }

      await instrutor.update({
        nome: nome || instrutor.nome,
        email: email || instrutor.email,
        telefone: telefone || instrutor.telefone,
        especialidade: especialidade || instrutor.especialidade,
        salario: salario ? parseFloat(salario) : instrutor.salario,
        status: status || instrutor.status,
      });

      return res.json(instrutor);
    } catch (error: any) {
      console.error('Erro ao atualizar instrutor:', error);
      
      // Verificar se é erro de email duplicado
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          message: 'Email já está em uso' 
        });
      }

      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Deletar instrutor
  async destroy(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const instrutor = await Instrutor.findByPk(id);

      if (!instrutor) {
        return res.status(404).json({ message: 'Instrutor não encontrado' });
      }

      // Registrar log antes de deletar
      await LogUtils.logDelete({
        usuario_id: (req as any).user?.id,
        tabela: 'instrutores',
        registro_id: instrutor.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        detalhes: `Instrutor deletado: ${instrutor.nome} (${instrutor.email})`,
      });

      await instrutor.destroy();

      return res.json({ message: 'Instrutor deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar instrutor:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
