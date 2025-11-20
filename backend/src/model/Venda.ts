import Cliente from "./Cliente";
import ItemsVendidos from "./ItemsVendidos";

/**
 * @swagger
 * components:
 *   schemas:
 *     Venda:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Veiculo'
 *         dataVenda:
 *           type: string
 *           format: date-time
 *         precoTotal:
 *           type: number
 *         clienteId:
 *           type: integer
 *         cliente:
 *           $ref: '#/components/schemas/Cliente'
 */
export default class Venda {
  
  //? ----------- Constructor -----------

  constructor(
    public id: number,
    public items: ItemsVendidos[],
    public dataVenda: Date,
    public precoTotal: number,
    public clienteId: number,
    public cliente?: Cliente
  ){}

  //? ----------- Methods -----------

  public getPrecoTotalFormatado(): string {
    return this.precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  //? ----------- Getters and Setters -----------

}