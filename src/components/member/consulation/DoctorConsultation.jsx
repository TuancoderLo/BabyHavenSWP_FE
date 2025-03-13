import React, { useState, useEffect } from "react";
import "./DoctorConsultation.css";
import childApi from "../../../services/childApi";
import doctorApi from "../../../services/DoctorApi";
import TextEditor from "../../../components/admin/Component_Sidebar/blog/textEditor";

function DoctorConsultation() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [consultationContent, setConsultationContent] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorSpecializations, setDoctorSpecializations] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Add steps variable
  const steps = ["Enter Information", "Select Doctor", "Confirm"];

  useEffect(() => {
    fetchChildren();
    fetchDoctors();
    fetchCategories();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const memberId = localStorage.getItem("memberId");
      console.log("MemberId from localStorage:", memberId);

      if (!memberId) {
        throw new Error("Vui lòng đăng nhập để xem danh sách trẻ em");
      }

      const response = await childApi.getByMember(memberId);
      console.log("API Response:", response);

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const childrenData = response.data.data.map((child) => ({
          name: child.name,
          childBirth: child.dateOfBirth,
        }));
        console.log("Processed children data:", childrenData);
        setChildren(childrenData);
      } else {
        throw new Error("Không tìm thấy dữ liệu trẻ em");
      }
    } catch (err) {
      console.error("Error in fetchChildren:", err);
      setError(err.message || "Không thể tải danh sách trẻ em");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await doctorApi.getAllDoctors();
      if (response?.data) {
        setDoctors(response.data);
        // Fetch specializations for each doctor
        response.data.forEach((doctor) => {
          fetchDoctorSpecializations(doctor.doctorId);
        });
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchDoctorSpecializations = async (doctorId) => {
    try {
      const response = await doctorApi.getDoctorSpecializations(doctorId);
      if (response?.data) {
        setDoctorSpecializations((prev) => ({
          ...prev,
          [doctorId]: response.data || [],
        }));
      }
    } catch (error) {
      console.error(
        `Error fetching specializations for doctor ${doctorId}:`,
        error
      );
      // Nếu có lỗi, set một mảng rỗng cho doctor đó
      setDoctorSpecializations((prev) => ({
        ...prev,
        [doctorId]: [],
      }));
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await doctorApi.getConsultationRequests();
      if (response?.data) {
        // Get unique categories from the response
        const uniqueCategories = [
          ...new Set(response.data.map((req) => req.category)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Thêm hàm helper để loại bỏ HTML tags
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setSubmitError(null);

      const memberId = localStorage.getItem("memberId");
      if (!memberId) {
        throw new Error("Vui lòng đăng nhập để tiếp tục");
      }

      if (!selectedChild) {
        throw new Error("Vui lòng chọn trẻ");
      }

      if (!selectedDoctor) {
        throw new Error("Vui lòng chọn bác sĩ");
      }

      if (!selectedCategory) {
        throw new Error("Vui lòng chọn category");
      }

      // Format ngày giờ theo định dạng yêu cầu
      const currentDate = new Date();
      const requestDate =
        currentDate.toISOString().slice(0, 10) +
        " " +
        currentDate.toTimeString().slice(0, 8) +
        "." +
        currentDate.getMilliseconds().toString().padEnd(3, "0");

      // Xử lý nội dung từ CKEditor, loại bỏ HTML tags
      const plainDescription = stripHtml(consultationContent);

      const payload = {
        memberId: memberId,
        childName: selectedChild.name,
        childBirth: selectedChild.childBirth,
        doctorId: selectedDoctor.doctorId,
        requestDate: requestDate,
        status: selectedDoctor.status.toLowerCase() === "active" ? 1 : 0,
        urgency: "high",
        category: selectedCategory,
        description: plainDescription,
      };

      console.log("Submitting payload:", payload);

      const response = await doctorApi.createConsultationRequest(payload);
      console.log("Submit response:", response);

      alert("Gửi yêu cầu tư vấn thành công!");
      setCurrentStep(0);
      setSelectedCategory("");
      setConsultationContent("");
      setSelectedDoctor(null);
    } catch (error) {
      console.error("Error submitting consultation:", error);
      setSubmitError(
        error.response?.data?.title ||
          error.message ||
          "Không thể gửi yêu cầu tư vấn"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="doctor-consultation-form">
            <div className="doctor-category-container">
              <div className="doctor-section-title">
                Select Consultation Category:
              </div>
              <select
                className="doctor-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={loadingCategories}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {loadingCategories && (
                <div className="loading-spinner-small"></div>
              )}
            </div>

            <div className="doctor-editor-container">
              <div className="doctor-section-title">Consultation Details:</div>
              <TextEditor
                value={consultationContent}
                onChange={(newContent) => setConsultationContent(newContent)}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="doctor-selection-container">
            <div className="doctor-section">
              <h3 className="doctor-section-heading">Available doctors</h3>
              <div className="doctor-cards">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.doctorId}
                    className={`doctor-card ${
                      selectedDoctor?.doctorId === doctor.doctorId
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="doctor-avatar">
                      <img
                        src={
                          doctor.user?.profilePicture ||
                          `https://ui-avatars.com/api/?name=${doctor.name}&background=random`
                        }
                        alt={doctor.name}
                      />
                    </div>
                    <div className="doctor-info">
                      <h4>{doctor.name}</h4>
                      <div className="doctor-status">
                        <span
                          className={`status-dot ${doctor.status.toLowerCase()}`}
                        ></span>
                        {doctor.status}
                      </div>
                      <p className="doctor-degree">{doctor.degree}</p>
                      <p className="doctor-hospital">{doctor.hospitalName}</p>
                      {Array.isArray(doctorSpecializations[doctor.doctorId]) &&
                        doctorSpecializations[doctor.doctorId].map(
                          (spec, index) => (
                            <p key={index} className="doctor-specialization">
                              {spec.name}
                            </p>
                          )
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="doctor-section">
              <h3 className="doctor-section-heading">All doctors</h3>
              <div className="doctor-list">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.doctorId}
                    className={`doctor-list-item ${
                      selectedDoctor?.doctorId === doctor.doctorId
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="doctor-name">
                      {doctor.name}
                      <span
                        className={`status-dot ${doctor.status.toLowerCase()}`}
                      ></span>
                    </div>
                    <div className="doctor-details">
                      <span>{doctor.degree}</span>
                      <span>{doctor.hospitalName}</span>
                      <div className="doctor-specializations">
                        {Array.isArray(
                          doctorSpecializations[doctor.doctorId]
                        ) &&
                          doctorSpecializations[doctor.doctorId].map(
                            (spec, index) => (
                              <span key={index} className="specialization-tag">
                                {spec.name}
                              </span>
                            )
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="doctor-review-container">
            <div className="doctor-review-content">
              <div className="doctor-section-title">
                Review Consultation Information
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Category:</strong> {selectedCategory}
              </div>
              <div className="consultation-details">
                <strong>Details:</strong>
                <div
                  className="consultation-details-content ck-content-display"
                  dangerouslySetInnerHTML={{ __html: consultationContent }}
                />
              </div>
            </div>

            {selectedDoctor && (
              <div className="doctor-review-selection">
                <div className="doctor-section-title">Selected Doctor</div>
                <div className="doctor-profile-card selected">
                  <div className="doctor-profile-header">
                    <div className="doctor-profile-avatar">
                      <img
                        src={
                          selectedDoctor.user?.profilePicture ||
                          `https://ui-avatars.com/api/?name=${selectedDoctor.name}&background=random`
                        }
                        alt={selectedDoctor.name}
                      />
                    </div>
                    <div className="doctor-profile-info">
                      <div className="doctor-profile-name">
                        {selectedDoctor.name}
                      </div>
                      <div className="doctor-profile-status">
                        <span
                          className={`doctor-status-dot ${selectedDoctor.status.toLowerCase()}`}
                        ></span>
                        {selectedDoctor.status}
                      </div>
                    </div>
                  </div>
                  <div className="doctor-profile-details">
                    <div className="doctor-profile-degree">
                      {selectedDoctor.degree}
                    </div>
                    <div className="doctor-profile-hospital">
                      {selectedDoctor.hospitalName}
                    </div>
                    {Array.isArray(
                      doctorSpecializations[selectedDoctor.doctorId]
                    ) &&
                      doctorSpecializations[selectedDoctor.doctorId].map(
                        (spec, index) => (
                          <div
                            key={index}
                            className="doctor-profile-specialization"
                          >
                            {spec.name}
                          </div>
                        )
                      )}
                  </div>
                </div>
              </div>
            )}

            <div className="doctor-submit-section">
              {submitError && <div className="submit-error">{submitError}</div>}
              <button
                className="doctor-action-button"
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? "Đang gửi..." : "Complete"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="doctor-consultation">
      <div className="doctor-sidebar">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading children...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchChildren} className="retry-button">
              Retry
            </button>
          </div>
        ) : children.length === 0 ? (
          <div className="empty-state">
            <p>No children found</p>
          </div>
        ) : (
          children.map((child, index) => (
            <div
              key={index}
              className={`doctor-child-item ${
                selectedChild?.name === child.name ? "selected" : ""
              }`}
              onClick={() => handleChildSelect(child)}
            >
              <div className="doctor-child-icon">
                <i className="fas fa-child"></i>
              </div>
              <div className="doctor-child-label">{child.name}</div>
            </div>
          ))
        )}
      </div>

      <div className="doctor-content">
        <div className="doctor-steps">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`doctor-step-item ${
                currentStep === index ? "active" : ""
              }`}
              onClick={() => setCurrentStep(index)}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="doctor-form-content">
          {renderStepContent()}
          <button className="doctor-action-button" onClick={handleNextStep}>
            {currentStep === steps.length - 1 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorConsultation;