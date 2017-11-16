import React from 'react';
import { Link } from 'react-router';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import DisplaySteps from './displaySteps';
import styles from './newHeader.css';

const ChallengeBar = ({ numberOfSteps, userName }) => {
  return (
    <Navbar fluid className={styles.navbar}>
      <Navbar.Header>
        <Navbar.Brand>
          <Link className={styles.brandName} to="/" >Code-Challenge</Link>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav>
          <DisplaySteps steps={numberOfSteps} />
        </Nav>
        <Nav pullRight>
          <NavItem eventKey={1} href="profile">{userName}</NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

ChallengeBar.propTypes = {
  numberOfSteps: React.PropTypes.number,
  userName: React.PropTypes.string,
};

export default ChallengeBar;