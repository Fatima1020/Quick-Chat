import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "../../../apiCalls/chat";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../../../redux/usersSlice";
import moment from "moment";
import { useEffect } from "react";
import store from "../../../redux/store";

function UsersList({searchKey, socket, onlineUser}){
  const { allUsers = [], allChats = [], user: currentuser, selectedChat } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  // ---------------- CREATE NEW CHAT ----------------
  const startNewChat = async (searchedUserId) => {
    try {
      dispatch(showLoader());
      const response = await createNewChat([currentuser._id, searchedUserId]);
      dispatch(hideLoader());

      if (response.success) {
          toast.success(response.message);
          const newChat = response.data;
          const updatedChats = [...allChats.filter,newChat];
          dispatch(setAllChats(updatedChats));
          dispatch(setSelectedChat(newChat));
        }
  }catch(error){
  toast.error(error.message);
  dispatch(hideLoader()); 
  }
}
  // ---------------- OPEN EXISTING CHAT ----------------
  const openChat = (selectedUserId) => {
    const chat = allChats.find(chat =>
        chat.members.some((m) => m._id === currentuser?._id) &&
        chat.members.some((m) => m._id === selectedUserId)
    );

    if (chat) {
      dispatch(setSelectedChat(chat));
    }
  };

  // ---------------- HELPERS ----------------
  const isSelectedChat = (user) =>
    selectedChat?.members?.some((m) => m._id === user._id);

  const getLastMessageTimeStamp = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.some((m) => m._id === userId)
    );

    if (!chat?.lastMessage?.creadetAt) return "";

    return moment(chat.lastMessage.createdAt).format("hh:mm A");
  };

  const getLastMessage = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.some((m) => m._id === userId)
    );

    if (!chat?.lastMessage) return "";

    const prefix =
      chat.lastMessage.sender === currentuser?._id ? "You: " : "";

    return prefix + chat.lastMessage.text?.substring(0, 25);
  };

  const formatName = (user) => {
    if (!user) return "";

    const fname =
      user.firstname?.charAt(0).toUpperCase() +
      user.firstname?.slice(1).toLowerCase();

    const lname =
      user.lastname?.charAt(0).toUpperCase() +
      user.lastname?.slice(1).toLowerCase();

    return `${fname} ${lname}`;
  };

  useEffect(() => {
  socket.off('set-message-count').on('set-message-message', (message) => {
    const { selectedChat, allChats } = store.getState().userReducer;

    // 1. Update the chat properties
    const updatedChats = allChats.map((chat) => {
      if (chat._id === message.chatId) {
        return {
          ...chat,
          unreadMessageCount: (selectedChat?._id !== message.chatId) 
            ? (chat.unreadMessageCount || 0) + 1 
            : 0,
          lastMessage: message,
        };
      }
      return chat;
    });

    // 2. Move the active chat to the top of the array
    const latestChat = updatedChats.find(chat => chat._id === message.chatId);
    const otherChats = updatedChats.filter(chat => chat._id !== message.chatId);
    
    const finalChats = latestChat ? [latestChat, ...otherChats] : updatedChats;

    dispatch(setAllChats(finalChats));
  });

  return () => socket.off('receive-message');
}, [socket, dispatch]);
   

  const getUnreadMessageCount = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.some((m) => m._id === userId)
    );

    if (
      chat &&
      chat.unreadMessageCount &&
      chat.lastMessage?.sender !== currentuser?._id
    ) {
      return (
        <div className="unread-message-counter">
          {chat.unreadMessageCount}
        </div>
      );
    }

    return null;
  };

  // ---------------- FIXED DATA FUNCTION ----------------
  const getData = () => {
  // 1. Filter users by search key first
  let users = allUsers;
  if (searchKey) {
    users = allUsers.filter(
      (user) =>
        user.firstname?.toLowerCase().includes(searchKey.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(searchKey.toLowerCase())
    );
  }

  // 2. Sort users based on the order of allChats
  // Users with the most recent chats (top of allChats) will appear first
  return [...users].sort((a, b) => {
    const indexA = allChats.findIndex((chat) =>
      chat.members.some((m) => m._id === a._id)
    );
    const indexB = allChats.findIndex((chat) =>
      chat.members.some((m) => m._id === b._id)
    );

    // If a user has no chat history, move them to the end
    const sortA = indexA === -1 ? Infinity : indexA;
    const sortB = indexB === -1 ? Infinity : indexB;

    return sortA - sortB;
  });
};

  // ---------------- RENDER ----------------
  return (
    <>
      {getData().map((user) => {
        if (!user) return null;

        const chatExists = allChats.find((chat) =>
          chat.members.some((m) => m._id === user._id)
        );

        return (
          <div
            key={user._id}
            className="user-search-filter"
            onClick={() => openChat(user._id)}
          >
            <div
              className={
                isSelectedChat(user)
                  ? "selected-user"
                  : "filtered-user"
              }
            >
              <div className="filter-user-display">
                {user.profilePic && <img src={user.profilePic} 
                                          alt="Profile Pic" 
                                          className="user-profile-image" 
                                          //style={onlineUser.includes(user._id) ? {border: '#82e0aa 3px solid'} : {}}
                                          />}

                {!user.profilePic &&<div
                    className={isSelectedChat(user)? "user-selected-avatar" : "user-default-avatar"}
                   // style={onlineUser.includes(user._id) ? {border: '#82e0aa 3px solid'} : {}}
                  >
                {
                    user.firstname?.charAt(0).toUpperCase() + 
                    user.lastname?.charAt(0).toUpperCase()
                }
                  </div>}

                <div className="filter-user-details">
                  <div className="user-display-name">
                    {formatName(user)}
                  </div>
                  <div className="user-display-email">
                    {getLastMessage(user._id) || user.email}
                  </div>
                </div>

                <div>
                  {getUnreadMessageCount(user._id)}
                  <div className="last-message-timestamp">
                    {getLastMessageTimeStamp(user._id)}
                  </div>
                </div>

                {!chatExists && (
                  <div className="user-start-chat">
                    <button
                      className="user-start-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startNewChat(user._id);
                      }}
                    >
                      Start Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default UsersList;