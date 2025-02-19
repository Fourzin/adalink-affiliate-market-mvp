import React from 'react';
import './WalletMenu.css';
//import { useNavigate } from 'react-router-dom';

const WalletMenu = ({ mode,setLoggedIn,lucid,setWalletAPI,setWalletName,setWalletIcon,Cookies,onClose,setAccountInfo,setImportantIPsList,setImportantBRsList,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) => {
  let walletAPI;
  const isNamiAvailable = window.cardano.nami !== undefined;
  const isEternlAvailable = window.cardano.eternl !== undefined;
  const isFlintAvailable = window.cardano.flint !== undefined;
  const isTyphonAvailable = window.cardano.typhon !== undefined;

  const closeWindow = (event) => {
      if(event.target.className.toString()=="backdrop"){
        onClose();
    }
  }

  //const navigate = useNavigate();

  async function handleSelection(walletActualName) {
    
    switch(mode){
      case "login":
        Cookies.set('lastConnectedWalletName',walletActualName,{expires:1000});
        try{
        lucid.selectWallet(walletAPI);
        }
        catch{
          setMessageWindowContent("Blockfrost API not responding proprely. Please try again later.");
          setMessageWindowButtonText("OK");
          setShowMessageWindow(true);
          return;
        }
        
        let stakeAddress = await lucid.wallet.rewardAddress();
        //console.log(stakeAddress)
        let response = await fetch('https://adalink.io/api/get-account-info-bz.php?stakeAddress='+stakeAddress,{cache:'reload'}); 
        let accountInfo = JSON.parse(await response.text());
        let bonusRequestResponse;
        console.log(accountInfo)
        if (accountInfo!=null){
          setAccountInfo(accountInfo);
          setLoggedIn(true);
          setShowMessageWindow(false);
          if(accountInfo['UniqueID']!=undefined){
            response = await fetch("https://adalink.io/api/get-affiliate-subscribed-ip-list.php?aID="+accountInfo['UniqueID'],{cache:"reload"});
          }else{
            response = await fetch("https://adalink.io/api/get-spo-ip-list.php?poolID="+accountInfo['PoolID'],{cache:"reload"});
            bonusRequestResponse = await fetch("https://adalink.io/api/get-spo-br-list.php?poolID="+accountInfo['PoolID'],{cache:"reload"});
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
      break;
      case "signup":
        Cookies.set('lastConnectedWalletName',walletActualName,{expires:1000});
      break;
    }
    
  }

  function refreshIPList(){
    /*
    let ipSearchValue=document.getElementById('ipSearchInput').value;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value').set;
    nativeInputValueSetter.call(document.getElementById('ipSearchInput'), ipSearchValue+"a");
    const event = new Event('change', { bubbles: true });
    document.getElementById('ipSearchInput').dispatchEvent(event);
    nativeInputValueSetter.call(document.getElementById('ipSearchInput'), '');
    document.getElementById('ipSearchInput').dispatchEvent(event);
    */
  }

  function showLoadingWindow(){
    if (mode=="login"){
      setMessageWindowContent("Logging in");
      setMessageWindowButtonText("");
      setShowMessageWindow(true);
    }
  }

  return (
    <div className="backdrop" onClick={closeWindow}>
    <div className="wallet-menu" >
      <h3>{mode=="login"?"Login":"Select wallet"}</h3>
      <ul className="wallet-list">
        {isNamiAvailable && (
          <li className="wallet-item">
            <button onClick={async () => {showLoadingWindow();onClose();walletAPI = await window.cardano.nami.enable();setWalletAPI(walletAPI);setWalletIcon(window.cardano.nami.icon);setWalletName('Nami');handleSelection('nami')}}>
                <img src={window.cardano.nami.icon} alt="Nami Icon" className="wallet-icon" />
                Nami
            </button>
          </li>
        )}
        {isEternlAvailable && (
          <li className="wallet-item">
            <button onClick={async () => {showLoadingWindow();onClose();walletAPI = await window.cardano.eternl.enable();setWalletAPI(walletAPI);setWalletIcon(window.cardano.eternl.icon);setWalletName('Eternl');handleSelection('eternl')}}>
                <img src={window.cardano.eternl.icon} alt="Eternl Icon" className="wallet-icon" />
                Eternl
            </button>
          </li>
        )}
        {isTyphonAvailable && (
          <li className="wallet-item">
            <button onClick={async () => {showLoadingWindow();onClose();walletAPI = await window.cardano.typhon.enable();setWalletAPI(walletAPI);setWalletIcon(window.cardano.typhon.icon);setWalletName('Typhon');handleSelection('typhon')}}>
                <img src={window.cardano.typhon.icon} alt="Typhon Icon" className="wallet-icon" />
                Typhon
            </button>
          </li>
        )}        
      </ul>
    </div>
    </div>
  );
};

export default WalletMenu;
