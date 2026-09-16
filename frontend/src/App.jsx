import { useEffect, useState, useRef } from "react";
const ADMIN_EMAIL = "joseph.allen@btech.christuniversity.in";
import { supabase } from "./supabase";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState("all");
const [showPassword, setShowPassword] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reports, setReports] = useState([]);
const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showRecoverConfirm, setShowRecoverConfirm] = useState(false);
const [recoverReportId, setRecoverReportId] = useState(null);
  const [user, setUser] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
const [showAdminDeleteConfirm, setShowAdminDeleteConfirm] = useState(false);
const [adminDeleteReportId, setAdminDeleteReportId] = useState(null);
const [adminLoading, setAdminLoading] = useState(false);
const [showRegister, setShowRegister] = useState(false);

const [registerName, setRegisterName] = useState("");
const [registerEmail, setRegisterEmail] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

const [registerLoading, setRegisterLoading] = useState(false);
const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");

const [authLoading, setAuthLoading] = useState(false);
const [authMessage, setAuthMessage] = useState("");

  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    colour: "",
    location: "",
    date: "",
    time: "",
    description: "",
    contact: "",
  });

  const [photo, setPhoto] = useState(null);
  const cameraInputRef = useRef(null);
const fileInputRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
useEffect(() => {
  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  };

  loadUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
  useEffect(() => {
    const API_URL =
      import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    fetch(`${API_URL}/api/test`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend error");
        }

        return response.json();
      })
      .then(() => {
        setBackendStatus("Online");
      })
      .catch(() => {
        setBackendStatus("Offline");
      });
  }, []);

  useEffect(() => {
    const API_URL =
      import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    fetch(`${API_URL}/api/reports`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load reports");
        }

        return response.json();
      })
      .then((data) => {
        console.log("REPORTS FROM SUPABASE:", data);
        setReports(data.reports || []);
      })
      .catch((error) => {
        console.error("LOAD REPORTS ERROR:", error);
      });
  }, []);

  const openReportForm = (type) => {
    setReportType(type);
    setShowForm(true);
    setSubmitted(false);

    setFormData({
      item_name: "",
      category: "",
      colour: "",
      location: "",
      date: "",
      time: "",
      description: "",
      contact: "",
    });

    setPhoto(null);
  };

  const closeForm = () => {
    if (!submitting) {
      setShowForm(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
const searchCategory = (category) => {
  setSearchQuery(category);
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const data = new FormData();

const finalReportType = reportType === "found" ? "found" : "lost";

console.log("REPORT TYPE:", finalReportType);

data.append("type", finalReportType);
data.append("item_name", formData.item_name);
data.append("category", formData.category);
data.append("colour", formData.colour);
data.append("location", formData.location);
data.append("date", formData.date);
data.append("time", formData.time);
data.append("description", formData.description);
data.append("contact", formData.contact);

if (user) {
  data.append("user_id", user.id);

  data.append(
    "user_name",
    user.user_metadata?.full_name || ""
  );

  data.append(
    "user_email",
    user.email || ""
  );
}

if (photo) {
  data.append("photo", photo);
}

      console.log("Sending report to:", `${API_URL}/api/reports`);
      console.log("Submitting as:", finalReportType);

const response = await fetch(`${API_URL}/api/reports`, {
  method: "POST",
  body: data,
});

console.log("Response status:", response.status);
console.log("Response content type:", response.headers.get("content-type"));

const responseText = await response.text();

console.log("Raw backend response:", responseText);

if (!response.ok) {
  let errorMessage = `Backend returned ${response.status}`;

  try {
    const errorData = JSON.parse(responseText);
    errorMessage = errorData.detail || errorMessage;
  } catch {
    if (responseText) {
      errorMessage = responseText;
    }
  }

  throw new Error(errorMessage);
}

let result = {};

if (responseText) {
  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      "Backend returned an invalid response: " + responseText
    );
  }
}

console.log("REPORT SAVED:", result);

if (result.report) {
  setReports((previousReports) => [
    result.report,
    ...previousReports,
  ]);
}

setSubmitted(true);
    } catch (error) {
      console.error("REPORT SUBMISSION FAILED:", error);
      window.alert(error.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };
  const myReports = reports.filter(
  (report) => report.user_id === user?.id
  );
  const isAdmin =
  user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

const myLostReports = myReports.filter(
  (report) => report.type === "lost"
);

const myFoundReports = myReports.filter(
  (report) => report.type === "found"
);

const myActiveReports = myReports.filter(
  (report) => report.status === "active"
);

const myRejectedReports = myReports.filter(
  (report) => report.status === "rejected"
  );
  const dashboardReports =
  dashboardFilter === "lost"
    ? myLostReports
    : dashboardFilter === "found"
    ? myFoundReports
        : myReports;
  const adminReports = reports.filter((report) => {
  const query = adminSearchQuery.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return (
    report.item_name?.toLowerCase().includes(query) ||
    report.category?.toLowerCase().includes(query) ||
    report.location?.toLowerCase().includes(query) ||
    report.type?.toLowerCase().includes(query) ||
    report.status?.toLowerCase().includes(query) ||
    report.contact?.toLowerCase().includes(query) ||
    report.user_id?.toLowerCase().includes(query)
  );
});

const adminTotalReports = reports.length;

const adminLostReports = reports.filter(
  (report) => report.type === "lost"
);

const adminFoundReports = reports.filter(
  (report) => report.type === "found"
);

const adminActiveReports = reports.filter(
  (report) => report.status === "active"
);

const adminRecoveredReports = reports.filter(
  (report) => report.status === "recovered"
);

  const filteredReports = reports.filter((report) => {
    if (report.status !== "active") {
      return false;
    }

    const query = searchQuery.toLowerCase().trim();

    if (!query) return false;

    return (
      report.item_name?.toLowerCase().includes(query) ||
      report.category?.toLowerCase().includes(query) ||
      report.colour?.toLowerCase().includes(query) ||
      report.location?.toLowerCase().includes(query) ||
      report.description?.toLowerCase().includes(query)
    );
  });

  const handleRecover = (reportId) => {
    setRecoverReportId(reportId);
    setShowRecoverConfirm(true);
  };

  const handleAdminDelete = async () => {
    if (!adminDeleteReportId) {
  return;
}
  if (!adminDeleteReportId) {
    return;
    }
    const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    setAdminLoading(true);
    const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.access_token) {
  throw new Error("Your session has expired. Please log in again.");
}

    try {
    if (!isAdmin) {
      throw new Error("You are not authorized to perform this action.");
    }

    const response = await fetch(
      `${API_URL}/api/reports/${adminDeleteReportId}`,
{
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
}
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.detail || "Failed to delete the report."
      );
    }

    setReports((previousReports) =>
      previousReports.filter(
        (report) => report.id !== adminDeleteReportId
      )
    );

    setShowAdminDeleteConfirm(false);
    setAdminDeleteReportId(null);
  } catch (error) {
    console.error("ADMIN DELETE ERROR:", error);
    alert(
      error.message ||
      "Failed to delete the report."
    );
  } finally {
    setAdminLoading(false);
  }
};

  const confirmRecover = async () => {
    if (!recoverReportId) return;

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

      const response = await fetch(
        `${API_URL}/api/reports/${recoverReportId}/recover`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to mark item as recovered."
        );
      }

      console.log("ITEM RECOVERED:", result);

      setReports((previousReports) =>
        previousReports.filter(
          (report) => report.id !== recoverReportId
        )
      );

      setSelectedReport(null);
      setShowRecoverConfirm(false);
      setRecoverReportId(null);
    } catch (error) {
      console.error("RECOVER ERROR:", error);
      window.alert(
        error.message || "Failed to mark item as recovered."
      );
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  setAuthLoading(true);
  setAuthMessage("");

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

    if (error) {
      throw error;
    }

    setUser(data.user);

    setShowLogin(false);

    setLoginEmail("");
    setLoginPassword("");
    setShowPassword(false);
    setAuthMessage("");

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    setAuthMessage(
      error.message ||
        "Login failed. Please check your email and password."
    );

  } finally {
    setAuthLoading(false);
  }
  };
  const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("LOGOUT ERROR:", error);
    return;
  }

  setUser(null);
  };
  const handleRegister = async (e) => {
  e.preventDefault();

  setRegisterLoading(true);
  setAuthMessage("");

  const email = registerEmail.trim().toLowerCase();

  if (!email.endsWith("christuniversity.in")) {
    setAuthMessage(
      "Please use your CHRIST University email address."
    );
    setRegisterLoading(false);
    return;
  }

  if (registerPassword.length < 6) {
    setAuthMessage(
      "Password must be at least 6 characters."
    );
    setRegisterLoading(false);
    return;
  }

  if (registerPassword !== registerConfirmPassword) {
    setAuthMessage(
      "Passwords do not match."
    );
    setRegisterLoading(false);
    return;
  }

  try {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password: registerPassword,
        options: {
          data: {
            full_name: registerName.trim(),
          },
        },
      });

    if (error) {
      throw error;
    }

    setUser(data.user);

    setShowRegister(false);
    setShowLogin(false);

    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");
    setAuthMessage("");

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    setAuthMessage(
      error.message ||
      "Registration failed. Please try again."
    );
  } finally {
    setRegisterLoading(false);
  }
};
  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">

<div className="brand">
  <img
    src="/campusfind-logo.svg"
    alt="CampusFind AI"
    className="campusfind-logo"
  />

  <div>
    <div className="brand-name">CHRIST</div>

    <div className="brand-ai">
      Deemed to be University
    </div>
  </div>
</div>

<div className="nav-links">
<a
  href="#home"
  onClick={(e) => {
    e.preventDefault();
    setShowDashboard(false);
    setShowAdminDashboard(false);
    window.location.hash = "home";
  }}
>
  Home
</a>
  <a href="#how-it-works">How It Works</a>
<a
  href="#items"
  onClick={(e) => {
    e.preventDefault();
    setShowDashboard(false);
    setShowAdminDashboard(false);
    document.getElementById("items")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  Browse Items
</a>
{isAdmin && (
  <a
    href="#admin-dashboard"
    onClick={(e) => {
      e.preventDefault();
      setShowAdminDashboard(true);
      setShowDashboard(false);
    }}
  >
    Admin Dashboard
  </a>
)}
  {user && (
    <a
      href="#dashboard"
      onClick={(e) => {
        e.preventDefault();
        setShowDashboard(true);
      }}
    >
      My Dashboard
    </a>
  )}
</div>

<div className="nav-actions">

  <a
    href="/app-debug.apk"
    download="app-debug.apk"
    className="download-nav-button"
  >
    ↓ Download App
  </a>

  {user ? (
    <button
      className="login-btn"
      onClick={handleLogout}
    >
      👤 {user.user_metadata?.full_name || "Account"} · Logout
    </button>
  ) : (
    <button
      className="login-btn"
      onClick={() => {
        setShowLogin(true);
        setShowRegister(false);
        setAuthMessage("");
      }}
    >
      Login
    </button>
  )}
</div>
        </div>
      </nav>
      {showDashboard && (
  <div className="dashboard-page">

    <div className="dashboard-container">

      <button
        className="dashboard-back"
        onClick={() => setShowDashboard(false)}
      >
        ← Back to Home
      </button>

      <div className="dashboard-header">
        <span className="section-label">
          MY ACCOUNT
        </span>

        <h1>My Dashboard</h1>

        <p>
          Manage the lost and found reports you created.
        </p>
      </div>

      <div className="dashboard-user-card">
        <div className="dashboard-avatar">
          👤
        </div>

        <div>
          <h2>
            {user?.user_metadata?.full_name || "User"}
          </h2>

          <p>
            {user?.email}
          </p>
        </div>
      </div>

<div className="dashboard-stats">

  <button
    className="dashboard-stat total-stat"
    onClick={() => setDashboardFilter("all")}
  >
    <strong>{myReports.length}</strong>
    <span>Total Reports</span>
  </button>

  <button
    className="dashboard-stat lost-stat"
    onClick={() => setDashboardFilter("lost")}
  >
    <strong>{myLostReports.length}</strong>
    <span>Lost Reports</span>
  </button>

  <button
    className="dashboard-stat found-stat"
    onClick={() => setDashboardFilter("found")}
  >
    <strong>{myFoundReports.length}</strong>
    <span>Found Reports</span>
  </button>

</div>

      <div className="dashboard-reports">

        <div className="dashboard-section-title">
          <h2>My Reports</h2>
          <p>
            Reports submitted using your account.
          </p>
        </div>

        <div className="dashboard-grid">

{reports.filter((report) => report.status === "active").length > 0 ? (

            dashboardReports.map((report) => (

                <button
                  key={report.id}
                  className="dashboard-report-card"
                  onClick={() => setSelectedReport(report)}
                >

                  <div className="dashboard-report-image">

                    {report.photo_path ? (
                      <img
                        src={`${
                          import.meta.env.VITE_SUPABASE_URL
                        }/storage/v1/object/public/lost-found/${report.photo_path}`}
                        alt={report.item_name}
                      />
                    ) : (
                      <span>📦</span>
                    )}

                  </div>

                  <div className="dashboard-report-info">

                    <span
                      className={`item-status ${
                        report.type === "lost"
                          ? "lost"
                          : "found"
                      }`}
                    >
                      {report.type === "lost"
                        ? "LOST"
                        : "FOUND"}
                    </span>

                    <h3>{report.item_name}</h3>

                    <p>📍 {report.location}</p>

                    <small>
                      {report.date}
                    </small>

                    <div className="dashboard-report-status">
  {report.status === "active" && (
    <span className="status-active">
      🟢 Active
    </span>
  )}

        
        </div>

      </div>

                </button>
              ))) : (
                <div className="dashboard-empty">
                  <p>No reports found.</p>
                </div>
              )}

    </div>

  </div>

  </div>

  </div>
)}

      {showAdminDashboard && isAdmin && (
        <div className="admin-page">

        {adminReports.length > 0 ? (

          <div className="admin-report-list">

            {adminReports.map((report) => {

              const imageUrl = report.photo_path
                ? `https://swrrvlsrpdeiculvzkqy.supabase.co/storage/v1/object/public/lost-found/${report.photo_path}`
                : null;

              return (
                <div
                  className="admin-report-card"
                  key={report.id}
                >

                  <div className="admin-report-image">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={report.item_name}
                      />
                    ) : (
                      <div className="admin-no-image">
                        📷
                        <span>No Photo</span>
                      </div>
                    )}

                  </div>

                  <div className="admin-report-content">

                    <div className="admin-report-top">

                      <div>

                        <span
                          className={
                            report.type === "lost"
                              ? "admin-type-lost"
                              : "admin-type-found"
                          }
                        >
                          {report.type === "lost"
                            ? "LOST"
                            : "FOUND"}
                        </span>

                        <h3>
                          {report.item_name}
                        </h3>

                      </div>

                      <div className="admin-status">

                        {report.status === "active" && (
                          <span className="status-active">
                            🟢 Active
                          </span>
                        )}

                        {report.status === "recovered" && (
                          <span className="status-recovered">
                            ✅ Recovered
                          </span>
                        )}

                        {report.status === "rejected" && (
                          <span className="status-rejected">
                            🔴 Rejected
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="admin-report-details">

                      <div>
                        <span>📂 Category</span>
                        <strong>
                          {report.category}
                        </strong>
                      </div>

                      <div>
                        <span>🎨 Colour</span>
                        <strong>
                          {report.colour}
                        </strong>
                      </div>

                      <div>
                        <span>📍 Location</span>
                        <strong>
                          {report.location}
                        </strong>
                      </div>

                      <div>
                        <span>📅 Date</span>
                        <strong>
                          {report.date}
                        </strong>
                      </div>

                      {report.time && (
                        <div>
                          <span>⏰ Time</span>
                          <strong>
                            {report.time}
                          </strong>
                        </div>
                      )}

                    </div>

                    <div className="admin-owner">

                      <div className="admin-owner-avatar">
                        👤
                      </div>

                      <div>
                        <span>
                          Submitted by
                        </span>

                        <strong>
                      {report.user_name ||
  report.user_email ||
  "Guest / Older Report"}
                        </strong>

                        <small>
<small>
  {report.user_email
    ? report.user_email
    : `Contact: ${report.contact}`}
</small>
                        </small>
                      </div>

                    </div>

                    {report.description && (
                      <div className="admin-description">
                        <span>Description</span>
                        <p>
                          {report.description}
                        </p>
                      </div>
                    )}

                    <div className="admin-report-actions">

                      <button
                        className="admin-delete-button"
                        onClick={() => {
                          setAdminDeleteReportId(
                            report.id
                          );
                          setShowAdminDeleteConfirm(
                            true
                          );
                        }}
                      >
                        🗑️ Delete Permanently
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        ) : (

          <div className="admin-empty">
            <div>🔎</div>

            <h3>No reports found</h3>

            <p>
              No reports match your search.
            </p>
          </div>

        )}

      </div>
)}

{showAdminDeleteConfirm && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        width: "400px",
        maxWidth: "90%",
        textAlign: "center",
      }}
    >
      <h2>Delete Report?</h2>

      <p>
        Are you sure you want to permanently delete this report?
        This action cannot be undone.
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => {
            setShowAdminDeleteConfirm(false);
            setAdminDeleteReportId(null);
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleAdminDelete}
          disabled={adminLoading}
          style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {adminLoading ? "Deleting..." : "Yes, Delete Permanently"}
        </button>
      </div>
    </div>
  </div>
)}
      {/* HERO */}
{!showDashboard && !showAdminDashboard && (
  <main id="home">

        <section className="hero">

          <div className="hero-content">

            <div className="status-pill">
              <span className="status-dot"></span>
              AI-powered campus lost & found
            </div>

            <h1>
              CHRIST Lost & Found
              <br />
              <span>Let's find it.</span>
            </h1>

            <p>
              A simple campus-wide platform for CHRIST
              (Deemed to be University) Kengeri students
              to report, find and recover lost belongings.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-btn"
                onClick={() => openReportForm("lost")}
              >
                🔴 Report Lost Item
              </button>

              <button
                className="secondary-btn"
                onClick={() => openReportForm("found")}
              >
                🟢 Report Found Item
              </button>

            </div>
            <div className="trust-text">
              ✨ Simple • Fast • Campus-focused
            </div>

          </div>

          {/* HERO CARD */}
          <div className="hero-card">

            <div className="search-header">
              <span>🔎</span>

              <span>
                Find your lost item
              </span>
            </div>

            <div className="search-box">

              <span>🔍</span>

        <input
  type="text"
  placeholder="Search items..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

            </div>

            <div className="category-title">
              Popular categories
            </div>

<div className="categories">

  <button onClick={() => searchCategory("electronics")}>
    🎧 Electronics
  </button>

  <button onClick={() => searchCategory("wallet")}>
    👛 Wallets
  </button>

  <button onClick={() => searchCategory("bag")}>
    🎒 Bags
  </button>

  <button onClick={() => searchCategory("id")}>
    🪪 IDs & Cards
  </button>

</div>
            {searchQuery.trim() && (
  <div className="search-results">
    {filteredReports.length > 0 ? (
      <>
        <div className="search-results-title">
          {filteredReports.length} item
          {filteredReports.length !== 1 ? "s" : ""} found
        </div>

        {filteredReports.map((report) => (
          <button
            key={report.id}
            className="search-result-card"
            onClick={() => setSelectedReport(report)}
          >
            <div className="search-result-image">
              {report.photo_path ? (
                <img
                  src={`${
                    import.meta.env.VITE_SUPABASE_URL
                  }/storage/v1/object/public/lost-found/${report.photo_path}`}
                  alt={report.item_name}
                />
              ) : (
                "📦"
              )}
            </div>

            <div className="search-result-info">
              <span
                className={`item-status ${
                  report.type === "lost" ? "lost" : "found"
                }`}
              >
                {report.type === "lost" ? "LOST" : "FOUND"}
              </span>

              <h3>{report.item_name}</h3>

              <p>📍 {report.location}</p>

              <small>
                {report.date}
              </small>
            </div>

            <div className="search-result-arrow">
              →
            </div>
          </button>
        ))}
      </>
    ) : (
      <div className="no-results">
        🔎 No matching items found.
      </div>
    )}
  </div>
)}

            <div className="match-card">

              <div className="match-icon">
                ✓
              </div>

              <div className="match-info">

                <strong>
                  AI Match Found
                </strong>

                <span>
                  Black headphones
                </span>

              </div>

              <div className="match-score">
                94%
              </div>

            </div>

          </div>

        </section>


        {/* STATS */}
        <section className="stats">

          <div className="stat">
            <strong>1,248+</strong>
            <span>Items Reported</span>
          </div>

          <div className="stat">
            <strong>890+</strong>
            <span>Items Recovered</span>
          </div>

          <div className="stat">
            <strong>92%</strong>
            <span>Match Accuracy</span>
          </div>

          <div className="stat">
            <strong>24/7</strong>
            <span>Campus Access</span>
          </div>

        </section>


        {/* HOW IT WORKS */}
        <section
          className="how-section"
          id="how-it-works"
        >

          <div className="section-heading">

            <span className="section-label">
              HOW IT WORKS
            </span>

            <h2>
              Finding your item is easy.
            </h2>

            <p>
              Three simple steps to turn a lost item
              into a recovered one.
            </p>

          </div>


          <div className="steps">

            <div className="step">

              <div className="step-number">
                01
              </div>

              <div className="step-icon">
                📝
              </div>

              <h3>
                Report
              </h3>

              <p>
                Tell us what you lost or found,
                including a photo and location.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                02
              </div>

              <div className="step-icon">
                🧠
              </div>

              <h3>
                AI Matches
              </h3>

              <p>
                Our matching engine compares
                descriptions, locations and other details.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                03
              </div>

              <div className="step-icon">
                🎉
              </div>

              <h3>
                Recover
              </h3>

              <p>
                Submit a claim, verify ownership
                and get your item back.
              </p>

            </div>

          </div>

        </section>

{/* RECENT ITEMS */}
<section
  className="items-section"
  id="items"
>
  <div className="section-heading">
    <span className="section-label">
      RECENT ACTIVITY
    </span>

    <h2>
      Recently reported
    </h2>

    <p>
      Real lost and found items reported on campus.
    </p>
  </div>

  <div className="items-grid">
{dashboardReports.length > 0 ? (
  [...reports]
    .filter((report) => report.status === "active")
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
      const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
      return dateB - dateA;
    })
    .map((report) => (
        <button
          key={report.id}
          className="item-card"
          onClick={() => setSelectedReport(report)}
        >
          <div className="item-image">
            {report.photo_path ? (
              <img
                src={`${
                  import.meta.env.VITE_SUPABASE_URL
                }/storage/v1/object/public/lost-found/${report.photo_path}`}
                alt={report.item_name}
              />
            ) : (
              <span>📦</span>
            )}
          </div>

          <div className="item-details">
            <span
              className={`item-status ${
                report.type === "lost" ? "lost" : "found"
              }`}
            >
              {report.type === "lost" ? "LOST" : "FOUND"}
            </span>

            <h3>{report.item_name}</h3>

            <p>
              📍 {report.location}
            </p>

            <small>
              {report.date}
              {report.time ? ` • ${report.time}` : ""}
            </small>
          </div>

          <div className="item-card-arrow">
            →
          </div>
        </button>
      ))
    ) : (
      <div className="empty-items">
        <div>📦</div>
        <h3>No reports yet</h3>
        <p>
          Lost and found reports will appear here.
        </p>
      </div>
    )}
  </div>
</section>

      </main>
  )}

      {/* FOOTER */}
{!showDashboard && !showAdminDashboard && (
  <footer>
        <div className="footer-content">

<div>
  <strong>🔎 CampusFind AI</strong>

  <p>
    Designed & developed by <strong>Allen Joseph</strong>
  </p>
</div>

          <div className="backend-status">

            <span
              className={
                backendStatus === "Online"
                  ? "online-dot"
                  : "offline-dot"
              }
            ></span>

            System {backendStatus}

          </div>

        </div>
        </footer>
)}
{/* ITEM DETAILS POPUP */}

{selectedReport && (
  <div
    className="item-details-overlay"
    onClick={() => setSelectedReport(null)}
  >
    <div
      className="item-details-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="details-close"
        onClick={() => setSelectedReport(null)}
      >
        ×
      </button>

      {selectedReport.photo_path ? (
        <img
          className="details-image"
          src={`https://swrrvlsrpdeiculvzkqy.supabase.co/storage/v1/object/public/lost-found/${selectedReport.photo_path}`}
          alt={selectedReport.item_name}
        />
      ) : (
        <div className="details-no-image">
          📦
        </div>
            )}
            {showRecoverConfirm && (
  <div
    className="recover-overlay"
    onClick={() => {
      setShowRecoverConfirm(false);
      setRecoverReportId(null);
    }}
  >
    <div
      className="recover-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="recover-icon">
        ✓
      </div>

      <h2>Mark as Recovered?</h2>

      <p>
        Has the owner received this item?
      </p>

      <span>
        Once recovered, the item will be removed from
        active Lost & Found and its photo will be permanently deleted.
      </span>

      <div className="recover-actions">

        <button
          className="recover-cancel"
          onClick={() => {
            setShowRecoverConfirm(false);
            setRecoverReportId(null);
          }}
        >
          Cancel
        </button>

        <button
          className="recover-confirm"
          onClick={confirmRecover}
        >
          ✓ Yes, Recovered
        </button>

      </div>

    </div>
  </div>
)}

      <span
        className={`item-status ${
          selectedReport.type === "lost"
            ? "lost"
            : "found"
        }`}
      >
        {selectedReport.type === "lost"
          ? "🔴 LOST"
          : "🟢 FOUND"}
      </span>

      <h2>{selectedReport.item_name}</h2>

      <div className="details-list">

        <p>
          <strong>Category:</strong>{" "}
          {selectedReport.category}
        </p>

        <p>
          <strong>Colour:</strong>{" "}
          {selectedReport.colour}
        </p>

        <p>
          <strong>Location:</strong>{" "}
          {selectedReport.location}
        </p>

        <p>
          <strong>Date:</strong>{" "}
          {selectedReport.date}
        </p>

        {selectedReport.time && (
          <p>
            <strong>Time:</strong>{" "}
            {selectedReport.time}
          </p>
        )}

        <div className="details-description">
          <strong>Description</strong>
          <p>{selectedReport.description}</p>
        </div>

        <div className="details-contact">
          <strong>📞 Contact</strong>
          <p>{selectedReport.contact}</p>
              </div>
              {selectedReport.status === "active" && (
  <button
    className="recover-btn"
    onClick={() => handleRecover(selectedReport.id)}
  >
    ✅ Mark as Recovered
  </button>
)}

      </div>

    </div>
  </div>
)}

      {/* REPORT FORM */}

      {showForm && (
        <div className="modal-overlay">

          <div className="report-modal">

            <div className="modal-header">

              <div>
                <span className="modal-label">
                  CHRIST KENGERI CAMPUS
                </span>

                <h2>
                  {reportType === "lost"
                    ? "Report Lost Item"
                    : "Report Found Item"}
                </h2>

                <p>
                  Give us a few details about the item.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={closeForm}
                type="button"
              >
                ×
              </button>

            </div>


            {!submitted ? (

              <form
                className="report-form"
                onSubmit={handleSubmit}
              >

                {/* ITEM NAME */}

                <div className="form-group">

                  <label>
                    Item Name *
                  </label>

                  <input
                    type="text"
                    name="item_name"
                    placeholder="Example: Black JBL headphones"
                    value={formData.item_name}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* CATEGORY */}

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Category *
                    </label>

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Select category
                      </option>

                      <option value="Electronics">
                        Electronics
                      </option>

                      <option value="Wallet">
                        Wallet
                      </option>

                      <option value="Bag">
                        Bag
                      </option>

                      <option value="ID / Card">
                        ID / Card
                      </option>

                      <option value="Keys">
                        Keys
                      </option>

                      <option value="Books">
                        Books
                      </option>

                      <option value="Clothing">
                        Clothing
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>


                  {/* COLOUR */}

                  <div className="form-group">

                    <label>
                      Colour *
                    </label>

                    <input
                      type="text"
                      name="colour"
                      placeholder="Example: Black"
                      value={formData.colour}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </div>


                {/* LOCATION */}

                <div className="form-group">

                  <label>
                    Campus Location *
                  </label>

                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select location
                    </option>

                    <option value="Library">
                      Library
                    </option>

                    <option value="Cafeteria">
                      Cafeteria
                    </option>

                    <option value="Main Block">
                      Main Block
                    </option>

                    <option value="Block A">
                      Block A
                    </option>

                    <option value="Block B">
                      Block B
                    </option>

                    <option value="Block C">
                      Block C
                    </option>

                    <option value="Hostel">
                      Hostel
                    </option>

                    <option value="Sports Ground">
                      Sports Ground
                    </option>

                    <option value="Parking">
                      Parking
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* DATE + TIME */}

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Date *
                    </label>

                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Approximate Time
                    </label>

                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                    />

                  </div>

                </div>


                {/* DESCRIPTION */}

                <div className="form-group">

                  <label>
                    Description *
                  </label>

                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Describe the item and any identifying details..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />

                </div>


{/* PHOTO */}

<div className="form-group">

  <label>
    Item Photo
  </label>

  <div className="photo-options">

    {/* CAMERA */}
    <button
      type="button"
      className="photo-option camera-option"
      onClick={() => cameraInputRef.current?.click()}
    >
      <span className="photo-option-icon">📷</span>
      <span>Take Photo</span>
    </button>

    {/* CHOOSE FILE */}
    <button
      type="button"
      className="photo-option file-option"
      onClick={() => fileInputRef.current?.click()}
    >
      <span className="photo-option-icon">📁</span>
      <span>Choose File</span>
    </button>

  </div>

  {/* CAMERA INPUT */}
  <input
    ref={cameraInputRef}
    type="file"
    accept="image/*"
    capture="environment"
    hidden
    onChange={(e) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setPhoto(selectedFile);
      }
    }}
  />

  {/* FILE/GALLERY INPUT */}
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    hidden
    onChange={(e) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setPhoto(selectedFile);
      }
    }}
  />

  {/* SELECTED PHOTO */}
  {photo && (
    <div className="selected-photo">

      <img
        src={URL.createObjectURL(photo)}
        alt="Selected item"
      />

      <div className="selected-photo-name">
        {photo.name}
      </div>

    </div>
  )}

</div>


                {/* CONTACT */}

                <div className="form-group">

                  <label>
                    Contact *
                  </label>

                  <input
                    type="text"
                    name="contact"
                    placeholder="Email or phone number"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* SUBMIT */}

                <button
                  type="submit"
                  className="submit-report-btn"
                  disabled={submitting}
                >

                  {submitting
                    ? "Submitting..."
                    : reportType === "lost"
                    ? "🔴 Submit Lost Report"
                    : "🟢 Submit Found Report"}

                </button>

              </form>

            ) : (

              /* SUCCESS MESSAGE */

              <div className="success-screen">

                <div className="success-icon">
                  ✓
                </div>

                <h2>
                  Report Submitted!
                </h2>

                <p>
                  Your {reportType} item has been
                  successfully reported.
                </p>

                <div className="success-info">
                  🧠 CampusFind AI will look for
                  potential matches.
                </div>

                <button
                  className="primary-btn"
                  onClick={closeForm}
                >
                  Done
                </button>

              </div>

            )}

          </div>

        </div>
      )}

      {/* LOGIN / REGISTER */}
      {showLogin && (
        <div className="login-page">
          <div className="login-container">

            <button
              className="login-close"
              onClick={() => {
                setShowLogin(false);
                setShowRegister(false);
                setAuthMessage("");
              }}
            >
              ×
            </button>

<div className="logo">
  <img
    src="/campusfind-logo.svg"
    alt="CampusFind AI"
  />
</div>

            <div className="login-brand">
              <h1>CHRIST</h1>
              <p>Deemed to be University</p>
            </div>

            {showRegister ? (
              <>
                <div className="login-heading">
                  <h2>Create account ✨</h2>
                  <p>Join CHRIST Lost & Found</p>
                </div>

                <form className="login-form" onSubmit={handleRegister}>
                  <label>Full Name</label>

                  <div className="login-input">
                    <span>👤</span>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>

                  <label>University Email</label>

                  <div className="login-input">
                    <span>📧</span>
                    <input
                      type="email"
                      placeholder="yourname@btech.christuniversity.in"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>

                  <label>Password</label>

                  <div className="login-input">
                    <span>🔒</span>
                    <input
                      type="password"
                      placeholder="Create a password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>

                  <label>Confirm Password</label>

                  <div className="login-input">
                    <span>🔒</span>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={registerConfirmPassword}
                      onChange={(e) =>
                        setRegisterConfirmPassword(e.target.value)
                      }
                      required
                    />
                  </div>

                  {authMessage && (
                    <div className="auth-message">{authMessage}</div>
                  )}

                  <button
                    type="submit"
                    className="login-submit"
                    disabled={registerLoading}
                  >
                    {registerLoading ? "Creating account..." : "Create Account →"}
                  </button>
                </form>

                <p className="login-footer">
                  Already have an account?
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(false);
                      setAuthMessage("");
                    }}
                  >
                    Login
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="login-heading">
                  <h2>Welcome back 👋</h2>
                  <p>Login to continue to CHRIST Lost & Found</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                  <label>University Email</label>

                  <div className="login-input">
                    <span>📧</span>
                    <input
                      type="email"
                      placeholder="Enter your university email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <label>Password</label>

                  <div className="login-input">
                    <span>🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {authMessage && (
                    <div className="auth-message">{authMessage}</div>
                  )}

                  <button
                    type="submit"
                    className="login-submit"
                    disabled={authLoading}
                  >
                    {authLoading ? "Logging in..." : "Login →"}
                  </button>
                </form>

                <div className="login-divider">
                  <span>OR</span>
                </div>

                <button
                  type="button"
                  className="christ-login"
                  onClick={() =>
                    window.open(
                      "https://christuniversity.in/login/",
                      "_blank"
                    )
                  }
                >
                  🎓 Continue with CHRIST
                </button>

                <p className="login-footer">
                  Don't have an account?
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(true);
                      setAuthMessage("");
                    }}
                  >
                    Create account
                  </button>
                </p>

                <div className="login-security">
                  🔐 Your password is securely handled by Supabase
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;