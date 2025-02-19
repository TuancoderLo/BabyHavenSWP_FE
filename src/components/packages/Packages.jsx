import React, { useState, useEffect } from "react";
import packages from "../../assets/packages.png";
import "./Packages.css";
function Packages() {
    const [open, setOpen] = useState(false);

    // Dữ liệu Packages (ví dụ)
    const [packagesData, setPackagesData] = useState([]);

    useEffect(() => {
        // fetch("/api/packages")
        //   .then(res => res.json())
        //   .then(data => setPackagesData(data))
        //   .catch(err => console.error(err));

        // Mock data cho giống ảnh thứ 2
        setPackagesData([
            {
                id: 1,
                planName: "CURRENT PLAN",
                title: "Free",
                price: "0",
                detail: "/ Tháng",
            },
            {
                id: 2,
                planName: "STANDARD",
                title: "379.000",
                price: "/3 Tháng",
                detail: "Try Standard",
            },
            {
                id: 3,
                planName: "PREMIUM",
                title: "1.279.000",
                price: "/1 Year",
                detail: "Try Premium",
            },
        ]);
    }, []);

    // Mở modal
    const handleOpen = () => {
        setOpen(true);
    };

    // Đóng modal
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            {/* ICON Packages nổi ở góc phải dưới */}
            <div className="floating-icon" onClick={handleOpen}>
                <img src={packages} alt="Packages Icon" />
            </div>

            {/* MODAL (overlay + content) */}
            {open && (
                <div className="packages-overlay" onClick={handleClose}>
                    <div className="packages-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={handleClose}>
                            &times;
                        </button>

                        <h2 className="modal-title">Explore the different</h2>
                        <p className="modal-subtitle">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>

                        <div className="packages-row">
                            {packagesData.map((pkg) => {
                                const isPremium = pkg.planName === "PREMIUM";
                                return (
                                    <div
                                        key={pkg.id}
                                        className={`package-card ${isPremium ? "premium" : ""}`}
                                    >
                                        {/* Icon gắn lên gói PREMIUM */}
                                        {isPremium && (
                                            <img
                                                src={packages}
                                                alt="Premium badge"
                                                className="premium-badge"
                                            />
                                        )}
                                        <h3>{pkg.planName}</h3>
                                        <div className="package-price">
                                            <span className="price-amount">{pkg.title}</span>
                                            <span className="price-duration">{pkg.price}</span>
                                        </div>
                                        {/* Nếu planName=CURRENT PLAN => hiển thị text Free, 
                        nếu planName=STANDARD => hiển thị Try Standard, 
                        etc. (mock data detail) */}
                                        <button className="package-btn">
                                            {pkg.detail || "Buy now"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Packages;