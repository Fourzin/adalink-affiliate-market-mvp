// src/pages/Home.js
import React, { useState,useEffect } from 'react';
import './Home.css';
import './SPOs.css'; // Import the CSS file
import CreateProgramWindow from '../components/CreateProgramWindow';
import AffiliateLinkWindow from '../components/AffiliateLinkWindow';
import BonusRequestWindow from '../components/BonusRequestWindow';
import searchIcon from '../assets/images/search-icon.svg';
import filterIcon from '../assets/images/filter-icon.png';

import {displayNumberInPrettyFormat,getCurrentEpochNumber,addHttpsToURL} from '../Constants';


/*let response = await fetch('https://adalink.io/api/get-projects-list.php',{cache:"reload"});
let sposRecord = JSON.parse(await response.text());
sposRecord = JSON.parse(sposRecord);*/
//let searchedIPsList = ipsList;
let selectedIP;
let currentEpoch = getCurrentEpochNumber();


function Home({isLoggedIn,ipsList,setIPsList,accountInfo,setImportantIPsList,walletAPI,lucid,selectedIPID,setMessageWindowContent,setMessageWindowButtonText,setShowMessageWindow}) {

  let searchedIPsList;
  //ipsList;
  let searchOrdering = 0;
  let orderBy;
  const [searchOrderingState,setSearchOrdering] = useState(0); // -1:decending, 0:no preference, 1:ascending
  const [orderByState,setOrderBy] = useState(); //fixedFees,margin,saturation
  
  const [isCreateProgramWindowOpen,setCreateWindowOpen]=useState(false);
  const [isAffiliateLinkWindowOpen,setAffiliateLinkWindowOpen]=useState(false);
  const [isBonusRequestWindowOpen,setBonusRequestWindowOpen]=useState(false);
  
  const [ipsListHTMLSyntax,setIPsListHTMLSyntax] = useState(constructIPsListSyntax());

  useEffect(() => {
    document.getElementById("nav-item-1").style.fontWeight="bold";
    updateIPsSearchResult(' ');
    setIPsListHTMLSyntax(constructIPsListSyntax());
  },[])

  useEffect(() => {

    const intervalId = setInterval(() => {
      // This code will run every 10 seconds
      //in development it is set to 10 hrs instead of 10000
      fetch('https://adalink.io/api/get-aps-list.php',{cache:'reload'})
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setIPsList(data);
        if(selectedIP!==undefined)
          selectedIPID=selectedIP["ID"];
        updateIPsSearchResult((document.getElementById('ipSearchInput').value))
        setIPsListHTMLSyntax(constructIPsListSyntax())
        
      })
      .catch((error) => {
        console.error('Error fetching affiliate programs:', error);
      });
    }, 10000); //36000000 10000

    // Don't forget to clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }); // Empty dependency array to run the effect only once
 
  function updateIPsSearchResult(searchString){
    
    let searchResult;
    if(searchString === "" || searchString === " ")
      searchResult=ipsList;
    else
      searchResult = ipsList.reduce(function(list,ip) {if(ip['ProjectName'].toLowerCase().includes(searchString.toLowerCase())  || ip['ProjectType'].toLowerCase().includes(searchString)){list.push(ip);}return list;},[]);
    
    
    //check filter values
    let minRewardRate = document?.getElementById('minRewardRate').value;
    let maxRewardRate = document?.getElementById('maxRewardRate').value;
    let minStartEpoch = document?.getElementById('minStartEpoch').value;
    let maxStartEpoch = document?.getElementById('maxStartEpoch').value;
    let minEndEpoch = document?.getElementById('minEndEpoch').value;
    let maxEndEpoch = document?.getElementById('maxEndEpoch').value;
    let projectType = document?.getElementById("projectType").value;
  
    //let filteredResult = searchResult;
    
    if(minRewardRate !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(parseFloat(ip['CommisionRate'])>=parseFloat(minRewardRate))list.push(ip);return list;},[]);
    }
    if(maxRewardRate !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(parseFloat(ip['CommisionRate'])<=parseFloat(maxRewardRate))list.push(ip);return list;},[]);
    }  
    if(minStartEpoch !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(ip['StartDate']>=minStartEpoch)list.push(ip);return list;},[]);
    }  
    if(maxStartEpoch !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(ip['StartDate']<=maxStartEpoch)list.push(ip);return list;},[]);
    } 
    if(minEndEpoch !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(ip['EndDate']>=minEndEpoch)list.push(ip);return list;},[]);
    }  
    if(maxEndEpoch !== ''){
      searchResult = searchResult.reduce(function(list,ip) {if(ip['EndDate']<=maxEndEpoch)list.push(ip);return list;},[]);
    } 
    if(projectType != "All"){
      searchResult = searchResult.reduce(function(list,ip) {if(ip['ProjectType']==projectType)list.push(ip);return list;},[]);
    }
  
  
    searchedIPsList = searchResult;
        
    
  }


  function constructIPsListSyntax(){
    
    if(searchedIPsList === undefined)
      return "";
    //order searchedIPsList before mapping
    searchedIPsList = searchedIPsList.reduce(function(list,ip) {if(ip['EndDate']>=parseInt(Date.now()/1000))list.push(ip);return list;},[]);
    if(searchOrdering==1){
      searchedIPsList=searchedIPsList.sort((a,b) => parseInt(a[orderBy])-parseInt(b[orderBy]));
    }else if(searchOrdering==-1){
      searchedIPsList=searchedIPsList.sort((a,b) => parseInt(b[orderBy])-parseInt(a[orderBy]));
    }
    let htmlBlocks = searchedIPsList.map((ap) => (
      <div key={ap['ProgramID']} className="ip-section "  >
        <div className='ip-section-header ' onClick={() => {if(selectedIPID===ap["ID"]){selectedIPID="0";selectedIP=undefined}else{selectedIPID=ap["ID"];selectedIP=ap};setIPsListHTMLSyntax(constructIPsListSyntax())} }>
          <div className='spo-pfp-in-spo-header'>
            <img alt="" src={ap['PFP']} width={100} />
          </div>
          <div className='spo-header-parameter-section'>
            <div>Project Name</div>
            <div>{ap['ProjectName']}</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Commision Rate</div>
            <div>{displayNumberInPrettyFormat(parseFloat(ap["CommisionRate"]))} %</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Type</div>
            <div>{ap["ProjectType"]}</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>Start Date</div>
            <div>{new Date(ap['StartDate']*1000).toLocaleDateString() }</div>
          </div>
          <div className='spo-header-parameter-section'>
            <div>End Date</div>
            <div>{new Date(ap['EndDate']*1000).toLocaleDateString() }</div>
          </div>                              
        </div>
        <div className='spo-section-body' id={"ap-"+ap["ID"]} style={{height: selectedIPID===ap["ID"]?document.getElementById("ap-"+ap["ID"]).scrollHeight:'0px'}}>
          <hr />
          <div className='spo-parameter-area'>
            <div>Affiliate Program Name:</div>
            <div>{ap["DisplayName"]}</div>
          </div>
          <div className='ip-details-area'>
            <div className='spo-sub-details-area'>
              <div className='spo-parameter-area'>
                <div>Description:</div>
                <div>{ap["Description"]}</div>
              </div>    
              <div className='spo-parameter-area'>
                <div>Affiliate Link:</div>
                
                <div><a href={addHttpsToURL(ap["AffiliateLink"])} target="_blank">{addHttpsToURL(ap["AffiliateLink"])}</a></div>
              </div>    
            </div>
            <div className='ip-sub-details-area'>
              {/*<button className='btnType1' onClick={() => {setBonusRequestWindowOpen(true)}}>Request bonus</button>*/}
              <button className='btnType1' onClick={() => {setAffiliateLinkWindowOpen(true)}}>Generate unique affiliate link</button>
            </div>
          </div>
        </div>
      </div>
    ));
    
    return(
      <div className={"slide-in-fwd-center"} id="spos-list">
          {htmlBlocks.every(function (block) {return block === ''})?
          <div className="" style={{marginLeft:"5px",color:"var(--major-color)"}}>There are no available affiliate programs.</div>
          :
          htmlBlocks}
      </div>
  );
  }
  


  return (
    <div className="home">
      <div className="container">
        <div style={{height:"4rem"}}>{}</div>
        <div className=''>
          <div className='header-section-of-ips'>
            <div className="search-bar-container">
              <div className="search-bar">
                <img alt='' src={searchIcon} style={{marginLeft:"5px",marginTop:"6px",float:"left"}}/>  
                <input className="search-input" placeholder="Search by project name or type..." id="ipSearchInput" onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructIPsListSyntax())}}></input>
              </div>
            </div>
            {(isLoggedIn && accountInfo["Description"]!==undefined)?
              <button className='btnType1' onClick={() => {setCreateWindowOpen(true)}}>List affiliate program</button>
              :
              <></>
            }
          </div>
          <div className='filter-container'>
            <img alt='' src={filterIcon} width={26}/>
            <div className='filter-parameter-element'>
              <div>Commision Rate</div>
              <div className='filter-arrows'>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===1&&orderByState==="RewardRate")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===1&&orderBy==="RewardRate"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=1;orderBy="RewardRate";setSearchOrdering(1);setOrderBy("RewardRate")};setIPsListHTMLSyntax(constructIPsListSyntax())}}>
                  ▲
                </div>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===-1&&orderByState==="RewardRate")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===-1&&orderBy==="RewardRate"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=-1;orderBy="RewardRate";setSearchOrdering(-1);setOrderBy("RewardRate")};setIPsListHTMLSyntax(constructIPsListSyntax())}}>
                  ▼
                </div>
              </div>
              <div className='filter-input-range' >
                <input  className='filter-input-text'  type='number' id='minRewardRate' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructIPsListSyntax())}}/>
                <div>-</div>
                <input className='filter-input-text' type='number' id='maxRewardRate' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructIPsListSyntax())}}/>
              </div>
            </div>
            <div className='filter-parameter-element'>
              <div>Type</div>
              <select id="projectType" onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructIPsListSyntax())}}>
                <option value="All">All</option>
                <option value="DEFI">DEFI</option>
                <option value="DEPIN">DEPIN</option>
                <option value="NFT">NFT</option>
                <option value="DAO">DAO</option>
                <option value="MEME">MEME</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>    
            <div className='filter-parameter-element'>
              <div>Start Date</div>
              <div className='filter-arrows'>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===1&&orderByState==="StartEpoch")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===1&&orderBy==="StartEpoch"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=1;orderBy="StartEpoch";setSearchOrdering(1);setOrderBy("StartEpoch")};setIPsListHTMLSyntax(constructIPsListSyntax())}}>
                  ▲
                </div>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===-1&&orderByState==="StartEpoch")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===-1&&orderBy==="StartEpoch"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=-1;orderBy="StartEpoch";setSearchOrdering(-1);setOrderBy("StartEpoch")};setIPsListHTMLSyntax(constructIPsListSyntax())}}>
                  ▼
                </div>
              </div>
              <div className='filter-input-range' style={{display:"none"}}>
                <input className='filter-input-text' type='number' id='minStartEpoch' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructIPsListSyntax())}}/>
                <div>-</div>
                <input className='filter-input-text' type='number' id='maxStartEpoch' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructIPsListSyntax())}}/>
              </div>
            </div>     
            <div className='filter-parameter-element'>
              <div>End Date</div>
              <div className='filter-arrows'>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===1&&orderByState==="EndEpoch")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===1&&orderBy==="EndEpoch"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=1;orderBy="EndEpoch";setSearchOrdering(1);setOrderBy("EndEpoch")};setIPsListHTMLSyntax(constructIPsListSyntax())}}>
                  ▲
                </div>
                <div  className='filter-arrow-icon'
                      style={{color:(searchOrderingState===-1&&orderByState==="EndEpoch")?"var(--major-backgroundColor)":"var(--main-borderColor)"}}
                      onClick={() => {if(searchOrdering===-1&&orderBy==="EndEpoch"){searchOrdering=0;orderBy=null;setSearchOrdering(0);setOrderBy()}else{searchOrdering=-1;orderBy="EndEpoch";setSearchOrdering(-1);setOrderBy("EndEpoch")};setIPsListHTMLSyntax(constructIPsListSyntax())}}>
                  ▼
                </div>
              </div>
              <div className='filter-input-range' style={{display:"none"}}>
                <input className='filter-input-text' type='number' id='minEndEpoch' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructIPsListSyntax())}}/>
                <div>-</div>
                <input className='filter-input-text' type='number' id='maxEndEpoch' onChange={() => {updateIPsSearchResult(document.getElementById('ipSearchInput').value);setIPsListHTMLSyntax(constructIPsListSyntax())}}/>
              </div>
            </div>                
          </div>
          <div className='spos-section'>
            {ipsListHTMLSyntax}  
          </div>          
        </div>
      </div>
    {isCreateProgramWindowOpen &&
    <CreateProgramWindow
      isLoggedIn={isLoggedIn}
      accountInfo={accountInfo}
      walletAPI={walletAPI}
      lucid={lucid}
      onClose={() => {setCreateWindowOpen(false)}}
      setMessageWindowContent={setMessageWindowContent}
      setMessageWindowButtonText={setMessageWindowButtonText}
      setShowMessageWindow={setShowMessageWindow}  
    />
    }
    {isAffiliateLinkWindowOpen &&
    <AffiliateLinkWindow
      isLoggedIn={isLoggedIn}
      accountInfo={accountInfo}
      ip={selectedIP}
      /*spo={sposRecord[selectedIP["PoolID"]]}*/
      setImportantIPsList={setImportantIPsList}
      onClose={() => {setAffiliateLinkWindowOpen(false)}}
      setMessageWindowContent={setMessageWindowContent}
      setMessageWindowButtonText={setMessageWindowButtonText}
      setShowMessageWindow={setShowMessageWindow}  
    />
    }
    {isBonusRequestWindowOpen &&
    <BonusRequestWindow
      isLoggedIn={isLoggedIn}
      accountInfo={accountInfo}
      ip={selectedIP}
      /*spo={sposRecord[selectedIP["PoolID"]]}*/
      setImportantIPsList={setImportantIPsList}
      onClose={() => {setBonusRequestWindowOpen(false)}}
      setMessageWindowContent={setMessageWindowContent}
      setMessageWindowButtonText={setMessageWindowButtonText}
      setShowMessageWindow={setShowMessageWindow}  
    />
    }
    </div>
  );
}

export default Home;
