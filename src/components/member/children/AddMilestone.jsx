import React, { useState } from "react";
import "./AddMilestone.css";
import MilestoneApi from "../../../services/milestoneApi";

function AddMilestone({ closeOverlay, onSuccess }) {
  const [milestoneName, setMilestoneName] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState("Medium");
  const [category, setCategory] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Tạo payload; luôn gán isPersonal = true
    const payload = {
      milestoneName,
      description,
      importance,
      category,
      minAge: parseInt(minAge, 10),
      maxAge: parseInt(maxAge, 10),
      isPersonal: true,
    };

    try {
      const response = await MilestoneApi.addMilestone(payload);
      if (onSuccess) onSuccess(response.data);
      closeOverlay();
    } catch (err) {
      setError("Failed to add milestone. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeOverlay}>
      <div className="add-milestone-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={closeOverlay}>×</button>
        <h2>Add Milestone</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Milestone Name</label>
            <input
              type="text"
              value={milestoneName}
              onChange={(e) => setMilestoneName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Importance</label>
            <select value={importance} onChange={(e) => setImportance(e.target.value)}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Min Age (months)</label>
            <input
              type="number"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Max Age (months)</label>
            <input
              type="number"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Adding..." : "Add Milestone"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMilestone;
