import React from 'react';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x51E39eCd468bE4Ae83295e2894be7380edbbFDDA";
  const contractABI = abi.abi;
  const isMetamask = window.ethereum && ethereum;
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      ethereum ? console.log("Metamask Installed!", ethereum) : console.log("Please install Metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  // connect wallet function
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      !ethereum ? console.log("Install Metamask") : console.log("Metamask Exists!");

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected!", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.error(err)
    }
  }

  const wave = async () => {
    try {
      if (isMetamask) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...");

        await waveTxn.wait();
        console.log("Mined at: ",waveTxn.hash);
        
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("No Eth Object");
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    isWalletConnected();
  }, [])

  return (
    <main>
      <h1>Hi There!</h1>
      <p>I'm Sooraj and I solve problems as a hobby!</p>
      <>
        {!currentAccount && (
          <button className="wave-button" onClick={connectWallet}>🦊 Connect your wallet!</button>
        )}
        <button className="wave-button" onClick={wave}>👋 Send Me a Wave!</button>
      </>
    </main>
  );
}

export default App;