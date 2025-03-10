import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './NotificationDropdown.css';

// Import icon từ react-icons
import {
  FaBell,
  FaExclamationCircle,
  FaEnvelopeOpenText,
  FaCalendarCheck,
  FaCreditCard,
  FaGift,
} from 'react-icons/fa';

const sampleNotifications = [
  { id: 1, type: 'alert', message: 'Child health alert: Check vaccination.', timestamp: new Date('2025-03-01T10:00:00'), read: false },
  { id: 2, type: 'contact', message: 'Doctor replied: Please review your consultation.', timestamp: new Date('2025-03-02T12:30:00'), read: true },
  { id: 3, type: 'appointment', message: 'Appointment reminder: Visit on Mar 10, 2025.', timestamp: new Date('2025-03-03T09:15:00'), read: false },
  { id: 4, type: 'transaction', message: 'Payment transaction: Upgrade successful.', timestamp: new Date('2025-03-04T14:45:00'), read: true },
  { id: 5, type: 'offer', message: 'New offer: Discount on premium package.', timestamp: new Date('2025-03-05T16:20:00'), read: false },
  { id: 6, type: 'alert', message: 'Growth chart updated for your child.', timestamp: new Date('2025-03-06T08:00:00'), read: false },
];

// Map type => icon component
const typeIcons = {
  alert: <FaExclamationCircle />,
  contact: <FaEnvelopeOpenText />,
  appointment: <FaCalendarCheck />,
  transaction: <FaCreditCard />,
  offer: <FaGift />,
};

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Giả lập dữ liệu thông báo
    setNotifications(sampleNotifications);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy 5 thông báo mới nhất
  const recentNotifications = [...notifications]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // Có thông báo chưa đọc?
  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-bell" onClick={toggleDropdown}>
        <FaBell size={24} />
        {hasUnread && <span className="unread-indicator" />}
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <ul>
            {recentNotifications.map(n => (
              <li
                key={n.id}
                className={`dropdown-item ${n.read ? 'read' : 'unread'}`}
              >
                <span className="item-icon">
                  {typeIcons[n.type] || <FaExclamationCircle />}
                </span>
                <span className="item-message">{n.message}</span>
              </li>
            ))}
          </ul>
          <Link to="/member/notifications" className="view-all-btn">
            View All
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
