import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import API from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";


const ReportsView = () => {

  const [tab, setTab] = useState("sales");

  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
const [ordersTable, setOrdersTable] = useState([]);
const [inventoryData, setInventoryData] = useState([]);
  const [summary, setSummary] = useState({});

const downloadSalesExcel = () => {
  const worksheetData = salesData.map((r) => ({
    Date: r.date,
    Orders: r.orders,
    Sales: r.sales,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const fileData = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(fileData, "Sales_Report.xlsx");
};


  const downloadSalesPDF = () => {
  const doc = new jsPDF();

  doc.text("Sales Report", 14, 10);

  autoTable(doc, {
    startY: 20,
    head: [["Date", "Orders", "Sales"]],
    body: salesData.map((r) => [
      r.date,
      r.orders,
      `₹${r.sales}`
    ])
  });

  doc.save("Sales_Report.pdf");
};



const downloadOrdersExcel = () => {
  const worksheetData = ordersTable.map((r) => ({
    OrderID: r.orderId,
    Customer: r.customer,
    Date: r.date,
    Amount: r.amount,
    Status: r.orderStatus || "Created",
  }));

  const ws = XLSX.utils.json_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Orders");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  saveAs(
    new Blob([buffer]),
    "Orders_Report.xlsx"
  );
};



const downloadInventoryExcel = () => {
  const worksheetData = inventoryData.map((r) => ({
    Medicine: r.name,
    Category: r.category,
    Stock: r.stock,
    MinStock: r.minStock,
    Status: r.stock <= r.minStock ? "Low Stock" : "In Stock",
  }));

  const ws = XLSX.utils.json_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Inventory");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  saveAs(new Blob([buffer]), "Inventory_Report.xlsx");
};


const downloadRevenueExcel = () => {
  const worksheetData = revenueData.map((r) => ({
    Date: r.date,
    Orders: r.orders,
    Revenue: r.revenue,
  }));

  const ws = XLSX.utils.json_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Revenue");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  saveAs(new Blob([buffer]), "Revenue_Report.xlsx");
};



const downloadInventoryPDF = () => {
  const doc = new jsPDF();

  doc.text("Inventory Report", 14, 10);

  autoTable(doc, {
    startY: 20,
    head: [["Medicine", "Category", "Stock", "Min Stock", "Status"]],
    body: inventoryData.map((r) => [
      r.name,
      r.category,
      r.stock,
      r.minStock,
      r.stock <= r.minStock ? "Low Stock" : "In Stock"
    ])
  });

  doc.save("Inventory_Report.pdf");
};


const downloadOrdersPDF = () => {
  const doc = new jsPDF();

  doc.text("Orders Report", 14, 10);

  autoTable(doc, {
    startY: 20,
    head: [["Order ID", "Customer", "Date", "Amount", "Status"]],
    body: ordersTable.map((r) => [
      r.orderId,
      r.customer,
      r.date,
      `₹${r.amount}`,
      r.orderStatus || "Created"
    ])
  });

  doc.save("Orders_Report.pdf");
};


const downloadRevenuePDF = () => {
  const doc = new jsPDF();

  doc.text("Revenue Report", 14, 10);

  autoTable(doc, {
    startY: 20,
    head: [["Date", "Orders", "Revenue"]],
    body: revenueData.map((r) => [
      r.date,
      r.orders,
      `₹${r.revenue}`
    ])
  });

  doc.save("Revenue_Report.pdf");
};


  useEffect(() => {
    fetchReports();
  }, []);

const fetchReports = async () => {
  try {

    const salesRes = await API.get("/reports/sales");
    const ordersRes = await API.get("/reports/orders");
    const revenueRes = await API.get("/reports/revenue");
    const inventoryRes = await API.get("/reports/inventory");

    /* ======================
       SALES TREND
    ====================== */

    const salesTrend = (salesRes.data.trend || []).map((r) => ({
      date: r._id,
      sales: r.sales,
      orders: r.orders
    }));


    /* ======================
       ORDERS TREND
    ====================== */

    const ordersTrend = (ordersRes.data.trend || []).map((r) => ({
      date: r._id,
      orders: r.orders,
      amount: r.amount
    }));


    /* ======================
       REVENUE TREND
    ====================== */

    const revenueTrend = (revenueRes.data.trend || []).map((r) => ({
      date: r._id,
      revenue: r.revenue,
      orders: r.orders
    }));


    /* ======================
       SET STATE
    ====================== */

    setSalesData(salesTrend);
    setOrdersData(ordersTrend);
    setRevenueData(revenueTrend);

    /* SUMMARY CARDS */

    setSummary({
      sales: salesRes.data.summary || {},
      orders: ordersRes.data.summary || {},
      revenue: revenueRes.data.summary || {},
      inventory: inventoryRes.data.summary || {}
    });

    /* ORDERS TABLE */

    setOrdersTable(ordersRes.data.table || []);

    /* INVENTORY TABLE */

    setInventoryData(inventoryRes.data.items || []);

  } catch (err) {
    console.error("Failed to load reports", err);
  }
};

  return (
    <div style={container}>

      {/* HEADER */}

      <div style={header}>
        <h2>Reports Dashboard</h2>
      </div>


      {/* TABS */}

      <div style={tabs}>

        <Tab label="Sales" active={tab === "sales"} onClick={() => setTab("sales")} />
        <Tab label="Inventory" active={tab === "inventory"} onClick={() => setTab("inventory")} />
        <Tab label="Orders" active={tab === "orders"} onClick={() => setTab("orders")} />
        <Tab label="Revenue" active={tab === "revenue"} onClick={() => setTab("revenue")} />

      </div>


      {/* SALES */}

      {tab === "sales" && (
        <>
          <SummaryCards
            data={[
              { label: "Total Sales", value: summary.sales?.totalSales || 0 },
              { label: "Orders Sold", value: summary.sales?.orders || 0 },
              { label: "Avg Order Value", value: summary.sales?.avgOrder || 0 }
            ]}
          />

<div style={{ display: "flex", gap: 10 }}>
  <button onClick={downloadSalesPDF} style={pdfBtn}>
    Download Sales PDF
  </button>

  <button onClick={downloadSalesExcel} style={pdfBtn}>
    Download Sales Excel
  </button>
</div>
          <Chart title="Sales Trend" data={salesData} dataKey="sales" />


          <Table
            columns={["Date", "Orders", "Sales"]}
            data={salesData}
            map={(r) => [
              r.date,
              r.orders,
              `₹${r.sales}`
            ]}
          />
        </>
      )}


      {/* INVENTORY */}

      {tab === "inventory" && (
        <>
          <SummaryCards
            data={[
              { label: "Total Medicines", value: summary.inventory?.total || 0 },
              { label: "Low Stock", value: summary.inventory?.lowStock || 0 }
            ]}
          />



<div style={{ display: "flex", gap: 10 }}>
 <button onClick={downloadInventoryPDF} style={pdfBtn}>
  Download Inventory PDF
</button>

  <button onClick={downloadInventoryExcel} style={pdfBtn}>
    Download Inventory Excel
  </button>
</div>
         <InventoryChart data={inventoryData} />

            
          <Table
            columns={[
              "Medicine",
              "Category",
              "Stock",
              "Min Stock",
              "Status"
            ]}
            data={inventoryData}
            map={(r) => [
              r.name,
              r.category,
              r.stock,
              r.minStock,
              r.stock <= r.minStock ? "Low Stock" : "In Stock"
            ]}
          />
        </>
      )}


      {/* ORDERS */}

      {tab === "orders" && (
        <>
          <SummaryCards
            data={[
              { label: "Total Orders", value: summary.orders?.total || 0 },
              { label: "Completed", value: summary.orders?.completed || 0 },
              { label: "Pending", value: summary.orders?.pending || 0 },
              { label: "Cancelled", value: summary.orders?.cancelled || 0 }
            ]}
          />

   


<div style={{ display: "flex", gap: 10 }}>
      <button onClick={downloadOrdersPDF} style={pdfBtn}>
  Download Orders PDF
</button>

  <button onClick={downloadOrdersExcel} style={pdfBtn}>
    Download Orders Excel
  </button>
</div>


         <Chart title="Orders Trend" data={ordersData} dataKey="orders" />

           
          <Table
            columns={[
              "Order ID",
              "Customer",
              "Date",
              "Amount",
              "Status"
            ]}
            data={ordersTable}
            map={(r) => [
              r.orderId,
              r.customer,
              r.date,
              `₹${r.amount}`,
              r.orderStatus || "Created"
            ]}
          />
        </>
      )}


      {/* REVENUE */}

      {tab === "revenue" && (
        <>
          <SummaryCards
            data={[
              { label: "Total Revenue", value: summary.revenue?.total || 0 },
              { label: "Paid Orders", value: summary.revenue?.paid || 0 },
              { label: "Avg Order", value: summary.revenue?.avg || 0 }
            ]}
          />

   

<div style={{ display: "flex", gap: 10 }}>
         <button onClick={downloadRevenuePDF} style={pdfBtn}>
  Download Revenue PDF
</button>


  <button onClick={downloadRevenueExcel} style={pdfBtn}>
    Download Revenue Excel
  </button>
</div>

          <Chart title="Revenue Trend" data={revenueData} dataKey="revenue" />

          

          <Table
            columns={[
              "Date",
              "Paid Orders",
              "Revenue"
            ]}
            data={revenueData}
            map={(r) => [
              r.date,
              r.orders,
              `₹${r.revenue}`
            ]}
          />
        </>
      )}

    </div>
  );
};


const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 18px",
      border: "none",
      borderBottom: active ? "3px solid #2563EB" : "3px solid transparent",
      background: "transparent",
      fontWeight: 600,
      cursor: "pointer"
    }}
  >
    {label}
  </button>
);


const SummaryCards = ({ data }) => (
  <div style={cards}>
    {data.map((c, i) => (
      <div key={i} style={card}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          {typeof c.value === "number" ? `₹${c.value}` : c.value}
        </div>
        <div style={{ color: "#6B7280" }}>{c.label}</div>
      </div>
    ))}
  </div>
);


const InventoryChart = ({ data }) => (
  <div style={chartCard}>
    <h3 style={{ marginBottom: 20 }}>Inventory Stock Overview</h3>

    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={data}
        barGap={8}
        barCategoryGap={25}
      >

        {/* Gradient colors */}

        <defs>
          <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.95}/>
            <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.7}/>
          </linearGradient>

          <linearGradient id="minStockGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.95}/>
            <stop offset="100%" stopColor="#F87171" stopOpacity={0.7}/>
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          interval={0}
        />

        <YAxis allowDecimals={false} />

        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
          }}
        />

        <Bar
          dataKey="stock"
          name="Current Stock"
          fill="url(#stockGradient)"
          radius={[8, 8, 0, 0]}
        />

        <Bar
          dataKey="minStock"
          name="Minimum Required"
          fill="url(#minStockGradient)"
          radius={[8, 8, 0, 0]}
        />

      </BarChart>
    </ResponsiveContainer>
  </div>
);


const Chart = ({ title, data, dataKey }) => (
  <div style={chartCard}>
    <h3>{title}</h3>

    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>

        <defs>
          <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>

        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
        />

        <YAxis tick={{ fontSize: 12 }}/>

        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            border: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)"
          }}
        />

        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#2563EB"
          strokeWidth={3}
          fill="url(#colorTrend)"
          dot={{ r: 4 }}
          activeDot={{ r: 7 }}
        />

      </AreaChart>
    </ResponsiveContainer>
  </div>
);


const Table = ({ columns, data, map }) => (
  <div style={tableBox}>
    <table style={table}>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} style={th}>{c}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            {map(r).map((v, j) => (
              <td key={j} style={td}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


const container = {
  padding: 30,
  display: "flex",
  flexDirection: "column",
  gap: 20
};

const header = {
  display: "flex",
  justifyContent: "space-between"
};

const tabs = {
  display: "flex",
  gap: 20,
  borderBottom: "1px solid #E5E7EB"
};

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: 16
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)"
};

const chartCard = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)"
};

const tableBox = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  padding: 12,
  borderBottom: "1px solid #E5E7EB",
  textAlign: "left"
};

const td = {
  padding: 12,
  borderBottom: "1px solid #F3F4F6"
};

const pdfBtn = {
  background: "#2563EB",
  color: "#fff",
  padding: "8px 14px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  width:"17%",
  marginBottom: "10px"
};

export default ReportsView;