/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaVeiculos:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nome:
 *           type: string
 *         descricao:
 *           type: string
 */
 export default class CategoriaVeiculos {
  
  //? ----------- Constructor -----------

  constructor(
    public id: number,
    public nome: string,
    public descricao?: string
  ){}

}