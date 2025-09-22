import React, { Component } from 'react';
import Identicon from 'identicon.js';
import box from '../box.png'

class Navbar extends Component {

  render() {
    return (
      <nav className="navbar modern-navbar">
        <div className="container-fluid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <a
            className="navbar-brand"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            DStorage
          </a>
          
          <div className="account-info">
            <small className="account-address">
              <a 
                target="_blank"
                className="account-address"
                rel="noopener noreferrer"
                href={"https://etherscan.io/address/" + this.props.account}
                title={this.props.account}
              >
                {this.props.account 
                  ? `${this.props.account.substring(0,6)}...${this.props.account.substring(38,42)}`
                  : 'Not Connected'
                }
              </a>
            </small>
            { this.props.account
              ? <img
                  alt="User Avatar"
                  className='user-avatar'
                  width='32'
                  height='32'
                  src={`data:image/png;base64,${new Identicon(this.props.account, 32).toString()}`}
                />
              : <div className="user-avatar" style={{ width: '32px', height: '32px', background: '#334155', borderRadius: '50%' }}></div>
            }
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;