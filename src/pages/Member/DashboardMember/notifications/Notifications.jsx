import React, { useState, useEffect } from 'react';
import './Notifications.css';
import { Link } from 'react-router-dom';

// Import icon từ react-icons
import {
  FaExclamationCircle,
  FaEnvelopeOpenText,
  FaCalendarCheck,
  FaCreditCard,
  FaGift,
} from 'react-icons/fa';

const sampleNotifications = [
  { id: 1, type: 'alert', message: 'Child health alert: Please check vaccination schedule.', timestamp: new Date('2025-03-01T10:00:00'), read: false },
  { id: 2, type: 'contact', message: 'Doctor replied: Your consultation message has a response.', timestamp: new Date('2025-03-02T12:30:00'), read: true },
  { id: 3, type: 'appointment', message: 'Appointment reminder: Doctor visit on Mar 10, 2025.', timestamp: new Date('2025-03-03T09:15:00'), read: false },
  { id: 4, type: 'transaction', message: 'Payment successful for membership upgrade.', timestamp: new Date('2025-03-04T14:45:00'), read: true },
  { id: 5, type: 'offer', message: 'New offer: Enjoy discount on premium package.', timestamp: new Date('2025-03-05T16:20:00'), read: false },
  { id: 6, type: 'alert', message: 'Growth chart updated. Check your child\'s progress.', timestamp: new Date('2025-03-06T08:00:00'), read: false },
];

const typeIcons = {
  alert: <FaExclamationCircle />,
  contact: <FaEnvelopeOpenText />,
  appointment: <FaCalendarCheck />,
  transaction: <FaCreditCard />,
  offer: <FaGift />,
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Fetch data (demo)
    setNotifications(sampleNotifications);
  }, []);

  const filteredNotifications = notifications.filter(
    n => filter === 'all' || n.type === filter
  );

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      <div className="filter-container">
        <label htmlFor="filter">Filter by type: </label>
        <select
          id="filter"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="alert">Child Alert</option>
          <option value="contact">Contact Doctor</option>
          <option value="appointment">Appointment Reminder</option>
          <option value="transaction">Payment Transaction</option>
          <option value="offer">Offers & Updates</option>
        </select>
      </div>

      <ul className="notifications-list">
        {filteredNotifications.map(n => (
          <li key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
            <span className="notification-icon">
              {typeIcons[n.type] || <FaExclamationCircle />}
            </span>
            <div className="notification-content">
              <p className="notification-message">{n.message}</p>
              <span className="notification-timestamp">
                {n.timestamp.toLocaleString()}
              </span>
            </div>
            {!n.read && (
              <button className="mark-read-btn" onClick={() => markAsRead(n.id)}>
                Mark as read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notifications;
