import io from "socket.io-client";
import { useState } from "react";

const socket = io('ws://localhost:3000', {
  transports: ['websocket'],
  withCredentials: true
});

function ChatMessage( { sender, chatMessage}) {
    return (
      <div className="chatBubble">
          <div className="sender"> { sender } </div>
          <div className="message"> { chatMessage } </div>
      </div>
    )
}

function ChatRoom() {
  
  const [textCont, setTextCont] = useState(''); // 보내는 메세지
  const [totalUser, setTotalUser] = useState(0); // 총 유저 수
  const [userId, setUserId] = useState(''); // 유저 ID
  const [messages, setMessages] = useState([]); // 유저 대화 기록

  socket.on("userId", (userId) => { // 유저 ID 전달
      setUserId(userId);  
  });

  const textOnChange = (event) => { // inputBox 텍스트 변동 감지
      setTextCont(event.target.value);
  };

  const sendMsg = () => { // 서버로 내 메세지 전송
      socket.emit("sendMsg", textCont);
      setTextCont("");
  };

  socket.on("emitMsg", (msgData) => { // 서버로부터 다른 유저의 메세지 수신
      const {sender, message} = msgData;
      setMessages([ ...messages, {sender, message}]);
  });

  socket.on("totalUser", (totalUser) => { // 전체 유저 수 반환
      setTotalUser(totalUser);
  })
  
  socket.on("enterance", (userEnter) => { // 유저 입장 알림
      setMessages([ ...messages, userEnter]);
  });

  socket.on("disconnect", (userExit) => { // 유저 퇴장 알림
    setMessages([ ...messages, userExit]);
  });

  return (
    <div className="ChatRoom">
      <h1 className="App-header">
        <p>
            Here is Chat Room / 현재 유저 수 : {totalUser}
        </p>
        <div className="Room"> 
            <div className="chatArea">
              { messages.map((msg, index) => (
                <ChatMessage key={index} sender={msg.sender} chatMessage={msg.message} />
              ))}
            </div>
        </div>
        
        <div className="inputArea">
            <textarea 
                type="text"
                className="inputBox" 
                value={textCont}
                placeholder="메시지를 입력하세요."
                onChange={textOnChange}/>
            
            <button onClick={sendMsg}>전송</button>
        </div>

        <p>
           Your id : {userId}
        </p>
     </h1>
    </div>
  );
}

export default ChatRoom;
