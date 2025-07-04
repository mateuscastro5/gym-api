import sequelize from '../config/database';
import { LogUtils } from '../utils/LogUtils';
const fs = require('fs').promises;
const path = require('path');

export class BackupController {
  // Realizar backup das tabelas
  async backup(req: any, res: any): Promise<any> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

      // Criar diretório de backup se não existir
      try {
        await fs.access(backupDir);
      } catch {
        await fs.mkdir(backupDir, { recursive: true });
      }

      // Lista de tabelas para backup
      const tabelas = ['usuarios', 'alunos', 'instrutores', 'treinos', 'pagamentos', 'logs'];
      let sqlBackup = `-- Backup Academia API - ${new Date().toISOString()}\n\n`;

      // Desabilitar verificações de chave estrangeira
      sqlBackup += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

      for (const tabela of tabelas) {
        try {
          // Obter estrutura da tabela
          const [createTable] = await sequelize.query(`SHOW CREATE TABLE ${tabela}`);
          const createStatement = (createTable as any)[0]['Create Table'];
          
          sqlBackup += `-- Estrutura da tabela ${tabela}\n`;
          sqlBackup += `DROP TABLE IF EXISTS \`${tabela}\`;\n`;
          sqlBackup += `${createStatement};\n\n`;

          // Obter dados da tabela
          const [dados] = await sequelize.query(`SELECT * FROM ${tabela}`);
          
          if ((dados as any[]).length > 0) {
            sqlBackup += `-- Dados da tabela ${tabela}\n`;
            sqlBackup += `INSERT INTO \`${tabela}\` VALUES\n`;
            
            const valores = (dados as any[]).map(row => {
              const vals = Object.values(row).map(val => {
                if (val === null) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                return val;
              });
              return `(${vals.join(', ')})`;
            });
            
            sqlBackup += valores.join(',\n') + ';\n\n';
          }
        } catch (error) {
          console.error(`Erro ao fazer backup da tabela ${tabela}:`, error);
          sqlBackup += `-- Erro ao fazer backup da tabela ${tabela}: ${error}\n\n`;
        }
      }

      // Reabilitar verificações de chave estrangeira
      sqlBackup += 'SET FOREIGN_KEY_CHECKS = 1;\n';

      // Salvar arquivo de backup
      await fs.writeFile(backupFile, sqlBackup, 'utf8');

      // Registrar log
      await LogUtils.logAction({
        usuario_id: req.user?.id,
        acao: 'BACKUP',
        tabela: 'sistema',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'SUCESSO',
        detalhes: `Backup criado: ${backupFile}`,
      });

      return res.json({
        message: 'Backup realizado com sucesso',
        arquivo: backupFile,
        timestamp,
        tabelas_incluidas: tabelas,
      });
    } catch (error) {
      console.error('Erro ao realizar backup:', error);
      
      await LogUtils.logAction({
        usuario_id: req.user?.id,
        acao: 'BACKUP_ERROR',
        tabela: 'sistema',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'ERRO',
        detalhes: `Erro no backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });

      return res.status(500).json({
        message: 'Erro ao realizar backup',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Restaurar backup
  async restore(req: any, res: any): Promise<any> {
    try {
      const { arquivo } = req.body;

      if (!arquivo) {
        return res.status(400).json({ message: 'Nome do arquivo de backup é obrigatório' });
      }

      const backupDir = path.join(process.cwd(), 'backups');
      const backupFile = path.join(backupDir, arquivo);

      // Verificar se arquivo existe
      try {
        await fs.access(backupFile);
      } catch {
        return res.status(404).json({ message: 'Arquivo de backup não encontrado' });
      }

      // Ler arquivo de backup
      const sqlContent = await fs.readFile(backupFile, 'utf8');

      // Executar SQL de restore
      const statements = sqlContent
        .split(';')
        .filter(stmt => stmt.trim().length > 0)
        .filter(stmt => !stmt.trim().startsWith('--'));

      let executedStatements = 0;
      for (const statement of statements) {
        try {
          await sequelize.query(statement + ';');
          executedStatements++;
        } catch (error) {
          console.error('Erro ao executar statement:', statement, error);
        }
      }

      // Registrar log
      await LogUtils.logAction({
        usuario_id: req.user?.id,
        acao: 'RESTORE',
        tabela: 'sistema',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'SUCESSO',
        detalhes: `Restore realizado do arquivo: ${arquivo}. Statements executados: ${executedStatements}`,
      });

      return res.json({
        message: 'Restore realizado com sucesso',
        arquivo,
        statements_executados: executedStatements,
        total_statements: statements.length,
      });
    } catch (error) {
      console.error('Erro ao realizar restore:', error);
      
      await LogUtils.logAction({
        usuario_id: req.user?.id,
        acao: 'RESTORE_ERROR',
        tabela: 'sistema',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'ERRO',
        detalhes: `Erro no restore: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });

      return res.status(500).json({
        message: 'Erro ao realizar restore',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Listar backups disponíveis
  async listarBackups(req: any, res: any): Promise<any> {
    try {
      const backupDir = path.join(process.cwd(), 'backups');

      try {
        const arquivos = await fs.readdir(backupDir);
        const backups: Array<{
          nome: string;
          tamanho: number;
          data_criacao: Date;
          data_modificacao: Date;
        }> = [];

        for (const arquivo of arquivos) {
          if (arquivo.endsWith('.sql')) {
            const filePath = path.join(backupDir, arquivo);
            const stats = await fs.stat(filePath);
            
            backups.push({
              nome: arquivo,
              tamanho: stats.size,
              data_criacao: stats.birthtime,
              data_modificacao: stats.mtime,
            });
          }
        }

        return res.json({
          backups: backups.sort((a, b) => b.data_criacao.getTime() - a.data_criacao.getTime()),
          total: backups.length,
        });
      } catch {
        return res.json({
          backups: [],
          total: 0,
          message: 'Diretório de backups não encontrado',
        });
      }
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return res.status(500).json({
        message: 'Erro ao listar backups',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}
