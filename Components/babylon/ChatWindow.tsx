import React from "react";
import styles from '../../styles/chatwindow.module.css';
import MessageContainer from "./MessageContainer";
import { TextField, Divider, Button } from '@mui/material';

const ChatWindow = ({ chatVisible }) => {
  const [textFieldValue, setTextFieldValue] = React.useState("");
  const [messageList, setMessageList] = React.useState([]);

  const handleSubmitTextField = () => {
    if (textFieldValue.length > 0) {
      const newMessage = {
        user: 'Fox',
        text: textFieldValue
      }
      setMessageList([...messageList, newMessage]);
      setTextFieldValue("");
    }
  }

  return (
    <div className={styles.user_interface}>
      <div className={chatVisible ? styles.chat_window_visible : styles.chat_window_hidden}>

        <div className={styles.message_list}>
          {messageList.map( (message, index) => Object.keys(message).length > 0 && <MessageContainer key={index} user={message.user} text={message.text} />)}
        </div>

        <Divider variant="middle" textAlign="center" sx={{
          color: '##0e0f0f',
          fontFamily: 'Inter',
          fontWeight: 300,
          width: 586,
          alignItems: 'flex-start',
        }}>Nearby Chat</Divider>

        <TextField id="textfield" value={textFieldValue} label={textFieldValue ? "Press return key to send" : "Type here to enter message"} variant="filled" multiline maxRows={10} sx={{
          width: 618,
          borderRadius: 1,
          bgcolor: '#ffffff',
          fontFamily: 'Inter',
          }}
          onChange={(e) => {
            setTextFieldValue(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key == 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmitTextField();
            }
          }}
        />
      </div>
    </div>
  )
}

  export default ChatWindow;