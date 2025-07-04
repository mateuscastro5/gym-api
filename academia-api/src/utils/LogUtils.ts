import { Log } from '../models';

export class LogUtils {
  static async logAction(data: {
    usuario_id?: number;
    acao: string;
    tabela: string;
    registro_id?: number;
    ip_address?: string;
    user_agent?: string;
    status: 'SUCESSO' | 'ERRO' | 'TENTATIVA';
    detalhes?: string;
  }): Promise<void> {
    try {
      await Log.create({
        usuario_id: data.usuario_id,
        acao: data.acao,
        tabela: data.tabela,
        registro_id: data.registro_id,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        status: data.status,
        detalhes: data.detalhes,
      });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  }

  static async logLoginAttempt(data: {
    email: string;
    ip_address?: string;
    user_agent?: string;
    status: 'SUCESSO' | 'ERRO';
    detalhes?: string;
    usuario_id?: number;
  }): Promise<void> {
    await this.logAction({
      usuario_id: data.usuario_id,
      acao: 'LOGIN',
      tabela: 'usuarios',
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      status: data.status,
      detalhes: `Email: ${data.email}. ${data.detalhes || ''}`,
    });
  }

  static async logCreate(data: {
    usuario_id?: number;
    tabela: string;
    registro_id: number;
    ip_address?: string;
    user_agent?: string;
    detalhes?: string;
  }): Promise<void> {
    await this.logAction({
      usuario_id: data.usuario_id,
      acao: 'CREATE',
      tabela: data.tabela,
      registro_id: data.registro_id,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      status: 'SUCESSO',
      detalhes: data.detalhes,
    });
  }

  static async logDelete(data: {
    usuario_id?: number;
    tabela: string;
    registro_id: number;
    ip_address?: string;
    user_agent?: string;
    detalhes?: string;
    soft_delete?: boolean;
  }): Promise<void> {
    await this.logAction({
      usuario_id: data.usuario_id,
      acao: data.soft_delete ? 'SOFT_DELETE' : 'DELETE',
      tabela: data.tabela,
      registro_id: data.registro_id,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      status: 'SUCESSO',
      detalhes: data.detalhes,
    });
  }

  static async logPasswordChange(data: {
    usuario_id: number;
    ip_address?: string;
    user_agent?: string;
    tipo: 'ALTERACAO' | 'RECUPERACAO';
  }): Promise<void> {
    await this.logAction({
      usuario_id: data.usuario_id,
      acao: 'PASSWORD_CHANGE',
      tabela: 'usuarios',
      registro_id: data.usuario_id,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      status: 'SUCESSO',
      detalhes: `Tipo: ${data.tipo}`,
    });
  }
}
