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
        name: "Doctor 1",
        status: "online",
        major: "Pediatrics",
        specializing: "Child Development",
        isFavorite: true,
      },
      {
        id: 2,
        name: "Doctor 2",
        status: "offline",
        major: "Pediatrics",
        specializing: "Pediatric Neurology",
        isFavorite: false,
      },
    ],
    available: [
      {
        id: 3,
        name: "Doctor 3",
        status: "online",
        major: "Pediatrics",
        specializing: "Child Psychology",
        isFavorite: false,
      },
      {
        id: 4,
        name: "Doctor 4",
        status: "online",
        major: "Pediatrics",
        specializing: "Pediatric Cardiology",
        isFavorite: false,
      },
      {
        id: 5,
        name: "Doctor 5",
        status: "online",
        major: "Pediatrics",
        specializing: "General Pediatrics",
        isFavorite: false,
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
          <div className="doctor-selection-container">
            {/* Recent Doctors Section */}
            <div className="doctor-section">
              <h3 className="doctor-section-heading">Recent doctor</h3>
              <div className="doctor-cards">
                {doctors.recent.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`doctor-card ${
                      selectedDoctor?.id === doctor.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="doctor-avatar">
                      <img
                        src={`https://ui-avatars.com/api/?name=${doctor.name}&background=random`}
                        alt={doctor.name}
                      />
                    </div>
                    <div className="doctor-info">
                      <h4>{doctor.name}</h4>
                      <div className="doctor-status">
                        <span className={`status-dot ${doctor.status}`}></span>
                        {doctor.status}
                      </div>
                      <p className="doctor-major">Major: {doctor.major}</p>
                      <p className="doctor-specializing">
                        Specializing: {doctor.specializing}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Doctors Section */}
            <div className="doctor-section">
              <h3 className="doctor-section-heading">Available doctors</h3>
              <div className="doctor-cards">
                {doctors.available.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`doctor-card ${
                      selectedDoctor?.id === doctor.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="doctor-avatar">
                      <img
                        src={`https://ui-avatars.com/api/?name=${doctor.name}&background=random`}
                        alt={doctor.name}
                      />
                    </div>
                    <div className="doctor-info">
                      <h4>{doctor.name}</h4>
                      <div className="doctor-status">
                        <span className={`status-dot ${doctor.status}`}></span>
                        {doctor.status}
                      </div>
                      <p className="doctor-major">Major: {doctor.major}</p>
                      <p className="doctor-specializing">
                        Specializing: {doctor.specializing}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Doctors Section */}
            <div className="doctor-section">
              <h3 className="doctor-section-heading">All doctors</h3>
              <div className="doctor-list">
                {[...doctors.recent, ...doctors.available].map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`doctor-list-item ${
                      selectedDoctor?.id === doctor.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="doctor-name">
                      {doctor.name}
                      <span className={`status-dot ${doctor.status}`}></span>
                    </div>
                    <div className="doctor-details">
                      <span>Major: {doctor.major}</span>
                      <span>Specializing: {doctor.specializing}</span>
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
