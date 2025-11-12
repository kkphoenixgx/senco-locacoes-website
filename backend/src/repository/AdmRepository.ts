import Adm, { IADMDto } from "../model/Adm";
import ConnectionFactory from "../database/ConnectionFactory";
import { RowDataPacket } from "mysql2";

export default class AdmRepository {


  public async findByEmail(email: string): Promise<Adm | null> {
    const pool = ConnectionFactory.getPool();

    const query = 'SELECT * FROM adms WHERE email = ?';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, [email]);

      if (rows.length === 0) return null;

      const rowData = rows[0];

      if (!rowData || typeof rowData.email !== 'string' || typeof rowData.senha_hash !== 'string') {
        console.error('Dados do administrador inválidos recebidos do banco de dados:', rowData);
        throw new Error('Formato de dados do administrador inválido no banco de dados.');
      }

      return Adm.fromDB(rowData as IADMDto);

    } 
    catch (error) {
      console.error('Erro ao buscar administrador por email:', error);
      throw new Error('Erro ao acessar o banco de dados.');
    }
  }

}