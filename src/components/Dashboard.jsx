import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import API from "../api";
import { Card, KPI, Btn } from "./Styles";
import { fCur } from "../data/MasterData";

export default function Dashboard({ setTab }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    API.get("/prescriptions").then((res) =>
      setPrescriptions(res.data)
    );

    API.get("/medicines").then((res) =>
      setMedicines(res.data)
    );
  }, []);

  /* ================= KPI CALCULATIONS ================= */

  const totalPrescriptions = prescriptions.length;

  const totalRevenue = prescriptions.reduce(
    (sum, p) => sum + (p.total || 0),
    0
  );

  const collected = prescriptions
    .filter((p) => p.payStatus === "Paid")
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const expiring = prescriptions.filter((p) => {
    const diff =
      (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  /* ================= INVENTORY HEALTH ================= */

  const inStock = medicines.filter(
    (m) => m.stock >= m.minStock * 2
  ).length;

  const lowStock = medicines.filter(
    (m) =>
      m.stock >= m.minStock &&
      m.stock < m.minStock * 2
  ).length;

  const critical = medicines.filter(
    (m) => m.stock < m.minStock
  ).length;

  /* ================= MONTHLY REVENUE ================= */

  const monthlyRevenue = useMemo(() => {
    const map = {};

    prescriptions.forEach((p) => {
      const month = new Date(p.createdAt).toLocaleString(
        "default",
        { month: "short" }
      );

      if (!map[month]) map[month] = 0;
      map[month] += p.total || 0;
    });

    return Object.entries(map).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }, [prescriptions]);

  /* ================= PRODUCT SALES ================= */

  const productSales = useMemo(() => {
    const map = {};

    prescriptions.forEach((p) => {
      p.meds?.forEach((m) => {
        if (!map[m.mName]) map[m.mName] = 0;
        map[m.mName] += m.qty || 1;
      });
    });

    return Object.entries(map).map(([name, sold]) => ({
      name,
      sold,
    }));
  }, [prescriptions]);
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
      <KPI label="Total Prescriptions" value={totalPrescriptions} />
      <KPI label="Expiring (7d)" value={expiring} />
      <KPI label="Total Revenue" value={fCur(totalRevenue)} />
      <KPI label="Collected" value={fCur(collected)} />
      <KPI label="Pending" value={fCur(totalRevenue - collected)} />
    </div>

    {/* CHART + INVENTORY GRID */}
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
              Monthly Revenue
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
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
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
                onClick={() => setTab("inventory")}
              />
            </div>

            <HealthBox label="In Stock" value={inStock} color="#16A34A" />
            <HealthBox label="Low Stock" value={lowStock} color="#F59E0B" />
            <HealthBox label="Critical" value={critical} color="#DC2626" />

            
          </div>
        }
      />
    </div>

    {/* ================= FULL WIDTH PRESCRIPTIONS ================= */}

    <Card
  ch={
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>Recent Prescriptions</h3>

        <Btn
          ch="View All"
          sm
          onClick={() => setTab("prescriptions")}
        />
      </div>

      {/* TABLE */}
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
              <th style={thLeft}>Rx ID</th>
              <th style={thLeft}>Patient</th>
              <th style={thCenter}>Date</th>
              <th style={thRight}>Amount</th>
              <th style={thCenter}>Payment</th>
              <th style={thCenter}>Action</th>
            </tr>
          </thead>

          <tbody>
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                  No prescriptions available.
                </td>
              </tr>
            )}

            {prescriptions
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((p) => (
                <tr
                  key={p._id}
                  style={{
                    borderBottom: "1px solid #F3F4F6",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F9FAFB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td style={tdLeft}>{p.rxId}</td>

                  <td style={tdLeft}>
                    {p.patient?.name || p.patientName || "Patient"}
                  </td>

                  <td style={tdCenter}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>

                  <td style={tdRight}>{fCur(p.total)}</td>

                  <td style={tdCenter}>
                    <span style={statusBadge(p.payStatus)}>
                      {p.payStatus}
                    </span>
                  </td>

                  <td style={tdCenter}>
                    <Btn
                      ch="View"
                      sm
                      onClick={() => setTab("prescriptions")}
                    />
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



/* ================= SMALL COMPONENT ================= */

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

const thLeft = { padding: 12, textAlign: "left" };
const thCenter = { padding: 12, textAlign: "center" };
const thRight = { padding: 12, textAlign: "right" };

const tdLeft = { padding: 10, textAlign: "left" };
const tdCenter = { padding: 10, textAlign: "center" };
const tdRight = { padding: 10, textAlign: "right", fontWeight: 600 };

const statusBadge = (status) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background: status === "Paid" ? "#DCFCE7" : "#FEE2E2",
  color: status === "Paid" ? "#166534" : "#991B1B",
});