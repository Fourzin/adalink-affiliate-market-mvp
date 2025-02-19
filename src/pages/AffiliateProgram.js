/* global BigInt */
import React, { useState } from 'react';
import './AffiliateTransaction.css';
import { addHttpsToURL } from '../Constants';
const queryParameters = new URLSearchParams(window.location.search);
let linkID=queryParameters.get('linkid');
let response,ipDetails,projectID,affiliateID;
if(linkID!==null){

  response = await fetch('https://adalink.io/api/get-affiliate-link-details-for-projects.php?linkid='+linkID,{cache:"reload"}); 
  ipDetails = JSON.parse(await response.text());
  projectID=ipDetails[0]['ProjectID'];
  affiliateID = ipDetails[0]['AffiliateID'];
  //response = await fetch('https://adalink.io/api/get-link-details.php?poolid='+poolID+'&aid='+affiliateID,{cache:"reload"}); 
}
let linkDetails
if(ipDetails?.length>0)
  linkDetails = ipDetails[0];
else{
  linkDetails = {ProjectName:'',AffiliateName:'',ProgramName:'',Description:'',AffiliateLink:''}
}

try{
  //linkDetails = JSON.parse(await response.text());
}catch{
  console.log('Could not load linkDetails')
}
let projectName,programName,affiliateDisplayName,programDescription,affiliateLink;
  projectName = linkDetails['ProjectName'];
  affiliateDisplayName = linkDetails['AffiliateName'];
  programName = linkDetails['ProgramName'];
  programDescription = linkDetails['Description'];
  affiliateLink = linkDetails['AffiliateLink'];

const AffiliateProgram = () => {

  const [buttonText,setButtonText]=useState("Go to Site")
  

  async function handleButtonClick(link){
    window.open(addHttpsToURL(link));
  }

  return (
    <div className="affiliate-transaction-background" >
      <div className='affiliate-transaction-window'>
        <h3>Affiliate Program</h3>
        <br/>
        <div style={{display:"flex",gap:"30px"}}>
          <div className='sign-up-text-fields-area'>
            {/*<div className='affiliate-link-field'>
              Check, connect and delegate. It is this simple.
            </div>*/}
            <div className='affiliate-link-field'>
              <b>Program</b>: {programName}
            </div>            
            <div className='affiliate-link-field'>
              <b>Affiliate</b>: {affiliateDisplayName}
            </div>
            <div className='affiliate-link-field'>
              <b>Project</b>: {projectName}
            </div>
            <div className='affiliate-link-field'>
              <b>Description</b>: {programDescription}
            </div>     
                   
          </div>
        </div>
        <div style={{marginTop:"3rem"}}>
          <button className='btnType1' id='delegateBtn' style={{width:"160px"}} onClick={() => {handleButtonClick(affiliateLink)}}>{buttonText}</button>
        </div>
      </div>
    </div>
  );
};

export default AffiliateProgram;
