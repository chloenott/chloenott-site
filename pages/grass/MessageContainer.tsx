import React from "react";
import styles from '../../styles/UserInterface.module.css';

const MessageContainer = ({ message }) => {

  return (
    <div className={styles.message_container}>
      <svg height="40px" width="40px" className={styles.message_icon}>
        <circle cx="20" cy="20" r="20" fill="#32a852" />
      </svg>
      <div className={styles.message_body}>
        <p className={styles.message_name}>{message.user}</p>
        <p className={styles.message_text}>{message.text}</p>
      </div>
    </div>
  )
}

export default MessageContainer;