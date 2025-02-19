/* global BigInt */
import React, { useEffect, useState } from 'react';
import {Constr, Data, toHex,fromHex} from 'lucid-cardano';
import './SignUpWindow.css';
import './CreateProgramWindow.css';
import downArrow from '../assets/images/down-arrow.svg';
import {SCRIPT_ADDRESS,stringToHex,getCurrentEpochNumber,displayNumberInPrettyFormat,removePrettyFormat} from '../Constants';


const CreateProgramWindow = ({ walletAPI,walletName,walletIcon,lucid,openWalletMenu,onClose,setLoggedIn,accountInfo,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) => {


  const closeWindow = (event) => {
      if(event.target.className.toString()==="backdrop"){ 
        onClose();
    }
  }

  //get current epoch number
  let currentEpoch = getCurrentEpochNumber();
  //

  const [listingCost,setListingCost] = useState(14);

  async function listAffiliateProgram(txHash){
    let programName = document.getElementById('programName')?.value;
    let commisionRate = document.getElementById('commisionRate')?.value;
    let affiliateLink = (document.getElementById('affiliateLink')?.value);
    let programDescription = (document.getElementById('programDescription')?.value);
    let listDuration = (document.getElementById('listDuration')?.value);

    //create formData object and populate the account data
    let newProgramData = new FormData();
    newProgramData.append('programName',programName);
    newProgramData.append('commisionRate',commisionRate);
    newProgramData.append('affiliateLink',affiliateLink);
    newProgramData.append('programDescription',programDescription);
    newProgramData.append('listDuration',listDuration);
    newProgramData.append('startDate',parseInt(Date.now()/1000));
    newProgramData.append('endDate',parseInt(Date.now()/1000)+parseInt(listDuration)*24*60*60);

    newProgramData.append('projectID',accountInfo["ProjectID"]);
    newProgramData.append('projectName',accountInfo["DisplayName"]);
    newProgramData.append('projectType',accountInfo["Type"]);
    newProgramData.append('projectPFP',accountInfo["PFP"]);


    console.log(txHash);
    newProgramData.append('txHash',txHash);
    console.log(newProgramData)
    //setBufferWindowMessage("Creating account...");
    
    let url="https://adalink.io/api/list-new-program-bz.php";
    let queryResponse = await fetch(url, {
        method: 'POST', 
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin', 
        
        redirect: 'follow',
        referrerPolicy: 'no-referrer', 
        body: newProgramData // string variable
      });

    let queryResult=await queryResponse.text();
  }

  async function handleProgramLaunch() {

    let programName = document.getElementById('programName')?.value;
    let commisionRate = document.getElementById('commisionRate')?.value;
    let affiliateLink = document.getElementById('affiliateLink')?.value;
    let programDescription = document.getElementById('programDescription')?.value;
    let listDuration = removePrettyFormat(document.getElementById('listDuration')?.value);

    setMessageWindowContent("Checking user input...");
    setMessageWindowButtonText('')
    setShowMessageWindow(true);

    if(programName == '' || commisionRate == '' || affiliateLink == '' || programDescription == ''){
      setMessageWindowContent("Please specify program information.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }

    //exit if user did not permit access or choose wallet
    if(walletAPI===undefined){
      setMessageWindowContent("Please select a wallet");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }

    /*if(await doesPoolHaveActiveProgram(accountInfo['PoolID'])){
      setMessageWindowContent("Can not create campaign. Theis pool has an active running program.");
      setMessageWindowButtonText('OK');
      setShowMessageWindow(true);
      return;
    }*/

    lucid.selectWallet(walletAPI);
    const publicKeyHash = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    ).paymentCredential?.hash;
    //let paymentAddress = await lucid.wallet.address();
    //let stakeAddress = await lucid.wallet.rewardAddress();

    //const datum = Data.to(new Constr(0, [publicKeyHash,stringToHex(accountInfo['PoolID']),BigInt(startEpoch),BigInt(endEpoch),BigInt(parseInt(maximumRewardPerEpoch*1000000)),BigInt(parseInt(rewardRate*1000000)),BigInt(parseInt(totalMaximumRewards*1000000)),BigInt(accountInfo['LiveStake']),BigInt(stakeTarget)]));
    
    let tx = lucid.newTx();
    //add 2.5 ada per epoch for adalink and tx fees
    //let adalinkFees = (endEpoch-startEpoch)*2500000;
    tx.payToAddress(SCRIPT_ADDRESS,{lovelace: BigInt(parseInt(listingCost*1000000))});
    //tx.payToContract(SCRIPT_ADDRESS,{inline : datum},{lovelace: BigInt(parseInt(totalMaximumRewards*1000000+adalinkFees))});
    
    try{
      tx = await tx.complete();
    }catch(e){
      setMessageWindowContent(e);
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
      return;
    }

    try{
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      await listAffiliateProgram(txHash);
      setMessageWindowContent(<><div>New Listing has been requested successfully!</div><br/><div style={{textAlign:"left",fontSize:"13px",paddingLeft:"1.2rem"}}>Program will be automatically displayed as soon as the transaction is confirmed on chain.</div></>)
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
      onClose();
      return;      
    }catch{
      setMessageWindowContent("User declined transaction.")
      setMessageWindowButtonText("Ok");
      setShowMessageWindow(true);
      return;
    }


  }

  async function doesPoolHaveActiveProgram(poolID){
        
    let response, responseInfo;
    response = await fetch('https://adalink.io/api/does-pool-have-active-program.php?poolID='+poolID+'&startEpoch='+currentEpoch,{cache:'reload'}); 
    responseInfo = JSON.parse(await response.text());
    
    if(responseInfo=="-1"){
        return false;
    }
    else
        return true;
  }


  return (
    <div className="backdrop" onClick={closeWindow}>
      <div className='signup-menu'>
        <h3>Affiliate Program Details</h3>
        <br/>
        <div style={{display:"flex",gap:"30px"}}>
          <div className='sign-up-text-fields-area'>
            <div className='sign-up-text-field' style={{gap:"19px"}}>
              <div className='sign-up-text-field-title'>Program Name:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='programName' style={{width:"100%",height:"20px"}}></input>
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Commision Rate:</div>
              <div className='sign-up-text-field-input' style={{width:"40px"}}>
                <input type='text' id='commisionRate' style={{width:"100%",height:"20px"}}
                    onKeyDown={(event) => {
                      if ((!/[0-9.]/.test(event.key)) && (!/[\B]/.test(event.key)) && event.key != 'ArrowLeft' && event.key != 'ArrowRight' ) {
                        event.preventDefault();
                      }
                      if (event.key == '.' && document.getElementById('commisionRate').value.split(".").length>1){
                        event.preventDefault();
                      }
                    }}
                  />
              </div>
              <div style={{paddingLeft:"5px"}}>%</div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Affiliate Link:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <input type='text' id='affiliateLink' style={{width:"100%",height:"20px"}}></input>
              </div>
            </div>
            <div className='sign-up-text-field' style={{gap:"19px",alignItems:"flex-start"}}>
              <div className='sign-up-text-field-title'>Description:</div>
              <div className='sign-up-text-field-input' style={{flex:1}}>
                <textarea  id='programDescription' style={{width:"100%",height:"64px"}}></textarea>
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Listing Duration:</div>
              <div className='sign-up-text-field-input' >
                    <select id="listDuration" style={{height:"25px"}} onChange={() => {setListingCost(2*document.getElementById("listDuration").value)}}>
                      <option value={"7"}>1 Week</option>
                      <option value={"30"}>1 Month</option>
                      <option value={"90"}>3 Months</option>
                      <option value={"180"}>6 Months</option>
                      <option value={"365"}>1 Year</option>
                    </select>
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Listing Cost:</div>
              <div className='sign-up-text-field-input'>
                    {listingCost}
              </div>
              <div>₳</div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"right",marginTop:"2rem"}}>
          <button className='btnType1' style={{width:"120px"}} onClick={async () => await handleProgramLaunch()}>List</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProgramWindow;
