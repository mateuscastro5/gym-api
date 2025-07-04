import { Request, Response } from 'express';
const nodemailer = require('nodemailer');
import { Aluno, Treino, Pagamento, Instrutor } from '../models';

export class EmailController {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Enviar relatório de treinos para um aluno
  async enviarRelatorioAluno(req: Request, res: Response): Promise<Response> {
    try {
      const { aluno_id } = req.params;

      // Buscar dados do aluno
      const aluno = await Aluno.findByPk(aluno_id, {
        include: [
          {
            model: Treino,
            as: 'treinos',
            include: [
              { model: Instrutor, as: 'instrutor' },
              { model: Pagamento, as: 'pagamentos' },
            ],
          },
        ],
      });

      if (!aluno) {
        return res.status(404).json({ message: 'Aluno não encontrado' });
      }

      // Preparar dados para o email
      const treinos = (aluno as any).treinos || [];
      const totalTreinos = treinos.length;
      const treinosConcluidos = treinos.filter((t: any) => t.status === 'CONCLUIDO').length;
      const valorTotal = treinos.reduce((sum: number, t: any) => sum + parseFloat(t.valor.toString()), 0);

      // Gerar HTML do relatório
      const htmlContent = `
        <h2>Relatório de Treinos - Academia Fitness</h2>
        <p><strong>Aluno:</strong> ${aluno.nome}</p>
        <p><strong>Email:</strong> ${aluno.email}</p>
        <p><strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        
        <h3>Resumo</h3>
        <ul>
          <li><strong>Total de Treinos:</strong> ${totalTreinos}</li>
          <li><strong>Treinos Concluídos:</strong> ${treinosConcluidos}</li>
          <li><strong>Valor Total Investido:</strong> R$ ${valorTotal.toFixed(2)}</li>
        </ul>

        <h3>Detalhes dos Treinos</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>Nome do Treino</th>
              <th>Instrutor</th>
              <th>Data Início</th>
              <th>Data Fim</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${treinos.map((treino: any) => `
              <tr>
                <td>${treino.nome}</td>
                <td>${treino.instrutor?.nome || 'N/A'}</td>
                <td>${new Date(treino.data_inicio).toLocaleDateString('pt-BR')}</td>
                <td>${new Date(treino.data_fim).toLocaleDateString('pt-BR')}</td>
                <td>R$ ${parseFloat(treino.valor.toString()).toFixed(2)}</td>
                <td>${treino.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <p><em>Este é um email automático da Academia Fitness. Não responda este email.</em></p>
      `;

      // Configurar email
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: aluno.email,
        subject: 'Relatório de Treinos - Academia Fitness',
        html: htmlContent,
      };

      // Enviar email
      await this.transporter.sendMail(mailOptions);

      return res.json({
        message: 'Relatório enviado com sucesso para o email do aluno',
        aluno: {
          nome: aluno.nome,
          email: aluno.email,
        },
        resumo: {
          totalTreinos,
          treinosConcluidos,
          valorTotal: parseFloat(valorTotal.toFixed(2)),
        },
      });
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      return res.status(500).json({ 
        message: 'Erro ao enviar relatório por email',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Enviar relatório de treinos para um instrutor
  async enviarRelatorioInstrutor(req: Request, res: Response): Promise<Response> {
    try {
      const { instrutor_id } = req.params;

      // Buscar dados do instrutor
      const instrutor = await Instrutor.findByPk(instrutor_id, {
        include: [
          {
            model: Treino,
            as: 'treinos',
            include: [
              { model: Aluno, as: 'aluno' },
              { model: Pagamento, as: 'pagamentos' },
            ],
          },
        ],
      });

      if (!instrutor) {
        return res.status(404).json({ message: 'Instrutor não encontrado' });
      }

      // Preparar dados para o email
      const treinos = (instrutor as any).treinos || [];
      const totalTreinos = treinos.length;
      const treinosConcluidos = treinos.filter((t: any) => t.status === 'CONCLUIDO').length;
      const valorTotal = treinos.reduce((sum: number, t: any) => sum + parseFloat(t.valor.toString()), 0);

      // Gerar HTML do relatório
      const htmlContent = `
        <h2>Relatório de Treinos Ministrados - Academia Fitness</h2>
        <p><strong>Instrutor:</strong> ${instrutor.nome}</p>
        <p><strong>Email:</strong> ${instrutor.email}</p>
        <p><strong>Especialidade:</strong> ${instrutor.especialidade}</p>
        <p><strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        
        <h3>Resumo</h3>
        <ul>
          <li><strong>Total de Treinos Ministrados:</strong> ${totalTreinos}</li>
          <li><strong>Treinos Concluídos:</strong> ${treinosConcluidos}</li>
          <li><strong>Valor Total dos Treinos:</strong> R$ ${valorTotal.toFixed(2)}</li>
        </ul>

        <h3>Detalhes dos Treinos</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>Nome do Treino</th>
              <th>Aluno</th>
              <th>Data Início</th>
              <th>Data Fim</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${treinos.map((treino: any) => `
              <tr>
                <td>${treino.nome}</td>
                <td>${treino.aluno?.nome || 'N/A'}</td>
                <td>${new Date(treino.data_inicio).toLocaleDateString('pt-BR')}</td>
                <td>${new Date(treino.data_fim).toLocaleDateString('pt-BR')}</td>
                <td>R$ ${parseFloat(treino.valor.toString()).toFixed(2)}</td>
                <td>${treino.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <p><em>Este é um email automático da Academia Fitness. Não responda este email.</em></p>
      `;

      // Configurar email
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: instrutor.email,
        subject: 'Relatório de Treinos Ministrados - Academia Fitness',
        html: htmlContent,
      };

      // Enviar email
      await this.transporter.sendMail(mailOptions);

      return res.json({
        message: 'Relatório enviado com sucesso para o email do instrutor',
        instrutor: {
          nome: instrutor.nome,
          email: instrutor.email,
          especialidade: instrutor.especialidade,
        },
        resumo: {
          totalTreinos,
          treinosConcluidos,
          valorTotal: parseFloat(valorTotal.toFixed(2)),
        },
      });
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      return res.status(500).json({ 
        message: 'Erro ao enviar relatório por email',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
