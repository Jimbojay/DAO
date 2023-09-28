import Navbar from 'react-bootstrap/Navbar';
import { ethers } from 'ethers';

import logo from '../logo.png';

const Navigation = ({ account, userBalance}) => {
  return (
    <Navbar className='my-3'>
      <img
        alt="logo"
        src={logo}
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand href="#">Dapp University DAO</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          <p>Account: {account} </p>
          {/*<p> User balance: {ethers.utils.formatUnits(userBalance.toString(),18)} DAPP  </p>*/}

        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
