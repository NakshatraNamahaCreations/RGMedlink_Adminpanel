import { useState, useEffect } from "react";
import API from "../api";
import { Card, Btn, Inp, Field, Modal } from "./Styles";

const PatientsView = () => {

  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editPatient, setEditPatient] = useState(null);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

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
              pincode: "",
              condition: "",
            })
          }
        />
      </div>

      {/* TABLE */}

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

                  {patients.map((p, i) => {

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
                            ? `${p.address}, ${p.city || ""} ${p.pincode || ""}`
                            : "-"}
                        </td>

                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          ₹{stats.totalPaid.toLocaleString("en-IN")}
                        </td>

                        <td style={{ ...tdStyle, textAlign: "right" }}>
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
                      <td colSpan="8" style={emptyStyle}>
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