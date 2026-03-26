import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Card, KPI, Btn } from "./Styles";

export default function Dashboard({ setTab }) {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const navigate = useNavigate();
  /* ================= LOAD DATA ================= */

const [dashboard, setDashboard] = useState(null);

useEffect(() => {
  API.get("/orders").then((res) => setOrders(res.data.data || []));

  API.get("/dashboard/summary").then((res) => {
    setDashboard(res.data);
    setMedicines(res.data.medicines || []);
  });
}, []);

  /* ================= KPI CALCULATIONS ================= */

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );

  const collected = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pending = totalRevenue - collected;

  /* ================= INVENTORY HEALTH ================= */

const getStatus = (m) => {
  // 🔥 FIRST check stock conditions

  if (m.stock === 0) return "Out of Stock";

  if (m.stock > 0 && m.stock <= m.minStock * 0.5)
    return "Critical";

  if (m.stock > m.minStock * 0.5 && m.stock <= m.minStock)
    return "Low Stock";

  // 🔥 THEN check inactive (optional)
  if (m.status === "Inactive") return "Inactive";

  return "In Stock";
};

const inStock = medicines.filter(
  (m) => getStatus(m) === "In Stock"
).length;

const lowStock = medicines.filter(
  (m) => getStatus(m) === "Low Stock"
).length;

const critical = medicines.filter(
  (m) => getStatus(m) === "Critical"
).length;

  /* ================= MONTHLY REVENUE ================= */

  const monthlyRevenue = useMemo(() => {
    const map = {};

    orders.forEach((o) => {
      if (!o.createdAt) return;

      const month = new Date(o.createdAt).toLocaleString(
        "default",
        { month: "short" }
      );

      if (!map[month]) map[month] = 0;

      map[month] += o.totalAmount || 0;
    });

    return Object.entries(map).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }, [orders]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* KPI CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 16,
        }}
      >
        <KPI label="Total Orders" value={totalOrders} />
        <KPI label="Total Revenue" value={`₹${totalRevenue}`} />
        <KPI label="Collected" value={`₹${collected}`} />
        <KPI label="Pending" value={`₹${pending}`} />
        <KPI label="Medicines" value={medicines.length} />
      </div>

      {/* CHART + INVENTORY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
        }}
      >

        {/* MONTHLY REVENUE */}

        <Card
          ch={
            <div>
              <h3 style={{ marginBottom: 16 }}>
                Monthly Order Revenue
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient
                      id="revGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2563EB"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#2563EB"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <Tooltip formatter={(v) => `₹${v}`} />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    fill="url(#revGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          }
        />

        {/* INVENTORY HEALTH */}

        <Card
          ch={
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h3>Inventory Health</h3>

                <Btn
                  ch="View Inventory"
                  sm
                 onClick={() => navigate("/inventory")}
                />
              </div>

              <HealthBox
                label="In Stock"
                value={inStock}
                color="#16A34A"
              />

              <HealthBox
                label="Low Stock"
                value={lowStock}
                color="#F59E0B"
              />

              <HealthBox
                label="Critical"
                value={critical}
                color="#DC2626"
              />
            </div>
          }
        />
      </div>

      {/* RECENT ORDERS */}

      <Card
        ch={
          <div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0 }}>Recent Orders</h3>

              <Btn
  ch="View All"
  sm
  onClick={() => navigate("/orders")}
/>
            </div>

            <div
              style={{
                overflowX: "auto",
                borderRadius: 10,
                border: "1px solid #E5E7EB",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                  background: "#fff",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#06549d",
                      color: "#fff",
                    }}
                  >
                    <th style={th}>Order ID</th>
                    <th style={th}>Customer</th>
                    <th style={th}>Date</th>
                    <th style={th}>Amount</th>
                    <th style={th}>Status</th>
                    <th style={th}>Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {orders
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                    )
                    .slice(0, 5)
                    .map((o) => (
                      <tr key={o._id}>
                        <td style={td}>{o.orderId}</td>

                        <td style={td}>
                          {o.patientDetails?.name || "Customer"}
                        </td>

                        <td style={td}>
                          {new Date(
                            o.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td style={td}>
                          ₹{o.totalAmount || 0}
                        </td>

                        <td style={td}>
                          <span
                            style={statusBadge(
                              o.orderStatus
                            )}
                          >
                            {o.orderStatus}
                          </span>
                        </td>

                        <td style={td}>
                          <span
                            style={paymentBadge(
                              o.paymentStatus
                            )}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        }
      />
    </div>
  );
}

/* ================= COMPONENTS ================= */

const HealthBox = ({ label, value, color }) => (
  <div
    style={{
      background: color + "15",
      border: `1px solid ${color}40`,
      padding: 16,
      borderRadius: 10,
      marginBottom: 12,
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 700, color }}>
      {value}
    </div>

    <div style={{ fontSize: 12, color: "#6B7280" }}>
      {label}
    </div>
  </div>
);

/* ================= TABLE STYLES ================= */

const th = { padding: 12, textAlign: "left" };

const td = {
  padding: 10,
  borderBottom: "1px solid #F3F4F6",
};

const statusBadge = (status) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background: "#DBEAFE",
  color: "#1E40AF",
});

const paymentBadge = (status) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    status === "Paid" ? "#DCFCE7" : "#FEE2E2",
  color:
    status === "Paid" ? "#166534" : "#991B1B",
});