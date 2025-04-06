import React, { useState, useEffect } from "react";
import "./DoctorConsultation.css";
import childApi from "../../../../services/childApi";
import doctorApi from "../../../../services/DoctorApi";
import TextEditor from "../../../../pages/Admin/DashboardAdmin/blog/textEditor";
import moment from "moment";
import PopupNotification from "../../../../layouts/Member/popUp/PopupNotification";

// Response Card
function ExpandableResponseCard({ response, request, onClick }) {
  const combinedText = `Date: ${response.responseDate} | Doctor: ${
    response.doctorName
  } | Child: ${request?.childName || "N/A"} | Category: ${
    request?.category || "N/A"
  }`;
  const truncatedText =
    combinedText.length > 100
      ? combinedText.slice(0, 100) + "..."
      : combinedText;

  return (
    <div
      className="consultation-response-card"
      onClick={() => onClick(response)}
    >
      <div className="response-header">
        <span className="response-date">{response.responseDate}</span>
        <span className="response-status">{response.status}</span>
      </div>
      <div className="response-summary">
        <p>
          <strong>Doctor:</strong> {response.doctorName}
        </p>
        <p>
          <strong>Child:</strong> {request?.childName || "N/A"}
        </p>
      </div>
      <div className="truncated-content">{truncatedText}</div>
    </div>
  );
}

// Sent Request Card
function ExpandableSentRequestCard({ request, onClick }) {
  const truncatedText =
    `ID: ${request.requestId} | Child: ${request.childName} | Date: ${request.requestDate} | Description: ${request.description}`.slice(
      0,
      50
    ) + "...";
  return (
    <div className="consultation-sent-card" onClick={() => onClick(request)}>
      <div className="sent-header">
        <span className="sent-date">
          {moment(request.requestDate).format("DD/MM/YYYY HH:mm")}
        </span>
        <span className="sent-status">{request.status}</span>
      </div>
      <div className="sent-summary">
        <p>
          <strong>Child:</strong> {request.childName}
        </p>
        <p>
          <strong>Description:</strong> {request.description.slice(0, 50)}...
        </p>
      </div>
      <div className="truncated-content">{truncatedText}</div>
    </div>
  );
}

// Feedback Card
function ExpandableFeedbackEntry({
  feedback,
  onClick,
  consultationResponses,
  consultationRequests,
}) {
  const truncatedText =
    `Rating: ${feedback.rating} stars`.slice(0, 100) + "...";
  const relatedResponse = consultationResponses.find(
    (resp) => resp.responseId === feedback.responseId
  );
  const relatedRequest = relatedResponse
    ? consultationRequests[relatedResponse.requestId]
    : null;

  return (
    <div
      className="consultation-feedback-card"
      onClick={() => onClick({ feedback, relatedResponse, relatedRequest })}
    >
      <div className="feedback-header">
        <span className="feedback-date">{feedback.feedbackDate}</span>
        <span className="feedback-rating">{feedback.rating} ★</span>
      </div>
      <div className="feedback-summary">
        <p>
          <strong>Comment:</strong> {feedback.comment.slice(0, 50)}...
        </p>
      </div>
      <div className="truncated-content">{truncatedText}</div>
    </div>
  );
}

function DoctorConsultation() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [consultationContent, setConsultationContent] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorSpecializations, setDoctorSpecializations] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  // Consultation Data
  const [consultationResponses, setConsultationResponses] = useState([]);
  const [consultationRequests, setConsultationRequests] = useState({});
  const [sentRequests, setSentRequests] = useState([]);

  // Modal / Feedback Data
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [selectedSentRequest, setSelectedSentRequest] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitError, setFeedbackSubmitError] = useState("");
  const [userFeedback, setUserFeedback] = useState([]);
  const [currentTab, setCurrentTab] = useState("consultation");

  // Steps
  const steps = ["Select Doctor", "Enter Information", "Confirm"];

  useEffect(() => {
    fetchChildren();
    fetchDoctors();
    fetchConsultationResponses();
    fetchSentRequests();
    fetchUserFeedback();
  }, []);

  useEffect(() => {
    setShowFeedbackForm(false);
    setRating(0);
    setComment("");
    setIsSubmitting(false);
    setFeedbackSubmitError("");
  }, [selectedResponse]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const memberId = localStorage.getItem("memberId");
      if (!memberId) throw new Error("Please log in to view the child list");
      const response = await childApi.getByMember(memberId);
      if (response?.data?.data && Array.isArray(response.data.data)) {
        const childrenData = response.data.data.map((child) => ({
          name: child.name,
          childBirth: child.dateOfBirth,
        }));
        setChildren(childrenData);
      } else {
        throw new Error("No child data found");
      }
    } catch (err) {
      setError(err.message || "Unable to load child list");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorApi.getAllDoctors();
      if (response?.data) {
        // Lọc ra những bác sĩ có status "Active" (không phân biệt hoa thường)
        const activeDoctors = response.data.filter(
          (doctor) => doctor.status && doctor.status.toLowerCase() === "active"
        );
        setDoctors(activeDoctors);
        activeDoctors.forEach((doctor) =>
          fetchDoctorSpecializations(doctor.doctorId)
        );
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Unable to load doctor list");
    } finally {
      setLoading(false);
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
      setDoctorSpecializations((prev) => ({ ...prev, [doctorId]: [] }));
    }
  };

  const parseContentToObject = (content) => {
    try {
      return JSON.parse(content);
    } catch (e) {
      if (typeof content === "string") {
        const lines = content.split("\r\n\r\n");
        return { followUp: lines[lines.length - 1] || "" };
      }
      return { followUp: "" };
    }
  };

  // Hàm chỉ lấy danh sách consultation responses
  const fetchConsultationResponses = async () => {
    try {
      const memberId = localStorage.getItem("memberId");
      if (!memberId)
        throw new Error("Please log in to fetch consultation responses");
      const res = await doctorApi.getConsultationResponses(memberId);
      const responses = Array.isArray(res?.data) ? res.data : [res.data];
      const parsedResponses = responses.map((item) => ({
        ...item,
        content:
          typeof item.content === "string"
            ? parseContentToObject(item.content)
            : item.content,
      }));
      setConsultationResponses(parsedResponses);
    } catch (error) {
      console.error("Error fetching consultation responses:", error);
    }
  };

  // Hàm lấy chi tiết consultation request dựa trên requestId
  const fetchConsultationRequestDetail = async (requestId) => {
    try {
      // Nếu chi tiết chưa có trong state thì mới gọi API
      if (!consultationRequests[requestId]) {
        const requestRes = await doctorApi.getConsultationRequestsById(
          requestId
        );
        if (requestRes?.data) {
          setConsultationRequests((prev) => ({
            ...prev,
            [requestId]: requestRes.data,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching consultation request detail:", error);
    }
  };

  // Handler khi người dùng click vào một response cụ thể
  const handleResponseClick = async (response) => {
    if (response.requestId) {
      await fetchConsultationRequestDetail(response.requestId);
    }
    // Sau khi fetch (hoặc nếu đã có), set state để hiển thị modal chi tiết
    setSelectedResponse({
      response,
      request: consultationRequests[response.requestId],
    });
  };

  const fetchSentRequests = async () => {
    try {
      const memberId = localStorage.getItem("memberId");
      const res = await doctorApi.getConsultationRequestsByMemberId(memberId);
      const requestsData = Array.isArray(res.value)
        ? res.data.value
        : Array.isArray(res.data)
        ? res.data
        : [];
      setSentRequests(requestsData);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      setSentRequests([]);
    }
  };

  const fetchUserFeedback = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Please log in to fetch user feedback");
      const res = await doctorApi.getUserFeedbackOData(userId);
      const feedbackData = Array.isArray(res.data.value)
        ? res.data.value
        : Array.isArray(res.data)
        ? res.data
        : [];
      setUserFeedback(feedbackData);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      setUserFeedback([]);
    }
  };

  const handleChildSelect = (child) => setSelectedChild(child);
  const handleNextStep = () =>
    currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const handleBackStep = () =>
    currentStep > 0 && setCurrentStep(currentStep - 1);
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const downloadAttachment = (attachment) => {
    try {
      const { FileName, Content, MimeType } = attachment;
      const byteCharacters = atob(Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: MimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = FileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setSubmitError(null);
      const memberId = localStorage.getItem("memberId");
      if (!memberId) throw new Error("Please log in to continue");
      if (!selectedChild) throw new Error("Please select a child");
      if (!selectedDoctor) throw new Error("Please select a doctor");

      const currentDate = new Date();
      const requestDate = `${currentDate
        .toISOString()
        .slice(0, 10)} ${currentDate.toTimeString().slice(0, 8)}.${currentDate
        .getMilliseconds()
        .toString()
        .padEnd(3, "0")}`;

      // Sử dụng hàm stripHtml thay vì regex đơn giản để loại bỏ các thẻ HTML và ký tự đặc biệt
      const plainDescription = stripHtml(consultationContent).trim();

      const attachments = await Promise.all(
        selectedFiles.map(async (file) => {
          const base64Content = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.readAsDataURL(file);
          });
          return {
            fileName: file.name,
            content: base64Content,
            mimeType: file.type,
          };
        })
      );

      const payload = {
        memberId,
        childName: selectedChild.name,
        childBirth: selectedChild.childBirth,
        doctorId: selectedDoctor.doctorId,
        requestDate,
        status: "Pending",
        category: "Health",
        urgency: "Medium",
        description: plainDescription,
        attachments,
      };

      await doctorApi.createConsultationRequest(payload);
      // Gọi lại fetch dữ liệu để cập nhật giao diện
      await fetchConsultationResponses();
      await fetchSentRequests();

      // Thay vì hiển thị modal success cũ, sử dụng popup
      setPopupType("success");
      setPopupMessage("Consultation request sent successfully!");
      setShowPopup(true);

      // Reset các trạng thái liên quan
      setCurrentStep(0);
      setConsultationContent("");
      setSelectedDoctor(null);
      setSelectedFiles([]);
    } catch (error) {
      setSubmitError(
        error.response?.data?.title ||
          error.message ||
          "Unable to send consultation request"
      );
      setPopupType("error");
      setPopupMessage("Failed to send consultation request. Please try again.");
      setShowPopup(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitFeedbackAndUpdateStatus = async () => {
    try {
      setIsSubmitting(true);
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Please log in to submit feedback");
      const responseId = selectedResponse?.response?.responseId;
      if (!responseId) {
        throw new Error("No response ID found");
      }
      if (rating < 1 || rating > 5) {
        throw new Error("Please select a rating");
      }
      if (!comment.trim()) {
        throw new Error("Comment cannot be empty");
      }
      const feedbackDate = new Date().toISOString();
      const payload = {
        userId,
        responseId,
        rating,
        comment,
        feedbackDate,
        feedbackType: 0,
        status: 0,
      };
      await doctorApi.createRatingFeedback(payload);
      await doctorApi.updateConsultationResponseStatus(responseId, "Completed");
      await fetchConsultationResponses();
      await fetchUserFeedback();
      setPopupType("success");
      setPopupMessage("Feedback submitted successfully!");
      setShowPopup(true);
      setShowFeedbackForm(false);
    } catch (error) {
      setFeedbackSubmitError(error.message || "Unable to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(1); // Move to "Enter Information" step
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Select Doctor
        return (
          <div className="doctor-selection-container">
            {loading ? (
              <div className="loading-state">
                <span className="loading-spinner"></span>
                <p>Loading doctor list...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchDoctors} className="retry-button">
                  Retry
                </button>
              </div>
            ) : doctors.length === 0 ? (
              <p>No doctors found.</p>
            ) : (
              <div className="doctor-selection-grid">
                {doctors.map((doctor) => (
                  <div key={doctor.doctorId} className="doctor-card-grid">
                    <div className="doctor-avatar-grid">
                      <img
                        src={
                          doctor.user?.profilePicture ||
                          `https://ui-avatars.com/api/?name=${doctor.name}&background=random`
                        }
                        alt={doctor.name}
                      />
                    </div>
                    <div className="doctor-info-grid">
                      <h4>{doctor.name}</h4>
                      <p>
                        <strong>Degree:</strong> {doctor.degree}
                      </p>
                      <p>
                        <strong>Hospital:</strong> {doctor.hospitalName}
                      </p>
                      {Array.isArray(
                        doctorSpecializations[doctor.doctorId]
                      ) && (
                        <div className="doctor-specializations-grid">
                          <strong>Specializations:</strong>
                          {doctorSpecializations[doctor.doctorId].map(
                            (spec, index) => (
                              <p
                                key={index}
                                className="doctor-specialization-grid"
                              >
                                {spec.name}
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      className="message-button"
                      onClick={() => handleMessageDoctor(doctor)}
                    >
                      Send Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 1: // Enter Information
        return (
          <div className="doctor-consultation-form">
            <div className="form-container">
              <div className="input-group">
                <label htmlFor="child-select">Select Child</label>
                {loading ? (
                  <div className="loading-state">
                    <span className="loading-spinner"></span>
                    <p>Loading child list...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchChildren} className="retry-button">
                      Retry
                    </button>
                  </div>
                ) : children.length === 0 ? (
                  <p>No children found</p>
                ) : (
                  <select
                    id="child-select"
                    className="doctor-child-select"
                    value={selectedChild?.name || ""}
                    onChange={(e) =>
                      handleChildSelect(
                        children.find((child) => child.name === e.target.value)
                      )
                    }
                  >
                    <option value="">Select a child</option>
                    {children.map((child) => (
                      <option key={child.name} value={child.name}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="input-group">
                <label htmlFor="file-upload">Attach Files</label>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="doctor-file-upload"
                />
                {selectedFiles.length > 0 && (
                  <ul>
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="editor-wrapper">
              <TextEditor
                value={consultationContent}
                onChange={setConsultationContent}
              />
            </div>
          </div>
        );
      case 2: // Confirm
        return (
          <div className="doctor-review-container">
            <div className="review-section">
              <h3 className="doctor-section-title">Review Information</h3>
              <div className="review-item">
                <strong>Child:</strong> {selectedChild?.name || "Not selected"}
              </div>
              <div className="review-item consultation-details">
                <strong>Details:</strong>
                <div
                  className="consultation-details-content"
                  dangerouslySetInnerHTML={{ __html: consultationContent }}
                />
              </div>
              {selectedFiles.length > 0 && (
                <div className="review-item">
                  <strong>Attached Files:</strong>
                  <ul>
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {selectedDoctor && (
              <div className="doctor-review-section">
                <h4 className="doctor-section-title">Selected Doctor</h4>
                <div className="doctor-profile-card selected">
                  <div className="doctor-profile-header">
                    <img
                      src={
                        selectedDoctor.user?.profilePicture ||
                        `https://ui-avatars.com/api/?name=${selectedDoctor.name}&background=random`
                      }
                      alt={selectedDoctor.name}
                      className="doctor-profile-avatar"
                    />
                    <div className="doctor-profile-info">
                      <h4 className="doctor-profile-name">
                        {selectedDoctor.name}
                      </h4>
                    </div>
                  </div>
                  <div className="doctor-profile-details">
                    <p className="doctor-profile-degree">
                      {selectedDoctor.degree}
                    </p>
                    <p className="doctor-profile-hospital">
                      {selectedDoctor.hospitalName}
                    </p>
                    {Array.isArray(
                      doctorSpecializations[selectedDoctor.doctorId]
                    ) && (
                      <div className="doctor-specializations">
                        {doctorSpecializations[selectedDoctor.doctorId].map(
                          (spec, index) => (
                            <p
                              key={index}
                              className="doctor-profile-specialization"
                            >
                              {spec.name}
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="submit-section">
              {submitError && <div className="submit-error">{submitError}</div>}
              <button
                className="doctor-action-button"
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? "Sending..." : "Complete"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render Tab Content
  const renderTabContent = () => {
    switch (currentTab) {
      case "consultation":
        return (
          <div className="doctor-request-column">
            <div className="progress-bar">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`progress-step ${
                      currentStep === index
                        ? "active"
                        : currentStep > index
                        ? "completed"
                        : ""
                    }`}
                  >
                    <div className="progress-step-circle">{index + 1}</div>
                    <span>{step}</span>
                  </div>
                  {index !== steps.length - 1 && (
                    <div
                      className={`progress-line ${
                        currentStep > index ? "completed" : ""
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <section className="doctor-form-content">
              {renderStepContent()}
              <div className="doctor-navigation-buttons">
                {currentStep > 0 && (
                  <button
                    className="doctor-back-button"
                    onClick={handleBackStep}
                  >
                    Back
                  </button>
                )}
                {currentStep < steps.length - 1 && currentStep > 0 && (
                  <button
                    className="doctor-next-button"
                    onClick={handleNextStep}
                  >
                    Next
                  </button>
                )}
              </div>
            </section>
          </div>
        );

      case "responses":
        return consultationResponses.length > 0 ? (
          consultationResponses.map((resp, index) => (
            <ExpandableResponseCard
              key={index}
              response={resp}
              request={consultationRequests[resp.requestId]}
              onClick={handleResponseClick}
            />
          ))
        ) : (
          <p>No responses available.</p>
        );

      case "sentRequests":
        return sentRequests.length > 0 ? (
          sentRequests.map((req, index) => (
            <ExpandableSentRequestCard
              key={index}
              request={req}
              onClick={setSelectedSentRequest}
            />
          ))
        ) : (
          <p>No sent requests available.</p>
        );

      case "feedback":
        return userFeedback.length > 0 ? (
          userFeedback.map((fb, index) => (
            <ExpandableFeedbackEntry
              key={index}
              feedback={fb}
              consultationResponses={consultationResponses || []}
              consultationRequests={consultationRequests || {}}
              onClick={(data) => setSelectedFeedback(data)}
            />
          ))
        ) : (
          <p>No feedback available.</p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="doctor-consultation">
      {/* Top Tabs */}
      <div className="top-tab-container">
        <button
          className={`top-tab-button ${
            currentTab === "consultation" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("consultation")}
        >
          Consultation
        </button>
        <button
          className={`top-tab-button ${
            currentTab === "responses" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("responses")}
        >
          Responses
        </button>
        <button
          className={`top-tab-button ${
            currentTab === "sentRequests" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("sentRequests")}
        >
          Sent Requests
        </button>
        <button
          className={`top-tab-button ${
            currentTab === "feedback" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("feedback")}
        >
          Feedback
        </button>
      </div>

      {/* Main Content */}
      <div className="tab-content">{renderTabContent()}</div>

      {/* Response Modal */}
      {selectedResponse && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedResponse(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedResponse(null)}
            >
              ×
            </button>
            <h3 className="modal-title">Response Details</h3>
            <button
              className="feedback-button"
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              style={{ marginBottom: "15px" }}
            >
              {showFeedbackForm ? "Hide Feedback" : "Submit Feedback"}
            </button>
            <div className="response-details">
              <div className="request-section">
                <h4>Request Information</h4>
                {selectedResponse.request ? (
                  <>
                    <p>
                      <strong>Member:</strong>{" "}
                      {selectedResponse.request.memberName}
                    </p>
                    <p>
                      <strong>Child:</strong>{" "}
                      {selectedResponse.request.childName}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedResponse.request.description}
                    </p>
                    <p>
                      <strong>Request Date:</strong>{" "}
                      {selectedResponse.request.requestDate}
                    </p>
                  </>
                ) : (
                  <p>No request details available.</p>
                )}
              </div>
              <div className="response-section">
                <h4>Response Information</h4>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedResponse.response.responseDate}
                </p>
                <p>
                  <strong>Doctor:</strong>{" "}
                  {selectedResponse.response.doctorName}
                </p>
                <p>
                  <strong>Status:</strong> {selectedResponse.response.status}
                </p>
                <p>
                  <strong>Follow-up:</strong>{" "}
                  {selectedResponse.response.content.followUp || "N/A"}
                </p>
              </div>
              {showFeedbackForm && (
                <div className="feedback-form">
                  <h4>Feedback</h4>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= rating ? "selected" : ""}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="input-group">
                    <label>Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter your feedback..."
                      rows="4"
                      className="feedback-textarea"
                    />
                  </div>
                  <button
                    className="submit-feedback-button"
                    onClick={handleSubmitFeedbackAndUpdateStatus}
                    disabled={isSubmitting || rating < 1 || !comment.trim()}
                  >
                    {isSubmitting ? "Sending..." : "Submit Feedback"}
                  </button>
                  {feedbackSubmitError && (
                    <p className="submit-error">{feedbackSubmitError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sent Request Modal */}
      {selectedSentRequest && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSentRequest(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedSentRequest(null)}
            >
              ×
            </button>
            <h3 className="modal-title">Sent Request Details</h3>
            <div className="response-details">
              <div className="request-section">
                <h4>Request Information</h4>
                <p>
                  <strong>ID:</strong> {selectedSentRequest.requestId}
                </p>
                <p>
                  <strong>Child:</strong> {selectedSentRequest.childName}
                </p>
                <p>
                  <strong>Category:</strong> {selectedSentRequest.category}
                </p>
                <p>
                  <strong>Urgency:</strong> {selectedSentRequest.urgency}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedSentRequest.description}
                </p>
                <p>
                  <strong>Request Date:</strong>{" "}
                  {selectedSentRequest.requestDate}
                </p>
                <p>
                  <strong>Status:</strong> {selectedSentRequest.status}
                </p>
                {selectedSentRequest.attachments && (
                  <div>
                    <h4>Attachments</h4>
                    {JSON.parse(selectedSentRequest.attachments).map(
                      (attachment, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                          <p>{attachment.fileName}</p>
                          <button
                            className="download-button"
                            onClick={() => downloadAttachment(attachment)}
                          >
                            Download
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {selectedFeedback && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedFeedback(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedFeedback(null)}
            >
              ×
            </button>
            <h3 className="modal-title">Feedback Details</h3>
            <div className="response-details">
              <div className="feedback-section">
                <h4>Feedback Information</h4>
                <p>
                  <strong>Rating:</strong> {selectedFeedback.feedback.rating} ★
                </p>
                <p>
                  <strong>Comment:</strong> {selectedFeedback.feedback.comment}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedFeedback.feedback.feedbackDate}
                </p>
              </div>
              {selectedFeedback.relatedResponse && (
                <div className="response-section">
                  <h4>Response Information</h4>
                  <p>
                    <strong>Date:</strong>{" "}
                    {selectedFeedback.relatedResponse.responseDate || "N/A"}
                  </p>
                  <p>
                    <strong>Doctor:</strong>{" "}
                    {selectedFeedback.relatedResponse.doctorName || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedFeedback.relatedResponse.status || "N/A"}
                  </p>
                  <p>
                    <strong>Follow-up:</strong>{" "}
                    {selectedFeedback.relatedResponse.content?.followUp ||
                      "N/A"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showPopup && (
        <PopupNotification
          type={popupType}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

export default DoctorConsultation;
