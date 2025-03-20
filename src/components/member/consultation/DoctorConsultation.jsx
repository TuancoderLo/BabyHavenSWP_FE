import React, { useState, useEffect } from "react";
import "./DoctorConsultation.css";
import childApi from "../../../services/childApi";
import doctorApi from "../../../services/DoctorApi";
import TextEditor from "../../../components/admin/Component_Sidebar/blog/textEditor";

function ExpandableResponseCard({ response, onClick, limit = 100 }) {
  const combinedText = `Date: ${response.responseDate} ${response.doctorName ? "By: " + response.doctorName : ""
    }. Greetings: ${response.content.greeting}. Approval: ${response.content.approvalMessage
    }. Advice: ${response.content.advice}. Follow-Up: ${response.content.followUp}`;
  const truncatedText =
    combinedText.length > limit ? combinedText.slice(0, limit) + "..." : combinedText;

  return (
    <div className="consultation-response-card" onClick={() => onClick(response)}>
      <div className="truncated-content">
        {truncatedText}
        {combinedText.length > limit && <div className="fade-overlay"></div>}
      </div>
    </div>
  );
}

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
  const steps = ["Enter Information", "Select Doctor", "Confirm"];
  const [consultationResponses, setConsultationResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [urgency, setUrgency] = useState("Low");

  useEffect(() => {
    fetchChildren();
    fetchDoctors();
    fetchCategories();
    fetchConsultationResponses();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const memberId = localStorage.getItem("memberId");
      if (!memberId) {
        throw new Error("Vui lòng đăng nhập để xem danh sách trẻ em");
      }
      const response = await childApi.getByMember(memberId);
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const childrenData = response.data.data.map((child) => ({
          name: child.name,
          childBirth: child.dateOfBirth,
        }));
        setChildren(childrenData);
      } else {
        throw new Error("Không tìm thấy dữ liệu trẻ em");
      }
    } catch (err) {
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
        const uniqueCategories = [...new Set(response.data.map((req) => req.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const parseContentToObject = (content) => {
    try {
      return JSON.parse(content);
    } catch (e) {
      const lines = content.split("\r\n\r\n");
      const greeting = lines[0] || "";
      const approvalMessage = lines[1] || "";
      const adviceLines = lines.slice(2, lines.length - 1).join("\n");
      const followUp = lines[lines.length - 1] || "";
      return {
        greeting,
        approvalMessage,
        advice: adviceLines,
        followUp,
      };
    }
  };

  const fetchConsultationResponses = async () => {
    try {
      const res = await doctorApi.getConsultationResponse();
      let responses = [];
      if (res && res.data) {
        responses = Array.isArray(res.data) ? res.data : [res.data];
      }
      const parsedResponses = responses.map((item) => ({
        ...item,
        content: parseContentToObject(item.content),
      }));
      setConsultationResponses(parsedResponses);
    } catch (error) {
      console.error("Error fetching consultation responses:", error);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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
      const currentDate = new Date();
      const requestDate =
        currentDate.toISOString().slice(0, 10) +
        " " +
        currentDate.toTimeString().slice(0, 8) +
        "." +
        currentDate.getMilliseconds().toString().padEnd(3, "0");

      const plainDescription = stripHtml(consultationContent);

      const payload = {
        memberId: memberId,
        childName: selectedChild.name,
        childBirth: selectedChild.childBirth,
        doctorId: selectedDoctor.doctorId,
        requestDate: requestDate,
        status: "pending",
        urgency: urgency,
        ...(selectedCategory && { category: selectedCategory }),
        description: plainDescription,
      };

      const createdRequest = await doctorApi.createConsultationRequest(payload);
      await fetchConsultationResponses();
      alert("Gửi yêu cầu tư vấn thành công!");
      setCurrentStep(0);
      setSelectedCategory("");
      setConsultationContent("");
      setSelectedDoctor(null);
    } catch (error) {
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
            <div className="doctor-section-title">Consultation Information</div>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#666" }}>
                  Category
                </label>
                <select
                  className="doctor-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Growth">Growth</option>
                  <option value="Health">Health</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Other">Other</option>
                </select>
                {loadingCategories && <div className="loading-spinner-small"></div>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#666" }}>
                  Urgency
                </label>
                <select
                  className="doctor-urgency-select"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="doctor-editor-container">
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
              <h3 className="doctor-section-title">Select a Doctor</h3>
              <div className="doctor-cards">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.doctorId}
                    className={`doctor-card ${selectedDoctor?.doctorId === doctor.doctorId ? "selected" : ""
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
                      <div className="doctor-status">{doctor.status}</div>
                      <p className="doctor-degree">{doctor.degree}</p>
                      <p className="doctor-hospital">{doctor.hospitalName}</p>
                      {Array.isArray(doctorSpecializations[doctor.doctorId]) &&
                        doctorSpecializations[doctor.doctorId].map((spec, index) => (
                          <p key={index} className="doctor-specialization">
                            {spec.name}
                          </p>
                        ))}
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
              <div className="doctor-section-title">Review Consultation Information</div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Category:</strong> {selectedCategory}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Urgency:</strong> {urgency}
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
                      <div className="doctor-profile-name">{selectedDoctor.name}</div>
                      <div className="doctor-profile-status">{selectedDoctor.status}</div>
                    </div>
                  </div>
                  <div className="doctor-profile-details">
                    <div className="doctor-profile-degree">{selectedDoctor.degree}</div>
                    <div className="doctor-profile-hospital">
                      {selectedDoctor.hospitalName}
                    </div>
                    {Array.isArray(doctorSpecializations[selectedDoctor.doctorId]) &&
                      doctorSpecializations[selectedDoctor.doctorId].map((spec, index) => (
                        <div key={index} className="doctor-profile-specialization">
                          {spec.name}
                        </div>
                      ))}
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
      <div className="doctor-grid-container">
        <div className="doctor-child-column">
          <h3 className="section-title">Select Child</h3>
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
                  className={`doctor-child-item ${selectedChild?.name === child.name ? "selected" : ""
                    }`}
                  onClick={() => handleChildSelect(child)}
                >
                  <div className="doctor-child-content">
                    <i className="fas fa-child"></i>
                    <span className="doctor-child-label">{child.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="doctor-request-column">
          <div className="doctor-request">
            <div className="doctor-steps">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`doctor-step-item ${currentStep === index ? "active" : ""}`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="doctor-form-content">
              {renderStepContent()}
              <div className="doctor-navigation-buttons">
                {currentStep > 0 && (
                  <button className="doctor-back-button" onClick={handleBackStep}>
                    Back
                  </button>
                )}
                {currentStep < steps.length - 1 && (
                  <button className="doctor-next-button" onClick={handleNextStep}>
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="doctor-response-column">
          <h3 className="section-title">Consultation Responses</h3>
          <div className="doctor-response">
            {consultationResponses.length > 0 ? (
              consultationResponses.map((resp, index) => (
                <ExpandableResponseCard
                  key={index}
                  response={resp}
                  onClick={setSelectedResponse}
                />
              ))
            ) : (
              <p>No consultation response available.</p>
            )}
          </div>
        </div>
      </div>
      {selectedResponse && (
        <div className="modal-overlay" onClick={() => setSelectedResponse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedResponse(null)}>
              ×
            </button>
            <div className="response-header">
              <div className="response-date">{selectedResponse.responseDate}</div>
              {selectedResponse.doctorName && (
                <div className="response-doctor">By: {selectedResponse.doctorName}</div>
              )}
            </div>
            <div className="response-content">
              <p>
                <strong>Greetings:</strong> {selectedResponse.content.greeting}
              </p>
              <p>
                <strong>Approval Message:</strong>{" "}
                {selectedResponse.content.approvalMessage}
              </p>
              <p>
                <strong>Advice:</strong> {selectedResponse.content.advice}
              </p>
              <p>
                <strong>Follow-Up:</strong> {selectedResponse.content.followUp}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorConsultation;