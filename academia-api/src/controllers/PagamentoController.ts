import { Request, Response } from 'express';
import { Pagamento, Treino, Aluno, Instrutor } from '../models';

export class PagamentoController {
  // Listar todos os pagamentos
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const pagamentos = await Pagamento.findAll({
        include: [
          {
            model: Treino,
            as: 'treino',
            include: [
              { model: Aluno, as: 'aluno' },
              { model: Instrutor, as: 'instrutor' }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
      });
      return res.json(pagamentos);
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Buscar pagamento por ID
  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const pagamento = await Pagamento.findByPk(id, {
        include: [
          {
            model: Treino,
            as: 'treino',
            include: [
              { model: Aluno, as: 'aluno' },
              { model: Instrutor, as: 'instrutor' }
            ]
          }
        ],
      });

      if (!pagamento) {
        return res.status(404).json({ message: 'Pagamento não encontrado' });
      }

      return res.json(pagamento);
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Atualizar status do pagamento
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;

      const pagamento = await Pagamento.findByPk(id);

      if (!pagamento) {
        return res.status(404).json({ message: 'Pagamento não encontrado' });
      }

      await pagamento.update({
        status: status || pagamento.status,
        observacoes: observacoes || pagamento.observacoes,
      });

      const pagamentoAtualizado = await Pagamento.findByPk(id, {
        include: [
          {
            model: Treino,
            as: 'treino',
            include: [
              { model: Aluno, as: 'aluno' },
              { model: Instrutor, as: 'instrutor' }
            ]
          }
        ],
      });

      return res.json(pagamentoAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Criar novo pagamento
  async store(req: any, res: any): Promise<any> {
    try {
      const { treino_id, valor, data_pagamento, forma_pagamento, observacoes } = req.body;

      // Validações básicas
      if (!treino_id || !valor || !data_pagamento || !forma_pagamento) {
        return res.status(400).json({ 
          message: 'Todos os campos obrigatórios devem ser preenchidos' 
        });
      }

      // Verificar se treino existe
      const treino = await Treino.findByPk(treino_id);
      if (!treino) {
        return res.status(404).json({ message: 'Treino não encontrado' });
      }

      const pagamento = await Pagamento.create({
        treino_id,
        valor: parseFloat(valor),
        data_pagamento: new Date(data_pagamento),
        forma_pagamento,
        status: 'PENDENTE',
        observacoes: observacoes || null,
      });

      const pagamentoCompleto = await Pagamento.findByPk(pagamento.id, {
        include: [
          {
            model: Treino,
            as: 'treino',
            include: [
              { model: Aluno, as: 'aluno' },
              { model: Instrutor, as: 'instrutor' }
            ]
          }
        ],
      });

      return res.status(201).json(pagamentoCompleto);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Deletar pagamento (soft delete)
  async destroy(req: any, res: any): Promise<any> {
    try {
      const { id } = req.params;

      const pagamento = await Pagamento.findByPk(id);

      if (!pagamento) {
        return res.status(404).json({ message: 'Pagamento não encontrado' });
      }

      // Soft delete - marcar como deletado
      await pagamento.update({
        deleted: true,
        deleted_at: new Date(),
      });

      return res.json({ message: 'Pagamento deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar pagamento:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Confirmar pagamento
  async confirmarPagamento(req: any, res: any): Promise<any> {
    try {
      const { id } = req.params;
      const { observacoes } = req.body;

      const pagamento = await Pagamento.findByPk(id);

      if (!pagamento) {
        return res.status(404).json({ message: 'Pagamento não encontrado' });
      }

      await pagamento.update({
        status: 'PAGO',
        observacoes: observacoes || pagamento.observacoes,
      });

      const pagamentoAtualizado = await Pagamento.findByPk(id, {
        include: [
          {
            model: Treino,
            as: 'treino',
            include: [
              { model: Aluno, as: 'aluno' },
              { model: Instrutor, as: 'instrutor' }
            ]
          }
        ],
      });

      return res.json({
        message: 'Pagamento confirmado com sucesso',
        pagamento: pagamentoAtualizado,
      });
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
