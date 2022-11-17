import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Text,
  Box,
  Heading,
  ScrollView,
  VStack,
  Image,
  HStack,
  Pressable,
  Center,
  IconButton,
  Button,
  Modal,
  Divider,
  Badge,
} from 'native-base';
import {auth,db} from '../../firebase'

import Menubar from '../components/menubar'
import { RefreshControl } from 'react-native';

import { Entypo } from '@expo/vector-icons';

import firebase from 'firebase/compat/app';


function ChatList(props: { navigation: { navigate: any; }; }) {
  const {navigate} = props.navigation;

  //store User that retrieve from database
  const [users, setUsers] = useState([])
  const onloadUser = auth?.currentUser?.uid;

  //refresh the page
  const [refresh, setRefresh] = useState(false)
  
  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  const onRefresh = useCallback(() => {
    setRefresh(true)
    wait(2000).then(() => {
      setRefresh(false)
      getUser()
    });
  }, []);

  const getUser = async () => {
    console.log('onloadUser',onloadUser)
    db.collection('users').where('uid','==',onloadUser).get('friends').then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const friendListed = doc.data().friends
        console.log('friendListed',friendListed)
        db.collection('users').where('username','in',friendListed).onSnapshot(snapshot => (
          //loadUser here! or code below 
          setUsers(snapshot.docs.map(doc => ({
            userId: doc.data().uid,
            name: doc.data().name,
            email: doc.data().email,
            status: doc.data().status,
            photoURL: doc.data().imageURL,
          })))
        ))
      });
    }).catch((error) => {
      console.log("Error getting documents: ", error);
      })
  }

  const dataLog = () => {
    console.log('users',users)
  }

  useEffect(() => {
    getUser()
  }, [])

  const bloackUser = (uid:string) => {
    console.log('block',uid)
    db.collection('users').doc(auth.currentUser?.uid).collection('block').doc(uid).get().then((doc) => {
      if(doc.exists){
        alert('user already block')
      }else{
        db.collection('users').doc(auth.currentUser?.uid).collection('block').doc(uid).set({
          blockId: uid,
          createdAt: new Date(),
        }).then(() => {
          alert('user block')
        }).catch((error) => {
          console.log("error getting documents: ", error);
        })
      }
    })
  }

  const unFriend = (uid:string) => {
    console.log('unFriend',uid)
    //convert uid to username
    db.collection('users').where('uid','==',uid).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let target = doc.data().username;
        console.log('target',target)
        db.collection('users').doc(auth.currentUser?.uid).get().then((doc) => {
          console.log(doc.data())
          //get friend list
          let friendList = doc.data()?.friends;
          console.log('friend',friendList)
          //remove target from friend friendList
          let newFriendList = friendList.filter((item:any) => item !== target);
          console.log('newFriend',newFriendList)
          //if traget is in friendList Remove
          if(friendList.includes(target)){
            db.collection('users').doc(auth.currentUser?.uid).update({
              friends: firebase.firestore.FieldValue.arrayRemove(target)
              }).then(() => {
                replace('Home')
                alert('unfriend success')
              }).catch((error) => {
                console.log("error getting documents: ", error);
              })
          }else{
            alert('unfriend failed')
          }
        })
      })
    })
  }

  function ListedUser () {

    const [friendMenu, setFriendMenu] = useState(false)

    console.log("Hello")
    if(users.length > 0){
    return(
      <VStack  space={4} px="14px" alignItems="center">
            {users.map((userobj, i) => {
              return (
                <Box
                  py="4px"
                  w="100%"
                  key={i} style={{ 
                    flex: 1, 
                    alignitems: 'center', 
                    justifycontent: 'center',
                  }}
                >
                  <Pressable onPress={() => navigate('Chat',
                    {
                      userId: userobj.userId,
                      name: userobj.name,
                      email: userobj.email,
                      photoURL: userobj.photoURL
                      
                    }
                  )}>
                  <HStack 
                    space={4} 
                    alignItems="center" 
                    w= "100%"
                    justifyContent="space-between"
                  >
                 
                    <Image 
                      source={{ uri: userobj.photoURL }}
                      alt="Friend picture"
                      borderRadius={100}
                      size="85px"
                    />
                      <VStack>
                        <Text fontSize="lg" fontWeight="bold"> {userobj.name} </Text>
                        <Text> {userobj.status} </Text>
                      </VStack>
                      <IconButton
                        borderRadius="15px"
                        variant="ghost"
                        onPress={() => setFriendMenu(true)}
                        _icon={{
                          as: Entypo,
                          name:'dots-three-vertical',
                          color: 'base',
                          size: 'md',
                        }}
                      />
                      

                    </HStack>
                  </Pressable>
                  <Badge colorScheme="green" variant="solid" size="sm" >Online</Badge>
                  <Badge colorScheme="coolGray" variant="solid" size="sm" >Offline</Badge>
                  <Badge colorScheme="info" variant="solid" size="sm" >noti : 2</Badge>
                  <Divider my={2} bg='rgba(17,17,17,0.05)' />
                <Modal isOpen={friendMenu} onClose={() => setFriendMenu(false)}>
            <Modal.Content>
              <Modal.CloseButton/>
              <Modal.Header>Friend Menu</Modal.Header>
                <Modal.Body>
                <Button 
                  onPress={() => bloackUser(userobj.userId)}
                  colorScheme="red"
                >Block</Button>
                <Button
                  onPress={() => unFriend(userobj.userId)}
                >Remove</Button>
              </Modal.Body>
            </Modal.Content>
          </Modal>
                </Box>
              )
            })}
        </VStack>
      )
    }else{
      return(
      <Center>
        <Text
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        > No friends yet let find someone 😆</Text>
      </Center>
      )
    }
  }
  return (
    <>
      <Menubar {...props}/>
      <Box 
        shadow={2}
        h="100%" 
        mt="10px" 
        flex={1} 
        bg="white" 
        roundedTop="30px"
        _light={{
          bg: 'rgba(255,255,255,0.5)',
        }}
        _dark={{
          bg: 'rgba(17,17,17,0.5)',
        }}>
        <Heading 
          size="xl"
          my="4"
          mx="4"
          fontSize="40"
          _light={{
            color:'black',
          }}
          _dark={{
            color:'base',
          }}
        >Friend List</Heading>
        <ScrollView 
          pt="18px"
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={onRefresh}
            />
          }
        >
          <ListedUser />
        </ScrollView>
      </Box>
    </>
  )
}
export default ChatList
