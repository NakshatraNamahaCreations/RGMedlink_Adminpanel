import { useState, useEffect } from "react";
import API from "../api";
import { Card, Btn, Inp, Field, Modal } from "./Styles";

const PatientsView = () => {

  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 5;
const [visibleCols, setVisibleCols] = useState(8);

  useEffect(() => {
    fetchPatients();
    fetchPrescriptions();
  }, []);

  /* FETCH PATIENTS */

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await API.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await API.get("/prescriptions");
      setPrescriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch prescriptions", err);
    }
  };

  const totalPages = Math.ceil(patients.length / rowsPerPage);

const paginatedPatients = patients.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

  /* PATIENT STATS */

  const patientStats = (patientId) => {
    const patientPrescriptions = prescriptions.filter(
      (p) => p.patient?._id === patientId
    );

    const totalPaid = patientPrescriptions
      .filter((p) => p.payStatus === "Paid")
      .reduce((sum, p) => sum + (p.total || 0), 0);

    const totalProducts = patientPrescriptions.reduce((sum, p) => {
      return (
        sum +
        (p.meds?.reduce((mSum, m) => mSum + (m.qty || 0), 0) || 0)
      );
    }, 0);

    return { totalPaid, totalProducts };
  };

  useEffect(() => {
  setCurrentPage(1);
}, [patients]);
  /* DELETE PATIENT */

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient?")) return;

    try {
      await API.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* SAVE PATIENT */

  const savePatient = async () => {
    try {
      if (editPatient._id) {
        await API.put(`/patients/${editPatient._id}`, editPatient);
      } else {
        await API.post("/patients", editPatient);
      }

      setEditPatient(null);
      fetchPatients();

    } catch (err) {
      console.error("Save failed", err);
    }
  };

  useEffect(() => {
  const table = document.querySelector("table");
  if (!table) return;

  const rows = table.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.children;

    for (let i = 0; i < cells.length; i++) {
      cells[i].style.display = i < visibleCols ? "" : "none";
    }
  });
}, [visibleCols, paginatedPatients]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* HEADER */}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          Patient Management
        </h2>

        <Btn
          ch="+ Add Patient"
          onClick={() =>
            setEditPatient({
              name: "",
              age: "",
              phone: "",
              email: "",
              address: "",
              city: "",
               state: "",
              pincode: "",
              condition: "",
            })
          }
        />
      </div>

      {/* TABLE */}




<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
   
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
      <Card
        ch={
          loading ? (
            <div style={{ padding: 20 }}>Loading...</div>
          ) : (

            
            <div style={{ overflowX: "auto" }}>
              


              
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#fff",
                }}
              >
                <thead>
                  <tr style={{ background: "#06549d", color: "#fff" }}>
                    {[
                      "Name",
                      "Age",
                      "Phone",
                      "Email",
                      "Address",
                      "Condition",
                      "Total Payments",
                      "Products",
                      "Actions",
                    ].map((h, i) => (
                      <th key={i} style={thStyle}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>

                  {paginatedPatients.map((p,i) => {

                    const stats = patientStats(p._id);

                    return (
                      <tr
                        key={p._id}
                        style={{
                          background: i % 2 === 0 ? "#fff" : "#F8FAFC",
                        }}
                      >

                        <td style={tdStyle}>{p.name}</td>
                        <td style={tdStyle}>{p.age}</td>
                        <td style={tdStyle}>{p.phone}</td>
                        <td style={tdStyle}>{p.email || "-"}</td>

                        <td style={tdStyle}>
                          {p.address
                            ? `${p.address}, ${p.city || ""} ${p.state || ""} ${p.pincode || ""}`
                            : "-"}
                        </td>
                        <td style={tdStyle}>
  {p.condition || "-"}
</td>

                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          ₹{stats.totalPaid.toLocaleString("en-IN")}
                        </td>

                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {stats.totalProducts}
                        </td>

                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Btn
                              ch="Edit"
                              v="ghost"
                              sm
                              onClick={() => setEditPatient(p)}
                            />

                            <Btn
                              ch="Delete"
                              v="danger"
                              sm
                              onClick={() => deletePatient(p._id)}
                            />
                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {patients.length === 0 && (
                    <tr>
                      <td colSpan="9" style={emptyStyle}>
                        No patients found
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          )
        }
      />

      {/* PROFESSIONAL ADD / EDIT FORM */}

      {editPatient && (
        <Modal
          title={editPatient._id ? "Edit Patient" : "Add Patient"}
          w={650}
          onClose={() => setEditPatient(null)}
          ch={

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <div style={{ fontWeight: 600, color: "#64748B" }}>
                Patient Information
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >

                <Field
                  label="Full Name"
                  ch={
                    <Inp
                      placeholder="Enter patient name"
                      value={editPatient.name}
                      onChange={(e) =>
                        setEditPatient({ ...editPatient, name: e.target.value })
                      }
                    />
                  }
                />

                <Field
                  label="Age"
                  ch={
                    <Inp
                      type="number"
                      placeholder="Age"
                      value={editPatient.age}
                      onChange={(e) =>
                        setEditPatient({ ...editPatient, age: e.target.value })
                      }
                    />
                  }
                />

                <Field
                  label="Phone Number"
                  ch={
                    <Inp
                      placeholder="10 digit phone"
                      value={editPatient.phone}
                      onChange={(e) =>
                        setEditPatient({ ...editPatient, phone: e.target.value })
                      }
                    />
                  }
                />

                <Field
                  label="Email"
                  ch={
                    <Inp
                      placeholder="example@email.com"
                      value={editPatient.email || ""}
                      onChange={(e) =>
                        setEditPatient({ ...editPatient, email: e.target.value })
                      }
                    />
                  }
                />

              </div>

              <div style={{ fontWeight: 600, color: "#64748B" }}>
                Address Details
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >

                <Field
                  label="Address"
                  ch={
                    <Inp
                      placeholder="Street address"
                      value={editPatient.address || ""}
                      onChange={(e) =>
                        setEditPatient({ ...editPatient, address: e.target.value })
                      }
                    />
                  }
                />

                <Field
                  label="City"
                  ch={
                    <Inp
                      placeholder="City"
                      value={editPatient.city || ""}
                      onChange={(e) =>
                        setEditPatient({ ...editPatient, city: e.target.value })
                      }
                    />
                  }
                />
                <Field
  label="State"
  ch={
    <Inp
      placeholder="State"
      value={editPatient.state || ""}
      onChange={(e) =>
        setEditPatient({ ...editPatient, state: e.target.value })
      }
    />
  }
/>

                <Field
                  label="Pincode"
                  ch={
                    <Inp
                      placeholder="Postal code"
                      value={editPatient.pincode || ""}
                      onChange={(e) =>
                        setEditPatient({ ...editPatient, pincode: e.target.value })
                      }
                    />
                  }
                />

                <Field
                  label="Medical Condition"
                  ch={
                    <Inp
                      placeholder="Optional"
                      value={editPatient.condition || ""}
                      onChange={(e) =>
                        setEditPatient({ ...editPatient, condition: e.target.value })
                      }
                    />
                  }
                />

              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <Btn ch="Cancel" v="ghost" onClick={() => setEditPatient(null)} />
                <Btn ch="Save Patient" onClick={savePatient} />
              </div>

            </div>

          }
        />
      )}


{totalPages > 1 && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 5,
      flexWrap: "wrap",
    }}
  >
    {/* PREV BUTTON */}
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      style={{
        padding: "6px 14px",
        borderRadius: 6,
        border: "1px solid #D1D5DB",
        background: currentPage === 1 ? "#F3F4F6" : "#fff",
        color: "#374151",
        cursor: currentPage === 1 ? "not-allowed" : "pointer",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      Prev
    </button>

    {/* PAGE NUMBERS */}
    {[...Array(totalPages)].map((_, i) => {
      const page = i + 1;

      return (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          style={{
            minWidth: 34,
            height: 34,
            borderRadius: 6,
            border: "1px solid #D1D5DB",
            background: currentPage === page ? "#06549d" : "#fff",
            color: currentPage === page ? "#fff" : "#111827",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            transition: "all .15s ease",
          }}
        >
          {page}
        </button>
      );
    })}

    {/* NEXT BUTTON */}
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      style={{
        padding: "6px 14px",
        borderRadius: 6,
        border: "1px solid #D1D5DB",
        background: currentPage === totalPages ? "#F3F4F6" : "#fff",
        color: "#374151",
        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      Next
    </button>
  </div>
)}

    </div>
  );
};

/* TABLE STYLES */

const thStyle = {
  padding: 14,
  textAlign: "left",
  fontWeight: 600,
};

const tdStyle = {
  padding: 14,
  borderBottom: "1px solid #E2E8F0",
};

const emptyStyle = {
  padding: 30,
  textAlign: "center",
  color: "#64748B",
};

export default PatientsView;