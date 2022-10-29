import React from 'react';
import {
  Button,
  HStack,
  Text,
  Box,
  IconButton,
} from 'native-base';

import {Entypo} from '@expo/vector-icons';

export default function Menubar() {
  return (
    <>
      <Box
        space={4} 
        alignItems="center" 
        bg="#D9D9D9"
        borderRadius="10px"
        w="auto"
        h="45px"
        m="15px"
        >
      <HStack p="3">
        <IconButton
          mr="24px"
          borderRadius="15px"
          variant="solid"
          bg="altbase"
          _icon={{
            as: Entypo,
            name: "home",
            size: 5,
            color: "base",
          }}
          onPress={() => console.log('pressed Home')}
          />    
        </HStack>
      </Box>
    </>

  );
}

