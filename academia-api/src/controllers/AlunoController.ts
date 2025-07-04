import { Aluno } from '../models';
import { LogUtils } from '../utils/LogUtils';

export class AlunoController {
  // Listar todos os alunos
  async index(req: any, res: any): Promise<any> {
    try {
      const alunos = await Aluno.findAll({
        order: [['created_at', 'DESC']],
      });
      return res.json(alunos);
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Buscar aluno por ID
  async show(req: any, res: any): Promise<any> {
    try {
      const { id } = req.params;
      const aluno = await Aluno.findByPk(id, {
        include: ['treinos'],
      });

      if (!aluno) {
        return res.status(404).json({ message: 'Aluno não encontrado' });
      }

      return res.json(aluno);
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Criar novo aluno
  async store(req: any, res: any): Promise<any> {
    try {
      const { nome, email, telefone, data_nascimento } = req.body;

      // Validações básicas
      if (!nome || !email || !telefone || !data_nascimento) {
        return res.status(400).json({ 
          message: 'Todos os campos obrigatórios devem ser preenchidos' 
        });
      }

      const aluno = await Aluno.create({
        nome,
        email,
        telefone,
        data_nascimento: new Date(data_nascimento),
        status: 'ATIVO',
      });

      // Registrar log de criação
      await LogUtils.logCreate({
        usuario_id: req.user?.id,
        tabela: 'alunos',
        registro_id: aluno.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        detalhes: `Aluno criado: ${aluno.nome} (${aluno.email})`,
      });

      return res.status(201).json(aluno);
    } catch (error: any) {
      console.error('Erro ao criar aluno:', error);
      
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

  // Atualizar aluno
  async update(req: any, res: any): Promise<any> {
    try {
      const { id } = req.params;
      const { nome, email, telefone, data_nascimento, status } = req.body;

      const aluno = await Aluno.findByPk(id);

      if (!aluno) {
        return res.status(404).json({ message: 'Aluno não encontrado' });
      }

      await aluno.update({
        nome: nome || aluno.nome,
        email: email || aluno.email,
        telefone: telefone || aluno.telefone,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : aluno.data_nascimento,
        status: status || aluno.status,
      });

      return res.json(aluno);
    } catch (error: any) {
      console.error('Erro ao atualizar aluno:', error);
      
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

  // Deletar aluno
  async destroy(req: any, res: any): Promise<any> {
    try {
      const { id } = req.params;

      const aluno = await Aluno.findByPk(id);

      if (!aluno) {
        return res.status(404).json({ message: 'Aluno não encontrado' });
      }

      // Registrar log antes de deletar
      await LogUtils.logDelete({
        usuario_id: req.user?.id,
        tabela: 'alunos',
        registro_id: aluno.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        detalhes: `Aluno deletado: ${aluno.nome} (${aluno.email})`,
      });

      await aluno.destroy();

      return res.json({ message: 'Aluno deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
