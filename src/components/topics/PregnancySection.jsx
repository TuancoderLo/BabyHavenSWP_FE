import React, { useState } from "react";

// Dữ liệu demo
const pregnancyArticles = [
    {
        image: "https://top3.vn/uploads/source/BaoNgoc/hinh-anh-me-va-be.jpg",
        title: "2 Genius TikTok Organizing Products, Approved by Moms",
        author: "John Smith",
        tags: ["#Nutrition", "#Wellness", "#Tips"],
    },
    {
        image: "https://thuthuatnhanh.com/wp-content/uploads/2022/06/Anh-me-va-be.jpg",
        title: "Essential Pregnancy Exercises for a Healthy Journey",
        author: "Emma Davis",
        tags: ["#Exercise", "#Fitness", "#Health"],
    },
    {
        image: "https://img5.thuthuatphanmem.vn/uploads/2021/12/16/hinh-anh-me-va-be-gai-cute_094356707.jpg",
        title: "Complete Guide to Prenatal Care: What to Expect",
        author: "Dr. Sarah Wilson",
        tags: ["#PrenatalCare", "#Health", "#Guide"],
    },
    {
        image: "https://studiovietnam.com/wp-content/uploads/2020/10/chup-anh-nghe-thuat-cho-me-va-be-7.jpg",
        title: "Nutrition Tips for a Healthy Pregnancy Diet",
        author: "Maria Rodriguez",
        tags: ["#Nutrition", "#Diet", "#Health"],
    },
];

function PregnancySection() {
    // State lưu filter hiện tại
    const [pregnancyFilter, setPregnancyFilter] = useState("All");

    // Hàm lọc bài viết
    function getFilteredPregnancyArticles() {
        switch (pregnancyFilter) {
            case "All":
                return pregnancyArticles;

            case "Nutrition & Wellness":
                // Lọc bài có tag #Nutrition hoặc #Wellness
                return pregnancyArticles.filter((article) =>
                    article.tags.includes("#Nutrition") || article.tags.includes("#Wellness")
                );

            case "Exercise & Fitness":
                return pregnancyArticles.filter((article) =>
                    article.tags.includes("#Exercise") || article.tags.includes("#Fitness")
                );

            case "Prenatal Care":
                return pregnancyArticles.filter((article) =>
                    article.tags.includes("#PrenatalCare")
                );

            case "Preparing for Birth":
                // Chưa có data demo => Tạm trả về toàn bộ
                return pregnancyArticles;

            case "Emotional Well-being":
                // Chưa có data demo => Tạm trả về toàn bộ
                return pregnancyArticles;

            default:
                return pregnancyArticles;
        }
    }

    return (
        <div className="topic-section">
            <h3>Pregnancy</h3>
            <div className="topic-filters">
                <button
                    className={`filter-btn ${pregnancyFilter === "All" ? "active" : ""}`}
                    onClick={() => setPregnancyFilter("All")}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${pregnancyFilter === "Nutrition & Wellness" ? "active" : ""
                        }`}
                    onClick={() => setPregnancyFilter("Nutrition & Wellness")}
                >
                    Nutrition & Wellness
                </button>
                <button
                    className={`filter-btn ${pregnancyFilter === "Exercise & Fitness" ? "active" : ""
                        }`}
                    onClick={() => setPregnancyFilter("Exercise & Fitness")}
                >
                    Exercise & Fitness
                </button>
                <button
                    className={`filter-btn ${pregnancyFilter === "Prenatal Care" ? "active" : ""
                        }`}
                    onClick={() => setPregnancyFilter("Prenatal Care")}
                >
                    Prenatal Care
                </button>
                <button
                    className={`filter-btn ${pregnancyFilter === "Preparing for Birth" ? "active" : ""
                        }`}
                    onClick={() => setPregnancyFilter("Preparing for Birth")}
                >
                    Preparing for Birth
                </button>
                <button
                    className={`filter-btn ${pregnancyFilter === "Emotional Well-being" ? "active" : ""
                        }`}
                    onClick={() => setPregnancyFilter("Emotional Well-being")}
                >
                    Emotional Well-being
                </button>
            </div>

            <div className="topic-grid">
                {getFilteredPregnancyArticles().map((item, index) => (
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

export default PregnancySection;
