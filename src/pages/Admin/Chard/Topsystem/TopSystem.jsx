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

  // State mới cho phần lọc theo tháng
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        setLoading(true);

        // 1. Lấy tất cả các yêu cầu tư vấn từ API
        console.log("Đang lấy dữ liệu yêu cầu tư vấn...");
        const consultationResponse = await axios.get(
          "https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/ConsultationRequests"
        );

        console.log("Dữ liệu API trả về:", consultationResponse.data);

        // Kiểm tra cấu trúc response và lấy mảng data từ response
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
          throw new Error("Dữ liệu API không đúng định dạng");
        }

        console.log("Danh sách yêu cầu sau khi xử lý:", requests);

        // Tìm các tháng có sẵn từ dữ liệu yêu cầu
        const months = {};
        requests.forEach((request) => {
          if (request && request.requestDate) {
            const date = new Date(request.requestDate);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
            months[monthKey] = true;
          }
        });

        // Sắp xếp các tháng theo thứ tự giảm dần (mới đến cũ)
        const sortedMonths = Object.keys(months).sort((a, b) =>
          b.localeCompare(a)
        );
        setAvailableMonths(sortedMonths);

        // Khởi tạo với tất cả các tháng
        processRequestsByMonth(requests, "all");
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu top bác sĩ:", err);
        setError("Không thể tải dữ liệu bác sĩ. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchTopDoctors();
  }, []);

  // Hàm mới để xử lý yêu cầu theo tháng
  const processRequestsByMonth = async (allRequests, monthFilter) => {
    try {
      // Lọc yêu cầu theo tháng nếu không phải 'all'
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

      // 2. Đếm số lượng yêu cầu cho mỗi bác sĩ
      const doctorCounts = {};
      filteredRequests.forEach((request) => {
        if (request && request.doctorId) {
          doctorCounts[request.doctorId] =
            (doctorCounts[request.doctorId] || 0) + 1;
        }
      });

      console.log(
        `Số lượng yêu cầu theo bác sĩ (${monthFilter}):`,
        doctorCounts
      );

      // 3. Sắp xếp và lấy top 10
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

      // 4. Tạo mảng promises để lấy thông tin bác sĩ từ API
      const doctorPromises = top10DoctorIds.map(async (id) => {
        try {
          console.log(`Đang lấy thông tin bác sĩ ID ${id}...`);
          const doctorResponse = await axios.get(
            `https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/Doctors/${id}`
          );

          // Kiểm tra cấu trúc response doctor
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
          console.error(`Lỗi khi lấy thông tin bác sĩ ID ${id}:`, err);
          // Trả về dữ liệu giả nếu không lấy được thông tin chi tiết
          return {
            doctorId: id,
            name: `Bác sĩ ID: ${id}`,
            degree: "Không có thông tin",
            hospitalName: "Không có thông tin",
            requestCount: doctorCounts[id],
            status: "Unknown",
          };
        }
      });

      const doctorsInfo = await Promise.all(doctorPromises);
      console.log(
        `Danh sách bác sĩ đã lấy thông tin (${monthFilter}):`,
        doctorsInfo
      );

      setTopDoctors(doctorsInfo.slice(0, 3)); // Lấy 3 bác sĩ đầu tiên cho top 3
      setAllTopDoctors(doctorsInfo); // Lưu toàn bộ danh sách top 10
      setSelectedMonth(monthFilter);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi xử lý dữ liệu theo tháng:", err);
      setError("Không thể xử lý dữ liệu theo tháng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Hàm phụ để tính toán thống kê theo danh mục
  const getCategoryStats = (requests, doctorId) => {
    const categories = {};
    const doctorRequests = requests.filter((req) => req.doctorId === doctorId);

    doctorRequests.forEach((req) => {
      const category = req.category || "Khác";
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
      // Lấy lại dữ liệu yêu cầu tư vấn
      const consultationResponse = await axios.get(
        "https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/ConsultationRequests"
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
        throw new Error("Dữ liệu API không đúng định dạng");
      }

      // Xử lý dữ liệu theo tháng đã chọn
      await processRequestsByMonth(requests, monthKey);

      // Đóng bộ lọc tháng sau khi đã chọn
      setShowMonthFilter(false);
    } catch (err) {
      console.error("Lỗi khi thay đổi tháng:", err);
      setError(
        "Không thể tải dữ liệu cho tháng đã chọn. Vui lòng thử lại sau."
      );
      setLoading(false);
    }
  };

  // Định dạng hiển thị tháng từ khóa YYYY-MM
  const formatMonthDisplay = (monthKey) => {
    if (monthKey === "all") return "Tất cả thời gian";

    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  };

  if (loading)
    return (
      <div className="TopSystem-loading">
        <div className="TopSystem-loading-spinner"></div>
        <p>Đang tải dữ liệu bác sĩ...</p>
      </div>
    );

  if (error) return <div className="TopSystem-error">{error}</div>;

  // Hiển thị thông báo nếu không có dữ liệu
  if (topDoctors.length === 0) {
    return (
      <div className="TopSystem-container">
        <h2 className="TopSystem-title">
          <FaMedal className="TopSystem-title-icon" /> Top Bác Sĩ Được Yêu Cầu
          Nhiều Nhất
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
                  Tất cả thời gian
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
          Không có dữ liệu về yêu cầu tư vấn bác sĩ cho{" "}
          {formatMonthDisplay(selectedMonth).toLowerCase()}.
        </div>
      </div>
    );
  }

  return (
    <div className="TopSystem-container">
      <h2 className="TopSystem-title">
        <FaMedal className="TopSystem-title-icon" /> Top Bác Sĩ Được Yêu Cầu
        Nhiều Nhất
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
                Tất cả thời gian
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

      {/* Top 3 bác sĩ với card nổi bật */}
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
                  <h3>{doctor.name || "Không có tên"}</h3>
                  <p className="TopSystem-doctor-degree">
                    {doctor.degree || "Không có thông tin"}
                  </p>
                  <p className="TopSystem-doctor-hospital">
                    <FaHospital className="TopSystem-info-icon" />{" "}
                    {doctor.hospitalName || "Không có thông tin"}
                  </p>
                  <div className="TopSystem-request-count">
                    <span className="TopSystem-count-number">
                      {doctor.requestCount}
                    </span>
                    <span className="TopSystem-count-label">
                      yêu cầu tư vấn
                    </span>
                  </div>
                  <div className="TopSystem-view-details">
                    <FaUserMd className="TopSystem-details-icon" /> Xem chi tiết
                  </div>
                </div>
              </div>

              {showDetailIndex === index && (
                <div className="TopSystem-doctor-card-back">
                  <div className="TopSystem-doctor-detail">
                    <h4>Thông tin liên hệ</h4>
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
                        <h4>Tiểu sử</h4>
                        <p className="TopSystem-doctor-biography">
                          {doctor.biography}
                        </p>
                      </>
                    )}

                    <h4>Thống kê yêu cầu tư vấn</h4>
                    <div className="TopSystem-request-stats">
                      <div className="TopSystem-stat-item">
                        <FaCalendarCheck className="TopSystem-stat-icon" />
                        <span>Tổng số: {doctor.requestCount} yêu cầu</span>
                      </div>

                      {doctor.requestsByCategory &&
                        Object.keys(doctor.requestsByCategory).length > 0 && (
                          <div className="TopSystem-category-stats">
                            <h5>Theo danh mục:</h5>
                            {Object.entries(doctor.requestsByCategory).map(
                              ([category, count]) => (
                                <div
                                  className="TopSystem-category-item"
                                  key={category}
                                >
                                  <FaChild className="TopSystem-category-icon" />
                                  <span>{category}: </span>
                                  <span className="TopSystem-category-count">
                                    {count} yêu cầu
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
                        {doctor.status || "Không xác định"}
                      </span>
                    </div>

                    <button
                      className="TopSystem-back-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailIndex(null);
                      }}
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nút chuyển đổi hiển thị bảng xếp hạng đầy đủ */}
      <div className="TopSystem-toggle-container">
        <button className="TopSystem-toggle-button" onClick={toggleFullRanking}>
          {showFullRanking ? (
            <>
              <FaChartLine className="TopSystem-toggle-icon" /> Ẩn bảng xếp hạng
              chi tiết
            </>
          ) : (
            <>
              <FaListOl className="TopSystem-toggle-icon" /> Xem bảng xếp hạng
              đầy đủ (Top 10)
            </>
          )}
        </button>
      </div>

      {/* Bảng xếp hạng đầy đủ top 10 */}
      {showFullRanking && allTopDoctors.length > 0 && (
        <div className="TopSystem-full-ranking">
          <h3 className="TopSystem-ranking-title">
            <FaListOl className="TopSystem-ranking-icon" /> Bảng Xếp Hạng Top 10
            Bác Sĩ{" "}
            {selectedMonth !== "all"
              ? `(${formatMonthDisplay(selectedMonth)})`
              : ""}
          </h3>
          <div className="TopSystem-ranking-table-container">
            <table className="TopSystem-ranking-table">
              <thead>
                <tr>
                  <th className="TopSystem-ranking-col-rank">Xếp hạng</th>
                  <th className="TopSystem-ranking-col-doctor">Bác sĩ</th>
                  <th className="TopSystem-ranking-col-degree">Chuyên môn</th>
                  <th className="TopSystem-ranking-col-hospital">Bệnh viện</th>
                  <th className="TopSystem-ranking-col-count">Số yêu cầu</th>
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
                        <span>{doctor.name || "Không có tên"}</span>
                      </div>
                    </td>
                    <td className="TopSystem-ranking-col-degree">
                      {doctor.degree || "Không có thông tin"}
                    </td>
                    <td className="TopSystem-ranking-col-hospital">
                      {doctor.hospitalName || "Không có thông tin"}
                    </td>
                    <td className="TopSystem-ranking-col-count">
                      <span className="TopSystem-ranking-count">
                        {doctor.requestCount}
                      </span>
                      <span className="TopSystem-ranking-label">yêu cầu</span>
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
