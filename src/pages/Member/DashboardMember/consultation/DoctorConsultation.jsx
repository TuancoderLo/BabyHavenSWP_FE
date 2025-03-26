import React, { useState, useEffect } from "react";
import "./DoctorConsultation.css";
import childApi from "../../../../services/childApi";
import doctorApi from "../../../../services/DoctorApi";
import TextEditor from "../../../../pages/Admin/DashboardAdmin/blog/textEditor";

// Thành phần cho thẻ yêu cầu đã gửi
function ExpandableSentRequestCard({ request, onClick }) {
  const truncatedText = `ID: ${request.requestId} | Child: ${request.childName} | Category: ${request.category} | Date: ${request.requestDate}`.slice(0, 100) + "...";
  return (
    <div className="consultation-sent-card" onClick={() => onClick(request)}>
      <div className="sent-header">
        <span className="sent-date">{request.requestDate}</span>
        <span className="sent-status">{request.status}</span>
      </div>
      <div className="sent-summary">
        <p><strong>ID:</strong> {request.requestId}</p>
        <p><strong>Child:</strong> {request.childName}</p>
        <p><strong>Category:</strong> {request.category}</p>
      </div>
      <div className="truncated-content">{truncatedText}</div>
    </div>
  );
}

// Thành phần cho thẻ phản hồi đã cung cấp
function ExpandableFeedbackEntry({ feedback, onClick }) {
  const truncatedText = `Child: ${feedback.childName} | Doctor: ${feedback.doctorName} | Rating: ${feedback.rating} stars`.slice(0, 100) + "...";
  return (
    <div className="consultation-feedback-card" onClick={() => onClick(feedback)}>
      <div className="feedback-header">
        <span className="feedback-date">{feedback.feedbackDate}</span>
        <span className="feedback-rating">{feedback.rating} ★</span>
      </div>
      <div className="feedback-summary">
        <p><strong>Child:</strong> {feedback.childName}</p>
        <p><strong>Doctor:</strong> {feedback.doctorName}</p>
        <p><strong>Comment:</strong> {feedback.comment.slice(0, 50)}...</p>
      </div>
      <div className="truncated-content">{truncatedText}</div>
    </div>
  );
}

// Thành phần chính
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
  const [consultationRequests, setConsultationRequests] = useState({});
  const [sentRequests, setSentRequests] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [selectedSentRequest, setSelectedSentRequest] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [urgency, setUrgency] = useState("Low");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const handleStarClick = (starValue) => setRating(starValue);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitError, setFeedbackSubmitError] = useState("");
  const [userFeedback, setUserFeedback] = useState([]);
  const [currentTab, setCurrentTab] = useState("responses");

  useEffect(() => {
    fetchChildren();
    fetchDoctors();
    fetchCategories();
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
      if (!memberId) throw new Error("Please login to view the list of children");
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
      setError(err.message || "Unable to load children list");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await doctorApi.getAllDoctors();
      if (response?.data) {
        setDoctors(response.data);
        response.data.forEach((doctor) => fetchDoctorSpecializations(doctor.doctorId));
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
      setDoctorSpecializations((prev) => ({ ...prev, [doctorId]: [] }));
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
      if (typeof content === "string") {
        const lines = content.split("\r\n\r\n");
        return {
          greeting: lines[0] || "",
          approvalMessage: lines[1] || "",
          advice: lines.slice(2, lines.length - 1).join("\n"),
          followUp: lines[lines.length - 1] || "",
        };
      }
      return { greeting: "", approvalMessage: content || "", advice: "", followUp: "" };
    }
  };

  const fetchConsultationResponses = async () => {
    try {
      const memberId = localStorage.getItem("memberId");
      if (!memberId) throw new Error("Please login to fetch consultation responses");
      const res = await doctorApi.getConsultationResponses(memberId);
      let responses = Array.isArray(res?.data) ? res.data : [res.data];
      const parsedResponses = responses.map((item) => ({
        ...item,
        content: typeof item.content === "string" ? parseContentToObject(item.content) : item.content,
      }));
      setConsultationResponses(parsedResponses);

      const requests = {};
      for (const response of parsedResponses) {
        if (response.requestId) {
          const requestRes = await doctorApi.getConsultationRequestsById(response.requestId);
          if (requestRes?.data) requests[response.requestId] = requestRes.data;
        }
      }
      setConsultationRequests(requests);
    } catch (error) {
      console.error("Error fetching consultation responses:", error);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const memberId = localStorage.getItem("memberId");
      if (!memberId) throw new Error("Please login to fetch sent requests");
      const res = await doctorApi.getSentRequests(memberId); // Giả định endpoint tồn tại
      setSentRequests(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  };

  const fetchUserFeedback = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Please login to fetch user feedback");
      const res = await doctorApi.getUserFeedbackOData(userId);
      const feedbackData = Array.isArray(res.data.value) ? res.data.value : Array.isArray(res.data) ? res.data : [];
      setUserFeedback(feedbackData);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      setUserFeedback([]); // Đặt về mảng rỗng nếu có lỗi
    }
  };

  const handleChildSelect = (child) => setSelectedChild(child);
  const handleNextStep = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
  const handleBackStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);
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
      if (!memberId) throw new Error("Please login to continue");
      if (!selectedChild) throw new Error("Please select a child");
      if (!selectedDoctor) throw new Error("Please select a doctor");
      const currentDate = new Date();
      const requestDate = `${currentDate.toISOString().slice(0, 10)} ${currentDate.toTimeString().slice(0, 8)}.${currentDate.getMilliseconds().toString().padEnd(3, "0")}`;
      const plainDescription = stripHtml(consultationContent);

      const payload = {
        memberId,
        childName: selectedChild.name,
        childBirth: selectedChild.childBirth,
        doctorId: selectedDoctor.doctorId,
        requestDate,
        status: "pending",
        urgency,
        ...(selectedCategory && { category: selectedCategory }),
        description: plainDescription,
      };

      await doctorApi.createConsultationRequest(payload);
      await fetchConsultationResponses();
      await fetchSentRequests();
      setShowSuccessModal(true);
      setCurrentStep(0);
      setSelectedCategory("");
      setConsultationContent("");
      setSelectedDoctor(null);
    } catch (error) {
      setSubmitError(error.response?.data?.title || error.message || "Unable to send consultation request");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitFeedbackAndUpdateStatus = async () => {
    try {
      setIsSubmitting(true); // Thêm setIsSubmitting vào đây
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Please login to submit feedback");
      const requestId = Number(selectedResponse.response.requestId);
      const odataQuery = `?$filter=requestId eq ${requestId}`;
      const odataRes = await doctorApi.getConsultationResponsesOData(odataQuery);
      const odataResponses = Array.isArray(odataRes.data) ? odataRes.data : [odataRes.data];
      const matchingResponse = odataResponses.find((resp) => resp.requestId === requestId);
      const responseId = matchingResponse?.responseId;
      if (!responseId) throw new Error("No response ID found for this request");
      if (rating < 1 || rating > 5) throw new Error("Please select a rating");
      if (!comment.trim()) throw new Error("Comment cannot be empty");

      const feedbackDate = new Date().toISOString();
      const payload = { userId, responseId, rating, comment, feedbackDate, feedbackType: 0, status: 0 };
      await doctorApi.createRatingFeedback(payload);
      await doctorApi.updateConsultationResponseStatus(responseId, "Completed");
      await fetchConsultationResponses();
      await fetchUserFeedback();
      setShowFeedbackForm(false);
    } catch (error) {
      setFeedbackSubmitError(error.message || "Unable to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="doctor-consultation-form">
            <h3 className="doctor-section-title">Enter Consultation Information</h3>
            <div className="form-container">
              <div className="input-group">
                <label htmlFor="child-select">Select Child</label>
                {loading ? (
                  <div className="loading-state"><span className="loading-spinner"></span><p>Loading children...</p></div>
                ) : error ? (
                  <div className="error-state"><p>{error}</p><button onClick={fetchChildren} className="retry-button">Retry</button></div>
                ) : children.length === 0 ? (
                  <p>No children found</p>
                ) : (
                  <select
                    id="child-select"
                    className="doctor-child-select"
                    value={selectedChild?.name || ""}
                    onChange={(e) => handleChildSelect(children.find((child) => child.name === e.target.value))}
                  >
                    <option value="">Select a child</option>
                    {children.map((child) => (
                      <option key={child.name} value={child.name}>{child.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="input-group">
                <label htmlFor="category-select">Category</label>
                <select
                  id="category-select"
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
                {loadingCategories && <span className="loading-spinner-small"></span>}
              </div>
              <div className="input-group">
                <label htmlFor="urgency-select">Urgency</label>
                <select
                  id="urgency-select"
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
            <div className="editor-wrapper">
              <TextEditor value={consultationContent} onChange={setConsultationContent} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="doctor-selection-container">
            <h3 className="doctor-section-title">Select a Doctor</h3>
            <div className="doctor-list">
              {doctors.map((doctor) => (
                <div
                  key={doctor.doctorId}
                  className={`doctor-card ${selectedDoctor?.doctorId === doctor.doctorId ? "selected" : ""}`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="doctor-avatar">
                    <img
                      src={doctor.user?.profilePicture || `https://ui-avatars.com/api/?name=${doctor.name}&background=random`}
                      alt={doctor.name}
                    />
                  </div>
                  <div className="doctor-info">
                    <h4>{doctor.name}</h4>
                    <span className="doctor-status">{doctor.status}</span>
                    <p className="doctor-degree">{doctor.degree}</p>
                    <p className="doctor-hospital">{doctor.hospitalName}</p>
                    {Array.isArray(doctorSpecializations[doctor.doctorId]) && (
                      <div className="doctor-specializations">
                        {doctorSpecializations[doctor.doctorId].map((spec, index) => (
                          <p key={index} className="doctor-specialization">{spec.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="doctor-review-container">
            <h3 className="doctor-section-title">Review Consultation Information</h3>
            <div className="review-section">
              <div className="review-item"><strong>Child:</strong> {selectedChild?.name || "Not selected"}</div>
              <div className="review-item"><strong>Category:</strong> {selectedCategory || "N/A"}</div>
              <div className="review-item"><strong>Urgency:</strong> {urgency}</div>
              <div className="review-item consultation-details">
                <strong>Details:</strong>
                <div className="consultation-details-content" dangerouslySetInnerHTML={{ __html: consultationContent }} />
              </div>
            </div>
            {selectedDoctor && (
              <div className="doctor-review-section">
                <h4 className="doctor-section-title">Selected Doctor</h4>
                <div className="doctor-profile-card selected">
                  <div className="doctor-profile-header">
                    <img
                      src={selectedDoctor.user?.profilePicture || `https://ui-avatars.com/api/?name=${selectedDoctor.name}&background=random`}
                      alt={selectedDoctor.name}
                      className="doctor-profile-avatar"
                    />
                    <div className="doctor-profile-info">
                      <h4 className="doctor-profile-name">{selectedDoctor.name}</h4>
                      <span className="doctor-profile-status">{selectedDoctor.status}</span>
                    </div>
                  </div>
                  <div className="doctor-profile-details">
                    <p className="doctor-profile-degree">{selectedDoctor.degree}</p>
                    <p className="doctor-profile-hospital">{selectedDoctor.hospitalName}</p>
                    {Array.isArray(doctorSpecializations[selectedDoctor.doctorId]) && (
                      <div className="doctor-specializations">
                        {doctorSpecializations[selectedDoctor.doctorId].map((spec, index) => (
                          <p key={index} className="doctor-profile-specialization">{spec.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="submit-section">
              {submitError && <div className="submit-error">{submitError}</div>}
              <button className="doctor-action-button" onClick={handleSubmit} disabled={submitLoading}>
                {submitLoading ? "Sending..." : "Complete"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case "responses":
        return consultationResponses.length > 0 ? (
          consultationResponses.map((resp, index) => (
            <ExpandableResponseCard
              key={index}
              response={resp}
              request={consultationRequests[resp.requestId]}
              onClick={setSelectedResponse}
            />
          ))
        ) : (
          <p>No consultation responses available.</p>
        );
      case "sentRequests":
        return sentRequests.length > 0 ? (
          sentRequests.map((req, index) => (
            <ExpandableSentRequestCard key={index} request={req} onClick={setSelectedSentRequest} />
          ))
        ) : (
          <p>No sent requests available.</p>
        );
      case "feedback":
        return userFeedback.length > 0 ? (
          userFeedback.map((fb, index) => (
            <ExpandableFeedbackEntry key={index} feedback={fb} onClick={setSelectedFeedback} />
          ))
        ) : (
          <p>No feedback provided yet.</p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="doctor-consultation">
      <div className="doctor-grid-container">
        <main className="doctor-request-column">
          <div className="doctor-request">
            <div className="doctor-steps">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`doctor-step-item ${currentStep === index ? "active" : ""} ${currentStep > index ? "completed" : ""}`}
                >
                  <div className="step-circle">{index + 1}</div>
                  <span className="step-label">{step}</span>
                </div>
              ))}
            </div>
            <section className="doctor-form-content">
              {renderStepContent()}
              <div className="doctor-navigation-buttons">
                {currentStep > 0 && (
                  <button className="doctor-back-button" onClick={handleBackStep}>Back</button>
                )}
                {currentStep < steps.length - 1 && (
                  <button className="doctor-next-button" onClick={handleNextStep}>Next</button>
                )}
              </div>
            </section>
          </div>
        </main>

        <aside className="doctor-response-column">
          <h3 className="section-title">History</h3>
          <div className="tab-container">
            <button
              className={`tab-button ${currentTab === "responses" ? "active" : ""}`}
              onClick={() => setCurrentTab("responses")}
            >
              Responses
            </button>
            <button
              className={`tab-button ${currentTab === "sentRequests" ? "active" : ""}`}
              onClick={() => setCurrentTab("sentRequests")}
            >
              Sent Requests
            </button>
            <button
              className={`tab-button ${currentTab === "feedback" ? "active" : ""}`}
              onClick={() => setCurrentTab("feedback")}
            >
              Provided Feedback
            </button>
          </div>
          <div className="doctor-response">{renderTabContent()}</div>
        </aside>
      </div>

      {selectedResponse && (
        <div className="modal-overlay" onClick={() => setSelectedResponse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedResponse(null)}>×</button>
            <h3 className="modal-title">Consultation Response Details</h3>
            <button
              className="feedback-button"
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              style={{ marginBottom: "15px" }}
            >
              {showFeedbackForm ? "Hide Feedback" : "Provide Feedback"}
            </button>
            <div className="response-details">
              <div className="request-section">
                <h4>Request Information</h4>
                {selectedResponse.request ? (
                  <>
                    <p><strong>Member:</strong> {selectedResponse.request.memberName}</p>
                    <p><strong>Child:</strong> {selectedResponse.request.childName}</p>
                    <p><strong>Category:</strong> {selectedResponse.request.category}</p>
                    <p><strong>Urgency:</strong> {selectedResponse.request.urgency}</p>
                    <p><strong>Description:</strong> {selectedResponse.request.description}</p>
                    <p><strong>Request Date:</strong> {selectedResponse.request.requestDate}</p>
                  </>
                ) : (
                  <p>No request details available.</p>
                )}
              </div>
              <div className="response-section">
                <h4>Response Information</h4>
                <p><strong>Date:</strong> {selectedResponse.response.responseDate}</p>
                <p><strong>Doctor:</strong> {selectedResponse.response.doctorName}</p>
                <p><strong>Status:</strong> {selectedResponse.response.status}</p>
                <p><strong>Greeting:</strong> {selectedResponse.response.content.greeting || "N/A"}</p>
                <p><strong>Approval Message:</strong> {selectedResponse.response.content.approvalMessage || "N/A"}</p>
                <p><strong>Advice:</strong> {selectedResponse.response.content.advice || "N/A"}</p>
                <p><strong>Follow-Up:</strong> {selectedResponse.response.content.followUp || "N/A"}</p>
                <p><strong>Helpful:</strong> {selectedResponse.response.isHelpful ? "Yes" : "No"}</p>
              </div>
              {showFeedbackForm && (
                <div className="feedback-form">
                  <h4>Rating and Feedback</h4>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= rating ? "selected" : ""}`}
                        onClick={() => handleStarClick(star)}
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
                      placeholder="Your feedback here..."
                      rows="4"
                      className="feedback-textarea"
                    />
                  </div>
                  <button
                    className="submit-feedback-button"
                    onClick={handleSubmitFeedbackAndUpdateStatus}
                    disabled={isSubmitting || rating < 1 || !comment.trim()}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                  {feedbackSubmitError && <p className="submit-error">{feedbackSubmitError}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedSentRequest && (
        <div className="modal-overlay" onClick={() => setSelectedSentRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSentRequest(null)}>×</button>
            <h3 className="modal-title">Sent Request Details</h3>
            <div className="response-details">
              <div className="request-section">
                <h4>Request Information</h4>
                <p><strong>ID:</strong> {selectedSentRequest.requestId}</p>
                <p><strong>Child:</strong> {selectedSentRequest.childName}</p>
                <p><strong>Category:</strong> {selectedSentRequest.category}</p>
                <p><strong>Urgency:</strong> {selectedSentRequest.urgency}</p>
                <p><strong>Description:</strong> {selectedSentRequest.description}</p>
                <p><strong>Date:</strong> {selectedSentRequest.requestDate}</p>
                <p><strong>Status:</strong> {selectedSentRequest.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedFeedback(null)}>×</button>
            <h3 className="modal-title">Feedback Details</h3>
            <div className="response-details">
              <div className="feedback-section">
                <h4>Feedback Information</h4>
                <p><strong>Child:</strong> {selectedFeedback.childName}</p>
                <p><strong>Doctor:</strong> {selectedFeedback.doctorName}</p>
                <p><strong>Category:</strong> {selectedFeedback.categoryName}</p>
                <p><strong>Rating:</strong> {selectedFeedback.rating} ★</p>
                <p><strong>Comment:</strong> {selectedFeedback.comment}</p>
                <p><strong>Date:</strong> {selectedFeedback.feedbackDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-header">
              <h3>Success!</h3>
              <button className="modal-close" onClick={() => setShowSuccessModal(false)}>×</button>
            </div>
            <div className="success-modal-body">
              <p>Consultation request sent successfully!</p>
            </div>
            <div className="success-modal-footer">
              <button className="success-modal-button" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandableResponseCard({ response, request, onClick }) {
  const combinedText = `Date: ${response.responseDate} | Doctor: ${response.doctorName} | Child: ${request?.childName || "N/A"} | Category: ${request?.category || "N/A"}`;
  const truncatedText = combinedText.length > 100 ? combinedText.slice(0, 100) + "..." : combinedText;

  return (
    <div className="consultation-response-card" onClick={() => onClick({ response, request })}>
      <div className="response-header">
        <span className="response-date">{response.responseDate}</span>
        <span className="response-status">{response.status}</span>
      </div>
      <div className="response-summary">
        <p><strong>Doctor:</strong> {response.doctorName}</p>
        <p><strong>Child:</strong> {request?.childName || "N/A"}</p>
        <p><strong>Category:</strong> {request?.category || "N/A"}</p>
      </div>
      <div className="truncated-content">{truncatedText}</div>
    </div>
  );
}

export default DoctorConsultation;