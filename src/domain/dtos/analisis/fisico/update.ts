export class UpdateAnalisisFisicoDto {
  private constructor(
    public readonly id_analisis_fisico: string,
    public readonly peso_muestra_g?: number,
    public readonly peso_pergamino_g?: number,
    public readonly wa?: number,
    public readonly temperatura_wa?: number,
    public readonly humedad?: number,
    public readonly temperatura_humedad?: number,
    public readonly densidad?: number,
    public readonly color_grano_verde?: string,
    public readonly olor?: string,
    public readonly superior_malla_18?: number,
    public readonly superior_malla_16?: number,
    public readonly superior_malla_14?: number,
    public readonly menor_malla_14?: number,
    public readonly peso_defectos_g?: number,
    public readonly quaquers?: number,
    public readonly peso_muestra_tostada_g?: number,
    public readonly desarrollo?: number,
    public readonly porcentaje_caramelizacion?: number,  // corregido
    public readonly c_desarrollo?: number,
    public readonly comentario?: string,
  ) {}

  /** Sólo incluye en el UPDATE los campos definidos */
  get values() {
    const v: Record<string, any> = {};
    if (this.peso_muestra_g   != null) v.peso_muestra_g = this.peso_muestra_g;
    if (this.peso_pergamino_g != null) v.peso_pergamino_g = this.peso_pergamino_g;
    if (this.wa               != null) v.wa = this.wa;
    if (this.temperatura_wa   != null) v.temperatura_wa = this.temperatura_wa;
    if (this.humedad          != null) v.humedad = this.humedad;
    if (this.temperatura_humedad != null) v.temperatura_humedad = this.temperatura_humedad;
    if (this.densidad         != null) v.densidad = this.densidad;
    if (this.color_grano_verde != null) v.color_grano_verde = this.color_grano_verde;
    if (this.olor             != null) v.olor = this.olor;
    if (this.superior_malla_18 != null) v.superior_malla_18 = this.superior_malla_18;
    if (this.superior_malla_16 != null) v.superior_malla_16 = this.superior_malla_16;
    if (this.superior_malla_14 != null) v.superior_malla_14 = this.superior_malla_14;
    if (this.menor_malla_14   != null) v.menor_malla_14 = this.menor_malla_14;
    if (this.peso_defectos_g  != null) v.peso_defectos_g = this.peso_defectos_g;
    if (this.quaquers         != null) v.quaquers = this.quaquers;
    if (this.peso_muestra_tostada_g != null) v.peso_muestra_tostada_g = this.peso_muestra_tostada_g;
    if (this.desarrollo       != null) v.desarrollo = this.desarrollo;
    if (this.porcentaje_caramelizacion != null) v.porcentaje_caramelizacion = this.porcentaje_caramelizacion;
    if (this.c_desarrollo     != null) v.c_desarrollo = this.c_desarrollo;
    if (this.comentario       != null) v.comentario = this.comentario;
    return v;
  }

  static update(props: { [key: string]: any }): [string?, UpdateAnalisisFisicoDto?] {
    const {
      id_analisis_fisico,
      peso_muestra_g,
      peso_pergamino_g,
      wa,
      temperatura_wa,
      humedad,
      temperatura_humedad,
      densidad,
      color_grano_verde,
      olor,
      superior_malla_18,
      superior_malla_16,
      superior_malla_14,
      menor_malla_14,
      peso_defectos_g,
      quaquers,
      peso_muestra_tostada_g,
      desarrollo,
      porcentaje_caramelizacion,
      c_desarrollo,
      comentario,
    } = props;


    return [undefined, new UpdateAnalisisFisicoDto(
      id_analisis_fisico,
      peso_muestra_g,
      peso_pergamino_g,
      wa,
      temperatura_wa,
      humedad,
      temperatura_humedad,
      densidad,
      color_grano_verde,
      olor,
      superior_malla_18,
      superior_malla_16,
      superior_malla_14,
      menor_malla_14,
      peso_defectos_g,
      quaquers,
      peso_muestra_tostada_g,
      desarrollo,
      porcentaje_caramelizacion,
      c_desarrollo,
      comentario,
    )];
  }
}
