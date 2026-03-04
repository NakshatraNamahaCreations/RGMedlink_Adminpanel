import { useEffect, useState } from "react";
import API from "../api";
import { C, Card, Btn, Inp, Tag, Modal } from "./Styles";
import { FaPills, FaBoxes, FaExclamationTriangle } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";

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

  const [showCategoryModal, setShowCategoryModal] = useState(false);
const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    const res = await API.get("/medicines");
    setMeds(res.data);
  };

  const saveMed = async () => {
    if (editMed._id) {
      await API.put(`/medicines/${editMed._id}`, editMed);
    } else {
      await API.post("/medicines", editMed);
    }

    setEditMed(null);
    fetchMeds();
  };

  const deleteMed = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;
    await API.delete(`/medicines/${id}`);
    fetchMeds();
  };

  const filtered = meds.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (m) => {
    if (m.stock === 0) return { label: "Out of Stock", color: "#DC2626" };
    if (m.stock <= m.minStock) return { label: "Low Stock", color: "#D97706" };
    return { label: "In Stock", color: "#16A34A" };
  };

  const totalMeds = meds.length;
  const lowStock = meds.filter((m) => m.stock <= m.minStock).length;
  const totalStock = meds.reduce((sum, m) => sum + m.stock, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* DASHBOARD CARDS */}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>

        <Card
          ch={
            <div style={{ display: "flex", gap: 12 }}>
              <FaPills size={24} />
              <div>
                <div>Total Medicines</div>
                <h2>{totalMeds}</h2>
              </div>
            </div>
          }
        />

        <Card
          ch={
            <div style={{ display: "flex", gap: 12 }}>
              <FaExclamationTriangle size={24} color="#DC2626" />
              <div>
                <div>Low Stock</div>
                <h2 style={{ color: "#DC2626" }}>{lowStock}</h2>
              </div>
            </div>
          }
        />

        <Card
          ch={
            <div style={{ display: "flex", gap: 12 }}>
              <FaBoxes size={24} />
              <div>
                <div>Total Inventory</div>
                <h2>{totalStock}</h2>
              </div>
            </div>
          }
        />

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
                <tr style={{ background: "#06549d", color: "#fff" }}>
                  {["Medicine", "Category", "Price", "Stock", "Status", "Actions"].map(
                    (head) => (
                      <th key={head} style={th}>{head}</th>
                    )
                  )}
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

                      <td style={td}>{m.name}</td>
                      <td style={td}>{m.category}</td>
                      <td style={{ ...td, textAlign: "left" }}>₹{m.price}</td>

                      <td style={td}>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ fontWeight: 600 }}>
                            {m.stock} / {m.minStock}
                          </div>

                          <div style={stockBarBg}>
                            <div
                              style={{
                                width: `${Math.min(
                                  (m.stock / (m.minStock || 1)) * 100,
                                  100
                                )}%`,
                                background:
                                  m.stock <= m.minStock ? "#EF4444" : "#10B981",
                                height: "100%",
                              }}
                            />
                          </div>

                        </div>

                      </td>

                      <td style={td}>
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
  padding: "14px 16px",
  borderBottom: "1px solid #E2E8F0",
};

const stockBarBg = {
  height: 6,
  background: "#E2E8F0",
  borderRadius: 6,
  overflow: "hidden",
};

export default InventoryMgt;