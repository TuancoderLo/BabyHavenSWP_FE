import React, { useState } from "react";
import "./DoctorConsultation.css";

function DoctorConsultation() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [consultationContent, setConsultationContent] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Add steps variable
  const steps = ["Enter Information", "Select Doctor", "Confirm"];

  // Mock data with unique keys
  const children = [
    { id: 1, name: "Child 1" },
    { id: 2, name: "Child 2" },
  ];

  const categories = [
    "General Consultation",
    "Pediatric Care",
    "Vaccination",
    "Development Check",
    "Nutrition Advice",
  ];

  const doctors = {
    recent: [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        status: "online",
        major: "Pediatrics",
        specializing: "Child Development",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      {
        id: 2,
        name: "Dr. Michael Chen",
        status: "offline",
        major: "Pediatrics",
        specializing: "Pediatric Neurology",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      },
    ],
    available: [
      {
        id: 3,
        name: "Dr. Emily Wilson",
        status: "online",
        major: "Pediatrics",
        specializing: "Child Psychology",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      },
      {
        id: 4,
        name: "Dr. James Miller",
        status: "online",
        major: "Pediatrics",
        specializing: "Pediatric Cardiology",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      },
    ],
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
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
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="doctor-editor-container">
              <div className="doctor-section-title">Consultation Details:</div>
              <textarea
                className="doctor-editor-area"
                placeholder="Enter your consultation details..."
                value={consultationContent}
                onChange={(e) => setConsultationContent(e.target.value)}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="doctor-grid-section">
            <div className="doctor-section-title">
              Select Consulting Doctor:
            </div>
            <div className="doctor-grid">
              {doctors.recent.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`doctor-profile-card ${
                    selectedDoctor?.id === doctor.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="doctor-profile-header">
                    <div className="doctor-profile-avatar">
                      <img src={doctor.avatar} alt={doctor.name} />
                    </div>
                    <div className="doctor-profile-info">
                      <div className="doctor-profile-name">{doctor.name}</div>
                      <div className="doctor-profile-status">
                        <span
                          className={`doctor-status-dot ${doctor.status}`}
                        ></span>
                        {doctor.status}
                      </div>
                    </div>
                  </div>
                  <div className="doctor-profile-details">
                    <div className="doctor-profile-major">{doctor.major}</div>
                    <div className="doctor-profile-specialty">
                      {doctor.specializing}
                    </div>
                  </div>
                </div>
              ))}
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
              <div>
                <strong>Details:</strong>
                <div style={{ marginTop: "10px", whiteSpace: "pre-wrap" }}>
                  {consultationContent}
                </div>
              </div>
            </div>

            {selectedDoctor && (
              <div className="doctor-review-selection">
                <div className="doctor-section-title">Selected Information</div>
                <div className="doctor-profile-card selected">
                  <div className="doctor-profile-header">
                    <div className="doctor-profile-avatar">
                      <img
                        src={selectedDoctor.avatar}
                        alt={selectedDoctor.name}
                      />
                    </div>
                    <div className="doctor-profile-info">
                      <div className="doctor-profile-name">
                        {selectedDoctor.name}
                      </div>
                      <div className="doctor-profile-status">
                        <span
                          className={`doctor-status-dot ${selectedDoctor.status}`}
                        ></span>
                        {selectedDoctor.status}
                      </div>
                    </div>
                  </div>
                  <div className="doctor-profile-details">
                    <div className="doctor-profile-major">
                      {selectedDoctor.major}
                    </div>
                    <div className="doctor-profile-specialty">
                      {selectedDoctor.specializing}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="doctor-consultation">
      <div className="doctor-sidebar">
        {children.map((child) => (
          <div
            key={child.id}
            className={`doctor-child-item ${
              selectedChild?.id === child.id ? "selected" : ""
            }`}
            onClick={() => setSelectedChild(child.id)}
          >
            <div className="doctor-child-icon">
              <i className="fas fa-child"></i>
            </div>
            <div className="doctor-child-label">{child.name}</div>
          </div>
        ))}
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
