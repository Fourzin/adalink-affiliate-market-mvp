import React, { useRef, useEffect } from 'react';
import {displayNumberInPrettyFormat,displayNumberInPrettierFormat} from '../Constants';
import './OrderSummary.css';

const OrderSummary = ({ orderSummary, onClose, onPlaceOrder }) => {
  const orderSummaryRef = useRef();
  let averagePrice;

  if(orderSummary.availableTokenAmount>orderSummary.userInputs.quantity){
    averagePrice = orderSummary.paidCoins/parseFloat(orderSummary.userInputs.quantity);
  }else{
    averagePrice = orderSummary.paidCoins/orderSummary.availableTokenAmount;
  }
  averagePrice = parseFloat(averagePrice.toFixed(6));
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (orderSummaryRef.current && !orderSummaryRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <div className="order-summary-container">
      <div className="order-summary" ref={orderSummaryRef}>
        <div className="close-button" onClick={onClose}>
            X
        </div>
        <div className="order-summary-header">
          <h2>Order Summary</h2>
        </div>
        {orderSummary.availableTokenAmount==0?
        <div style={{textAlign:"left",padding:"10px 5px"}}>A {orderSummary.userInputs.type} order for <>{displayNumberInPrettyFormat(parseFloat(orderSummary.userInputs.quantity)-orderSummary.availableTokenAmount)}</> {orderSummary.selectedPair.token_name} will be created at price of <>{displayNumberInPrettierFormat(orderSummary.userInputs.price)}</> ADA/{orderSummary.selectedPair.token_name}</div>
        :
        <div className="order-summary-content">
          <div className='item-container'><div>Action:</div> <div>{orderSummary.userInputs.type=='sell'?'Sell':'Buy'}</div></div>
          <div className='item-container'><div>Requested Amount to {orderSummary.userInputs.type=='sell'?'Sell':'Buy'}:</div><div>{displayNumberInPrettyFormat(orderSummary.userInputs.quantity)} {orderSummary.selectedPair.token_name}</div></div>
          <div className='item-container'><div>Fulfilled Amount:</div> <div>{orderSummary.availableTokenAmount>orderSummary.userInputs.quantity?displayNumberInPrettyFormat(orderSummary.userInputs.quantity):displayNumberInPrettyFormat(orderSummary.availableTokenAmount)} {orderSummary.selectedPair.token_name}</div></div>
          <div className='item-container'><div>Average Price:</div> <div>{displayNumberInPrettierFormat(averagePrice)} ADA/{orderSummary.selectedPair.token_name}</div></div> 
          <div className='item-container'><div>Fees:</div> <div>{displayNumberInPrettyFormat(orderSummary.feesToPay)} ADA</div></div>
          <div style={{fontSize:"x-small",textAlign:"left",paddingLeft:"5px"}}>*0.3% of total ADA volume or a minimum of 1.5 ADA</div>
          {orderSummary.availableTokenAmount<orderSummary.userInputs.quantity?
            <div style={{textAlign:"left",padding:"10px 5px"}}>A {orderSummary.userInputs.type} order for the remaining {displayNumberInPrettyFormat((parseFloat(orderSummary.userInputs.quantity)-orderSummary.availableTokenAmount).toFixed(orderSummary.selectedPair.decimals))} {orderSummary.selectedPair.token_name} will be created at price of {displayNumberInPrettierFormat(orderSummary.userInputs.price)} ADA/{orderSummary.selectedPair.token_name}</div> 
            :
            <></> 
        }
        </div>
        }

        <div className="order-summary-footer">
          <button className="place-order-button" onClick={onPlaceOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
