import React, {Component, useState} from 'react';
import '../css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { ethers } from "ethers";
import Box from "3box";



import NavBar from './NavBar'
import Register from './register/Register'
import Approve from './approve/Approve'


var registeredZones = require('../registeredTestZonesSmall.json');

// import Approve from './approve/Approve'

class App extends Component {

  state = {
    needToAWeb3Browser: false,
    registeredZones: registeredZones,
    zoneToRegister: undefined,
  }

  constructor() {
    super()
    this.setZoneToRegister = this.setZoneToRegister.bind(this)
  }

  async setZoneToRegister(zone) {
    this.setState({zoneToRegister: zone});
  }

  async getAddressFromMetaMask() {
    if (typeof window.ethereum == "undefined") {
      this.setState({ needToAWeb3Browser: true });
    } else {
      window.ethereum.autoRefreshOnNetworkChange = false; //silences warning about no autofresh on network change
      const accounts = await window.ethereum.enable();
      this.setState({ accounts });
    }
  }

  async componentDidMount() {
    console.log(registeredZones);
    await this.getAddressFromMetaMask();
    if (this.state.accounts) {
      console.log("connected to provider!");
      const box = await Box.openBox(this.state.accounts[0], window.ethereum);
      // Sync 3Box
      await box.syncDone;
      // window.state = this.state;
      console.log("3Box synced");
      // const spaceList = await Box.listSpaces(this.state.accounts[0]);
      // console.log("number of space: " + spaceList.length);
      const space = await box.openSpace("zones");
      await space.syncDone;
      this.setState({ box, space });
      console.log("space synced! ", "zone");
    }
  }


  render() {
    if (this.state.needToAWeb3Browser) {
      return <h1>Please install metamask</h1>
    }
    console.log(this.state);

    return (
      <Router>
        <div className = "app">
          <NavBar />
          {this.state.needToAWeb3Browser && <h2>Please install metamask🦊</h2>}
          {(!this.state.needToAWeb3Browser && !this.state.accounts) && <h2>Connect MetaMask🤝</h2>}
            {this.state.accounts && (
              <Switch>
                <Route path="/register">
                  <Register 
                    addr = {this.state.accounts[0]} 
                    box = {this.state.box} 
                    space = {this.state.space} 
                    registeredZones = {this.state.registeredZones} 
                    zoneToRegister = {this.state.zoneToRegister} 
                    setZoneToRegister={this.setZoneToRegister} />
                </Route>
                <Route path="/approve">
                  <Approve 
                    addr = {this.state.accounts[0]} 
                    box = {this.state.box} 
                    space = {this.state.space} 
                    registeredZones = {this.state.registeredZones}/>
                </Route>
                <Route path="/">

                </Route>
              </Switch>
            )}

        </div>
      </Router>
    );
  }
}

export default App;
