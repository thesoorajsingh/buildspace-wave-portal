import React from "react";
import "./Card.css";

const Card = ({address, message, time}) => {
  return (
    <div className={`card`}>
      <div className="title-container">
        <p className="key">Address</p>
        <p className="key">Message</p>
        <p className="key">Time</p>
      </div>
      <div className="value-container">
        <p className="value">{address}</p>
        <p className="value message">{message}</p>
        <p className="value">{time}</p>
      </div>
    </div>
  )
}

export default Card;