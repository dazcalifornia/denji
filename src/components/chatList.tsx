import React, {
  useState,
  useEffect,
} from 'react';
import {

  Text,
  Box,
  Heading,
  ScrollView,
  VStack,
  Button,
  Image,
  HStack,
  Pressable,
} from 'native-base';

import {auth,db} from '../../firebase'

function ChatList(props: { navigation: { navigate: any; }; }) {
  const {navigate} = props.navigation;

  //store User that retrieve from database
  const [users, setUsers] = useState([])

  const onloadUser = auth?.currentUser?.uid;
  
  useEffect(() => {
    console.log('onloadUser',onloadUser)
    db.collection('users').where('uid','==',onloadUser).get('friends').then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const friendListed = doc.data().friends
        console.log('friendListed',friendListed)
        db.collection('users').where('uid','in',friendListed).onSnapshot(snapshot => (
          //loadUser here! or code below 
          setUsers(snapshot.docs.map(doc => ({
            userId: doc.data().uid,
            name: doc.data().name,
            email: doc.data().email,
            photoURL: doc.data().imageURL,
          })))
        ))
      });
    })
  }, [])


  return (
    <>
      <Box shadow={2} mt="10px" flex={1} bg="white" roundedTop="30px" bg="#FCFBFC">
        <Heading size="xl" pt="7px" pl="14px" fontSize="40" color="black">Friend List</Heading>
        <Button onPress={() => console.log("Clear huh?")} bg="white" _text={{ color: 'black' }} size="sm" ml="14px" mt="10px" rounded="full" px="4" py="2" _pressed={{ bg: 'gray.200' }}>
          <Text fontSize="sm" fontWeight="bold">Add Friend</Text>
        </Button>
        <ScrollView pt="18px">
          
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
                  <HStack space={4} alignItems="center" w={100}>
                    <Image 
                      key={i}
                      source={{ uri: userobj.photoURL }}
                      alt="Friend picture"
                      borderRadius={100}
                      size="65px"
                    />
                      <Text> {userobj.name} </Text>
                    </HStack>
                  </Pressable>
                </Box>
              )
            })
            }
          </VStack>
        </ScrollView>
      </Box>
    </>
  )
}
export default ChatList
