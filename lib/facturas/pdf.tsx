// Render del PDF de la factura. ARCA no genera el PDF: solo autoriza y devuelve
// el CAE. El diseño y los datos obligatorios corren por nuestra cuenta.
//
// El layout replica el comprobante del facturador oficial de ARCA (mismo orden
// de bloques, mismas etiquetas, misma tabla de 8 columnas), con el isotipo de
// LumarSoft arriba a la derecha.
import "server-only";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import type { EmisorConfig } from "@/lib/arca/config";
import type { DatosEmision, ResultadoEmision } from "@/lib/arca/emitir";
import { LOGO_DATA_URL } from "@/lib/facturas/logo";

/** Formato de ARCA: sin separador de miles, coma decimal. */
function num(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function fecha(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const NEGRO = "#000";
const GRIS = "#555";

const s = StyleSheet.create({
  page: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: NEGRO,
  },

  // ── Encabezado ────────────────────────────────────────────────────────
  // Fila superior: ORIGINAL centrado y el isotipo a la derecha. Se resuelve con
  // flex y espaciadores en vez de position absolute, porque react-pdf colapsa
  // las imágenes absolutas que no llevan ancho explícito.
  filaSup: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  ladoSup: { flex: 1 },
  originalBox: {
    borderWidth: 1,
    borderColor: NEGRO,
    paddingVertical: 3,
    paddingHorizontal: 26,
  },
  original: { fontSize: 9, fontFamily: "Helvetica-Bold" },

  marcoSup: { borderWidth: 1, borderColor: NEGRO, flexDirection: "row" },
  colIzq: { flex: 1, padding: 10, paddingRight: 26 },
  colDer: { flex: 1, padding: 10, paddingLeft: 26 },
  divisor: { width: 1, backgroundColor: NEGRO },

  // El cuadro de la letra va montado sobre el borde superior, centrado.
  letraBox: {
    position: "absolute",
    top: -1,
    left: "50%",
    marginLeft: -23,
    width: 46,
    height: 40,
    borderWidth: 1,
    borderColor: NEGRO,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  letra: { fontSize: 22, fontFamily: "Helvetica-Bold", lineHeight: 1 },
  cod: { fontSize: 5.5, marginTop: 2 },

  // Ancho y alto explícitos: sin ancho, react-pdf no dibuja la imagen.
  logo: { width: 31, height: 38 },
  logoCaja: { flex: 1, alignItems: "flex-end" },

  titulo: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  linea: { marginBottom: 2.5 },
  bold: { fontFamily: "Helvetica-Bold" },

  // ── Bandas ────────────────────────────────────────────────────────────
  banda: {
    borderWidth: 1,
    borderColor: NEGRO,
    borderTopWidth: 0,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bloque: {
    borderWidth: 1,
    borderColor: NEGRO,
    borderTopWidth: 0,
    padding: 10,
  },
  fila2: { flexDirection: "row", marginBottom: 2.5 },
  celdaIzq: { width: "48%" },
  celdaDer: { flex: 1 },

  // ── Tabla de ítems ────────────────────────────────────────────────────
  tabla: { marginTop: 10, borderWidth: 1, borderColor: NEGRO },
  thead: {
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    borderBottomWidth: 1,
    borderColor: NEGRO,
  },
  th: {
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    borderRightWidth: 1,
    borderColor: NEGRO,
  },
  td: {
    paddingVertical: 5,
    paddingHorizontal: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderColor: NEGRO,
  },
  tr: { flexDirection: "row", minHeight: 200 },
  cCodigo: { width: "8%" },
  cDesc: { width: "34%" },
  cCant: { width: "8%", textAlign: "right" },
  cUm: { width: "10%", textAlign: "center" },
  cPrecio: { width: "13%", textAlign: "right" },
  cBonifPct: { width: "7%", textAlign: "right" },
  cBonifImp: { width: "9%", textAlign: "right" },
  cSubtotal: { width: "11%", textAlign: "right", borderRightWidth: 0 },

  // ── Totales ───────────────────────────────────────────────────────────
  totales: { alignItems: "flex-end", marginTop: 8 },
  filaTotal: { flexDirection: "row", marginBottom: 3 },
  etiquetaTotal: { width: 130, textAlign: "right", paddingRight: 10 },
  valorTotal: { width: 95, textAlign: "right" },
  granTotal: { fontSize: 10, fontFamily: "Helvetica-Bold" },

  actividad: { marginTop: 14, fontSize: 8, fontStyle: "italic" },

  // ── Pie ───────────────────────────────────────────────────────────────
  pie: { flexDirection: "row", marginTop: 16, alignItems: "flex-end" },
  qr: { width: 78, height: 78 },
  pieCentro: { flex: 1, alignItems: "center", paddingBottom: 6 },
  pieDer: { alignItems: "flex-end", paddingBottom: 6 },
  cae: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  autorizado: { fontSize: 8, fontFamily: "Helvetica-Bold", marginTop: 6 },
  descargo: { marginTop: 8, fontSize: 6, color: GRIS, textAlign: "center" },
  aviso: {
    marginTop: 10,
    padding: 5,
    backgroundColor: "#fff4d6",
    borderWidth: 1,
    borderColor: "#e0a800",
    textAlign: "center",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
});

export interface DatosPdf {
  cfg: EmisorConfig;
  datos: DatosEmision;
  resultado: ResultadoEmision;
}

/** Etiqueta + valor en la misma línea, con la etiqueta en negrita. */
function Dato({ label, value }: { label: string; value: string }) {
  return (
    <Text style={s.linea}>
      <Text style={s.bold}>{label}: </Text>
      {value}
    </Text>
  );
}

export async function renderFacturaPdf({
  cfg,
  datos,
  resultado,
}: DatosPdf): Promise<Buffer> {
  // El QR se genera como PNG en memoria; react-pdf no ejecuta canvas.
  const qrDataUrl = await QRCode.toDataURL(resultado.qrUrl, {
    margin: 0,
    width: 240,
  });

  const ptoVta = String(resultado.ptoVta).padStart(5, "0");
  const nro = String(resultado.cbteNro).padStart(8, "0");
  const importe = resultado.importe;

  const doc = (
    <Document
      title={`Factura C ${ptoVta}-${nro}`}
      author={cfg.razonSocial || "LumarSoft"}
      subject={datos.concepto}
    >
      <Page size="A4" style={s.page}>
        <View style={s.filaSup}>
          <View style={s.ladoSup} />
          <View style={s.originalBox}>
            <Text style={s.original}>ORIGINAL</Text>
          </View>
          <View style={s.logoCaja}>
            <Image style={s.logo} src={LOGO_DATA_URL} />
          </View>
        </View>

        {/* Encabezado: emisor a la izquierda, comprobante a la derecha */}
        <View style={s.marcoSup}>
          <View style={s.colIzq}>
            <Dato label="Razón Social" value={cfg.razonSocial} />
            <Dato label="Domicilio Comercial" value={cfg.domicilio} />
            <Dato
              label="Condición frente al IVA"
              value="Responsable Monotributo"
            />
          </View>

          <View style={s.divisor} />

          <View style={s.colDer}>
            <Text style={s.titulo}>FACTURA</Text>
            <Text style={s.linea}>
              <Text style={s.bold}>Punto de Venta: </Text>
              {ptoVta}
              <Text style={s.bold}>{"   Comp. Nro: "}</Text>
              {nro}
            </Text>
            <Dato label="Fecha de Emisión" value={fecha(datos.fechaEmision)} />
            <Dato label="CUIT" value={String(cfg.cuit)} />
            <Dato label="Ingresos Brutos" value={cfg.ingresosBrutos} />
            <Dato
              label="Fecha de Inicio de Actividades"
              value={cfg.inicioActividades}
            />
          </View>

          {/* Al final para quedar por encima del borde superior */}
          <View style={s.letraBox}>
            <Text style={s.letra}>C</Text>
            <Text style={s.cod}>COD. 011</Text>
          </View>
        </View>

        {/* Período facturado */}
        <View style={s.banda}>
          <Text>
            <Text style={s.bold}>Período Facturado Desde: </Text>
            {fecha(datos.servicioDesde)}
            <Text style={s.bold}>{"   Hasta: "}</Text>
            {fecha(datos.servicioHasta)}
          </Text>
          <Text>
            <Text style={s.bold}>Fecha de Vto. para el pago: </Text>
            {fecha(datos.vtoPago)}
          </Text>
        </View>

        {/* Receptor */}
        <View style={s.bloque}>
          <View style={s.fila2}>
            <View style={s.celdaIzq}>
              <Text>
                <Text style={s.bold}>
                  {datos.receptor.docTipo === "Consumidor final"
                    ? "Documento"
                    : datos.receptor.docTipo}
                  :{" "}
                </Text>
                {datos.receptor.docNro || "—"}
              </Text>
            </View>
            <View style={s.celdaDer}>
              <Text>
                <Text style={s.bold}>Apellido y Nombre / Razón Social: </Text>
                {datos.receptor.razonSocial}
              </Text>
            </View>
          </View>
          <View style={s.fila2}>
            <View style={s.celdaIzq}>
              <Text>
                <Text style={s.bold}>Condición frente al IVA: </Text>
                {datos.receptor.condicionIva}
              </Text>
            </View>
            <View style={s.celdaDer}>
              <Text>
                <Text style={s.bold}>Domicilio: </Text>
                {datos.receptor.domicilio || "—"}
              </Text>
            </View>
          </View>
          <Dato
            label="Condición de venta"
            value={datos.condicionVenta || "Transferencia Bancaria"}
          />
        </View>

        {/* Detalle */}
        <View style={s.tabla}>
          <View style={s.thead}>
            <Text style={[s.th, s.cCodigo]}>Código</Text>
            <Text style={[s.th, s.cDesc]}>Producto / Servicio</Text>
            <Text style={[s.th, s.cCant]}>Cantidad</Text>
            <Text style={[s.th, s.cUm]}>U. Medida</Text>
            <Text style={[s.th, s.cPrecio]}>Precio Unit.</Text>
            <Text style={[s.th, s.cBonifPct]}>% Bonif</Text>
            <Text style={[s.th, s.cBonifImp]}>Imp. Bonif.</Text>
            <Text style={[s.th, s.cSubtotal]}>Subtotal</Text>
          </View>
          <View style={s.tr}>
            <Text style={[s.td, s.cCodigo]}>{datos.codigo || ""}</Text>
            <Text style={[s.td, s.cDesc]}>{datos.concepto}</Text>
            <Text style={[s.td, s.cCant]}>1,00</Text>
            <Text style={[s.td, s.cUm]}>unidades</Text>
            <Text style={[s.td, s.cPrecio]}>{num(importe)}</Text>
            <Text style={[s.td, s.cBonifPct]}>0,00</Text>
            <Text style={[s.td, s.cBonifImp]}>0,00</Text>
            <Text style={[s.td, s.cSubtotal]}>{num(importe)}</Text>
          </View>
        </View>

        {/* Totales */}
        <View style={s.totales}>
          <View style={s.filaTotal}>
            <Text style={[s.etiquetaTotal, s.bold]}>Subtotal:</Text>
            <Text style={s.valorTotal}>$ {num(importe)}</Text>
          </View>
          <View style={s.filaTotal}>
            <Text style={[s.etiquetaTotal, s.bold]}>
              Importe Otros Tributos:
            </Text>
            <Text style={s.valorTotal}>$ 0,00</Text>
          </View>
          <View style={s.filaTotal}>
            <Text style={[s.etiquetaTotal, s.bold, s.granTotal]}>
              Importe Total:
            </Text>
            <Text style={[s.valorTotal, s.granTotal]}>$ {num(importe)}</Text>
          </View>
        </View>

        {cfg.actividad ? (
          <Text style={s.actividad}>&quot;{cfg.actividad}&quot;</Text>
        ) : null}

        {/* Pie: QR, CAE y leyendas obligatorias */}
        <View style={s.pie}>
          <Image style={s.qr} src={qrDataUrl} />
          <View style={s.pieCentro}>
            <Text style={s.autorizado}>Comprobante Autorizado</Text>
            <Text style={{ fontSize: 6, color: GRIS, marginTop: 3 }}>
              Pág. 1/1
            </Text>
          </View>
          <View style={s.pieDer}>
            <Text style={s.linea}>
              <Text style={s.bold}>CAE N°: </Text>
              <Text style={s.cae}>{resultado.cae}</Text>
            </Text>
            <Text style={s.linea}>
              <Text style={s.bold}>Fecha de Vto. de CAE: </Text>
              {fecha(resultado.caeVto)}
            </Text>
          </View>
        </View>

        <Text style={s.descargo}>
          Esta Agencia no se responsabiliza por los datos ingresados en el
          detalle de la operación
        </Text>

        {cfg.ambiente === "homologacion" ? (
          <Text style={s.aviso}>
            COMPROBANTE EMITIDO EN AMBIENTE DE PRUEBA (HOMOLOGACIÓN) — SIN
            VALIDEZ FISCAL
          </Text>
        ) : null}
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
