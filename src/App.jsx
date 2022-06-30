import React from 'react';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import './App.scss';
import abi from "./utils/WavePortal.json";
import Card from "./components/Card.jsx"

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [latest, setLatest] = useState([]);
  const contractAddress = "0x05545C5096e3B861D175096Df3377576843cDeBD";
  const contractABI = abi.abi;
  const isMetamask = window.ethereum && ethereum;
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [input, setInput] = useState("")

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
        const signer = await provider.getSigner();
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
        setLatest(wavesCleaned[wavesCleaned.length-1]);
        console.log(latest)
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  const wave = async (message) => {
    try {
      if (isMetamask) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setButtonEnabled(false);
        setButtonLoading(true);
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining...");

        await waveTxn.wait();
        console.log("Mined at: ", waveTxn.hash);
        setButtonLoading(false);
        setButtonEnabled(true);

        count = await wavePortalContract.getTotalWaves();
        setInput("");
        getAllWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("No Eth Object");
      }
    }
    catch (error) {
      console.error(error);
      setButtonLoading(false);
      setButtonEnabled(true);
    }
  }

  useEffect(() => {
    isWalletConnected();
    getAllWaves();
  }, [currentAccount])

  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

  return (
    <main>
      <h1>Hi There!</h1>
      <p>I'm <span style={{ color: "black", textDecoration: "underline" }}>Sooraj</span> and I solve problems as a hobby!</p>
      <p>Send me your playlist or your most controversial opinion 👀</p>
      <>
        {!currentAccount ? (
          <button className="wave-button" onClick={connectWallet}>🦊 Connect your wallet!</button>
        ) : (
            <input
              required
              type="text"
              value={input || ""}
              onChange={(e) => {
                setInput(e.target.value);
                input.length !== 0 ? setButtonEnabled(true) : setButtonEnabled(false);
              }}
              className={`input-box valid-input`}
              placeholder="Drop me your playlist or your secrets!"></input>
          )}
        <div>
          <button className={buttonEnabled ? "wave-button" : buttonLoading ? "wave-button-loading" : "wave-button-disabled"} onClick={() => wave(input)}>👋 Send Me a Wave!</button>
        </div>
      </>
      {
        allWaves.length > 0 && latest?.address !== undefined ?
          (
            <>
              <h2 className="latest">Latest Wave:</h2>
              <Card address={latest.address.slice(0,6)+"..."+latest.address.slice(-4)} message={latest.message} time={latest.timestamp.getHours()+":"+latest.timestamp.getMinutes()+":"+latest.timestamp.getSeconds()} />
            </>) :
          (<>
            <p className="loading-status">Loading Latest Wave...</p>
          </>)
      }
    </main >
  );
}

export default App;