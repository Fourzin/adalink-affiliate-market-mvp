// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Update the import statement
import { Lucid, Blockfrost } from 'lucid-cardano';
import Cookies from 'js-cookie';
import { WEBSITE } from './Constants';

import './App.css';

// Use the Lucid object in your component


import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import SPOs from './pages/SPOs';


import MessageWindow from './components/MessageWindow';
import AffiliateProgram from './pages/AffiliateProgram';

let lucid;
switch(WEBSITE){
  case 'https://test-orderbook.adalink.io':
    lucid = await Lucid.new(
      new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", "preview7iVl38anG9Np8lT4JzXCKB16mxPC8Kyg"),
      "Preview",
    );
  break;
  case 'https://orderbook.adalink.io':
    lucid = await Lucid.new(
      new Blockfrost("https://cardano-mainnet.blockfrost.io/api/v0", "mainnetedOr1A0jt3OG6NJ4dI0U59cFb42hgD3t"),
      "Mainnet",
    );
  break;
  default:
}




let checkForLastConnectedWalletEnabled = true;
let connectedWalletAPI;
let response = await fetch('https://adalink.io/api/get-aps-list.php',{cache:'reload'});
let initialIPsList = JSON.parse(await response.text());

let selectedSPOID="0";
let selectedIPID="0";
function App() {
  const [walletAPI,setWalletAPI]=useState();
  const [walletName,setWalletName]=useState();
  const [walletIcon,setWalletIcon]=useState();
  const [isLoggedIn,setLoggedIn] = useState(false);
  const [ipsList,setIPsList]=useState(initialIPsList);

  
  const [accountInfo,setAccountInfo] = useState({StakeAddress:"0"});
  const [importantIPsList,setImportantIPsList]=useState();
  const [importantBRsList,setImportantBRsList]=useState();
  
  const [showMessageWindow,setShowMessageWindow] = useState(false);
  const [messageWindowContent,setMessageWindowContent] = useState('');
  const [messageWindowButtonText,setMessageWindowButtonText] = useState('Ok');


  useEffect(() => {
    //this will run once!
    if (checkForLastConnectedWalletEnabled) {
      connectLastConnectedWallet();
      checkForLastConnectedWalletEnabled=false
    }
    
  },[]) // Empty dependency array to run the effect only once

  async function connectLastConnectedWallet(){
    if(Cookies.get('lastConnectedWalletName')){
      //console.log('checking last connected wallet...');
      let lastConnectedWalletName = Cookies.get('lastConnectedWalletName');
      let lastConnectedWalletAPI;
      switch(lastConnectedWalletName){
        case 'nami':
          lastConnectedWalletAPI = await window.cardano.nami.enable();
          setWalletName('Nami');
        break;
        case 'eternl':
          lastConnectedWalletAPI = await window.cardano.eternl.enable();
          setWalletName('Eternl');
        break;
        case 'flint':
          lastConnectedWalletAPI = await window.cardano.flint.enable();
          setWalletName('Flint');
        break;
        default:
      }
      
      setWalletAPI(lastConnectedWalletAPI);
      //console.log(Cookies.get('lastConnectedWalletName'))
      //console.log(walletName)
      connectedWalletAPI=lastConnectedWalletAPI;
      Cookies.set('lastConnectedWalletName',lastConnectedWalletName,{expires:1000});
      showLoadingWindow();
      handleLogin(connectedWalletAPI);
    }
  }

  async function handleLogin(walletAPI) {
    lucid.selectWallet(walletAPI);
    let stakeAddress = await lucid.wallet.rewardAddress();
        //console.log(stakeAddress)
    let response = await fetch('https://adalink.io/api/get-account-info-bz.php?stakeAddress='+stakeAddress,{cache:'reload'}); 
    let accountInfo = JSON.parse(await response.text());

    if (accountInfo!==null){
      setAccountInfo(accountInfo);
      setLoggedIn(true);
      setShowMessageWindow(false);
      if(accountInfo['Description']==undefined){
        response = await fetch("https://adalink.io/api/get-affiliate-subscribed-ap-list.php?aID="+accountInfo['UniqueID'],{cache:"reload"});
      }else{
        response = await fetch("https://adalink.io/api/get-project-ap-list.php?pID="+accountInfo['ProjectID'],{cache:"reload"});
        let bonusRequestResponse = await fetch("https://adalink.io/api/get-spo-br-list.php?poolID="+accountInfo['PoolID'],{cache:"reload"});
        let importantBRsList = JSON.parse(await bonusRequestResponse.text());
        setImportantBRsList(importantBRsList);
      }
      let importantIPsList = JSON.parse(await response.text());
      setImportantIPsList(importantIPsList);
    } else {
      setMessageWindowContent("Wallet is not linked to an account.");
      setMessageWindowButtonText("OK");
      setShowMessageWindow(true);
    }
  }
    
    function showLoadingWindow(){
      setMessageWindowContent("Logging in");
      setMessageWindowButtonText("");
      setShowMessageWindow(true);
    }

  return (
    <Router>
      <div className="App">
        <Header 
          isLoggedIn={isLoggedIn} 
          setLoggedIn={setLoggedIn} 
          setAccountInfo={setAccountInfo}
          accountInfo={accountInfo}
          setImportantIPsList={setImportantIPsList}
          setImportantBRsList={setImportantBRsList}
          walletAPI={walletAPI} 
          setWalletAPI={setWalletAPI} 
          walletName={walletName} 
          setWalletName={setWalletName} 
          walletIcon={walletIcon} 
          setWalletIcon={setWalletIcon} 
          lucid={lucid} 
          Cookies={Cookies}
          selectedIPID={selectedIPID}
          selectedSPOID={selectedSPOID}
          setMessageWindowContent={setMessageWindowContent}
          setMessageWindowButtonText={setMessageWindowButtonText}
          setShowMessageWindow={setShowMessageWindow}  
        />
        <Routes onChange={(path) => console.log(path)}>
          <Route 
            path="/" 
            element={
              <Home 
                isLoggedIn={isLoggedIn}
                ipsList={ipsList}
                setIPsList={setIPsList}
                accountInfo={accountInfo}
                setImportantIPsList={setImportantIPsList}
                walletAPI={walletAPI}
                lucid={lucid}
                selectedIPID={selectedIPID}
                setMessageWindowContent={setMessageWindowContent}
                setMessageWindowButtonText={setMessageWindowButtonText}
                setShowMessageWindow={setShowMessageWindow}  
              />
            }
            
            onAction={() => {document.getElementById("nav-item-1").style.fontWeight="bold";document.getElementById("nav-item-2").style.fontWeight="normal"}}
          />
          <Route
            path="/spos"
            element={(
              <SPOs
                ipsList={ipsList}
                selectedSPOID={selectedSPOID}
                setMessageWindowContent={setMessageWindowContent}
                setMessageWindowButtonText={setMessageWindowButtonText}
                setShowMessageWindow={setShowMessageWindow}  
              />
            )}
            onAction={() => {document.getElementById("nav-item-1").style.fontWeight="normal";document.getElementById("nav-item-2").style.fontWeight="bold"}}
          />
          <Route
            path="/profile"
            element={(
              <ProfilePage
                accountInfo={accountInfo}
                importantIPsList={importantIPsList}
                setImportantBRsList={setImportantBRsList}
                importantBRsList={importantBRsList}
                setAccountInfo={setAccountInfo}
                setMessageWindowContent={setMessageWindowContent}
                setMessageWindowButtonText={setMessageWindowButtonText}
                setShowMessageWindow={setShowMessageWindow}  
              />
            )}
            onAction={() => {document.getElementById("nav-item-1").style.fontWeight="normal";document.getElementById("nav-item-2").style.fontWeight="normal"}}
          />
          <Route
            path='/affiliate-program'
            element={(
              <AffiliateProgram

              />
            )}
          />          
        </Routes>
        {showMessageWindow && ( // Show OrderSummary when orderSummaryVisible is true
          <MessageWindow
            message={messageWindowContent}
            buttonText={messageWindowButtonText}
            onClose={() => setShowMessageWindow(false)} // Close OrderSummary
            onAction={ () => setShowMessageWindow(false)} // Pass placeOrderHandler as onPlaceOrder
          />
        )}
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;

