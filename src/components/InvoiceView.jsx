import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import html2pdf from "html2pdf.js";

const InvoiceView = () => {

  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await API.get(`/orders/${id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error("Failed to load invoice", err);
    }
  };


  const numberToWords = (num) => {
  const a = [
    "", "One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
    "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen",
    "Eighteen","Nineteen"
  ];

  const b = [
    "", "", "Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"
  ];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100)
      return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred " +
        inWords(n % 100)
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        " Thousand " +
        inWords(n % 1000)
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        " Lakh " +
        inWords(n % 100000)
      );
  };

  return inWords(num) + " Rupees Only";
};


const generateInvoice = async () => {
  try {

    await API.patch(`/orders/${invoice._id}/invoice`);

    const res = await API.get(`/orders/${invoice._id}`);

    setInvoice(res.data);

  } catch (err) {
    console.error("Invoice generation failed", err);
  }
};

  const downloadPDF = () => {

    const element = document.getElementById("invoicePDF");

    const opt = {
      margin: 10,
      filename: `Invoice-${invoice.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!invoice) return <div style={{padding:40}}>Loading invoice...</div>;

  const meds = invoice.prescription?.meds || [];

  return (

    <div style={{ padding: 10 }}>

      <div
        id="invoicePDF"
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
          maxWidth: 1000,
          margin: "auto"
        }}
      >

        {/* HEADER */}

        <div style={{
          display:"flex",
          justifyContent:"space-between",
          borderBottom:"2px solid #E5E7EB",
          paddingBottom:20
        }}>

          <div>
            <h1 style={{margin:0,color:"#06549d"}}>
              RG Medlink Pharmacy
            </h1>

            <div style={{fontSize:13,color:"#6B7280",marginTop:6}}>
              Medicines Made Easy & Accessible <br/>
              Vijayanagar, Mysore <br/>
              Phone: +91 9911344536
            </div>
          </div>

          <div style={{textAlign:"left",fontSize:14}}>

            <div><b>Invoice No:</b> {invoice.invoiceNumber}</div>

            <div>
              <b>Invoice Date:</b>{" "}
              {invoice.invoiceDate
                ? new Date(invoice.invoiceDate).toLocaleDateString()
                : "-"}
            </div>

            <div><b>Order ID:</b> {invoice.orderId}</div>

            <div><b>Payment Status:</b> {invoice.paymentStatus}</div>

            <div><b>Order Status:</b> {invoice.orderStatus}</div>

          </div>

        </div>


        {/* CUSTOMER + DELIVERY */}

        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:40,
          marginTop:30
        }}>

          <div>
            <h3 style={sectionTitle}>Bill To</h3>

            <div style={textRow}><b>Name:</b> {invoice.patient?.name}</div>

            <div style={textRow}><b>Mobile:</b> {invoice.patient?.phone}</div>

            <div style={textRow}><b>Email:</b> {invoice.patient?.email || "-"}</div>

            <div style={textRow}>
              <b>Address:</b> {invoice.patient?.address || "Not Provided"}
            </div>
          </div>


          <div>

            <h3 style={sectionTitle}>Delivery Info</h3>

            <div style={textRow}>
              <b>Courier Partner:</b> {invoice.courierPartner || "-"}
            </div>

            <div style={textRow}>
              <b>Tracking Number:</b> {invoice.trackingNumber || "-"}
            </div>

            <div style={textRow}>
              <b>Order Date:</b>{" "}
              {invoice.createdAt
                ? new Date(invoice.createdAt).toLocaleDateString()
                : "-"}
            </div>

          </div>

        </div>


        {/* MEDICINE TABLE */}

        <table style={tableStyle}>

          <thead style={thead}>

            <tr>
              <th style={th}>Medicine</th>
              <th style={th}>Duration</th>
              <th style={th}>Dosage</th>
              <th style={th}>Qty</th>
              <th style={th}>Price</th>
              <th style={th}>Subtotal</th>
            </tr>

          </thead>

          <tbody>

            {meds.map((m)=>{

              const dosage = `${m.freq?.m || 0}-${m.freq?.a || 0}-${m.freq?.n || 0}`;

              return(

                <tr key={m._id}>

                  <td style={td}>{m.medicine?.name}</td>

                  <td style={td}>{m.duration} days</td>

                  <td style={td}>{dosage}</td>

                  <td style={td}>{m.qty}</td>

                  <td style={td}>₹{m.price}</td>

                  <td style={td}>
                    ₹{m.subtotal?.toLocaleString("en-IN")}
                  </td>

                </tr>

              )

            })}

          </tbody>

        </table>


        {/* BILLING SUMMARY */}

       <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 30,
    marginTop: 20,
    alignItems: "start"
  }}
>

  {/* LEFT SIDE - AMOUNT IN WORDS */}

  <div>

    <div style={{ fontWeight: 600, marginBottom: 6 }}>
      Rs. in Words:
    </div>

    <div style={{ fontSize: 14 }}>
      {numberToWords(invoice.totalAmount)}
    </div>

    <div style={{ marginTop: 15 }}>
  <div><b>Payment Method:</b> {invoice.paymentMethod || "UPI"}</div>

  <div><b>Transaction ID:</b> {invoice.paymentReference || "-"}</div>

  <div>
    <b>Payment Time:</b>{" "}
    {invoice.paymentTime
      ? new Date(invoice.paymentTime).toLocaleString()
      : "-"}
  </div>
</div>

<div style={{ marginTop: 15 }}>
  <div><b>GSTIN:</b> 29ABCDE1234F1Z5</div>
  <div><b>HSN Code:</b> 3004</div>
  <div><b>Place of Supply:</b> Karnataka</div>
</div>

  </div>


  {/* RIGHT SIDE - BILLING SUMMARY */}

  <div style={summaryBox}>

    <Row
      label="Subtotal"
      value={invoice.prescription?.subtotal}
    />

    <Row
      label="GST"
      value={invoice.prescription?.gst}
    />

    <Row
      label="Discount"
      value={invoice.prescription?.discount || 0}
    />

    <div style={totalRow}>
      <span>Total Amount</span>
      <span>
        ₹{invoice.totalAmount?.toLocaleString("en-IN")}
      </span>
    </div>

  </div>

</div>

        


        {/* FOOTER */}

        <div style={{
          marginTop:40,
          borderTop:"1px solid #E5E7EB",
          paddingTop:15,
          textAlign:"center",
          fontSize:13,
          color:"#6B7280"
        }}>
          Thank you for choosing RG Medlink Pharmacy.  
          For any support contact us at support@rgmedlink.com
        </div>

      </div>


      {/* ACTION BUTTONS */}

     <div
  style={{
    marginTop: 25,
    display: "flex",
    gap: 12,
    justifyContent: "center"
  }}
>

{invoice.invoiceStatus === "Pending" ? (

  <button
    onClick={generateInvoice}
    style={{
      background: "#2563EB",
      color: "#fff",
      border: "none",
      padding: "10px 22px",
      borderRadius: 6,
      cursor: "pointer",
      fontWeight: 600
    }}
  >
    Generate Invoice
  </button>

) : (

  <>
    <button onClick={downloadPDF} style={btnBlue}>
      Download PDF
    </button>

    <button onClick={() => window.print()} style={btnGreen}>
      Print Invoice
    </button>
  </>

)}

</div>

    </div>
  );
};



const Row = ({label,value}) => (

  <div style={{
    display:"flex",
    justifyContent:"space-between",
    padding:"6px 0"
  }}>
    <span>{label}</span>
    <span>₹{value}</span>
  </div>

);



const sectionTitle = {
  marginBottom:10,
  fontSize:16,
  color:"#111827"
};

const textRow = {
  fontSize:14,
  marginBottom:6
};

const tableStyle = {
  width:"100%",
  borderCollapse:"collapse",
  marginTop:30
};

const thead = {
  background:"#06549d",
  color:"#fff"
};

const th = {
  padding:12,
  textAlign:"left"
};

const td = {
  padding:12,
  borderBottom:"1px solid #E5E7EB"
};

const summaryBox = {
  width:280,
  border:"1px solid #E5E7EB",
  borderRadius:8,
  padding:18,
  background:"#FAFAFA"
};

const totalRow = {
  borderTop:"2px solid #000",
  marginTop:10,
  paddingTop:10,
  display:"flex",
  justifyContent:"space-between",
  fontWeight:700
};

const btnBlue = {
  background:"#2563EB",
  color:"#fff",
  border:"none",
  padding:"10px 20px",
  borderRadius:6,
  cursor:"pointer"
};

const btnGreen = {
  background:"#16A34A",
  color:"#fff",
  border:"none",
  padding:"10px 20px",
  borderRadius:6,
  cursor:"pointer"
};

export default InvoiceView;