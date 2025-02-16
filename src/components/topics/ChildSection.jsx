import React, { useState } from "react";

const childArticles = [
    {
        image: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg",
        title: "Boosting Your Child's Academic Performance: Expert Tips",
        author: "Dr. Robert Miller",
        tags: ["#Education", "#Learning", "#Academic"],
    },
    {
        image: "https://images.pexels.com/photos/8612900/pexels-photo-8612900.jpeg",
        title: "Best After-School Activities for Well-Rounded Development",
        author: "Jennifer Adams",
        tags: ["#Activities", "#Development", "#Skills"],
    },
    {
        image: "https://images.pexels.com/photos/8613315/pexels-photo-8613315.jpeg",
        title: "Building Emotional Intelligence in Children",
        author: "Dr. Amanda Lee",
        tags: ["#Emotional", "#Growth", "#Development"],
    },
    {
        image: "https://images.pexels.com/photos/8612977/pexels-photo-8612977.jpeg",
        title: "Balancing Screen Time and Physical Activities",
        author: "Coach David Wilson",
        tags: ["#Technology", "#Health", "#Balance"],
    },
];

function ChildSection() {
    const [childFilter, setChildFilter] = useState("All");

    function getFilteredChildArticles() {
        switch (childFilter) {
            case "All":
                return childArticles;
            case "Academic Growth":
                return childArticles.filter((article) =>
                    article.tags.includes("#Academic") || article.tags.includes("#Education")
                );
            case "Extracurricular Activities":
                return childArticles.filter((article) =>
                    article.tags.includes("#Activities") || article.tags.includes("#Skills")
                );
            case "Emotional Intelligence":
                return childArticles.filter((article) =>
                    article.tags.includes("#Emotional") || article.tags.includes("#Growth")
                );
            case "Technology Use":
                return childArticles.filter((article) =>
                    article.tags.includes("#Technology")
                );
            case "Physical Fitness":
                // Chưa có data => tạm trả về all
                return childArticles;
            default:
                return childArticles;
        }
    }

    return (
        <div className="topic-section">
            <h3>Child</h3>
            <div className="topic-filters">
                <button
                    className={`filter-btn ${childFilter === "All" ? "active" : ""}`}
                    onClick={() => setChildFilter("All")}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${childFilter === "Academic Growth" ? "active" : ""
                        }`}
                    onClick={() => setChildFilter("Academic Growth")}
                >
                    Academic Growth
                </button>
                <button
                    className={`filter-btn ${childFilter === "Extracurricular Activities" ? "active" : ""
                        }`}
                    onClick={() => setChildFilter("Extracurricular Activities")}
                >
                    Extracurricular Activities
                </button>
                <button
                    className={`filter-btn ${childFilter === "Emotional Intelligence" ? "active" : ""
                        }`}
                    onClick={() => setChildFilter("Emotional Intelligence")}
                >
                    Emotional Intelligence
                </button>
                <button
                    className={`filter-btn ${childFilter === "Technology Use" ? "active" : ""
                        }`}
                    onClick={() => setChildFilter("Technology Use")}
                >
                    Technology Use
                </button>
                <button
                    className={`filter-btn ${childFilter === "Physical Fitness" ? "active" : ""
                        }`}
                    onClick={() => setChildFilter("Physical Fitness")}
                >
                    Physical Fitness
                </button>
            </div>

            <div className="topic-grid">
                {getFilteredChildArticles().map((item, index) => (
                    <div key={index} className="topic-card">
                        <div className="topic-image">
                            <img src={item.image} alt={item.title} />
                        </div>
                        <div className="topic-content">
                            <h4>{item.title}</h4>
                            <div className="topic-meta">
                                <span className="author">{item.author}</span>
                                <div className="topic-tags">
                                    {item.tags.map((tag, idx) => (
                                        <span key={idx} className="tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChildSection;
