import React, { useState } from "react";

const babyArticles = [
    {
        image: "https://images.pexels.com/photos/235127/pexels-photo-235127.jpeg",
        title: "Essential Guide to Baby Feeding Schedules",
        author: "Dr. Emily Chen",
        tags: ["#Feeding", "#Schedule", "#Tips"],
    },
    {
        image:
            "https://images.squarespace-cdn.com/content/v1/5a943503b40b9d58b1938792/1525104916603-YSPWOIJ3SE5SEOOJYEE4/Look+no+further+for+the+quickest+method+to+get+the+sleep+results+you+seek.+With+Extinction%2C+you+allow+your+child+the+opportunity+to+fall+asleep+completely+on+his+own.",
        title: "Sleep Training Methods: Finding What Works for Your Baby",
        author: "Lisa Thompson",
        tags: ["#Sleep", "#Training", "#Development"],
    },
    {
        image: "https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg",
        title: "Understanding Your Baby's Growth Milestones",
        author: "Dr. Michael Brown",
        tags: ["#Growth", "#Milestones", "#Development"],
    },
    {
        image: "https://images.pexels.com/photos/3875089/pexels-photo-3875089.jpeg",
        title: "Fun and Educational Activities for Baby Bonding",
        author: "Sarah Parker",
        tags: ["#Bonding", "#Activities", "#Learning"],
    },
];

function BabySection() {
    const [babyFilter, setBabyFilter] = useState("All");

    function getFilteredBabyArticles() {
        switch (babyFilter) {
            case "All":
                return babyArticles;
            case "Feeding Essentials":
                return babyArticles.filter((article) =>
                    article.tags.includes("#Feeding")
                );
            case "Sleep Training Tips":
                return babyArticles.filter((article) =>
                    article.tags.includes("#Sleep") || article.tags.includes("#Training")
                );
            case "Developmental Milestones":
                return babyArticles.filter((article) =>
                    article.tags.includes("#Milestones") || article.tags.includes("#Growth")
                );
            case "Health & Immunization":
                // Chưa có data demo => tạm trả về all
                return babyArticles;
            case "Bonding Activities":
                return babyArticles.filter((article) =>
                    article.tags.includes("#Bonding") || article.tags.includes("#Activities")
                );
            default:
                return babyArticles;
        }
    }

    return (
        <div className="topic-section">
            <h3>Baby</h3>
            <div className="topic-filters">
                <button
                    className={`filter-btn ${babyFilter === "All" ? "active" : ""}`}
                    onClick={() => setBabyFilter("All")}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${babyFilter === "Feeding Essentials" ? "active" : ""
                        }`}
                    onClick={() => setBabyFilter("Feeding Essentials")}
                >
                    Feeding Essentials
                </button>
                <button
                    className={`filter-btn ${babyFilter === "Sleep Training Tips" ? "active" : ""
                        }`}
                    onClick={() => setBabyFilter("Sleep Training Tips")}
                >
                    Sleep Training Tips
                </button>
                <button
                    className={`filter-btn ${babyFilter === "Developmental Milestones" ? "active" : ""
                        }`}
                    onClick={() => setBabyFilter("Developmental Milestones")}
                >
                    Developmental Milestones
                </button>
                <button
                    className={`filter-btn ${babyFilter === "Health & Immunization" ? "active" : ""
                        }`}
                    onClick={() => setBabyFilter("Health & Immunization")}
                >
                    Health & Immunization
                </button>
                <button
                    className={`filter-btn ${babyFilter === "Bonding Activities" ? "active" : ""
                        }`}
                    onClick={() => setBabyFilter("Bonding Activities")}
                >
                    Bonding Activities
                </button>
            </div>

            <div className="topic-grid">
                {getFilteredBabyArticles().map((item, index) => (
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

export default BabySection;
