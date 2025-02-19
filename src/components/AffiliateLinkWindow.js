/* global BigInt */
import React, { useState } from 'react';
import './SignUpWindow.css';
import {SCRIPT_ADDRESS,stringToHex,getCurrentEpochNumber,displayNumberInPrettyFormat,removePrettyFormat} from '../Constants';


const AffiliateLinkWindow = ({ ip,spo,onClose,accountInfo,setImportantIPsList,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) => {





  const closeWindow = (event) => {
      if(event.target.className.toString()==="backdrop"){ 
        onClose();
    }
  }

  function showNeedToSignInMessage(){
    setMessageWindowContent("Sign in as an affiliate first.");
    setMessageWindowButtonText("OK");
    setShowMessageWindow(true);
    onClose();
  }

  function handleCopyLink(){
    let affiliateLink="https://affiliate-programs-preview.adalink.io/affiliate-transaction?poolid="+ip['PoolID']+"&aid="+accountInfo['UniqueID'];
    navigator.clipboard.writeText(affiliateLink);
    setMessageWindowContent("Affiliate link copied to clipboard.");
    setMessageWindowButtonText("OK");
    setShowMessageWindow(true);
  }

  async function handleSubscribeToCampaign(){
    setMessageWindowContent("Subscribing to campaign...");
    setMessageWindowButtonText("");
    setShowMessageWindow(true);
    let linkID = ip['ProgramID']+"-"+accountInfo['UniqueID'];
    let affiliateLink="https://affiliate-programs-preview.adalink.io/affiliate-program?linkid="+linkID;
    navigator.clipboard.writeText(affiliateLink);
    
    let raw_url_request_link_header = "";
    //console.log(encodeURIComponent(raw_url_request_link_header))
    let response = await fetch("https://adalink.io/api/create-new-affiliate-link-for-project.php?linkID="+linkID+"&affiliateLink="+ip['AffiliateLink']+"&programName="+ip["DisplayName"]+"&affiliateID="+accountInfo['UniqueID']+'&affiliateDisplayName='+accountInfo['DisplayName']+'&projectID='+ip["ProjectID"]+'&projectName='+ip['ProjectName']+'&startDate='+ip['StartDate']+'&endDate='+ip['EndDate']+"&description="+encodeURIComponent(ip['Description']),{cache:"reload"});
    let result = await response.text();
    console.log(result)
    if(result == "New record created successfully"){
      response = await fetch("https://adalink.io/api/get-affiliate-subscribed-ap-list.php?aID="+accountInfo['UniqueID'],{cache:"reload"});
      let importantIPsList = JSON.parse(await response.text());
      setImportantIPsList(importantIPsList);
      setMessageWindowContent(<><div style={{textAlign:"left",marginTop:"0px",marginBottom:"10px"}}>Successfully subscribed to program.</div><div style={{textAlign:"left"}}>Link is copied to clipboard. You can always find the link from your profile page.</div></>);
      setMessageWindowButtonText("OK");
    }else{
      setMessageWindowContent(<><div style={{textAlign:"left",marginTop:"0px",marginBottom:"10px"}}>Link is already generated.</div><div style={{textAlign:"left"}}>Link is copied to clipboard. You can always find the link from your profile page.</div></>);
      setMessageWindowButtonText("OK");
    }
  }


  return (
    <div className="backdrop" onClick={closeWindow}>
      {accountInfo["UniqueID"]===undefined?
      showNeedToSignInMessage()
      :
      <div className='affiliate-link-window'>
        <h3>Affiliate Link</h3>
        <br/>
        <div style={{display:"flex",gap:"30px"}}>
          <div className='sign-up-text-fields-area'>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Affiliate:</div>
              <div className='sign-up-text-field-input' >
                {accountInfo["DisplayName"]}
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Affiliate ID:</div>
              <div className='sign-up-text-field-input' >
                {accountInfo["UniqueID"]}
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Affiliate Program:</div>
              <div className='affiliate-link-text-field-input' style={{flex:1}}>
                {ip['DisplayName']}
              </div>
            </div>
            <div className='sign-up-text-field'>
              <div className='sign-up-text-field-title'>Project:</div>
              <div className='affiliate-link-text-field-input' style={{flex:1}}>
                {ip['ProjectName']}
              </div>
            </div>            
            <div className='affiliate-link-field'>
              Affiliate link: https://affiliate-programs-preview.adalink.io/affiliate-program?linkid={ip["StartDate"]}{ip['ProjectID']}-{accountInfo['UniqueID']}
            </div>
            {/*<div className='affiliate-link-field' style={{marginTop:"20px"}}>
              Note: Any wallet delegates through this link will be considered toward the affiliate's contribution in this specific campaign.
            </div>*/}
          </div>
        </div>
        <div style={{textAlign:"right",marginTop:"2rem"}}>
          <button className='btnType1' style={{width:"200px"}} onClick={() => {handleSubscribeToCampaign()}}>Generate unique link</button>
        </div>
      </div>
      }
    </div>
  );
};

export default AffiliateLinkWindow;
