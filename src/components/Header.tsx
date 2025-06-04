import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBell,
  faUser,
  faGear,
  faSignOut,
  faCheck,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../index.css';

library.add(faBell, faUser, faGear, faSignOut, faCheck, faBars, faTimes);

type HeaderProps = {
  user: any;
  handleLogOut: () => void;
};

export const Header: React.FC<HeaderProps> = ({ user, handleLogOut }) => {
  const [activePopup, setActivePopup] = useState<'profile' | 'notification' | 'settings' | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Close popups and menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActivePopup(null);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync notification settings
  useEffect(() => {
    const localPref = localStorage.getItem('notificationsEnabled');
    setNotificationsEnabled(localPref === 'true' && Notification.permission === 'granted');
  }, []);

  const toggleNotifications = async () => {
    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem('notificationsEnabled', 'true');
          setActivePopup('notification');
          setTimeout(() => setActivePopup(null), 2000);
        }
      } else if (Notification.permission === 'granted') {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);
        localStorage.setItem('notificationsEnabled', String(newState));
      } else if (Notification.permission === 'denied') {
        alert('Notifications are blocked in your browser settings. Please enable them manually.');
        setNotificationsEnabled(false);
        localStorage.setItem('notificationsEnabled', 'false');
      }
    } catch (error) {
      console.error('Notification toggle error:', error);
    }
  };

  const togglePopup = (popup: 'profile' | 'notification' | 'settings') => {
    setActivePopup(activePopup === popup ? null : popup);
    setIsMenuOpen(false);
  };

  return (
    <header className="header" ref={headerRef}>
      <div className="header__logo">
        <motion.div 
          className="logo-icon"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="logo-text">
            <img src="/app_logo.png" alt="App Logo" />
            <span>DO-DID</span>
          </span>
        </motion.div>
      </div>

      <div className="header__controls">
        <motion.button 
          className="hamburger-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} size="lg" />
        </motion.button>

        <div className="header__actions">
          <motion.button
            className={`header__action-btn ${activePopup === 'notification' ? 'active' : ''}`}
            onClick={() => togglePopup('notification')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Notifications"
          >
            <FontAwesomeIcon icon={faBell} />
            <span className="action-tooltip">Notifications</span>
          </motion.button>

          <motion.button
            className={`header__action-btn ${activePopup === 'settings' ? 'active' : ''}`}
            onClick={() => togglePopup('settings')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Settings"
          >
            <FontAwesomeIcon icon={faGear} />
            <span className="action-tooltip">Settings</span>
          </motion.button>

          <motion.button
            className={`header__action-btn profile-btn ${activePopup === 'profile' ? 'active' : ''}`}
            onClick={() => togglePopup('profile')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="User profile"
          >
            <div className="profile-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
            </div>
            <span className="action-tooltip">Profile</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="mobile-menu"
          >
            <ul className="mobile-menu-list">
              <li>
                <motion.button
                  className="mobile-menu-item"
                  onClick={() => togglePopup('notification')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Notifications"
                >
                  <FontAwesomeIcon icon={faBell} />
                  <span>Notifications</span>
                </motion.button>
              </li>
              <li>
                <motion.button
                  className="mobile-menu-item"
                  onClick={() => togglePopup('settings')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Settings"
                >
                  <FontAwesomeIcon icon={faGear} />
                  <span>Settings</span>
                </motion.button>
              </li>
              <li>
                <motion.button
                  className="mobile-menu-item"
                  onClick={() => togglePopup('profile')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Profile"
                >
                  <div className="profile-avatar">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" />
                    ) : (
                      <FontAwesomeIcon icon={faUser} />
                    )}
                  </div>
                  <span>Profile</span>
                </motion.button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePopup === 'profile' && (
          <motion.div
            className="header-popup profile-popup"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="profile-header">
              <div className="profile-avatar-large">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
              </div>
              <div className="profile-info">
                <h3>{user?.displayName || 'User'}</h3>
                <p>{user?.email || ''}</p>
              </div>
            </div>
            <motion.button
              className="logout-btn"
              onClick={handleLogOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Sign out"
            >
              <FontAwesomeIcon icon={faSignOut} />
              <span>Sign Out</span>
            </motion.button>
          </motion.div>
        )}

        {activePopup === 'notification' && (
          <motion.div
            className="header-popup notification-popup"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <h3 className="notification-title">Notifications</h3>
            <p>You'll receive reminders before task deadlines.</p>
            <div className={`notification-status ${notificationsEnabled ? 'enabled' : 'disabled'}`}>
              {notificationsEnabled && <FontAwesomeIcon icon={faCheck} />}
              <span>{notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}</span>
            </div>
          </motion.div>
        )}

        {activePopup === 'settings' && (
          <motion.div
            className="header-popup settings-popup"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <h3 className="settings-heading">Notification Settings</h3>
            <div className="setting-item">
              <label className="setting-label">
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={toggleNotifications}
                    aria-label="Toggle notifications"
                  />
                  <span className="slider"></span>
                </div>
                <span>Enable Notifications</span>
              </label>
              <p className="setting-description">
                Receive reminders for upcoming deadlines
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
