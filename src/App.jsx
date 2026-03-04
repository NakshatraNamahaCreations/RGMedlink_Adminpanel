import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import API from "./api";
import { useEffect } from "react";

import { G, C, PATHS, Ic, Toast } from "./components/Styles";
import { ROLES_CFG, MEDS } from "./data/MasterData";
import { fDate } from "./data/MasterData";

import Dashboard from "./components/Dashboard";
import RxView from "./components/Prescriptions";
import PatientsView from "./components/PatientsView";
import InvView from "./components/Inventory";
import OrdersView from "./components/OrdersView";

/* SIDEBAR */

const Sidebar = ({ currentRole, NAV }) => {

  return (

    <div
      style={{
        width: 224,
        background: C.sidebarBg,
        display: "flex",
        flexDirection: "column",
        padding: "22px 0",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
      }}
    >

      {/* LOGO */}

      <div
        style={{
          padding: "0 18px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>

          <div
            style={{
              width: 38,
              height: 38,
              background: `linear-gradient(135deg,${C.blue},${C.teal})`,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            💊
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
            RG Medlink
          </div>

        </div>
      </div>


      {/* NAVIGATION */}

      <nav
        style={{
          flex: 1,
          padding: "0 8px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >

        {NAV.map((n) => (

          <NavLink
            key={n.id}
            to={n.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 9,
              textDecoration: "none",
              background: isActive ? C.sidebarActive : "transparent",
              color: "#fff",
              fontSize: 15,
            })}
          >

            <Ic d={PATHS[n.icon]} s={15} c="#fff" />

            {n.l}

            {n.badge && (
              <span
                style={{
                  marginLeft: "auto",
                  background: n.badgeColor,
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 99,
                }}
              >
                {n.badge}
              </span>
            )}

          </NavLink>

        ))}

      </nav>

    </div>
  );
};


/* MAIN APP */

export default function App() {

  const [currentRole] = useState("Admin");
  const [rx, setRx] = useState([]);
  const [toast, setToast] = useState(null);

  
  useEffect(() => {
  fetchMeds();
}, []);

const fetchMeds = async () => {
  try {
    const res = await API.get("/medicines");
    setMeds(res.data);
  } catch (err) {
    console.error("Failed to load medicines", err);
  }
};
const [meds, setMeds] = useState([]);

  /* LOW STOCK COUNT */

const critStock = meds.filter((m) => m.stock <= m.minStock).length;

  /* NAVIGATION */

  const NAV = [

    {
      id: "dashboard",
      l: "Dashboard",
      icon: "dash",
      path: "/dashboard",
    },

    {
      id: "prescriptions",
      l: "Prescriptions",
      icon: "rx",
      path: "/prescriptions",
    },

    {
      id: "patients",
      l: "Patients",
      icon: "users",
      path: "/patients",
    },

    {
      id: "inventory",
      l: "Inventory",
      icon: "box",
      path: "/inventory",
      badge: critStock > 0 ? critStock : null,
      badgeColor: C.red,
    },

     {
      id: "orders",
      l: "orders",
      icon: "orders",
      path: "/orders",
    },

  ].filter(
    (n) =>
      ROLES_CFG[currentRole]?.includes(n.id) ||
      ROLES_CFG[currentRole]?.includes("all") ||
      currentRole === "Admin"
  );


  return (

    <BrowserRouter>

      <G />

      {toast && (
        <Toast msg={toast.m} type={toast.t} onClose={() => setToast(null)} />
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* SIDEBAR */}

        <Sidebar currentRole={currentRole} NAV={NAV} />


        {/* MAIN AREA */}

        <div
          style={{
            marginLeft: 224,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >

          {/* HEADER */}

          <div
            style={{
              height: 58,
              background: C.surface,
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 28px",
            }}
          >

            <div style={{ fontSize: 16 }}>
              <span style={{ color: C.blue, fontWeight: 600 }}>
                RG Medlink
              </span>
            </div>

            <div style={{ fontSize: 12 }}>
              {fDate(new Date().toISOString().slice(0, 10))}
            </div>

          </div>


          {/* PAGE CONTENT */}

          <div
            style={{
              flex: 1,
              padding: "24px 28px",
              background: "#ECEEF4",
            }}
          >

            <Routes>

              <Route
                path="/"
                element={<Dashboard rx={rx} />}
              />

              <Route
                path="/dashboard"
                element={<Dashboard rx={rx} />}
              />

              <Route
                path="/prescriptions"
                element={<RxView role={currentRole} />}
              />

              <Route
                path="/patients"
                element={<PatientsView rx={rx} setRx={setRx} />}
              />

              <Route
                path="/inventory"
                element={<InvView rx={rx} />}
              />

              <Route
 path="/orders"
 element={<OrdersView />}
/>

            </Routes>

          </div>

        </div>

      </div>

    </BrowserRouter>
  );
}