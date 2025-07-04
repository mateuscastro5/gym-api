import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import sequelize from '../config/database';
import { Treino, Pagamento, Aluno, Instrutor } from '../models';
import { LogUtils } from '../utils/LogUtils';

export class TreinoController {
  // Listar todos os treinos
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const treinos = await Treino.findAll({
        include: [
          { model: Aluno, as: 'aluno' },
          { model: Instrutor, as: 'instrutor' },
          { model: Pagamento, as: 'pagamentos' },
        ],
        order: [['created_at', 'DESC']],
      });
      return res.json(treinos);
    } catch (error) {
      console.error('Erro ao listar treinos:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Buscar treino por ID
  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const treino = await Treino.findByPk(id, {
        include: [
          { model: Aluno, as: 'aluno' },
          { model: Instrutor, as: 'instrutor' },
          { model: Pagamento, as: 'pagamentos' },
        ],
      });

      if (!treino) {
        return res.status(404).json({ message: 'Treino não encontrado' });
      }

      return res.json(treino);
    } catch (error) {
      console.error('Erro ao buscar treino:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Criar novo treino com pagamento (TRANSAÇÃO)
  async store(req: any, res: any): Promise<any> {
    const t: Transaction = await sequelize.transaction();
    
    try {
      const { 
        aluno_id, 
        instrutor_id, 
        nome, 
        descricao, 
        data_inicio, 
        data_fim, 
        valor,
        forma_pagamento 
      } = req.body;

      // Validações básicas
      if (!aluno_id || !instrutor_id || !nome || !data_inicio || !data_fim || !valor || !forma_pagamento) {
        await t.rollback();
        return res.status(400).json({ 
          message: 'Todos os campos obrigatórios devem ser preenchidos' 
        });
      }

      // Verificar se aluno existe
      const aluno = await Aluno.findByPk(aluno_id, { transaction: t });
      if (!aluno) {
        await t.rollback();
        return res.status(404).json({ message: 'Aluno não encontrado' });
      }

      // Verificar se instrutor existe
      const instrutor = await Instrutor.findByPk(instrutor_id, { transaction: t });
      if (!instrutor) {
        await t.rollback();
        return res.status(404).json({ message: 'Instrutor não encontrado' });
      }

      // Criar treino
      const treino = await Treino.create({
        aluno_id,
        instrutor_id,
        usuario_criador_id: req.user?.id,
        nome,
        descricao,
        data_inicio: new Date(data_inicio),
        data_fim: new Date(data_fim),
        valor: parseFloat(valor),
        status: 'AGENDADO',
        deleted: false,
      }, { transaction: t });

      // Criar pagamento associado
      const pagamento = await Pagamento.create({
        treino_id: treino.id,
        valor: parseFloat(valor),
        data_pagamento: new Date(),
        forma_pagamento,
        status: 'PENDENTE',
      }, { transaction: t });

      // Commit da transação
      await t.commit();

      // Registrar log
      await LogUtils.logCreate({
        usuario_id: req.user?.id,
        tabela: 'treinos',
        registro_id: treino.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        detalhes: `Treino criado: ${nome}`,
      });

      // Buscar treino criado com associações
      const treinoCompleto = await Treino.findByPk(treino.id, {
        include: [
          { model: Aluno, as: 'aluno' },
          { model: Instrutor, as: 'instrutor' },
          { model: Pagamento, as: 'pagamentos' },
        ],
      });

      return res.status(201).json(treinoCompleto);
    } catch (error) {
      // Rollback da transação em caso de erro
      await t.rollback();
      console.error('Erro ao criar treino:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Atualizar treino
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { 
        aluno_id, 
        instrutor_id, 
        nome, 
        descricao, 
        data_inicio, 
        data_fim, 
        valor, 
        status 
      } = req.body;

      const treino = await Treino.findByPk(id);

      if (!treino) {
        return res.status(404).json({ message: 'Treino não encontrado' });
      }

      await treino.update({
        aluno_id: aluno_id || treino.aluno_id,
        instrutor_id: instrutor_id || treino.instrutor_id,
        nome: nome || treino.nome,
        descricao: descricao || treino.descricao,
        data_inicio: data_inicio ? new Date(data_inicio) : treino.data_inicio,
        data_fim: data_fim ? new Date(data_fim) : treino.data_fim,
        valor: valor ? parseFloat(valor) : treino.valor,
        status: status || treino.status,
      });

      const treinoAtualizado = await Treino.findByPk(id, {
        include: [
          { model: Aluno, as: 'aluno' },
          { model: Instrutor, as: 'instrutor' },
          { model: Pagamento, as: 'pagamentos' },
        ],
      });

      return res.json(treinoAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Soft delete do treino (TRANSAÇÃO)
  async destroy(req: any, res: any): Promise<any> {
    const t: Transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;

      const treino = await Treino.scope('withDeleted').findByPk(id, { transaction: t });

      if (!treino) {
        await t.rollback();
        return res.status(404).json({ message: 'Treino não encontrado' });
      }

      // Verificar se já foi deletado
      if (treino.deleted) {
        await t.rollback();
        return res.status(400).json({ message: 'Treino já foi deletado' });
      }

      // Soft delete do treino
      await treino.update({
        deleted: true,
        deleted_at: new Date(),
      }, { transaction: t });

      // Soft delete dos pagamentos associados (se implementado)
      // await Pagamento.update(
      //   { deleted: true, deleted_at: new Date() },
      //   { where: { treino_id: id }, transaction: t }
      // );

      // Commit da transação
      await t.commit();

      // Registrar log
      await LogUtils.logDelete({
        usuario_id: req.user?.id,
        tabela: 'treinos',
        registro_id: parseInt(id),
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        soft_delete: true,
        detalhes: `Treino ${treino.nome} foi deletado (soft delete)`,
      });

      return res.json({ message: 'Treino deletado com sucesso (soft delete)' });
    } catch (error) {
      // Rollback da transação em caso de erro
      await t.rollback();
      console.error('Erro ao deletar treino:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Finalizar treino e confirmar pagamento (TRANSAÇÃO)
  async finalizarTreino(req: Request, res: Response): Promise<Response> {
    const t: Transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { observacoes } = req.body;

      const treino = await Treino.findByPk(id, { transaction: t });

      if (!treino) {
        await t.rollback();
        return res.status(404).json({ message: 'Treino não encontrado' });
      }

      // Atualizar status do treino para CONCLUIDO
      await treino.update({ status: 'CONCLUIDO' }, { transaction: t });

      // Atualizar todos os pagamentos para PAGO
      await Pagamento.update(
        { 
          status: 'PAGO',
          observacoes: observacoes || null 
        },
        { 
          where: { treino_id: id },
          transaction: t 
        }
      );

      // Commit da transação
      await t.commit();

      // Buscar treino atualizado
      const treinoFinalizado = await Treino.findByPk(id, {
        include: [
          { model: Aluno, as: 'aluno' },
          { model: Instrutor, as: 'instrutor' },
          { model: Pagamento, as: 'pagamentos' },
        ],
      });

      return res.json({
        message: 'Treino finalizado e pagamento confirmado com sucesso',
        treino: treinoFinalizado,
      });
    } catch (error) {
      // Rollback da transação em caso de erro
      await t.rollback();
      console.error('Erro ao finalizar treino:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
