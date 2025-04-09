import React, { useState, useEffect } from "react";
import "./DoctorConsultation.css";
import childApi from "../../../../services/childApi";
import doctorApi from "../../../../services/DoctorApi";
import TextEditor from "../../../../pages/Admin/DashboardAdmin/blog/textEditor";
import moment from "moment";
import doctorImage from "../../../../data/doctorImages";
import PopupNotification from "../../../../layouts/Member/popUp/PopupNotification";

// Hàm định dạng thời gian từ chuỗi ISO - Chỉ hiển thị ngày tháng năm
const formatDateTime = (isoString) => {
  if (!isoString) return { date: "N/A", time: "N/A" };

  try {
    const date = new Date(isoString);

    // Định dạng ngày: DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Vẫn lưu thời gian nhưng không hiển thị
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return {
      date: formattedDate,
      time: formattedTime,
      dateTime: formattedDate, // Chỉ trả về ngày tháng năm
    };
  } catch (error) {
    console.error("Error formatting date:", error);
    return { date: "N/A", time: "N/A", dateTime: "N/A" };
  }
};

// Khôi phục lại function getVietnameseStatus sang tiếng Anh
const getStatusText = (status) => {
  return status; // Giữ nguyên status gốc bằng tiếng Anh
};

// Response Card
function ExpandableResponseCard({ response, request, onClick }) {
  const { date } = formatDateTime(response.responseDate);
  const combinedText = `Date: ${date} | Doctor: ${
    response.doctorName
  } | Child: ${request?.childName || "N/A"} | Category: ${
    request?.category || "N/A"
  }`;
  const truncatedText =
    combinedText.length > 100
      ? combinedText.slice(0, 100) + "..."
      : combinedText;

  return (
    <article
      className="consultation-response-card"
      onClick={() => onClick(response)}
    >
      <header className="response-header">
        <span className="response-date">{date}</span>
        <span className="response-status">{response.status}</span>
      </header>
      <section className="response-summary">
        <p>
          <strong>Doctor:</strong> {response.doctorName}
        </p>
        <p>
          <strong>Child:</strong> {request?.childName || "N/A"}
        </p>
      </section>
      <footer className="truncated-content">{truncatedText}</footer>
    </article>
  );
}

// Sent Request Card
function ExpandableSentRequestCard({ request, onClick }) {
  const { date } = formatDateTime(request.requestDate);
  const truncatedText =
    `ID: ${request.requestId} | Child: ${request.childName} | Date: ${date} | Description: ${request.description}`.slice(
      0,
      50
    ) + "...";
  return (
    <article
      className="consultation-sent-card"
      onClick={() => onClick(request)}
    >
      <header className="sent-header">
        <span className="sent-date">{date}</span>
        <span className="sent-status">{request.status}</span>
      </header>
      <section className="sent-summary">
        <p>
          <strong>Child:</strong> {request.childName}
        </p>
        <p>
          <strong>Description:</strong> {request.description.slice(0, 50)}...
        </p>
      </section>
      <footer className="truncated-content">{truncatedText}</footer>
    </article>
  );
}

// Feedback Card
function ExpandableFeedbackEntry({
  feedback,
  onClick,
  consultationResponses,
  consultationRequests,
}) {
  const { date } = formatDateTime(feedback.feedbackDate);
  const truncatedText =
    `Rating: ${feedback.rating} stars | Date: ${date}`.slice(0, 100) + "...";
  const relatedResponse = consultationResponses.find(
    (resp) => resp.responseId === feedback.responseId
  );
  const relatedRequest = relatedResponse
    ? consultationRequests[relatedResponse.requestId]
    : null;

  return (
    <article
      className="consultation-feedback-card"
      onClick={() => onClick({ feedback, relatedResponse, relatedRequest })}
    >
      <header className="feedback-header">
        <span className="feedback-date">{date}</span>
        <span className="feedback-rating">{feedback.rating} ★</span>
      </header>
      <section className="feedback-summary">
        <p>
          <strong>Comment:</strong> {feedback.comment.slice(0, 50)}...
        </p>
      </section>
      <footer className="truncated-content">{truncatedText}</footer>
    </article>
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
  const [consultationResponses, setConsultationResponses] = useState([]);
  const [consultationRequests, setConsultationRequests] = useState({});
  const [sentRequests, setSentRequests] = useState([]);
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
  const [anotherRequestCount, setAnotherRequestCount] = useState(0);

  const steps = ["Select Doctor", "Enter Information", "Confirm"];

  useEffect(() => {
    fetchChildren();
    fetchDoctors();
    fetchConsultationResponses();
    fetchSentRequests();
    fetchUserFeedback();
  
    // Kiểm tra nếu có dữ liệu từ location.state (từ ChildrenPage)
    if (location.state) {
      const { child, description } = location.state;
      if (child) {
        setSelectedChild(child); // Điền sẵn child
      }
      if (description) {
        setConsultationContent(description); // Điền sẵn description
      }
      setCurrentStep(1); // Chuyển thẳng đến bước "Enter Information"
    }
  }, [location.state]);

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
        const activeDoctors = response.data.filter(
          (doctor) => doctor.status && doctor.status.toLowerCase() === "active"
        );
        setDoctors(activeDoctors);
        // Gọi fetchDoctorSpecializations sau khi có danh sách bác sĩ
        await fetchDoctorSpecializations();
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Unable to load doctor list");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorSpecializations = async () => {
    try {
      setLoading(true);
      const response = await doctorApi.getAllDoctorSpecialization();
      if (response?.data) {
        const specializationsMap = {};

        // Duyệt qua response từ API DoctorSpecializations
        response.data.forEach((item) => {
          const { doctorName, specializationName, status } = item;
          // Chỉ xử lý nếu status là "Active"
          if (status.toLowerCase() === "active") {
            if (!specializationsMap[doctorName]) {
              specializationsMap[doctorName] = [];
            }
            // Thêm specializationName vào mảng của doctorName
            if (!specializationsMap[doctorName].includes(specializationName)) {
              specializationsMap[doctorName].push(specializationName);
            }
          }
        });

        // Cập nhật state doctorSpecializations
        setDoctorSpecializations(specializationsMap);
      }
    } catch (error) {
      console.error("Error fetching doctor specializations:", error);
      setError("Unable to load doctor specializations");
    } finally {
      setLoading(false);
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

  // Hàm sắp xếp theo thời gian mới nhất với trường ngày tùy chỉnh
  const sortByDateDesc = (items, dateField = "responseDate") => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a[dateField]);
      const dateB = new Date(b[dateField]);
      return dateB - dateA; // Sắp xếp giảm dần (mới nhất đầu tiên)
    });
  };

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
      // Sắp xếp các response theo thời gian mới nhất đầu tiên
      const sortedResponses = sortByDateDesc(parsedResponses);
      setConsultationResponses(sortedResponses);
    } catch (error) {
      console.error("Error fetching consultation responses:", error);
    }
  };

  const fetchConsultationRequestDetail = async (requestId) => {
    try {
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
      console.log(
        "Consultation request detail:",
        consultationRequests[requestId]
      );
    } catch (error) {
      console.error("Error fetching consultation request detail:", error);
    }
  };

  const handleResponseClick = async (response) => {
    if (response.requestId) {
      await fetchConsultationRequestDetail(response.requestId);
    }
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
      // Sắp xếp các request mới nhất lên đầu
      const sortedRequests = sortByDateDesc(requestsData, "requestDate");
      setSentRequests(sortedRequests);
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
      // Sắp xếp feedback mới nhất lên đầu
      const sortedFeedback = sortByDateDesc(feedbackData, "feedbackDate");
      setUserFeedback(sortedFeedback);
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
      // Kiểm tra nếu có request nào chưa ở trạng thái Completed
  const hasPendingRequest = sentRequests.some(req => req.status !== "Completed");
  if (hasPendingRequest) {
    setPopupType("error");
    setPopupMessage("Vui lòng cập nhật các request hiện tại ở tab Response (chưa Completed) trước khi gửi request mới.");
    setShowPopup(true);
    return; // Không tiến hành gửi mới nếu có request chưa hoàn thành
  }
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
      const plainDescription = consultationContent.replace(/<[^>]+>/g, "");
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
      await fetchConsultationResponses();
      await fetchSentRequests();

      setPopupType("success");
      setPopupMessage("Consultation request sent successfully!");
      setShowPopup(true);

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
    // Kiểm tra nếu trong danh sách sentRequests có request nào chưa được cập nhật thành "Completed"
    const pendingRequestExists = sentRequests.some(req => req.status !== "Completed");
    
    if (pendingRequestExists) {
      // Nếu tồn tại request chưa hoàn thành, thông báo cho người dùng
      setPopupType("error");
      setPopupMessage("Vui lòng cập nhật các request hiện tại (chưa Completed) ở tab Response trước khi gửi request mới.");
      setShowPopup(true);
      return; // Không chuyển sang bước tiếp theo
    }
    
    // Nếu không có request nào đang chờ cập nhật, tiến hành chọn bác sĩ và chuyển sang bước nhập thông tin
    setSelectedDoctor(doctor);
    setCurrentStep(1);
  };
  

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Select Doctor
        return (
          <section className="doctor-selection-container">
            {loading ? (
              <div className="loading-state">
                <span className="loading-spinner"></span>
                <p>Loading doctor list...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchDoctors} className="doctor-action-button">
                  Retry
                </button>
              </div>
            ) : doctors.length === 0 ? (
              <p>No doctors found.</p>
            ) : (
              <article className="doctor-selection-grid">
                {doctors.map((doctor) => (
                  <section key={doctor.doctorId} className="doctor-card-grid">
                    <div className="doctor-avatar-grid">
                      <img
                        src={
                          doctorImage[doctor.doctorId] ||
                          "/assets/default-doctor.jpg"
                        }
                        alt={doctor.name}
                      />
                    </div>
                    <article className="doctor-info-grid">
                      <h4>{doctor.name}</h4>
                      <p>
                        <strong>Degree:</strong> {doctor.degree}
                      </p>
                      <p>
                        <strong>Hospital:</strong> {doctor.hospitalName}
                      </p>
                      {Array.isArray(doctorSpecializations[doctor.name]) && (
                        <div className="doctor-specializations-grid">
                          <p>
                            <strong>Specializations:</strong>
                          </p>
                          {doctorSpecializations[doctor.name].map(
                            (spec, index) => (
                              <p
                                key={index}
                                className="doctor-specialization-grid"
                              >
                                {spec}
                              </p>
                            )
                          )}
                        </div>
                      )}
                      <button
                        className="message-button"
                        onClick={() => handleMessageDoctor(doctor)}
                      >
                        Send Message
                      </button>
                    </article>
                  </section>
                ))}
              </article>
            )}
          </section>
        );

      case 1: // Enter Information
        return (
          <section className="doctor-consultation-form">
            <article className="form-container">
              <section className="input-group">
                <label htmlFor="child-select">Select Child</label>
                {loading ? (
                  <div className="loading-state">
                    <span className="loading-spinner"></span>
                    <p>Loading child list...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <p>{error}</p>
                    <button
                      onClick={fetchChildren}
                      className="doctor-action-button"
                    >
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
              </section>
              <section className="input-group">
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
              </section>
            </article>
            <article className="editor-wrapper">
              <TextEditor
                value={consultationContent}
                onChange={setConsultationContent}
              />
            </article>
          </section>
        );

      case 2: // Confirm
        return (
          <section className="doctor-review-container">
            <article className="review-section">
              <h3 className="doctor-section-title">Review Information</h3>
              <section className="review-item">
                <strong>Child:</strong> {selectedChild?.name || "Not selected"}
              </section>
              <section className="review-item consultation-details">
                <strong>Chi tiết:</strong>
                <div
                  className="consultation-details-content"
                  dangerouslySetInnerHTML={{ __html: consultationContent }}
                />
              </section>
              {selectedFiles.length > 0 && (
                <section className="review-item">
                  <strong>Tệp đính kèm:</strong>
                  <ul>
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
            {selectedDoctor && (
              <article className="doctor-review-section">
                <h4 className="doctor-section-title">Bác sĩ đã chọn</h4>
                <section className="doctor-profile-card">
                  <header className="doctor-profile-header">
                    <img
                      src={
                        selectedDoctor.user?.profilePicture ||
                        `https://ui-avatars.com/api/?name=${selectedDoctor.name}&background=random`
                      }
                      alt={selectedDoctor.name}
                      className="doctor-profile-avatar"
                    />
                    <article className="doctor-profile-info">
                      <h4 className="doctor-profile-name">
                        {selectedDoctor.name}
                      </h4>
                    </article>
                  </header>
                  <section className="doctor-profile-details">
                    <p>{selectedDoctor.degree}</p>
                    <p>{selectedDoctor.hospitalName}</p>
                    {Array.isArray(
                      doctorSpecializations[selectedDoctor.name]
                    ) && (
                      <div className="doctor-specializations">
                        {doctorSpecializations[selectedDoctor.name].map(
                          (spec, index) => (
                            <p
                              key={index}
                              className="doctor-profile-specialization"
                            >
                              {spec}
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </section>
                </section>
              </article>
            )}
            <footer className="submit-section">
              {submitError && <div className="submit-error">{submitError}</div>}
              <button
                className="doctor-action-button"
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? "Sending..." : "Complete"}
              </button>
            </footer>
          </section>
        );

      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case "consultation":
        return (
          <section className="doctor-request-column">
            <header className="progress-bar">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <article
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
                  </article>
                  {index !== steps.length - 1 && (
                    <div
                      className={`progress-line ${
                        currentStep > index ? "completed" : ""
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </header>
            <article className="doctor-form-content">
              {renderStepContent()}
              <footer className="doctor-navigation-buttons">
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
              </footer>
            </article>
          </section>
        );

      case "responses":
        return consultationResponses.length > 0 ? (
          <section className="tab-content">
            {consultationResponses.map((resp, index) => (
              <ExpandableResponseCard
                key={index}
                response={resp}
                request={consultationRequests[resp.requestId]}
                onClick={handleResponseClick}
              />
            ))}
          </section>
        ) : (
          <p>No responses available.</p>
        );

      case "sentRequests":
        return sentRequests.length > 0 ? (
          <section className="tab-content">
            {sentRequests.map((req, index) => (
              <ExpandableSentRequestCard
                key={index}
                request={req}
                onClick={setSelectedSentRequest}
              />
            ))}
          </section>
        ) : (
          <p>No sent requests available.</p>
        );

      case "feedback":
        return userFeedback.length > 0 ? (
          <section className="tab-content">
            {userFeedback.map((fb, index) => (
              <ExpandableFeedbackEntry
                key={index}
                feedback={fb}
                consultationResponses={consultationResponses || []}
                consultationRequests={consultationRequests || {}}
                onClick={(data) => setSelectedFeedback(data)}
              />
            ))}
          </section>
        ) : (
          <p>No feedback available.</p>
        );

      default:
        return null;
    }
  };

  // Hàm xử lý khi nhấn "Send Another Request" (giữ nguyên logic cũ)
  const handleSendAnotherRequest = () => {
    if (anotherRequestCount < 3) {
      // Tăng số lần đã gửi lên 1
      const newCount = anotherRequestCount + 1;
      setAnotherRequestCount(newCount);
      const confirm = window.confirm(
        "Bạn có muốn gửi yêu cầu mới không? Nếu có, bạn sẽ không thể gửi yêu cầu này nữa.");
      if (confirm) {
        // Nếu người dùng xác nhận, thực hiện gửi yêu cầu mới
        setSelectedResponse(null); // Đóng modal
        setCurrentStep(0); // Quay lại bước chọn bác sĩ
        setSelectedChild(null); // Đặt lại child đã chọn
        setConsultationContent(""); // Đặt lại nội dung tư vấn
        setSelectedDoctor(null); // Đặt lại bác sĩ đã chọn
        setSelectedFiles([]); // Đặt lại danh sách file đính kèm
      } else {

      }
    // setCurrentStep(0); // Quay lại bước chọn bác sĩ
    // setSelectedChild(null); // Đặt lại child đã chọn
    // setConsultationContent(""); // Đặt lại nội dung tư vấn
    // setSelectedDoctor(null); // Đặt lại bác sĩ đã chọn
    // setSelectedFiles([]); // Đặt lại danh sách file đính kèm
    // setSelectedResponse(null); // Đóng modal
    // setCurrentTab("consultation"); // Chuyển về tab Consultation
    // const remaining = 3 - newCount;
    // setPopupType("success");
    // setPopupMessage(`Yêu cầu mới đã được khởi tạo. Bạn còn ${remaining} lần gửi request nữa.`);
    setShowPopup(true);
  } else {
    // Nếu đã vượt quá số lần cho phép thì thông báo lỗi
    setPopupType("error");
    setPopupMessage("Bạn đã vượt quá số lần gửi request cho phép (3 lần).");
    setShowPopup(true);
  }
  };

  const handleCompleteRequest = async () => {
    try {
      if (selectedResponse?.response?.requestId && selectedResponse?.response?.responseId) {
        const requestId = selectedResponse.response.requestId;
        const responseId = selectedResponse.response.responseId;
        
        // Cập nhật trạng thái request thành "Completed"
        await doctorApi.updateConsultationRequestsStatus(requestId, "Completed");
  
        // Cập nhật trạng thái response thành "Completed"
        // await doctorApi.updateConsultationResponseStatus(responseId, "Completed");
  
        // Refresh danh sách sau khi cập nhật
        await fetchSentRequests();
        await fetchConsultationResponses();
  
        setPopupType("success");
        setPopupMessage("Request and response đã được cập nhật thành Completed thành công!");
        setShowPopup(true);
      } else {
        throw new Error("Không tìm thấy thông tin request/response hợp lệ để cập nhật.");
      }
    } catch (error) {
      console.error("Error updating request/response status:", error);
      setPopupType("error");
      setPopupMessage("Cập nhật không thành công. Vui lòng thử lại sau.");
      setShowPopup(true);
    }
  };
  

  return (
    <main className="doctor-consultation">
      <header className="top-tab-container">
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
      </header>

      <section className="tab-content">{renderTabContent()}</section>

      {selectedResponse && (
        <aside
          className="modal-overlay"
          onClick={() => setSelectedResponse(null)}
        >
          <article
            className="modal-response-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedResponse(null)}
            >
              ×
            </button>
            <header className="modal-response-title">Response Details</header>
            <section className="response-details">
              <div className="response-header-button">
                <button
                  className="feedback-button"
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                >
                  {showFeedbackForm ? "Hide Feedback" : "Feedback"}
                </button>
                <button
                  className="send-another-button"
                  onClick={handleSendAnotherRequest}
                >
                  Send Another Request
                </button>
                <button
                  className="complete-request-button"
                  onClick={handleCompleteRequest}
                >
                  Complete
                </button>
              </div>
              <article className="request-section">
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
                      {
                        formatDateTime(selectedResponse.request.requestDate)
                          .date
                      }
                    </p>
                  </>
                ) : (
                  <p>No request details available.</p>
                )}
              </article>
              <article className="response-section">
                <h4>Response Information</h4>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDateTime(selectedResponse.response.responseDate).date}
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
              </article>
              {showFeedbackForm && (
                <article className="feedback-form">
                  <h4>Feedback</h4>
                  <section className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= rating ? "selected" : ""}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </section>
                  <section className="input-group">
                    <label>Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter your feedback..."
                      rows="4"
                      className="feedback-textarea"
                    />
                  </section>
                  <footer>
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
                  </footer>
                </article>
              )}
            </section>
          </article>
        </aside>
      )}

      {selectedSentRequest && (
        <aside
          className="modal-overlay"
          onClick={() => setSelectedSentRequest(null)}
        >
          <article
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedSentRequest(null)}
            >
              ×
            </button>
            <header className="modal-title">Sent Request Details</header>
            <section className="response-details">
              <article className="request-section">
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
                  {formatDateTime(selectedSentRequest.requestDate).date}
                </p>
                <p>
                  <strong>Status:</strong> {selectedSentRequest.status}
                </p>
                {selectedSentRequest.attachments && (
                  <section>
                    <h4>Attachments</h4>
                    {JSON.parse(selectedSentRequest.attachments).map(
                      (attachment, index) => (
                        <article key={index} style={{ marginBottom: "10px" }}>
                          <p>{attachment.fileName}</p>
                          <button
                            className="doctor-action-button"
                            onClick={() => downloadAttachment(attachment)}
                          >
                            Download
                          </button>
                        </article>
                      )
                    )}
                  </section>
                )}
              </article>
            </section>
          </article>
        </aside>
      )}

      {selectedFeedback && (
        <aside
          className="modal-overlay"
          onClick={() => setSelectedFeedback(null)}
        >
          <article
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedFeedback(null)}
            >
              ×
            </button>
            <header className="modal-title">Feedback Details</header>
            <section className="response-details">
              <article className="feedback-section">
                <h4>Feedback Information</h4>
                <p>
                  <strong>Rating:</strong> {selectedFeedback.feedback.rating} ★
                </p>
                <p>
                  <strong>Comment:</strong> {selectedFeedback.feedback.comment}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDateTime(selectedFeedback.feedback.feedbackDate).date}
                </p>
              </article>
              {selectedFeedback.relatedResponse && (
                <article className="response-section">
                  <h4>Response Information</h4>
                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDateTime(
                      selectedFeedback.relatedResponse.responseDate
                    ).date || "N/A"}
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
                </article>
              )}
            </section>
          </article>
        </aside>
      )}

      {showPopup && (
        <PopupNotification
          type={popupType}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </main>
  );
}

export default DoctorConsultation;
