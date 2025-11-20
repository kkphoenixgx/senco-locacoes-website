import Encrypt from "../utils/Encrypt";

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nome:
 *           type: string
 *         telefone:
 *           type: string
 *         email:
 *           type: string
 *         endereco:
 *           type: string
 */
export default class Cliente {
  
  //? ----------- Constructor -----------

  /** * O construtor é privado para forçar a criação de instâncias através do método `create`, * garantindo que a senha seja sempre encriptada. */
  private constructor(
    public readonly id: number,
    public readonly nome: string,
    public readonly telefone: string,
    public readonly email: string,
    public senha_hash: string,
    public readonly endereco: string
  ) {}

  //? ----------- Methods -----------

  /** Cria uma nova instância de Cliente, encriptando a senha fornecida. * @returns Uma Promise que resolve para uma nova instância de Cliente. */
  public static async create(
    id: number,
    nome: string,
    telefone: string,
    email: string,
    senhaPlana: string,
    endereco: string
  ): Promise<Cliente> {
    const senha_hash = await Encrypt.hash(senhaPlana);
    return new Cliente(id, nome, telefone, email, senha_hash, endereco);
  }

  /** Recria uma instância de Cliente a partir de dados do banco de dados. */
  public static fromDB(data: { id: number, nome: string, telefone: string, email: string, senha_hash: string, endereco: string }): Cliente {
    return new Cliente(data.id, data.nome, data.telefone, data.email, data.senha_hash, data.endereco);
  }

  /** Verifica se a senha fornecida corresponde à senha armazenada. */
  public async isPasswordCorrect(senhaPlana: string): Promise<boolean> {
    return Encrypt.compare(senhaPlana, this.senha_hash);
  }


}
