import { useEffect, useState } from "react";
import API from "../api";
import { C, Card, Btn, Inp, Tag, Modal } from "./Styles";
import { FaPills, FaBoxes, FaExclamationTriangle } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { AreaChart, Area } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import {
FaChartLine,
FaRupeeSign
} from "react-icons/fa";

const defaultCategories = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Ointment",
  "Medical Device",
];

const units = ["Tablet", "Bottle", "Strip", "Tube", "Box"];

const statuses = ["Active", "Inactive", "Discontinued"];

const InventoryMgt = () => {
  const [meds, setMeds] = useState([]);
  const [search, setSearch] = useState("");
  const [editMed, setEditMed] = useState(null);
  const [categories, setCategories] = useState(defaultCategories);
const [dashboard, setDashboard] = useState(null);
const [showAlert, setShowAlert] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
const [newCategory, setNewCategory] = useState("");

 useEffect(() => {
  fetchDashboard();
}, []);

  const fetchDashboard = async () => {
  const res = await API.get("/dashboard/summary");

  setDashboard(res.data);
  setMeds(res.data.medicines);
};

  const saveMed = async () => {
    if (editMed._id) {
      await API.put(`/medicines/${editMed._id}`, editMed);
    } else {
      await API.post("/medicines", editMed);
    }

    setEditMed(null);
    fetchDashboard();
  };

  const deleteMed = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;
    await API.delete(`/medicines/${id}`);
    fetchDashboard();
  };

  const filtered = meds.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (m) => {
    if (m.stock === 0) return { label: "Out of Stock", color: "#DC2626" };
    if (m.stock <= m.minStock) return { label: "Low Stock", color: "#D97706" };
    return { label: "In Stock", color: "#16A34A" };
  };

  const totalMeds = dashboard?.totalSKUs || 0;
const lowStock = dashboard?.lowStockItems || 0;
const totalStock = meds.reduce((sum, m) => sum + m.stock, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {dashboard && showAlert && dashboard.criticalStock > 0 && (

<div style={alertContainer}>

  <div style={alertLeft}>

    <FaExclamationTriangle size={20} color="#fff" />

    <div>

      <div style={alertTitle}>
        Live Inventory Alert — Immediate Action Required
      </div>

      <div style={alertText}>
        {dashboard.criticalStock} medicines CRITICAL (stock below minimum) ·
        {dashboard.lowStockItems} LOW STOCK ·
        Estimated reorder cost: ₹{dashboard.reorderCost}
      </div>

    </div>

  </div>

  <button
    style={dismissBtn}
    onClick={() => setShowAlert(false)}
  >
    Dismiss
  </button>

</div>

)}

    {dashboard && dashboard.criticalStock > 0 && (

  <div style={{
    background: "linear-gradient(135deg,#DC2626,#991B1B)",
    color: "#fff",
    padding: "14px 18px",
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}>

    <div>

      <div style={{fontWeight:700}}>
        🚨 Live Inventory Alert — Immediate Action Required
      </div>

      <div style={{fontSize:12,opacity:0.9}}>

        {dashboard.criticalStock} medicines CRITICAL ·
        {dashboard.lowStockItems} LOW STOCK ·
        Estimated reorder cost: ₹{dashboard.reorderCost}

      </div>

    </div>

  </div>

)}


{dashboard && (

<Card
  ch={
    <div style={{ height: 350 }}>

      <h3 style={{ marginBottom: 16 }}>
        30-Day Demand Forecast vs Current Stock
      </h3>

      <ResponsiveContainer width="100%" height="90%">

        <BarChart
          data={dashboard?.graphData || []}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >

          <defs>

            <linearGradient id="demand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.4}/>
            </linearGradient>

            <linearGradient id="stock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#A7F3D0" stopOpacity={0.4}/>
            </linearGradient>

          </defs>

          <XAxis dataKey="name" stroke="#6B7280"/>
          <YAxis stroke="#6B7280"/>

          <Tooltip
            cursor={{ fill: "#F3F4F6" }}
            contentStyle={{
              borderRadius: 8,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          />

          <Bar
            dataKey="demand"
            fill="url(#demand)"
            radius={[6,6,0,0]}
          />

          <Bar
            dataKey="stock"
            fill="url(#stock)"
            radius={[6,6,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  }
/>

)}
      {/* DASHBOARD CARDS */}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>

    <div style={statsGrid}>

  {/* TOTAL MEDICINES */}

  <div style={{...statCard, borderLeft:"4px solid #3B82F6"}}>

    <div style={iconBox("#DBEAFE")}>
      <FaPills color="#2563EB" size={20}/>
    </div>

    <div>
      <div style={statTitle}>Total Medicines</div>
      <div style={statValue}>{totalMeds}</div>
    </div>

  </div>

  {/* LOW STOCK */}

  <div style={{...statCard, borderLeft:"4px solid #EF4444"}}>

    <div style={iconBox("#FEE2E2")}>
      <FaExclamationTriangle color="#DC2626" size={20}/>
    </div>

    <div>
      <div style={statTitle}>Low Stock</div>
      <div style={{...statValue,color:"#DC2626"}}>{lowStock}</div>
    </div>

  </div>

  {/* TOTAL INVENTORY */}

  <div style={{...statCard, borderLeft:"4px solid #059669"}}>

    <div style={iconBox("#D1FAE5")}>
      <FaBoxes color="#059669" size={20}/>
    </div>

    <div>
      <div style={statTitle}>Total Inventory</div>
      <div style={statValue}>{totalStock}</div>
    </div>

  </div>

  {/* 30 DAY DEMAND */}

  <div style={{...statCard, borderLeft:"4px solid #7C3AED"}}>

    <div style={iconBox("#EDE9FE")}>
      <FaChartLine color="#7C3AED" size={20}/>
    </div>

    <div>
      <div style={statTitle}>30-Day Demand</div>
      <div style={statValue}>
        {dashboard?.graphData?.reduce((a,b)=>a+b.demand,0) || 0}
      </div>
    </div>

  </div>

  {/* REORDER COST */}

  <div style={{...statCard, borderLeft:"4px solid #F59E0B"}}>

    <div style={iconBox("#FEF3C7")}>
      <FaRupeeSign color="#D97706" size={20}/>
    </div>

    <div>
      <div style={statTitle}>Reorder Cost</div>
      <div style={statValue}>₹{dashboard?.reorderCost || 0}</div>
    </div>

  </div>

</div>

      </div>

      {/* TOOLBAR */}

      <div style={{ display: "flex", justifyContent: "space-between" }}>

        <div style={searchBox}>

  <FaSearch
    size={14}
    color="#64748B"
    style={{ marginRight: 4 }}
  />

  <input
    placeholder="Search medicines..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={searchInput}
  />

</div>

        <Btn
          ch="+ Add Medicine"
          onClick={() =>
            setEditMed({
              name: "",
              category: "",
              price: "",
              stock: "",
              minStock: "",
              unit: "Tablet",
              status: "Active",
            })
          }
        />

      </div>

      {/* TABLE */}

   <Card
  ch={
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #E2E8F0" }}>

      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          background: "#fff",
        }}
      >

        {/* HEADER */}

        <thead>
          <tr
            style={{
              background: "#0F172A",
              color: "#fff",
              fontSize: 13,
              letterSpacing: 0.3
            }}
          >
            {[
              "Medicine",
              "Category",
              "Price",
              "Stock",
              "Min Stock",
              "📊 30d Demand",
              "📊 90d Demand",
              "Status",
              "Days Until Stockout",
              "Auto Reorder Qty",
              "Actions"
            ].map((head) => (
              <th key={head} style={th}>{head}</th>
            ))}
          </tr>
        </thead>

        {/* BODY */}

        <tbody>

          {filtered.map((m, index) => {

            const status = getStatus(m);

            return (

              <tr
                key={m._id}
                style={{
                  background: index % 2 === 0 ? "#fff" : "#F8FAFC",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#EEF2FF")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    index % 2 === 0 ? "#fff" : "#F8FAFC")
                }
              >

                {/* Medicine */}

                <td style={td}>{m.name}</td>

                {/* Category */}

                <td style={td}>
                  <span
                    style={{
                      background: "#EEF2FF",
                      color: "#2563EB",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    {m.category}
                  </span>
                </td>

                {/* Price */}

                <td style={td}>₹{m.price}</td>

                {/* Stock with progress bar */}

                <td style={td}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>

                    <span style={{ fontWeight: 700 }}>
                      {m.stock}
                    </span>

                    <div
                      style={{
                        height: 6,
                        background: "#E5E7EB",
                        borderRadius: 20,
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min((m.stock / (m.minStock || 1)) * 100, 100)}%`,
                          height: "100%",
                          background:
                            m.stock <= m.minStock
                              ? "#DC2626"
                              : "#059669"
                        }}
                      />
                    </div>

                  </div>
                </td>

                {/* Min Stock */}

                <td style={td}>{m.minStock}</td>

                {/* 30d Demand */}

                <td style={{ ...td, color: "#2563EB", fontWeight: 600 }}>
                  {m.demand30 || 0}
                </td>

                {/* 90d Demand */}

                <td style={{ ...td, color: "#7C3AED", fontWeight: 600 }}>
                  {m.demand90 || 0}
                </td>

                {/* Status */}

                <td style={{padding:"14px 5px"}}>
                  <span
                    style={{
                      background:
                        status.label === "Low Stock"
                          ? "#FEF3C7"
                          : status.label === "Out of Stock"
                            ? "#FEE2E2"
                            : "#DCFCE7",
                      color: status.color,
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {status.label}
                  </span>
                </td>

                {/* Days Until Stockout */}

                <td style={{ ...td, fontWeight: 600, color: "#059669" }}>
                  {m.daysUntilStockout}
                </td>

                {/* Auto Reorder */}

                <td style={td}>

                  {m.autoReorderQty > 0 ? (

                    <span
                      style={{
                        background: "#FEF3C7",
                        color: "#D97706",
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 12
                      }}
                    >
                      Order {m.autoReorderQty}
                    </span>

                  ) : (

                    <span style={{ color: "#059669", fontWeight: 700 }}>
                      ✓ OK
                    </span>

                  )}

                </td>

                {/* Actions */}

                <td style={td}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn ch="Edit" sm v="ghost" onClick={() => setEditMed(m)} />
                    <Btn ch="Delete" sm v="danger" onClick={() => deleteMed(m._id)} />
                  </div>
                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>
  }
/>


{dashboard?.expiryRisk?.length > 0 && (

<Card
  ch={

    <div>

      <h4>Medicine Expiry Risk Monitor</h4>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",
        gap:12
      }}>

        {dashboard.expiryRisk.map((m)=> (

          <div
            key={m._id}
            style={{
              border:"1px solid #E5E7EB",
              borderRadius:10,
              padding:12
            }}
          >

            <div style={{fontWeight:700}}>{m.name}</div>

            <div style={{fontSize:12}}>
              Expires: {m.expiry}
            </div>

            <div style={{
              fontSize:12,
              color:m.risk === "HIGH" ? "#DC2626"
                   : m.risk === "MEDIUM" ? "#D97706"
                   : "#16A34A"
            }}>
              Risk: {m.risk}
            </div>

          </div>

        ))}

      </div>

    </div>

  }
/>

)}
      {/* MODAL */}

      {editMed && (
        <Modal
          title={editMed._id ? "Edit Medicine" : "Add Medicine"}
          w={520}
          onClose={() => setEditMed(null)}
          ch={
            <div style={formGrid}>

              <Field label="Medicine Name" value={editMed.name}
                onChange={(v) => setEditMed({ ...editMed, name: v })} />
             
               <div>
  <label style={labelStyle}>Category</label>

  <div style={{ display: "flex", gap: 8 }}>

    <select
      value={editMed.category}
      style={selectStyle}
      onChange={(e) =>
        setEditMed({ ...editMed, category: e.target.value })
      }
    >
      <option value="">Select Category</option>

      {categories.map((c) => (
        <option key={c}>{c}</option>
      ))}

    </select>

    {/* ADD CATEGORY BUTTON */}

    <button
      onClick={() => setShowCategoryModal(true)}
      style={addCategoryBtn}
    >
      <FaPlus size={12} />
    </button>

  </div>
</div>

              <Field label="Price"
                value={editMed.price}
                type="number"
                onChange={(v) => setEditMed({ ...editMed, price: v })}
              />

              <Field label="Current Stock"
                value={editMed.stock}
                type="number"
                onChange={(v) => setEditMed({ ...editMed, stock: v })}
              />

              <Field label="Minimum Stock"
                value={editMed.minStock}
                type="number"
                onChange={(v) => setEditMed({ ...editMed, minStock: v })}
              />

            

              <div>
                <label style={labelStyle}>Unit</label>
                <select
                  value={editMed.unit}
                  style={selectStyle}
                  onChange={(e) =>
                    setEditMed({ ...editMed, unit: e.target.value })
                  }
                >
                  {units.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={editMed.status}
                  style={selectStyle}
                  onChange={(e) =>
                    setEditMed({ ...editMed, status: e.target.value })
                  }
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={formButtons}>
                <Btn ch="Cancel" v="ghost" onClick={() => setEditMed(null)} />
                <Btn ch="Save" onClick={saveMed} />
              </div>

            </div>
          }
        />
      )}



      {/* CATEGORY MODAL */}

{showCategoryModal && (
  <Modal
    title="Add Category"
    w={380}
    onClose={() => setShowCategoryModal(false)}
    ch={
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <Inp
          placeholder="Enter category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>

          <Btn
            ch="Cancel"
            v="ghost"
            onClick={() => setShowCategoryModal(false)}
          />

          <Btn
            ch="Add"
            onClick={() => {

              if (!newCategory.trim()) return;

              const updated = [...categories, newCategory];

              setCategories(updated);

              setEditMed({
                ...editMed,
                category: newCategory
              });

              setNewCategory("");
              setShowCategoryModal(false);

            }}
          />

        </div>

      </div>
    }
  />
)}

    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <Inp value={value} type={type} onChange={(e) => onChange(e.target.value)} />
  </div>
);

/* STYLES */

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};

const alertContainer = {
  background: "linear-gradient(135deg,#DC2626,#B91C1C)",
  color: "#fff",
  padding: "16px 20px",
  borderRadius: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
};

const alertLeft = {
  display: "flex",
  alignItems: "center",
  gap: 12
};

const alertTitle = {
  fontWeight: 700,
  fontSize: 15
};

const alertText = {
  fontSize: 13,
  opacity: 0.9
};

const dismissBtn = {
  background: "rgba(255,255,255,0.2)",
  border: "none",
  color: "#fff",
  padding: "6px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600
};

const addCategoryBtn = {
  width: 38,
  height: 38,
  borderRadius: 8,
  border: "1px solid #E2E8F0",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "0.2s"
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const formButtons = {
  gridColumn: "span 2",
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
};

const selectStyle = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ddd",
  width: "100%",
};

const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#fff",
  width: 300,
};

const searchInput = {
  border: "none",
  outline: "none",
  width: "100%",
};

const th = {
  padding: "14px 16px",
  textAlign: "left",
  fontWeight: 600,
};

const td = {
  padding: "14px 4px",
  borderBottom: "1px solid #E2E8F0",
  textAlign: "center",
};

const stockBarBg = {
  height: 6,
  background: "#E2E8F0",
  borderRadius: 6,
  overflow: "hidden",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)", // 5 cards in one row
  gap: 20,
  marginBottom: 20
};

const statCard = {
  background:"#fff",
  borderRadius:14,
  padding:20,
  width:"200px",
  display:"flex",
  alignItems:"center",
  gap:14,
  boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
  transition:"0.25s",
  cursor:"default"
};

const statTitle = {
  fontSize:13,
  color:"#6B7280",
  fontWeight:500
};

const statValue = {
  fontSize:24,
  fontWeight:700,
  color:"#111827"
};

const iconBox = (bg)=>({
  width:44,
  height:44,
  borderRadius:12,
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  background:bg
});

export default InventoryMgt;