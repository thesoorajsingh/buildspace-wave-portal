import React from 'react';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import Card from "./components/Card.jsx"

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xF2b346de7f2E4961895AbA9D82fF0A351b7cae4e";
  const contractABI = abi.abi;
  const isMetamask = window.ethereum && ethereum;
  // const toast = useToast();

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      ethereum ? console.log("Metamask Installed!", ethereum) : console.log("Please install Metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
        console.log("Total Waves -> ", allWaves);
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

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    }
    catch (error) {
      console.log(error);
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

        const waveTxn = await wavePortalContract.wave("This is a wave message v1");
        console.log("Mining...");

        await waveTxn.wait();
        console.log("Mined at: ", waveTxn.hash);

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
    console.log(allWaves)
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
      { allWaves.length > 0 ?
      <Card address="1234" name="Sooraj" time="1:24pm" /> :
        null
      }
    </main>
  );
}

export default App;