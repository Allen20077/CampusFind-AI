import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
const [showPassword, setShowPassword] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reports, setReports] = useState([]);
const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showRecoverConfirm, setShowRecoverConfirm] = useState(false);
const [recoverReportId, setRecoverReportId] = useState(null);
  const [user, setUser] = useState(null);

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
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

const confirmRecover = async () => {
  if (!recoverReportId) {
    return;
  }

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
  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">

          <div className="brand">
            <div className="brand-icon">🔎</div>

            <div>
              <div className="brand-name">CHRIST</div>

              <div className="brand-ai">
                Deemed to be University
              </div>
            </div>
          </div>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#items">Browse Items</a>
          </div>

          <button
  className="login-btn"
  onClick={() => setShowLogin(true)}
>
  Login
</button>
        </div>
      </nav>


      {/* HERO */}
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
{reports.filter((report) => report.status === "active").length > 0 ? (
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

      {/* FOOTER */}
      <footer>

        <div className="footer-content">

          <div>
            <strong>🔎 CampusFind AI</strong>

            <p>
              Making campus life a little easier.
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

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setPhoto(e.target.files[0])
                    }
                  />

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
{showLogin && (
  <div className="login-page">

    <div className="login-container">

      <button
        className="login-close"
        onClick={() => setShowLogin(false)}
      >
        ×
      </button>

      <div className="login-logo">
        🔎
      </div>

      <div className="login-brand">
        <h1>CHRIST</h1>
        <p>Deemed to be University</p>
      </div>

      <div className="login-heading">
        <h2>Welcome back 👋</h2>
        <p>
          Login to continue to CHRIST Lost & Found
        </p>
      </div>

<form
  className="login-form"
  onSubmit={handleLogin}
>

        <label>
          University Email
        </label>

        <div className="login-input">
          <span>📧</span>

          <input
            type="email"
            placeholder="Enter your university email"
            required
          />
        </div>

        <label>
          Password
        </label>

        <div className="login-input">
          <span>🔒</span>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="login-options">
          <label className="remember-me">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="forgot-password"
            onClick={() =>
              alert("Password reset will be connected next.")
            }
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="login-submit"
        >
          Login →
        </button>

      </form>

      <div className="login-divider">
        <span>OR</span>
      </div>

      <button
        className="christ-login"
        onClick={() =>
          alert("CHRIST University login will be connected next.")
        }
      >
        🎓 Continue with CHRIST
      </button>

      <p className="login-footer">
        Don't have an account?
        <button
          onClick={() =>
            alert("Registration will be connected next.")
          }
        >
          Create account
        </button>
      </p>

      <div className="login-security">
        🔐 Your information is securely protected
      </div>

    </div>

  </div>
)}
    </div>
  );
}

export default App;