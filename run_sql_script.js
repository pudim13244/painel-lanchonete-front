const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSQLScript() {
  let connection;
  
  try {
    // Configuração do banco de dados
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: '', // Adicione sua senha se necessário
      database: 'lancheria_pedidos_ninja' // Ajuste o nome do banco se necessário
    };

    console.log('Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado com sucesso!');

    // Ler o script SQL
    const sqlPath = path.join(__dirname, 'add_delivery_address_column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executando script SQL...');
    
    // Dividir o script em comandos individuais
    const commands = sql.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          console.log('Executando:', command.substring(0, 50) + '...');
          await connection.execute(command);
          console.log('✓ Comando executado com sucesso');
        } catch (error) {
          console.log('⚠ Erro no comando (pode ser esperado):', error.message);
        }
      }
    }
    
    console.log('Script SQL executado com sucesso!');
    
    // Verificar se os campos foram adicionados
    console.log('\nVerificando estrutura da tabela orders...');
    const [rows] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME IN ('delivery_address', 'notes', 'updated_at')
      ORDER BY COLUMN_NAME
    `);
    
    if (rows.length > 0) {
      console.log('Campos encontrados:');
      rows.forEach(row => {
        console.log(`- ${row.COLUMN_NAME}: ${row.DATA_TYPE} (${row.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } else {
      console.log('Nenhum dos campos foi encontrado. Verifique se o script foi executado corretamente.');
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexão fechada.');
    }
  }
}

runSQLScript(); 