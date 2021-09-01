import React, { createRef } from 'react';
import './App.css';
const { BN, Long, bytes, units } = require('@zilliqa-js/util');
const { toBech32Address } = require('@zilliqa-js/crypto');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { StatusType, MessageType } = require('@zilliqa-js/subscriptions');

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      contractAddress: '',
      welcomeMsg: '',
      pubKey: localStorage.getItem('pubKey')
    };

    this.pubKeyInputRef = createRef(null)
  }

  handleAddressChange = (event) => {
    this.setState({ contractAddress: event.target.value });
  }

  handleSubmit = () => {
    localStorage.setItem("contract_address", this.state.contractAddress);
  }

  verifyWalletEnable = async (callback) => {
    if (window.zilPay.wallet.isEnable) {
      callback();
    }
    else {
      const isConnect = await window.zilPay.wallet.connect();
      if (isConnect) {
        callback();
      } else {
        alert("Not able to call setHello as transaction is rejected");
      }
    }
  }

  setPublicKey = async () => {
    const zilliqa = window.zilPay;
    let value = this.pubKeyInputRef.current.value

    console.log(value, "setPublicKey value");

    let contractAddress = localStorage.getItem("contract_address");
    const CHAIN_ID = 333;
    const MSG_VERSION = 1;
    const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);
    const myGasPrice = units.toQa('2000', units.Units.Li); // Gas Price that will be used by all transactions
    // contractAddress = contractAddress.substring(2);

    const ftAddr = toBech32Address(contractAddress);
    try {
      const contract = zilliqa.contracts.at(ftAddr);
      const callTx = await contract.call(
        'setPublicKey',
        [
          {
            vname: 'pubKey',
            type: 'ByStr33',
            value: value
          }
        ],
        {
          // amount, gasPrice and gasLimit must be explicitly provided
          version: VERSION,
          amount: new BN(0),
          gasPrice: myGasPrice,
          gasLimit: Long.fromNumber(10000),
        }
      );
      console.log(callTx, "setPublicKey response");
      alert('success')


    } catch (err) {
      alert('error')

      console.log(err);
    }
  }

  getPublicKey = async () => {

    const zilliqa = window.zilPay;
    let contractAddress = localStorage.getItem("contract_address");

    const CHAIN_ID = 333;
    const MSG_VERSION = 1;
    const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);

    const myGasPrice = units.toQa('2000', units.Units.Li); // Gas Price that will be used by all transactions

    // contractAddress = contractAddress.substring(2);
    const ftAddr = toBech32Address(contractAddress);
    try {
      const contract = zilliqa.contracts.at(ftAddr);
      const callTx = await contract.call(
        'getPublicKey',
        [],
        {
          // amount, gasPrice and gasLimit must be explicitly provided
          version: VERSION,
          amount: new BN(0),
          gasPrice: myGasPrice,
          gasLimit: Long.fromNumber(10000),
        }
      );
      console.log(callTx, "getPublicKey response");
      alert('success')

      if (callTx.pubKey) {
        this.setState({ pubKey: callTx.pubKey })
        localStorage.setItem('pubKey', callTx.pubKey)
      }
      // this.eventLogSubscription();
    } catch (err) {
      alert('error')
      console.log(err);
    }
  }

  connectZilpay = async () => {
    try {
      await window.zilPay.wallet.connect();
      if (window.zilPay.wallet.isConnect) {
        localStorage.setItem("zilpay_connect", true);
        window.location.reload(false);
      } else {
        alert("Zilpay connection failed, try again...")
      }
    } catch (error) { }
  }

  render() {
    const { pubKey } = this.state

    return (
      <div className="App">
        <div> {`Current Contract Address : ${localStorage.getItem("contract_address")}`} </div>
        <h3>Update Contract Address</h3>

        <form onSubmit={this.handleSubmit}>
          <label>
            New Address <br />
            <input type="text" onChange={this.handleAddressChange} size="70" placeholder="Format: 0x47d9CEea9a2DA23dc6b2D96A16F7Fbf884580665" />
          </label><br />
          <input type="submit" value="Submit" />
          <hr></hr>
        </form>


        <div> Lists of Transitions</div>
        <br />

        <label>{'Set Public Key'}</label>
        <br />
        <input type="text" ref={this.pubKeyInputRef} size="30" />
        <br />
        <button onClick={() => this.verifyWalletEnable(this.setPublicKey)}>{'Set Public Key'}</button>
        <br />
        <br />

        <label>{'Get Public Key'}</label>
        <br />
        <button onClick={() => this.verifyWalletEnable(this.getPublicKey)}>{'Get Public Key'}</button>
        <br />
        <br />

        <div> {`Current Public Key : ${pubKey}`} </div>
        <div> {`Current Welcome Msg : ${this.state.welcomeMsg}`} </div>
        <hr></hr>

        {!localStorage.getItem("zilpay_connect") && <button onClick={this.connectZilpay}>Connect Zilpay</button>}
        <br /><br />

      </div>

    );
  }
}
