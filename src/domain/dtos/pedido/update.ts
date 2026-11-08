export class UpdatePedidoDto {
  private constructor(
    public readonly id_pedido?: string,
    public readonly tipo_pedido?: string,
    public readonly cantidad?: number,
    public readonly estado_pedido?: string,
    public readonly comentario?: string,
    public readonly id_user?: string,
    public readonly id_lote?: string,
    public readonly id_nuevoLote?: string,
    public readonly id_nuevoLote_tostado?: string,
    public readonly id_almacen?: string,
    public readonly pesos_g?: number[],
    public readonly tostadora?: string,
    public readonly fecha_tueste?: Date,
    public readonly molienda?: string,
    public readonly gramaje?: number,
    public readonly facturado?: boolean,
    public readonly id_lote_destino?: string | null,
  ) { }

  get values() {
    const returnObj: { [key: string]: any } = {};

    if (this.tipo_pedido) returnObj.tipo_pedido = this.tipo_pedido;
    if (this.cantidad) returnObj.cantidad = this.cantidad;
    if (this.estado_pedido) returnObj.estado_pedido = this.estado_pedido;
    if (this.comentario) returnObj.comentario = this.comentario;
    if (this.id_nuevoLote) returnObj.id_nuevoLote = this.id_nuevoLote;
    if (this.id_nuevoLote_tostado) returnObj.id_nuevoLote_tostado = this.id_nuevoLote_tostado;
    if (this.id_almacen) returnObj.id_almacen = this.id_almacen;
    if (this.pesos_g) returnObj.pesos_g = this.pesos_g;
    if (this.tostadora) returnObj.tostadora = this.tostadora;
    if (this.fecha_tueste) returnObj.fecha_tueste = this.fecha_tueste;
    if (this.molienda) returnObj.molienda = this.molienda;
    if (this.gramaje) returnObj.gramaje = this.gramaje;
    if (this.facturado !== undefined) returnObj.facturado = this.facturado;
    if (this.id_lote_destino !== undefined) returnObj.id_lote_destino = this.id_lote_destino;


    return returnObj;
  }

  static update(props: { [key: string]: any }): [string?, UpdatePedidoDto?] {
    const {
      id_pedido,
      tipo_pedido,
      cantidad,
      estado_pedido,
      comentario,
      id_user,
      id_lote,
      id_nuevoLote,
      id_nuevoLote_tostado,
      id_almacen,
      pesos_g,
      tostadora,
      fecha_tueste,
      molienda,
      gramaje,
      facturado,
      id_lote_destino,
    } = props;

    const fechaTuesteDate = fecha_tueste ? new Date(fecha_tueste) : undefined;

    return [
      undefined,
      new UpdatePedidoDto(
        id_pedido,
        tipo_pedido,
        cantidad,
        estado_pedido,
        comentario,
        id_user,
        id_lote,
        id_nuevoLote,
        id_nuevoLote_tostado,
        id_almacen,
        pesos_g,
        tostadora,
        fechaTuesteDate,
        molienda,
        gramaje,
        facturado,
        id_lote_destino,
      ),
    ];
  }
}
