import React, { 
  useState,
  useEffect, 
  useLayoutEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {auth, db} from '../../firebase';

import {
  pickImage
} from '../components/eventHandle/mediaUtils';


import {
  View,
  IconButton,
  Icon,
  Text,
  KeyboardAvoidingView,
} from 'native-base';

import { 
  GiftedChat,
  InputToolbar,
  Actions,
  Bubble,
  MessageImage,
} from 'react-native-gifted-chat';
import ChatHeader from '../components/chatHeader';

import { Entypo } from '@expo/vector-icons';

function Chat (props:{
  route: any;userId:string,name:string, email:string, photoURL:string,navigation:any
}) {

  const {userId, name, email, photoURL} = props.route.params;

  const [message, setMessage] = useState([])  //loadmessage from firebase specific to user 

  const [channel, setChannel] = useState([]) //load subroom from firebase

  const [chatName, setChatName] = useState('') //load chat name from firebase specific to userId

  const [userImage, setUserImage] = useState(null)


  const member = [auth.currentUser?.uid, userId];

  const chatId = member.sort().join('_');
 
  useLayoutEffect(() => {
    const loadChat = db.collection('Chatroom').doc(chatId).collection('messages')
    .orderBy('createdAt', 'desc').onSnapshot(snapshot => (
        setMessage(snapshot.docs.map(doc => ({
        _id: doc.data()._id,    
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        image: doc.data().image,
        video: doc.data().video,
        user: doc.data().user,
      })))
    ))
    return loadChat;

  }, [])

  const onSend = useCallback((messages = []) => {
    setMessage(previousMessages => GiftedChat.append(previousMessages, messages))
    const {
      _id,
      createdAt, 
      text,
      user 
    } = messages[0]
    const docId = Math.random().toString(36).substring(7);
    db.collection('Chatroom').doc(chatId).set({
      chatId: chatId,
      member: member,
      chatName: "Regular",
      recentMessage: {
        _id: _id,
        createdAt: createdAt,
        text: text,
        user: user
      }
    }).then(() => {
      db.collection('Chatroom').doc(chatId).collection('messages').add({
        _id: _id,
        createdAt,
        address: chatId,
        text,
        user,
        delivered: false,
      })
    })
  }, [])

  const renderActions = (props) => {
    return (
      <Actions
        {...props}
        containerStyle={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 4,
          marginBottom: 0,
        }}
        icon={() => (
          <Icon
            as={<Entypo name="plus" />}
            size="sm"
            color="muted.400"
          />
        )}
        options={{
          'Choose From Library': () => {
            console.log('Choose From Library')
            //pickimage and set result to image 
            pickImage().then((result) => setUserImage(result))
          },
          'Take Picture': () => {
            console.log('Take Picture')
          },
          'Send Location': () => {
            console.log('Send Location')
          },

          Cancel: () => {
            console.log('Cancel')
          },
        }}
        optionTintColor="#222B45"
      />

    )
  }


  const customInputToolbar = (props:any) => {
    return(
      
      <InputToolbar
        {...props}
        renderMessageImage={() => { renderMessageImage(props) }}
        renderActions={() => renderActions(props)}
        //renderComposer={() => renderComposer(props)}
        containerStyle={{
          //make it blur and adjust it to center screen
          //text white
          backgroundColor: 'white',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'white',
          marginHorizontal: 10,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        >
        {userImage && (
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center',}}>
            <MessageImage
              imageStyle={{
                width: 200,
                height: 200,
                borderRadius: 10,
                margin: 5,
              }}
              currentMessage={{
                image: userImage,
              }}
            />
            <IconButton
              icon={<Icon as={<Entypo name="cross" />} size="sm" color="muted.400" />}
              onPress={() => setUserImage(null)}
              variant="unstyled"
              size="sm"
              style={{position: 'absolute', right: 0, top: 0, zIndex: 1}}
            />
          </View>
        )}

      </InputToolbar>

    )
  }

  const renderMessageImage = (props:any) => {
    return (
     <MessageImage
      {...props}
      imageStyle={{
        width: 200,
        height: 200,
        borderRadius: 10,
        margin: 5,
      }}
    />
    )
  }


  const renderBubble = (props:any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#06C755',
          },
          left: {
            backgroundColor: '#E5E5EA',
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
        }}
      />
    )
  }
  return (
    <View style={{flex:1, backgroundColor:'#1D1E24'}}>
      <ChatHeader chatId={chatId} navigation={props.navigation} route={props.route}/>
     
      <GiftedChat
        isTyping={true}
        isAnimated
        messages={message}
        renderBubble={renderBubble}
        showUserAvatar={true}
        alwaysShowSend={true}
        renderInputToolbar={props => customInputToolbar(props)}
        onSend={messages => onSend(messages)}
        user={{
          _id: auth?.currentUser?.uid,
          name: auth?.currentUser?.displayName,
          avatar: auth?.currentUser?.photoURL
        }
      }
      />
    </View>
  );
}
export default Chat;
