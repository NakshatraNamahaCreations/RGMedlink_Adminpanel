import { useState, useEffect, useMemo } from "react";
import { C, Card, Tag, Btn, Modal, Toast } from "./Styles";
import { dLeft, isExp, fDate, fCur } from "../data/MasterData";
import API from "../api";
import RxForm from "./RxForm";

export const RxView = ({ role }) => {
  const [rx, setRx] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [viewRx, setViewRx] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
const [confirmId, setConfirmId] = useState(null);
  const thLeft = { padding: 14, textAlign: "left" };
const thCenter = { padding: 14, textAlign: "center" };
const thRight = { padding: 14, textAlign: "right" };

const tdLeft = { padding: 12, textAlign: "left" };
const tdCenter = { padding: 12, textAlign: "center" };
const tdRight = { padding: 12, textAlign: "right", fontWeight: 600 };

const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 8;

const [visibleCols, setVisibleCols] = useState(9);
const [payingId, setPayingId] = useState(null);

const badge = (status) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  background: status.toLowerCase() === "paid" ? "#DCFCE7" : "#FEE2E2",
  color: status.toLowerCase() === "paid" ? "#166534" : "#991B1B",
  fontWeight: 600,
});

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const canEdit = ["Admin", "Pharmacist", "Data Entry", "Doctor"].includes(role);

  const toast_ = (m, t = "ok") => {
    setToast({ m, t });
    setTimeout(() => setToast(null), 3000);
  };

  // ───────────────── FETCH ─────────────────
  useEffect(() => {
    fetchPrescriptions();
    
  }, []);

  useEffect(() => {
  setCurrentPage(1);
  
}, [search, statusFilter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/prescriptions");

      const formatted = res.data.map((r) => ({
        id: r._id,
        rxId: r.rxId,
        pName: r.patient?.name || "Unknown",
        doctor: r.doctor,
        start: r.start,
        expiry: r.expiry,
        subtotal: r.subtotal,
        gst: r.gst,
        discount: r.discount,
        total: r.total,
        payStatus: r.payStatus,
        ordStatus: r.orderStatus,
        meds: r.meds.map((m) => ({
          mName: m.medicine?.name,
          dur: m.duration,
          freq: m.freq,
          qty: m.qty,
          price: m.price,
          sub: m.subtotal,
        })),
      }));

      setRx(formatted);
    } catch (err) {
      console.error(err);
      toast_("Failed to load prescriptions", "err");
    } finally {
      setLoading(false);
    }
  };

  // ───────────────── FILTER LOGIC ─────────────────
  const filteredRx = useMemo(() => {
    return rx.filter((r) => {
      const matchesSearch =
        r.pName.toLowerCase().includes(search.toLowerCase()) ||
        r.rxId.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || r.payStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rx, search, statusFilter]);

  const totalPages = Math.ceil(filteredRx.length / rowsPerPage);

const paginatedRx = useMemo(() => {
  const start = (currentPage - 1) * rowsPerPage;
  return filteredRx.slice(start, start + rowsPerPage);
}, [filteredRx, currentPage]);


const columns = [
  { key: "rxId", label: "Rx ID" },
  { key: "patient", label: "Patient" },
  { key: "doctor", label: "Doctor" },
  { key: "start", label: "Start" },
  { key: "expiry", label: "Expiry" },
  { key: "total", label: "Total" },
  { key: "payment", label: "Payment" },
  { key: "order", label: "Order" },
  { key: "actions", label: "Actions" },
];


  // ───────────────── CREATE ─────────────────
 const save = async (data) => {
  try {
    console.log("FRONTEND PAYLOAD:", data);

    const res = await API.post("/prescriptions", data);

    console.log("API RESPONSE:", res.data);

    toast_("Prescription created successfully");
    setShowNew(false);
    fetchPrescriptions();

  } catch (err) {
    console.error("API ERROR:", err.response?.data || err.message);
    toast_("Failed to create prescription", "err");
  }
};

  // ───────────────── MARK PAID ─────────────────
const markPaid = async (id) => {
  try {

    const res = await API.patch(`/prescriptions/${id}/pay`);

    console.log("PAY RESPONSE:", res.data);

    toast_("Payment marked as paid");

    // reload table data
    await fetchPrescriptions();

  } catch (err) {

    console.error("PAY ERROR:", err.response?.data || err.message);

    toast_(err.response?.data?.message || "Payment failed", "err");

  }
};

  // ───────────────── RENEW ─────────────────
  const renewPrescription = async (id) => {
    try {
      await API.post(`/prescriptions/${id}/renew`);
      toast_("Prescription renewed");
      fetchPrescriptions();
    } catch (err) {
      console.error(err);
      toast_("Renew failed", "err");
    }
  };

  useEffect(() => {
  const table = document.querySelector("table");
  if (!table) return;

  const rows = table.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.children;

    for (let i = 0; i < cells.length; i++) {
      if (i < visibleCols) {
        cells[i].style.display = "";
      } else {
        cells[i].style.display = "none";
      }
    }
  });
}, [visibleCols, paginatedRx]);


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {toast && (
        <Toast msg={toast.m} type={toast.t} onClose={() => setToast(null)} />
      )}

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          Prescription Management
        </h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            placeholder="Search Patient / Rx ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: 13,
              minWidth: 220,
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: 13,
            }}
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          {canEdit && (
            <Btn ch="New Prescription" onClick={() => setShowNew(true)} />
          )}
        </div>
      </div>

      {/* LOADING */}
      {loading && <Card ch="Loading prescriptions..." />}

      {/* LIST */}
      {/* TABLE LIST */}
<div style={{ overflowX: "auto" }}>
  <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 14,
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "#F9FAFB",
      border: "1px solid #E5E7EB",
      padding: "6px 12px",
      borderRadius: 8,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}
  >
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
      }}
    >
      Columns
    </span>

    <select
      value={visibleCols}
      onChange={(e) => setVisibleCols(Number(e.target.value))}
      style={{
        padding: "6px 28px 6px 10px",
        borderRadius: 6,
        border: "1px solid #D1D5DB",
        fontSize: 13,
        background: "#fff",
        color: "#111827",
        cursor: "pointer",
        outline: "none",
      }}
    >
      <option value={4}>4 Columns</option>
      <option value={6}>6 Columns</option>
      <option value={8}>8 Columns</option>
      <option value={9}>All Columns</option>
    </select>
  </div>
</div>  
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 1000,
      
      background: "#fff",
      fontSize: 14,
    }}
  >
   <thead>
  <tr style={{ background: "#06549d", color: "#fff" }}>
    <th
      style={{
        ...thLeft,
        borderTopLeftRadius: 10,
      }}
    >
      Rx ID
    </th>

    <th style={thLeft}>Patient</th>
    <th style={thLeft}>Doctor</th>
    <th style={thCenter}>Start</th>
    <th style={thCenter}>Expiry</th>
    <th style={thRight}>Total</th>
    <th style={thCenter}>Payment</th>
    <th style={thCenter}>Order</th>

    <th
      style={{
        ...thCenter,
        borderTopRightRadius: 10,
      }}
    >
      Actions
    </th>
  </tr>
</thead>

    <tbody>
      {loading && (
        <tr>
          <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
            Loading prescriptions...
          </td>
        </tr>
      )}

      {!loading && filteredRx.length === 0 && (
        <tr>
          <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
            No prescriptions found
          </td>
        </tr>
      )}

      {!loading &&
        paginatedRx.map((r) => {
          const exp = isExp(r.expiry);

          return (
            <tr
              key={r.id}
              style={{ borderBottom: "1px solid #E5E7EB" }}
            >
              <td style={tdLeft}>{r.rxId}</td>
              <td style={tdLeft}>{r.pName}</td>
              <td style={tdLeft}>{r.doctor}</td>
              <td style={tdCenter}>{fDate(r.start)}</td>
              <td style={tdCenter}>{fDate(r.expiry)}</td>
              <td style={tdRight}>{fCur(r.total)}</td>

              <td style={tdCenter}>
                <span style={badge(r.payStatus)}>
                  {r.payStatus}
                </span>
              </td>

              <td style={tdCenter}>{r.ordStatus}</td>

              <td style={tdCenter}>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  <Btn ch="View" sm onClick={() => setViewRx(r)} />

                 {canEdit && r.payStatus?.toLowerCase() !== "paid" && (
 <Btn
  ch={payingId === r.id ? "Processing..." : "Mark Paid"}
  sm
  disabled={payingId === r.id}
  onClick={() => setConfirmId(r.id)}
/>
)}

                  {canEdit && exp && (
                    <Btn ch="Renew" sm onClick={() => renewPrescription(r.id)} />
                  )}
                </div>
              </td>
            </tr>
          );
        })}
    </tbody>
  </table>

  {totalPages > 1 && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 16,
      flexWrap: "wrap",
    }}
  >
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      style={{
        padding: "6px 12px",
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        style={{
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #ddd",
          background: currentPage === i + 1 ? "#06549d" : "#fff",
          color: currentPage === i + 1 ? "#fff" : "#111",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      style={{
        padding: "6px 12px",
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      Next
    </button>
  </div>
)}
</div>

      {/* NEW MODAL */}
      {showNew && (
        <Modal
          title="New Prescription"
          w={850}
          onClose={() => setShowNew(false)}
          ch={<RxForm onSave={save} />}
        />
      )}

      {/* VIEW MODAL */}
      {viewRx && (
        <Modal
          title={`Prescription — ${viewRx.rxId}`}
          sub={`${viewRx.pName} · ${viewRx.doctor}`}
          w={1000}
          onClose={() => setViewRx(null)}
          ch={
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* TABLE */}
              <div style={{ overflowX: "auto" }}>

                {/* <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 13 }}>Columns:</span>

    <select
      value={visibleCols}
      onChange={(e) => setVisibleCols(Number(e.target.value))}
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid #ddd",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      <option value={4}>4</option>
      <option value={6}>6</option>
      <option value={8}>8</option>
      <option value={9}>All</option>
    </select>
  </div>
</div> */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 900,
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#06549d", color: "#fff" }}>
                      <th style={thLeft}>Medicine</th>
                      <th style={thCenter}>Days</th>
                      <th style={thCenter}>M</th>
                      <th style={thCenter}>A</th>
                      <th style={thCenter}>N</th>
                      <th style={thCenter}>Daily</th>
                      <th style={thCenter}>Qty</th>
                      <th style={thRight}>Price</th>
                      <th style={thRight}>Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {viewRx.meds.map((m, i) => {
                      const daily =
                        (m.freq?.m || 0) +
                        (m.freq?.a || 0) +
                        (m.freq?.n || 0);

                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={tdLeft}>{m.mName}</td>
                          <td style={tdCenter}>{m.dur}</td>
                          <td style={tdCenter}>{m.freq?.m || 0}</td>
                          <td style={tdCenter}>{m.freq?.a || 0}</td>
                          <td style={tdCenter}>{m.freq?.n || 0}</td>
                          <td style={tdCenter}>{daily}</td>
                          <td style={tdCenter}>{m.qty}</td>
                          <td style={tdRight}>₹{m.price}</td>
                          <td style={{ ...tdRight, fontWeight: 700 }}>
                            ₹{m.sub}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                <SummaryBox label="Subtotal" value={viewRx.subtotal} />
                <SummaryBox label="GST" value={viewRx.gst} />
                <SummaryBox label="Discount" value={`- ₹${viewRx.discount}`} />
                <SummaryBox label="Total" value={viewRx.total} highlight />
              </div>

              {/* <Btn ch="Close" onClick={() => setViewRx(null)} /> */}
            </div>
          }
        />
      )}


      {confirmId && (
  <Modal
    title="Confirm Payment"
    w={420}
    onClose={() => setConfirmId(null)}
    ch={
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Warning Section */}
        <div
          style={{
            display: "flex",
            gap: 12,
            background: "#FEF3C7",
            padding: 14,
            borderRadius: 8,
            border: "1px solid #FCD34D",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#B45309",
            }}
          >
            ⚠️
          </div>

          <div style={{ fontSize: 14, color: "#92400E" }}>
            <strong>Important:</strong> Once marked as paid,
            this action will update the billing record permanently.
          </div>
        </div>

        {/* Main Message */}
        <div style={{ fontSize: 15, lineHeight: 1.6 }}>
          Are you sure you want to mark this prescription as{" "}
          <strong>Paid</strong>?
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "#E5E7EB",
            margin: "4px 0",
          }}
        />

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={() => setConfirmId(null)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #D1D5DB",
              background: "#F9FAFB",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
           onClick={async () => {
  await markPaid(confirmId);
  setConfirmId(null);

  // refresh the page
  window.location.reload();
}}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "none",
              background: "#2563EB",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(37,99,235,0.3)",
            }}
          >
            Confirm Payment
          </button>
        </div>
      </div>
    }
  />
)}
    </div>
  );
};



// Alignment Styles
const thLeft = { padding: 12, textAlign: "left" };
const thCenter = { padding: 12, textAlign: "center" };
const thRight = { padding: 12, textAlign: "right" };

const tdLeft = { padding: 10, textAlign: "left" };
const tdCenter = { padding: 10, textAlign: "center" };
const tdRight = { padding: 10, textAlign: "right" };

// Summary Box
const SummaryBox = ({ label, value, highlight }) => (
  <div
    style={{
      background: "#F9FAFB",
      padding: 14,
      borderRadius: 8,
      textAlign: "center",
      border: highlight ? "1px solid #2563EB" : "1px solid #E5E7EB",
    }}
  >
    <div style={{ fontSize: 12, color: "#6B7280" }}>{label}</div>
    <div
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: highlight ? "#2563EB" : "#111827",
      }}
    >
      {typeof value === "number"
        ? `₹${value.toLocaleString("en-IN")}`
        : value}
    </div>
  </div>
);

export default RxView;