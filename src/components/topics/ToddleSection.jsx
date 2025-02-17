import React, { useState } from "react";

const toddleArticles = [
    {
        image: "https://todaysparent.mblycdn.com/uploads/tp/2016/03/29-toddler-discipline-tactics-that-work.jpg",
        title: "Effective Discipline Strategies for Toddlers",
        author: "Dr. Rachel Green",
        tags: ["#Discipline", "#Behavior", "#Parenting"],
    },
    {
        image: "https://keeptoddlersbusy.com/wp-content/uploads/2020/09/Preschool-Learning-Activity-Counting-clothespin-wheel-1140x933.jpg",
        title: "Fun Learning Activities for Toddler Development",
        author: "Jessica Williams",
        tags: ["#Learning", "#Development", "#Activities"],
    },
    {
        image: "https://assets.babycenter.com/ims/2022/10/toddler-potty-training-10-oct-2022_4x3.jpg",
        title: "Complete Guide to Successful Potty Training",
        author: "Dr. James Anderson",
        tags: ["#PottyTraining", "#Tips", "#Guide"],
    },
    {
        image: "https://onceuponafarmorganics.com/cdn/shop/articles/2160px_f6ae9da3-be10-4471-a933-d6d0cecf3b4e.jpg?v=1683323853",
        title: "Healthy and Easy Toddler Meal Ideas",
        author: "Chef Maria Garcia",
        tags: ["#Nutrition", "#Meals", "#HealthyEating"],
    },
];

function ToddleSection() {
    const [toddleFilter, setToddleFilter] = useState("All");

    function getFilteredToddleArticles() {
        switch (toddleFilter) {
            case "All":
                return toddleArticles;
            case "Discipline & Behavior":
                return toddleArticles.filter((article) =>
                    article.tags.includes("#Discipline") || article.tags.includes("#Behavior")
                );
            case "Early Learning Tools":
                return toddleArticles.filter((article) =>
                    article.tags.includes("#Learning") || article.tags.includes("#Development")
                );
            case "Potty Training":
                return toddleArticles.filter((article) =>
                    article.tags.includes("#PottyTraining")
                );
            case "Healthy Meals & Snacks":
                return toddleArticles.filter((article) =>
                    article.tags.includes("#Meals") || article.tags.includes("#HealthyEating")
                );
            case "Social Skills Development":
                // Chưa có data => tạm trả về all
                return toddleArticles;
            default:
                return toddleArticles;
        }
    }

    return (
        <div className="topic-section">
            <h3>Toddle</h3>
            <div className="topic-filters">
                <button
                    className={`filter-btn ${toddleFilter === "All" ? "active" : ""}`}
                    onClick={() => setToddleFilter("All")}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${toddleFilter === "Discipline & Behavior" ? "active" : ""
                        }`}
                    onClick={() => setToddleFilter("Discipline & Behavior")}
                >
                    Discipline & Behavior
                </button>
                <button
                    className={`filter-btn ${toddleFilter === "Early Learning Tools" ? "active" : ""
                        }`}
                    onClick={() => setToddleFilter("Early Learning Tools")}
                >
                    Early Learning Tools
                </button>
                <button
                    className={`filter-btn ${toddleFilter === "Potty Training" ? "active" : ""
                        }`}
                    onClick={() => setToddleFilter("Potty Training")}
                >
                    Potty Training
                </button>
                <button
                    className={`filter-btn ${toddleFilter === "Healthy Meals & Snacks" ? "active" : ""
                        }`}
                    onClick={() => setToddleFilter("Healthy Meals & Snacks")}
                >
                    Healthy Meals & Snacks
                </button>
                <button
                    className={`filter-btn ${toddleFilter === "Social Skills Development" ? "active" : ""
                        }`}
                    onClick={() => setToddleFilter("Social Skills Development")}
                >
                    Social Skills Development
                </button>
            </div>

            <div className="topic-grid">
                {getFilteredToddleArticles().map((item, index) => (
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

export default ToddleSection;
