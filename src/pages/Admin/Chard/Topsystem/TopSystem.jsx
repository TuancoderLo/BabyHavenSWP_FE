import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TopSystem.css";
import {
  FaEnvelope,
  FaPhone,
  FaHospital,
  FaMapMarkerAlt,
  FaMedal,
  FaUserMd,
  FaCalendarCheck,
  FaChild,
  FaChartLine,
  FaListOl,
  FaCalendarAlt,
  FaFilter,
  FaGlobeAsia,
} from "react-icons/fa";

function TopSystem() {
  const [topDoctors, setTopDoctors] = useState([]);
  const [allTopDoctors, setAllTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailIndex, setShowDetailIndex] = useState(null);
  const [showFullRanking, setShowFullRanking] = useState(false);

  // New state for month filtering
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        setLoading(true);

        // 1. Get all consultation requests from API
        console.log("Getting consultation request data...");
        const consultationResponse = await axios.get(
          "https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/ConsultationRequests"
        );

        console.log("API data returned:", consultationResponse.data);

        // Check response structure and get data array from response
        let requests = [];
        if (
          consultationResponse.data &&
          consultationResponse.data.data &&
          Array.isArray(consultationResponse.data.data)
        ) {
          requests = consultationResponse.data.data;
        } else if (Array.isArray(consultationResponse.data)) {
          requests = consultationResponse.data;
        } else {
          throw new Error("API data is not in the correct format");
        }

        console.log("Request list after processing:", requests);

        // Find available months from request data
        const months = {};
        requests.forEach((request) => {
          if (request && request.requestDate) {
            const date = new Date(request.requestDate);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
            months[monthKey] = true;
          }
        });

        // Sort months in descending order (newest to oldest)
        const sortedMonths = Object.keys(months).sort((a, b) =>
          b.localeCompare(a)
        );
        setAvailableMonths(sortedMonths);

        // Initialize with all months
        processRequestsByMonth(requests, "all");
      } catch (err) {
        console.error("Error getting top doctor data:", err);
        setError("Could not load doctor data. Please try again later.");
        setLoading(false);
      }
    };

    fetchTopDoctors();
  }, []);

  // New function to process requests by month
  const processRequestsByMonth = async (allRequests, monthFilter) => {
    try {
      // Filter requests by month if not 'all'
      let filteredRequests = allRequests;
      if (monthFilter !== "all") {
        filteredRequests = allRequests.filter((request) => {
          if (request && request.requestDate) {
            const date = new Date(request.requestDate);
            const requestMonthKey = `${date.getFullYear()}-${
              date.getMonth() + 1
            }`;
            return requestMonthKey === monthFilter;
          }
          return false;
        });
      }

      // 2. Count number of requests for each doctor
      const doctorCounts = {};
      filteredRequests.forEach((request) => {
        if (request && request.doctorId) {
          doctorCounts[request.doctorId] =
            (doctorCounts[request.doctorId] || 0) + 1;
        }
      });

      console.log(`Request count by doctor (${monthFilter}):`, doctorCounts);

      // 3. Sort and get top 10
      const top10DoctorIds = Object.entries(doctorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => parseInt(id));

      console.log(`Top 10 doctorId (${monthFilter}):`, top10DoctorIds);

      if (top10DoctorIds.length === 0) {
        setTopDoctors([]);
        setAllTopDoctors([]);
        setLoading(false);
        return;
      }

      // 4. Create array of promises to get doctor information from API
      const doctorPromises = top10DoctorIds.map(async (id) => {
        try {
          console.log(`Getting doctor information for ID ${id}...`);
          const doctorResponse = await axios.get(
            `https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/Doctors/${id}`
          );

          // Check doctor response structure
          let doctorData = null;
          if (doctorResponse.data && doctorResponse.data.data) {
            doctorData = doctorResponse.data.data;
          } else {
            doctorData = doctorResponse.data;
          }

          return {
            ...doctorData,
            requestCount: doctorCounts[id],
            requestsByCategory: getCategoryStats(filteredRequests, id),
          };
        } catch (err) {
          console.error(`Error getting information for doctor ID ${id}:`, err);
          // Return placeholder data if detailed information cannot be obtained
          return {
            doctorId: id,
            name: `Doctor ID: ${id}`,
            degree: "No information",
            hospitalName: "No information",
            requestCount: doctorCounts[id],
            status: "Unknown",
          };
        }
      });

      const doctorsInfo = await Promise.all(doctorPromises);
      console.log(
        `Doctor list with information (${monthFilter}):`,
        doctorsInfo
      );

      setTopDoctors(doctorsInfo.slice(0, 3)); // Get first 3 doctors for top 3
      setAllTopDoctors(doctorsInfo); // Save the entire top 10 list
      setSelectedMonth(monthFilter);
      setLoading(false);
    } catch (err) {
      console.error("Error processing data by month:", err);
      setError("Could not process data by month. Please try again later.");
      setLoading(false);
    }
  };

  // Helper function to calculate statistics by category
  const getCategoryStats = (requests, doctorId) => {
    const categories = {};
    const doctorRequests = requests.filter((req) => req.doctorId === doctorId);

    doctorRequests.forEach((req) => {
      const category = req.category || "Other";
      categories[category] = (categories[category] || 0) + 1;
    });

    return categories;
  };

  const toggleDoctorDetail = (index) => {
    setShowDetailIndex(showDetailIndex === index ? null : index);
  };

  const toggleFullRanking = () => {
    setShowFullRanking(!showFullRanking);
  };

  const toggleMonthFilter = () => {
    setShowMonthFilter(!showMonthFilter);
  };

  const handleMonthChange = async (monthKey) => {
    setLoading(true);

    try {
      // Get consultation request data again
      const consultationResponse = await axios.get(
        "https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/ConsultationRequests"
      );

      let requests = [];
      if (
        consultationResponse.data &&
        consultationResponse.data.data &&
        Array.isArray(consultationResponse.data.data)
      ) {
        requests = consultationResponse.data.data;
      } else if (Array.isArray(consultationResponse.data)) {
        requests = consultationResponse.data;
      } else {
        throw new Error("API data is not in the correct format");
      }

      // Process data by selected month
      await processRequestsByMonth(requests, monthKey);

      // Close month filter after selection
      setShowMonthFilter(false);
    } catch (err) {
      console.error("Error when changing month:", err);
      setError(
        "Could not load data for the selected month. Please try again later."
      );
      setLoading(false);
    }
  };

  // Format month display from YYYY-MM key
  const formatMonthDisplay = (monthKey) => {
    if (monthKey === "all") return "All Time";

    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (loading)
    return (
      <div className="TopSystem-loading">
        <div className="TopSystem-loading-spinner"></div>
        <p>Loading doctor data...</p>
      </div>
    );

  if (error) return <div className="TopSystem-error">{error}</div>;

  // Display message if no data
  if (topDoctors.length === 0) {
    return (
      <div className="TopSystem-container">
        <h2 className="TopSystem-title">
          <FaMedal className="TopSystem-title-icon" /> Top Most Requested
          Doctors
          <div className="TopSystem-month-selector">
            <button
              className="TopSystem-month-button"
              onClick={toggleMonthFilter}
            >
              <FaCalendarAlt className="TopSystem-month-icon" />
              {formatMonthDisplay(selectedMonth)}
              <FaFilter className="TopSystem-filter-icon" />
            </button>

            {showMonthFilter && (
              <div className="TopSystem-month-dropdown">
                <div
                  className={`TopSystem-month-item ${
                    selectedMonth === "all" ? "active" : ""
                  }`}
                  onClick={() => handleMonthChange("all")}
                >
                  <FaGlobeAsia className="TopSystem-month-item-icon" />
                  All Time
                </div>
                {availableMonths.map((month) => (
                  <div
                    key={month}
                    className={`TopSystem-month-item ${
                      selectedMonth === month ? "active" : ""
                    }`}
                    onClick={() => handleMonthChange(month)}
                  >
                    <FaCalendarAlt className="TopSystem-month-item-icon" />
                    {formatMonthDisplay(month)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </h2>
        <div className="TopSystem-empty">
          No data on doctor consultation requests for{" "}
          {formatMonthDisplay(selectedMonth).toLowerCase()}.
        </div>
      </div>
    );
  }

  return (
    <div className="TopSystem-container">
      <h2 className="TopSystem-title">
        <FaMedal className="TopSystem-title-icon" /> Top Most Requested Doctors
        <div className="TopSystem-month-selector">
          <button
            className="TopSystem-month-button"
            onClick={toggleMonthFilter}
          >
            <FaCalendarAlt className="TopSystem-month-icon" />
            {formatMonthDisplay(selectedMonth)}
            <FaFilter className="TopSystem-filter-icon" />
          </button>

          {showMonthFilter && (
            <div className="TopSystem-month-dropdown">
              <div
                className={`TopSystem-month-item ${
                  selectedMonth === "all" ? "active" : ""
                }`}
                onClick={() => handleMonthChange("all")}
              >
                <FaGlobeAsia className="TopSystem-month-item-icon" />
                All Time
              </div>
              {availableMonths.map((month) => (
                <div
                  key={month}
                  className={`TopSystem-month-item ${
                    selectedMonth === month ? "active" : ""
                  }`}
                  onClick={() => handleMonthChange(month)}
                >
                  <FaCalendarAlt className="TopSystem-month-item-icon" />
                  {formatMonthDisplay(month)}
                </div>
              ))}
            </div>
          )}
        </div>
      </h2>

      {/* Top 3 doctors with featured cards */}
      <div className="TopSystem-grid">
        {topDoctors.map((doctor, index) => (
          <div
            key={doctor.doctorId}
            className={`TopSystem-doctor-card ${
              showDetailIndex === index ? "expanded" : ""
            }`}
            onClick={() => toggleDoctorDetail(index)}
          >
            <div className="TopSystem-doctor-rank">{index + 1}</div>
            <div className="TopSystem-doctor-card-inner">
              <div className="TopSystem-doctor-card-front">
                <div className="TopSystem-doctor-avatar">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      doctor.name || "Doctor"
                    )}&background=random&color=fff&size=128`}
                    alt={doctor.name || "Doctor"}
                  />
                </div>
                <div className="TopSystem-doctor-info">
                  <h3>{doctor.name || "No name"}</h3>
                  <p className="TopSystem-doctor-degree">
                    {doctor.degree || "No information"}
                  </p>
                  <p className="TopSystem-doctor-hospital">
                    <FaHospital className="TopSystem-info-icon" />{" "}
                    {doctor.hospitalName || "No information"}
                  </p>
                  <div className="TopSystem-request-count">
                    <span className="TopSystem-count-number">
                      {doctor.requestCount}
                    </span>
                    <span className="TopSystem-count-label">
                      consultation requests
                    </span>
                  </div>
                  <div className="TopSystem-view-details">
                    <FaUserMd className="TopSystem-details-icon" /> View details
                  </div>
                </div>
              </div>

              {showDetailIndex === index && (
                <div className="TopSystem-doctor-card-back">
                  <div className="TopSystem-doctor-detail">
                    <h4>Contact Information</h4>
                    {doctor.email && (
                      <p>
                        <FaEnvelope className="TopSystem-detail-icon" />
                        <a href={`mailto:${doctor.email}`}>{doctor.email}</a>
                      </p>
                    )}
                    {doctor.phoneNumber && (
                      <p>
                        <FaPhone className="TopSystem-detail-icon" />
                        <a href={`tel:${doctor.phoneNumber}`}>
                          {doctor.phoneNumber}
                        </a>
                      </p>
                    )}
                    {doctor.hospitalAddress && (
                      <p>
                        <FaMapMarkerAlt className="TopSystem-detail-icon" />
                        {doctor.hospitalAddress}
                      </p>
                    )}

                    {doctor.biography && (
                      <>
                        <h4>Biography</h4>
                        <p className="TopSystem-doctor-biography">
                          {doctor.biography}
                        </p>
                      </>
                    )}

                    <h4>Consultation Request Statistics</h4>
                    <div className="TopSystem-request-stats">
                      <div className="TopSystem-stat-item">
                        <FaCalendarCheck className="TopSystem-stat-icon" />
                        <span>Total: {doctor.requestCount} requests</span>
                      </div>

                      {doctor.requestsByCategory &&
                        Object.keys(doctor.requestsByCategory).length > 0 && (
                          <div className="TopSystem-category-stats">
                            <h5>By category:</h5>
                            {Object.entries(doctor.requestsByCategory).map(
                              ([category, count]) => (
                                <div
                                  className="TopSystem-category-item"
                                  key={category}
                                >
                                  <FaChild className="TopSystem-category-icon" />
                                  <span>{category}: </span>
                                  <span className="TopSystem-category-count">
                                    {count} requests
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>

                    <div className="TopSystem-doctor-status">
                      <span
                        className={`TopSystem-status-badge ${(
                          doctor.status || "unknown"
                        ).toLowerCase()}`}
                      >
                        {doctor.status || "Unspecified"}
                      </span>
                    </div>

                    <button
                      className="TopSystem-back-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailIndex(null);
                      }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Toggle button for displaying full ranking */}
      <div className="TopSystem-toggle-container">
        <button className="TopSystem-toggle-button" onClick={toggleFullRanking}>
          {showFullRanking ? (
            <>
              <FaChartLine className="TopSystem-toggle-icon" /> Hide detailed
              ranking
            </>
          ) : (
            <>
              <FaListOl className="TopSystem-toggle-icon" /> View full ranking
              (Top 10)
            </>
          )}
        </button>
      </div>

      {/* Full ranking top 10 */}
      {showFullRanking && allTopDoctors.length > 0 && (
        <div className="TopSystem-full-ranking">
          <h3 className="TopSystem-ranking-title">
            <FaListOl className="TopSystem-ranking-icon" /> Top 10 Doctors
            Ranking{" "}
            {selectedMonth !== "all"
              ? `(${formatMonthDisplay(selectedMonth)})`
              : ""}
          </h3>
          <div className="TopSystem-ranking-table-container">
            <table className="TopSystem-ranking-table">
              <thead>
                <tr>
                  <th className="TopSystem-ranking-col-rank">Rank</th>
                  <th className="TopSystem-ranking-col-doctor">Doctor</th>
                  <th className="TopSystem-ranking-col-degree">Specialty</th>
                  <th className="TopSystem-ranking-col-hospital">Hospital</th>
                  <th className="TopSystem-ranking-col-count">Request Count</th>
                </tr>
              </thead>
              <tbody>
                {allTopDoctors.map((doctor, index) => (
                  <tr
                    key={doctor.doctorId}
                    className={`TopSystem-ranking-row ${
                      index < 3 ? "TopSystem-ranking-top3" : ""
                    }`}
                  >
                    <td className="TopSystem-ranking-col-rank">
                      <div
                        className={`TopSystem-ranking-badge rank-${index + 1}`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="TopSystem-ranking-col-doctor">
                      <div className="TopSystem-ranking-doctor-info">
                        <div className="TopSystem-ranking-avatar">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              doctor.name || "Doctor"
                            )}&background=random&color=fff&size=32`}
                            alt={doctor.name}
                          />
                        </div>
                        <span>{doctor.name || "No name"}</span>
                      </div>
                    </td>
                    <td className="TopSystem-ranking-col-degree">
                      {doctor.degree || "No information"}
                    </td>
                    <td className="TopSystem-ranking-col-hospital">
                      {doctor.hospitalName || "No information"}
                    </td>
                    <td className="TopSystem-ranking-col-count">
                      <span className="TopSystem-ranking-count">
                        {doctor.requestCount}
                      </span>
                      <span className="TopSystem-ranking-label">requests</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopSystem;
