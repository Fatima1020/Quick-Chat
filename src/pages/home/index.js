import { useSelector } from "react-redux";
import ChatArea from "./components/chat";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import { io } from 'socket.io-client';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const socket = io('http://localhost:5000');

function Home(){
   const { selectedChat, user } = useSelector(state => state.userReducer);
   const [onlineuser, setOnlineUser] = useState([]);
   const navigate = useNavigate();

useEffect(() => {
   if (socket) {
      socket.on('message', (data) => {});
   }
}, [socket]);

useEffect(() => {
  if (user) {
    socket.emit('join-room', user._id);
    socket.emit('user-login', user._id);

    socket.on('online-users', onlineusers => {
         setOnlineUser(onlineusers);
    });
    socket.on('online-users-updated', onlineusers => {
         setOnlineUser(onlineusers);
    });
  }
  else{
   navigate('/login');
  }
}, [user, onlineuser])  

   return (
      <div className="home-page">
         <Header socket ={socket}></Header>
         <div className="main-content">
               <Sidebar socket={socket} onlineUser={user}></Sidebar>
               {selectedChat && <ChatArea socket={socket}></ChatArea>}
         </div>
      </div>
   );
}

export default Home;