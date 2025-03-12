import React, { useState, useEffect } from "react";
import "./DoctorConsultation.css";

function DoctorConsultation() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    details: "",
    doctorSelection: null,
    additionalInfo: {},
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [children, setChildren] = useState([
    { id: 1, name: "Child 1" },
    { id: 2, name: "Child 2" },
  ]);

  useEffect(() => {
    // TODO: Gọi API để lấy danh sách children
    // setChildren(response.data);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // TODO: Gửi dữ liệu đến database
    console.log("Submit data:", {
      childId: selectedChild,
      ...formData,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-container">
            <div className="consultation-form">
              <div className="form-group category-input">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  placeholder="Enter category"
                />
              </div>
              <div className="form-group consultation-details">
                <textarea
                  value={formData.details}
                  onChange={(e) => handleInputChange("details", e.target.value)}
                  placeholder="Enter your consultation details"
                  className="consultation-textarea"
                />
              </div>
            </div>
            <button className="next-step-btn" onClick={() => setCurrentStep(2)}>
              Next step
            </button>
          </div>
        );
      case 2:
        return (
          <div className="form-container">
            <div className="consultation-form">
              <h3>Choose Doctor</h3>
              {/* Nội dung cho bước 2 sẽ được thêm sau */}
            </div>
            <button className="next-step-btn" onClick={() => setCurrentStep(3)}>
              Next step
            </button>
          </div>
        );
      case 3:
        return (
          <div className="form-container">
            <div className="consultation-form">
              <h3>Submit</h3>
              {/* Nội dung cho bước 3 sẽ được thêm sau */}
            </div>
            <button className="next-step-btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="doctor-consultation">
      <div className="content-wrapper">
        <div className="child-selection">
          {children.map((child) => (
            <div
              key={child.id}
              className={`child-card ${
                selectedChild === child.id ? "selected" : ""
              }`}
              onClick={() => setSelectedChild(child.id)}
            >
              <div className="child-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="#666666"
                  />
                </svg>
              </div>
              <div className="child-name">{child.name}</div>
            </div>
          ))}
        </div>

        <div className="main-container">
          <div className="steps-navigation">
            <div
              className={`step ${currentStep === 1 ? "active" : ""}`}
              onClick={() => setCurrentStep(1)}
            >
              1. Entry information
            </div>
            <div
              className={`step ${currentStep === 2 ? "active" : ""}`}
              onClick={() => setCurrentStep(2)}
            >
              2. Choose doctor
            </div>
            <div
              className={`step ${currentStep === 3 ? "active" : ""}`}
              onClick={() => setCurrentStep(3)}
            >
              3. Submit
            </div>
          </div>

          <div className="main-content">{renderStepContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default DoctorConsultation;
