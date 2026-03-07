import { API_BASE_URL } from "../config/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ESTADOS_PEDIDO = [
  "En espera",
  "Confirmado",
  "Pendiente",
  "En preparación",
  "Enviado",
  "Entregado",
  "Retirado",
  "Cancelado",
];

const PAGO_LABELS = {
  1: "Efectivo",
  2: "Mercado Pago",
  3: "Transferencia",
};

const ENVIO_LABELS = {
  1: "Retiro en el local",
  2: "Envío por correo",
};

const API_BASE = API_BASE_URL;

async function parseApiResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  return { error: text || `Respuesta no JSON (HTTP ${res.status})` };
}

export default function SeguimientoPedidos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [comercio, setComercio] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [estadosDraft, setEstadosDraft] = useState({});
  const [detallesAbiertos, setDetallesAbiertos] = useState({});
  const [busquedaNumero, setBusquedaNumero] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const totalPedidos = useMemo(() => pedidos.length, [pedidos]);
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const numero = String(pedido.numero_pedido || "").toLowerCase();
      const coincideBusqueda = !busquedaNumero.trim() || numero.includes(busquedaNumero.trim().toLowerCase());
      if (!coincideBusqueda) return false;

      const coincideEstado = filtroEstado === "todos" || pedido.estado === filtroEstado;
      if (!coincideEstado) return false;

      const fechaPedido = new Date(pedido.fecha);
      if (Number.isNaN(fechaPedido.getTime())) return false;

      if (fechaDesde) {
        const inicio = new Date(`${fechaDesde}T00:00:00`);
        if (fechaPedido < inicio) return false;
      }

      if (fechaHasta) {
        const fin = new Date(`${fechaHasta}T23:59:59`);
        if (fechaPedido > fin) return false;
      }

      return true;
    });
  }, [pedidos, busquedaNumero, filtroEstado, fechaDesde, fechaHasta]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError("");

        const userData = localStorage.getItem("user");
        if (!userData) {
          setError("No hay sesión activa para consultar pedidos.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        const comercioRes = await fetch(`${API_BASE}/api/comercio/${user.id_usuario}`);
        const comercioData = await parseApiResponse(comercioRes);

        if (!comercioRes.ok || !comercioData?.id_comercio) {
          setError("No se encontró un comercio activo para esta cuenta.");
          setLoading(false);
          return;
        }

        setComercio(comercioData);

        const pedidosRes = await fetch(`${API_BASE}/api/pedidos/comercio/${comercioData.id_comercio}`);
        const pedidosData = await parseApiResponse(pedidosRes);

        if (!pedidosRes.ok) {
          if (pedidosRes.status === 404) {
            throw new Error(
              "El backend no tiene disponible la ruta de seguimiento de pedidos. Reiniciá el servidor backend para aplicar los cambios nuevos."
            );
          }
          throw new Error(pedidosData?.error || `No se pudieron cargar los pedidos (HTTP ${pedidosRes.status}).`);
        }

        const lista = Array.isArray(pedidosData) ? pedidosData : [];
        setPedidos(lista);

        const drafts = {};
        for (const pedido of lista) {
          drafts[pedido.id_pedido] = pedido.estado;
        }
        setEstadosDraft(drafts);
      } catch (err) {
        setError(err.message || "Ocurrió un error al cargar pedidos.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChangeEstado = (idPedido, nuevoEstado) => {
    setEstadosDraft((prev) => ({ ...prev, [idPedido]: nuevoEstado }));
  };

  const handleGuardarEstado = async (idPedido) => {
    if (!comercio?.id_comercio) return;

    const nuevoEstado = estadosDraft[idPedido];
    if (!nuevoEstado) return;

    try {
      setSavingId(idPedido);

      const res = await fetch(`${API_BASE}/api/pedidos/${idPedido}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_comercio: comercio.id_comercio,
          estado: nuevoEstado,
        }),
      });

      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data?.error || `No se pudo actualizar el estado (HTTP ${res.status}).`);
      }

      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.id_pedido === idPedido ? { ...pedido, estado: nuevoEstado } : pedido
        )
      );
    } catch (err) {
      alert(err.message || "No se pudo actualizar el estado del pedido.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleDetallePedido = (idPedido) => {
    setDetallesAbiertos((prev) => ({
      ...prev,
      [idPedido]: !prev[idPedido],
    }));
  };

  return (
    <section className="admin-page">
      <div className="admin-container">
        <div
          className="admin-title"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
        >
          <span>
            Seguimiento de <span className="accent">pedidos</span>
          </span>
          <button type="button" className="btn btn-back" onClick={() => navigate("/admin")}>
            ← Volver al panel
          </button>
        </div>

        <p className="admin-subtitle">
          Revisá tus pedidos y actualizá su estado en tiempo real.
        </p>

        {loading && <p>Cargando pedidos...</p>}
        {!loading && error && <p style={{ color: "#B42318" }}>{error}</p>}

        {!loading && !error && (
          <>
            <div
              style={{
                display: "inline-flex",
                padding: "8px 14px",
                borderRadius: 8,
                background: "#EEF2FF",
                color: "#1E3A8A",
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Total de pedidos: {totalPedidos}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
                marginBottom: 14,
                padding: 12,
                border: "1px solid #E4E7EC",
                borderRadius: 10,
                background: "#FCFCFD",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#475467", marginBottom: 4 }}>
                  Buscar por número
                </label>
                <input
                  type="text"
                  placeholder="Ej: ORD-123"
                  value={busquedaNumero}
                  onChange={(e) => setBusquedaNumero(e.target.value)}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #D0D5DD" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, color: "#475467", marginBottom: 4 }}>
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #D0D5DD" }}
                >
                  <option value="todos">Todos</option>
                  {ESTADOS_PEDIDO.map((estado) => (
                    <option key={`filtro-${estado}`} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, color: "#475467", marginBottom: 4 }}>
                  Desde
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #D0D5DD" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, color: "#475467", marginBottom: 4 }}>
                  Hasta
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #D0D5DD" }}
                />
              </div>
            </div>

            <p style={{ marginTop: 0, color: "#475467", fontWeight: 600 }}>
              Mostrando {pedidosFiltrados.length} de {totalPedidos} pedidos
            </p>

            {pedidosFiltrados.length === 0 ? (
              <p>No hay pedidos para mostrar.</p>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {pedidosFiltrados.map((pedido) => {
                  const estadoDraft = estadosDraft[pedido.id_pedido] || pedido.estado;
                  const isDirty = estadoDraft !== pedido.estado;
                  const nombrePago = pedido.nombre_pago || PAGO_LABELS[Number(pedido.id_pago)] || "No informado";
                  const nombreEnvio = pedido.nombre_envio || ENVIO_LABELS[Number(pedido.id_envio)] || "No informado";
                  const backendNoExponeDetalles = typeof pedido.detalles === "undefined";
                  const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];
                  const detalleAbierto = !!detallesAbiertos[pedido.id_pedido];

                  return (
                    <article
                      key={pedido.id_pedido}
                      style={{
                        border: "1px solid #E5E7EB",
                        borderRadius: 12,
                        padding: 16,
                        background: "#FFFFFF",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <strong>#{pedido.numero_pedido}</strong>
                          <p style={{ margin: "4px 0 0", color: "#475467" }}>
                            Fecha: {new Date(pedido.fecha).toLocaleDateString("es-AR")}
                          </p>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <strong>${Number(pedido.total || 0).toFixed(2)}</strong>
                          <p style={{ margin: "4px 0 0", color: "#475467" }}>
                            {pedido.total_unidades || 0} unidad(es)
                          </p>
                        </div>
                      </div>

                      <p style={{ margin: "0 0 10px", color: "#101828" }}>
                        Cliente: {pedido.nombre || "Sin nombre"} ({pedido.email || "sin email"})
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: 8,
                          marginBottom: 12,
                          padding: "10px 12px",
                          background: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          borderRadius: 10,
                        }}
                      >
                        <div>
                          <span style={{ color: "#475467", fontSize: 13 }}>Método de pago</span>
                          <p style={{ margin: 0, fontWeight: 600 }}>{nombrePago}</p>
                        </div>
                        <div>
                          <span style={{ color: "#475467", fontSize: 13 }}>Método de envío</span>
                          <p style={{ margin: 0, fontWeight: 600 }}>{nombreEnvio}</p>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <button
                          type="button"
                          onClick={() => toggleDetallePedido(pedido.id_pedido)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            border: "1px solid #E4E7EC",
                            borderRadius: 10,
                            padding: "10px 12px",
                            background: "#F9FAFB",
                            color: "#1D2939",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {detalleAbierto ? "▼" : "▶"} Detalle de la venta
                        </button>

                        {detalleAbierto && (
                          <div style={{ marginTop: 8 }}>
                            {detalles.length > 0 ? (
                              <div style={{ display: "grid", gap: 8 }}>
                                {detalles.map((detalle) => (
                                  <div
                                    key={detalle.id_detallepedido}
                                    style={{
                                      border: "1px solid #E4E7EC",
                                      borderRadius: 10,
                                      padding: "10px 12px",
                                      background: "#FFFFFF",
                                    }}
                                  >
                                    <p style={{ margin: 0, fontWeight: 600 }}>
                                      {detalle.producto_nombre || `Producto #${detalle.id_producto}`}
                                    </p>
                                    <p style={{ margin: "4px 0 0", color: "#475467" }}>
                                      Variante: {detalle.variante_descripcion || "Sin variante"}
                                    </p>
                                    <p style={{ margin: "4px 0 0", color: "#475467" }}>
                                      Cantidad: {detalle.cantidad} | Precio unitario: ${Number(detalle.precio || 0).toFixed(2)} | Subtotal: ${Number(detalle.subtotal || 0).toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : backendNoExponeDetalles ? (
                              <p style={{ margin: 0, color: "#667085" }}>
                                Este backend no está enviando el detalle de productos para los pedidos.
                              </p>
                            ) : (
                              <p style={{ margin: 0, color: "#667085" }}>
                                Este pedido no tiene líneas de detalle guardadas (pedido histórico o incompleto).
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <select
                          value={estadoDraft}
                          onChange={(e) => handleChangeEstado(pedido.id_pedido, e.target.value)}
                          style={{
                            minWidth: 210,
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid #D0D5DD",
                          }}
                        >
                          {ESTADOS_PEDIDO.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>

                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => handleGuardarEstado(pedido.id_pedido)}
                          disabled={!isDirty || savingId === pedido.id_pedido}
                        >
                          {savingId === pedido.id_pedido ? "Guardando..." : "Guardar estado"}
                        </button>

                        <span style={{ fontSize: 14, color: "#667085" }}>
                          Estado actual: <strong>{pedido.estado}</strong>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
