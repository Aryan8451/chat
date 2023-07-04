import { Box, Button, Container, VStack, Input, HStack } from "@chakra-ui/react";
import Message from "./components/Message";
// import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth"
// import {app} from "./firebase"
// const auth= getAuth(app)
// const loginHandler =()=>{
//   const provider = new GoogleAuthProvider;
//   signInWithPopup(auth,provider)
// }

import {signOut,onAuthStateChanged, GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"
import {app} from "./firebase"
import { useEffect, useRef, useState } from "react";
import{getFirestore,addDoc, collection, serverTimestamp, onSnapshot,query,orderBy} from "firebase/firestore"

const database= getFirestore(app)


const auth =getAuth(app)


const logoutHandler =()=>{
  signOut(auth)
}
const login =()=>{
 const provider =new GoogleAuthProvider;
 signInWithPopup(auth,provider)
 

}



function App() {
   const [user,setUser] =useState(false)
   const [message,setMessage] =useState("")
   const[messages,setMessages]=useState([])
   const divForScroll = useRef(null)

 const submitHandler=async(e)=>{
    e.preventDefault()
   
    try{
      setMessage("")
     await addDoc(collection(database,"Messages"),{
       text:message,
       uid:user.uid,
       uri:user.photoURL,
       createdAt:serverTimestamp(),

     })
     setMessage("")
     divForScroll.current.scrollIntoView({behavior:"smooth"})
    }
    catch(error){
     alert(error)
    }
   }

   
  useEffect(()=>{
    const q= query(collection(database,"Messages"),orderBy("createdAt","asc"))

     const unsub = onAuthStateChanged(auth,(data)=>{
      setUser(data)
    })

  const unsubFormessage =  onSnapshot(q,
  (snap)=>{
      setMessages(snap.docs.map((item)=>{
        const id= item.id;
        return {id,...item.data()};
      }))
    })
    return()=>{
      unsubFormessage();
      unsub();
    }
  },[])

  return (
    <Box bg={"red.50"}>
      {user?(
        <Container h={"100vh"} bg={"white"}>
        <VStack  h={"full"} py={"4"}>
          <Button onClick={logoutHandler} w={"full"} colorScheme={"red"}>
            log out
          </Button>

          <VStack h={"full"}  w={"full"} overflowY={"auto"} css={{"&::-webkit-scrollbar":{display:"none"}}}>

        {

          messages.map(item=>(
            <Message key={item.id} user={item.uid===user.uid?"me":"other"} text={item.text} uri={item.uri}/>
          ))
        }
     

  <div ref={divForScroll}></div>
          </VStack>
          
          <form onSubmit={submitHandler} style={{width:"100%"}}>
           <HStack>

           <Input value={message} onChange={(e)=>{setMessage(e.target.value)}} border={"1px solid "} focusBorderColor=" black" placeholder="enter message here" _hover={{background:"white",width:"100%"}}/>

            <Button colorScheme={"messenger"} type="submit">
              send
            </Button>
           </HStack>
          </form>
        </VStack>
      </Container>
      ):

        <VStack h={"100vh"}justifyContent={"center"}>
          <Button color={"white"} bg={"whatsapp.500"} onClick={login}>
            sign in
          </Button>
        </VStack>
      }
    </Box>
  );
}

export default App;
