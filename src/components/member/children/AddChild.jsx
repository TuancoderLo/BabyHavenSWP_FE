import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../../config/axios.js";
import "./AddChild.css";

const AddChild = ({ closeOverlay }) => {
    const [formData, setFormData] = useState({
        name: "",
        memberId: "",
        dateOfBirth: "",
        gender: "",
        birthWeight: "",
        birthHeight: "",
        bloodType: "",
        allergies: "",
        notes: "",
        relationshipToMember: ""
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        const { name, memberId, gender, birthWeight, birthHeight, bloodType, dateOfBirth } = formData;

        if (!name.trim()) newErrors.name = "Name is required!";
        if (!memberId.trim()) newErrors.memberId = "Member ID is required!";
        if (!gender) newErrors.gender = "Gender is required!";
        if (!birthWeight) newErrors.birthWeight = "Birth Weight is required!";
        if (!birthHeight) newErrors.birthHeight = "Birth Height is required!";
        if (!bloodType) newErrors.bloodType = "Blood Type is required!";
        if (!dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required!";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post("Children", formData);
            console.log('Child added successfully:', response.data);
            navigate('/member/');  // Redirect to a list or other page after successful submission
        } catch (error) {
            console.error('Error adding child:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            closeOverlay(); // Close the overlay if the user clicks outside the form
        }
    };

    return (
        <div className="add-child-overlay" onClick={handleClose}>
            <form className="add-child-form" onSubmit={handleSubmit}>
                <button
                    type="button"
                    className="add-child-close-btn"
                    onClick={() => closeOverlay()}
                >
                    ×
                </button>

                <h2 className="add-child-heading">Add Child</h2>

                <div className="add-child-error">{errors.general && <p>{errors.general}</p>}</div>

                {/* Name Field */}
                <label className="add-child-label">Name</label>
                {errors.name && <div className="add-child-error">{errors.name}</div>}
                <input
                    className={`add-child-input ${errors.name ? 'error-input' : ''}`}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                {/* Member ID Field */}
                <label className="add-child-label">Member ID</label>
                {errors.memberId && <div className="add-child-error">{errors.memberId}</div>}
                <input
                    className={`add-child-input ${errors.memberId ? 'error-input' : ''}`}
                    type="text"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleChange}
                    required
                />

                {/* Date of Birth Field */}
                <label className="add-child-label">Date of Birth</label>
                {errors.dateOfBirth && <div className="add-child-error">{errors.dateOfBirth}</div>}
                <input
                    className={`add-child-input ${errors.dateOfBirth ? 'error-input' : ''}`}
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                />

                {/* Gender Field */}
                <label className="add-child-label">Gender</label>
                {errors.gender && <div className="add-child-error">{errors.gender}</div>}
                <select
                    className={`add-child-input ${errors.gender ? 'error-input' : ''}`}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                </select>

                {/* Birth Weight Field */}
                <label className="add-child-label">Birth Weight (kg)</label>
                {errors.birthWeight && <div className="add-child-error">{errors.birthWeight}</div>}
                <input
                    className={`add-child-input ${errors.birthWeight ? 'error-input' : ''}`}
                    type="number"
                    name="birthWeight"
                    value={formData.birthWeight}
                    onChange={handleChange}
                    required
                />

                {/* Birth Height Field */}
                <label className="add-child-label">Birth Height (cm)</label>
                {errors.birthHeight && <div className="add-child-error">{errors.birthHeight}</div>}
                <input
                    className={`add-child-input ${errors.birthHeight ? 'error-input' : ''}`}
                    type="number"
                    name="birthHeight"
                    value={formData.birthHeight}
                    onChange={handleChange}
                    required
                />

                {/* Blood Type Field */}
                <label className="add-child-label">Blood Type</label>
                {errors.bloodType && <div className="add-child-error">{errors.bloodType}</div>}
                <input
                    className={`add-child-input ${errors.bloodType ? 'error-input' : ''}`}
                    type="text"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    required
                />

                {/* Allergies Field */}
                <label className="add-child-label">Allergies</label>
                <input
                    className="add-child-input"
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                />

                {/* Notes Field */}
                <label className="add-child-label">Notes</label>
                <input
                    className="add-child-input"
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                />

                {/* Relationship to Member Field */}
                <label className="add-child-label">Relationship to Member</label>
                {errors.relationshipToMember && <div className="add-child-error">{errors.relationshipToMember}</div>}
                <input
                    className={`add-child-input ${errors.relationshipToMember ? 'error-input' : ''}`}
                    type="text"
                    name="relationshipToMember"
                    value={formData.relationshipToMember}
                    onChange={handleChange}
                    required
                />

                {/* Submit Button */}
                <button className="add-child-button" type="submit" disabled={isLoading}>
                    {isLoading ? 'Adding Child...' : 'Add Child'}
                </button>
            </form>
        </div>
    );
};

export default AddChild;
