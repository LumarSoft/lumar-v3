// Emisión de Factura C (monotributo) contra WSFEv1.
import "server-only";
import { X509Certificate } from "node:crypto";
import { Arca, WsfeClient } from "@ramiidv/arca-facturacion";
import {
  CBTE_TIPO_FACTURA_C,
  CONCEPTO_SERVICIOS,
  aFechaArca,
  condicionIvaCodigo,
  desdeFechaArca,
  docTipoCodigo,
  type EmisorConfig,
} from "@/lib/arca/config";
import { obtenerAuth } from "@/lib/arca/ticket";

export interface DatosEmision {
  concepto: string;
  importe: number;
  fechaEmision: string; // YYYY-MM-DD
  servicioDesde: string;
  servicioHasta: string;
  vtoPago: string;
  /** Código interno del servicio para la tabla del PDF, ej: "SIST". */
  codigo?: string;
  /** Ej: "Transferencia Bancaria". Solo informativo, va en el PDF. */
  condicionVenta?: string;
  receptor: {
    razonSocial: string;
    docTipo: string;
    docNro: string;
    condicionIva: string;
    domicilio?: string;
  };
}

export interface ResultadoEmision {
  cae: string;
  caeVto: string; // YYYY-MM-DD
  cbteNro: number;
  ptoVta: number;
  cbteTipo: number;
  importe: number;
  qrUrl: string;
  observaciones: string[];
}

/** Un rechazo de ARCA, ya traducido a algo que se pueda leer en un toast. */
export class ArcaRechazo extends Error {
  constructor(
    message: string,
    readonly detalle?: string,
  ) {
    super(message);
  }
}

/** Emisor (CA) de un certificado PEM. "" si no se puede leer. */
function emisorDelCertificado(pem: string): string {
  try {
    return new X509Certificate(pem).issuer;
  } catch {
    return "";
  }
}

function listar(x: unknown): { Code: number; Msg: string }[] {
  if (!x) return [];
  return Array.isArray(x) ? x : [x as { Code: number; Msg: string }];
}

export async function emitirFacturaC(
  cfg: EmisorConfig,
  datos: DatosEmision,
): Promise<ResultadoEmision> {
  // Los certificados de homologación los firma la CA "Computadores Test" y no
  // sirven en producción. Sin este chequeo, poner ARCA_PRODUCCION=true con el
  // certificado de pruebas falla con un HTTP 500 opaco de WSAA.
  if (
    cfg.produccion &&
    /computadores test/i.test(emisorDelCertificado(cfg.cert))
  ) {
    throw new ArcaRechazo(
      "El certificado cargado es de homologación y el ambiente está en producción",
      "Generá el certificado de producción por 'Administración de Certificados Digitales' " +
        "y vinculalo desde 'Administrador de Relaciones de Clave Fiscal'. " +
        "Mientras tanto, poné ARCA_PRODUCCION=false para seguir emitiendo de prueba.",
    );
  }

  const docTipo = docTipoCodigo(datos.receptor.docTipo);
  const condicionIva = condicionIvaCodigo(datos.receptor.condicionIva);

  if (docTipo === null) {
    throw new ArcaRechazo(
      `Tipo de documento desconocido: "${datos.receptor.docTipo}"`,
    );
  }
  if (condicionIva === null) {
    throw new ArcaRechazo(
      `Condición de IVA desconocida: "${datos.receptor.condicionIva}"`,
    );
  }

  const importe = Math.round(datos.importe * 100) / 100;
  if (!(importe > 0)) {
    throw new ArcaRechazo("El importe tiene que ser mayor a cero.");
  }

  const auth = await obtenerAuth(cfg);
  const wsfe = new WsfeClient(cfg.produccion, { retries: 2 });

  // El número lo asigna ARCA por punto de venta: pedimos el último y sumamos 1.
  const ultimo = await wsfe.ultimoComprobante(
    auth,
    cfg.ptoVta,
    CBTE_TIPO_FACTURA_C,
  );
  const cbteNro = ultimo + 1;

  // Factura C: no se discrimina IVA. El total es el neto y no va el array Iva.
  const detalle = {
    Concepto: CONCEPTO_SERVICIOS,
    DocTipo: docTipo,
    DocNro: docTipo === 99 ? 0 : Number(datos.receptor.docNro),
    CbteDesde: cbteNro,
    CbteHasta: cbteNro,
    CbteFch: aFechaArca(datos.fechaEmision),
    ImpTotal: importe,
    ImpTotConc: 0,
    ImpNeto: importe,
    ImpOpEx: 0,
    ImpTrib: 0,
    ImpIVA: 0,
    MonId: "PES",
    MonCotiz: 1,
    FchServDesde: aFechaArca(datos.servicioDesde),
    FchServHasta: aFechaArca(datos.servicioHasta),
    FchVtoPago: aFechaArca(datos.vtoPago),
    CondicionIVAReceptorId: condicionIva,
  };

  const res = await wsfe.solicitarCAE(auth, {
    PtoVta: cfg.ptoVta,
    CbteTipo: CBTE_TIPO_FACTURA_C,
    invoices: [detalle],
  });

  // Errores a nivel request (auth, punto de venta inexistente, etc.)
  const errores = listar(res.Errors?.Err);
  if (errores.length) {
    throw new ArcaRechazo(
      "ARCA rechazó el pedido",
      errores.map((e) => `[${e.Code}] ${e.Msg}`).join(" · "),
    );
  }

  const det = Array.isArray(res.FeDetResp?.FECAEDetResponse)
    ? res.FeDetResp.FECAEDetResponse[0]
    : res.FeDetResp?.FECAEDetResponse;

  if (!det) {
    throw new ArcaRechazo("ARCA no devolvió detalle del comprobante");
  }

  const observaciones = listar(det.Observaciones?.Obs).map(
    (o) => `[${o.Code}] ${o.Msg}`,
  );

  // "R" = rechazado. Las observaciones dicen por qué.
  if (det.Resultado === "R" || !det.CAE) {
    throw new ArcaRechazo(
      "ARCA rechazó el comprobante",
      observaciones.join(" · ") || "Sin detalle",
    );
  }

  const qrUrl = Arca.generateQRUrl({
    fecha: datos.fechaEmision,
    cuit: cfg.cuit,
    ptoVta: cfg.ptoVta,
    tipoCmp: CBTE_TIPO_FACTURA_C,
    nroCmp: cbteNro,
    importe,
    moneda: "PES",
    ctz: 1,
    tipoDocRec: docTipo,
    nroDocRec: detalle.DocNro,
    codAut: Number(det.CAE),
  });

  return {
    cae: String(det.CAE),
    caeVto: desdeFechaArca(det.CAEFchVto),
    cbteNro,
    ptoVta: cfg.ptoVta,
    cbteTipo: CBTE_TIPO_FACTURA_C,
    importe,
    qrUrl,
    // Una factura aprobada igual puede traer observaciones: las guardamos.
    observaciones,
  };
}
