import { useState, useEffect, useMemo } from "react";
import API from "../api";
import { Card, Btn } from "./Styles";
import { useNavigate } from "react-router-dom";

const BillingInvoiceView = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
const [selectedInvoice, setSelectedInvoice] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 6;

const navigate = useNavigate();

const totalPages = Math.ceil(orders.length / rowsPerPage);

const paginatedOrders = useMemo(() => {
  const start = (currentPage - 1) * rowsPerPage;
  return orders.slice(start, start + rowsPerPage);
}, [orders, currentPage]);


  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/billing");
      setOrders(res.data);
    } catch (err) {
      console.error("Billing fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (id) => {
    try {
      await API.patch(`/orders/${id}/invoice`);
      fetchBilling();
    } catch (err) {
      console.error("Invoice generation failed", err);
    }
  };



  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* HEADER */}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          Billing & Invoicing
        </h2>
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
                      "Order ID",
                      "Invoice Number",
                      "Invoice Date",
                      "Customer Name",
                      "Bill Amount",
                      "Invoice Status",
                      "Payment Status",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: 14,
                          textAlign: "left",
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginatedOrders.map((o, i) => (
                    <tr
                      key={o.id}
                      style={{
                        background: i % 2 === 0 ? "#fff" : "#F8FAFC",
                      }}
                    >
                      <td style={td}>{o.orderId}</td>

                      <td style={td}>{o.invoiceNumber}</td>

                      <td style={td}>
                        {o.invoiceDate === "-"
                          ? "-"
                          : new Date(o.invoiceDate).toLocaleDateString()}
                      </td>

                      <td style={td}>{o.customerName}</td>

                      <td style={{ ...td, textAlign: "right" }}>
                        ₹{o.billAmount.toLocaleString("en-IN")}
                      </td>

                      <td style={td}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            background:
                              o.invoiceStatus === "Generated"
                                ? "#DCFCE7"
                                : "#FEF3C7",
                            color:
                              o.invoiceStatus === "Generated"
                                ? "#15803D"
                                : "#92400E",
                          }}
                        >
                          {o.invoiceStatus}
                        </span>
                      </td>

                      <td style={td}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            background: "#DCFCE7",
                            color: "#15803D",
                          }}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>

                     <td style={td}>
  <div style={{ display: "flex", gap: 8 }}>

    {o.invoiceStatus === "Pending" && (
      <Btn
        ch="Generate"
        sm
        onClick={() => generateInvoice(o.id)}
      />
    )}

    <Btn
      ch="View"
      v="ghost"
      sm
      onClick={() => navigate(`/invoice/${o.id}`)}
    />

  </div>
</td>
                    </tr>
                  ))}

                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="8" style={empty}>
                        No billing records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        }
      />
      {totalPages > 1 && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: 8,
      marginTop: 16
    }}
  >
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      style={pageBtn}
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        style={{
          ...pageBtn,
          background: currentPage === i + 1 ? "#06549d" : "#fff",
          color: currentPage === i + 1 ? "#fff" : "#111"
        }}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      style={pageBtn}
    >
      Next
    </button>
  </div>
)}

      {/* INVOICE MODAL */}

      {selectedInvoice && (

        <div style={modalOverlay}>

  <div style={modalBox}>
        <div
  style={{
    background: "#fff",
    borderRadius: 16,
    padding: 30,
    boxShadow: "0 30px 70px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: 28
  }}
>

{/* HEADER */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: 14
  }}
>

  {/* LEFT SIDE */}

  <div>

    <h2 style={{ margin: 0 }}>Invoice Details</h2>

    <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
      Pharmacy Billing Summary
    </div>

  </div>


  {/* RIGHT SIDE */}

  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>

    {selectedInvoice?.invoiceStatus === "Pending" && (
      <button
        onClick={async () => {
          try {

            await API.patch(`/orders/${selectedInvoice._id}/invoice`);

            const res = await API.get(`/orders/${selectedInvoice._id}`);

            setSelectedInvoice(res.data);

            fetchBilling();

          } catch (err) {
            console.error("Invoice generation failed", err);
          }
        }}
        style={{
          background: "#2563EB",
          color: "#fff",
          border: "none",
          padding: "7px 14px",
          marginRight:"20px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 3px 8px rgba(0,0,0,0.1)"
        }}
      >
        Generate Invoice
      </button>
    )}

    <button
      onClick={() => setSelectedInvoice(null)}
      style={{
        background: "#F1F5F9",
        border: "none",
        width: 34,
        height: 34,
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: 16
      }}
    >
      ✕
    </button>

  </div>

</div>


{/* CUSTOMER INFO */}

<div
  style={{
    background: "#F8FAFC",
    borderRadius: 12,
    padding: 18,
    border: "1px solid #E5E7EB",
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 18
  }}
>

<Info label="Customer Name" value={selectedInvoice.patient?.name} />

<Info label="Phone" value={selectedInvoice.patient?.phone} />

<Info label="Email" value={selectedInvoice.patient?.email} />

<Info label="Invoice Number" value={selectedInvoice.invoiceNumber} />

<Info
  label="Invoice Date"
  value={new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
/>

</div>


{/* MEDICINE SECTION */}

<div
  style={{
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    overflow: "hidden"
  }}
>

<div
  style={{
    background: "#06549d",
    color: "#fff",
    padding: "12px 18px",
    fontWeight: 600
  }}
>
  Medicines
</div>

<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14
  }}
>
<thead style={{ background: "#F1F5F9" }}>
<tr>
<th style={th}>Medicine</th>
<th style={th}>Days</th>
<th style={th}>M</th>
<th style={th}>A</th>
<th style={th}>N</th>
<th style={th}>Daily</th>
<th style={th}>Qty</th>
<th style={th}>Price</th>
<th style={th}>Subtotal</th>
</tr>
</thead>

<tbody>

{selectedInvoice.prescription?.meds?.map((m)=>{

const daily =
(m.freq?.m||0)+(m.freq?.a||0)+(m.freq?.n||0)

return(

<tr key={m._id} style={{borderBottom:"1px solid #E5E7EB"}}>

<td style={td}>{m.medicine?.name}</td>
<td style={td}>{m.duration}</td>
<td style={td}>{m.freq?.m}</td>
<td style={td}>{m.freq?.a}</td>
<td style={td}>{m.freq?.n}</td>
<td style={td}>{daily}</td>
<td style={td}>{m.qty}</td>
<td style={td}>₹{m.price}</td>
<td style={{...td,fontWeight:700}}>₹{m.subtotal}</td>

</tr>

)

})}

</tbody>
</table>

</div>


{/* BILLING SUMMARY */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 14
  }}
>

<Summary label="Subtotal" value={selectedInvoice.prescription?.subtotal} />

<Summary label="GST" value={selectedInvoice.prescription?.gst} />

<Summary label="Discount" value={selectedInvoice.prescription?.discount} />

<Summary
  label="Total Amount"
  value={selectedInvoice.totalAmount}
  highlight
/>

</div>

</div>

</div>

</div>

      )}
    </div>
  );
};


/* COMPONENTS */

const Info = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 12, color: "#64748B" }}>{label}</div>
    <div style={{ fontWeight: 600 }}>{value || "-"}</div>
  </div>
);

const Summary = ({label,value,highlight}) => (
<div
style={{
background: highlight ? "#EFF6FF" : "#F9FAFB",
border: highlight ? "1px solid #3B82F6" : "1px solid #E5E7EB",
padding:16,
borderRadius:12,
textAlign:"center"
}}
>

<div style={{fontSize:12,color:"#6B7280"}}>
{label}
</div>

<div
style={{
fontSize:20,
fontWeight:700,
marginTop:6,
color:highlight ? "#1D4ED8" : "#111827"
}}
>
₹{value}
</div>

</div>
);


/* STYLES */

const pageBtn = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600
};

const td = {
  padding: 14,
  borderBottom: "1px solid #E2E8F0",
};

const empty = {
  padding: 30,
  textAlign: "center",
  color: "#64748B",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalBox = {
//   background: "#fff",
  padding: 30,
  borderRadius: 14,
  width: 980,
  maxHeight: "92vh",
  overflowY: "auto",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const closeBtn = {
  background: "#F1F5F9",
  border: "none",
  borderRadius: "50%",
  width: 32,
  height: 32,
  cursor: "pointer",
};

const customerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 20,
};

const medicineTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
};

const billingGrid = {
  marginTop: 20,
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 12,
};

const thead = { background: "#06549d", color: "#fff" };
const th = { padding: 12, textAlign: "left" };

export default BillingInvoiceView;