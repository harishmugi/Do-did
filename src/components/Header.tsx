
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// src/icons.js
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCoffee,
  faBell,
  faUser, faGear
} from '@fortawesome/free-solid-svg-icons';

import { faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { useState } from 'react';
type HeaderProps = {
  user: any;
  handleLogOut: () => void;
};
library.add(faCoffee, faBell, faUser, faFacebook, faTwitter);
export const Header: React.FC<HeaderProps> = ({ user, handleLogOut }) => {

  const [isActive, setISActive] = useState(false)
  return (<>
    <header className="header">
      <div className="icon">logo</div>
      <div className="side_options">
        <div className="notification_icon"> <FontAwesomeIcon icon={faBell} /></div>
        <div onClick={() => setISActive(!isActive)} className="profile_icon"><FontAwesomeIcon icon={faUser} /></div>
        <div className="settings_icon"><FontAwesomeIcon icon={faGear} /></div>

      </div>
      <div className={isActive?"user_div display_none":"display_none"}>
        <div style={{ textAlign: "center" }}><FontAwesomeIcon icon={faUser} style={{ fontSize: "50px", textAlign: "center", border: "3px solid #fff", padding: "20px", borderRadius: "50%" }} />
          <p>{user.email || user.displayName}</p>
        </div>    <button onClick={handleLogOut}>Sign Out</button>
      </div>
    </header>



  </>)
}