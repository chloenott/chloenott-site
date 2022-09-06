import React from "react";
import styles from '../../styles/chatwindow.module.css';

const MessageContainer = ({ user, text }) => {

  return (
      <div className={styles.message_container}>
        <svg height="40px" width="40px" className={styles.message_icon}>
          <circle cx="20" cy="20" r="20" fill="#32a852" />
        </svg>
        <div className={styles.message_body}>
          <p className={styles.message_name}>{user}</p>
          <p className={styles.message_text}>{text}</p>
        </div>
      </div>
  )
}

export default MessageContainer;