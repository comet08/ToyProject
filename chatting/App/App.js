import { StatusBar } from 'expo-status-bar';
import React, { useReducer } from 'react';
import { StyleSheet, Text, View, TextInput, 
          ScrollView, state, Dimensions, Image,
          KeyboardAvoidingView 

} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLoading from 'expo-app-loading';
import { render } from 'react-dom';
import { stringify, v4 } from "uuid";
import  'react-native-get-random-values'; 

let {width, height} = Dimensions.get('window')
import io from 'socket.io-client'
const socket = io.connect("http://192.168.0.11:3000/");


export default  class App extends React.Component{
  
  constructor(){
    super();
    this.state = {
        loaded : false,
        chat : [
          
        ],
        name : "",
        uid : "",
        textvalue : "",
    }
  }

  componentDidMount= ()=>{
    
    socket.on('connect',()=>{
      console.log("success connecting server");
    })
    //this._loadname();
    socket.on('load', (list)=>{
      this._loadchat(list);
    })

    socket.on("message", (message)=>{
      this._receive(message);
    })
    this._loadname();

  };

  componentDidUpdate = ()=>{
   //this._scrolling();
  }
  render(){
    const {uid, loaded, chat, name, textvalue} = this.state;
    if(!loaded)
        <AppLoading />
    return (
      <>
      <View style={styles.container}>
        <StatusBar style="auto" />
        { uid=="" ? 
        <View style={styles.register}>
          <TextInput 
          placeholder = "What's your name?"
          style= {styles.input_name}
          onChangeText={this._controlText}
           value={textvalue}
           onSubmitEditing = {this._register}   
           ></TextInput>
        </View>

          :
          
        <View style={styles.card}>
          <Image  style={styles.image}
          source={require('./assets/comet.png')}    />
          <View style = {styles.messages}>
          
            <ScrollView contentContainerStyle={styles.scroll} 
              ref={ref=>{this.scrollref =ref}}
               onContentSizeChange={()=>{
                this._scrolling()
               }}
            >
              {
                chat.map((m)=>{
                    {
                    return(
                      (m.uid==uid) ?
                      <View  key={m.key}  style= {styles.me}>
                        <View style={styles.concat_chattime}>
                          <Text style={{marginTop : 5, marginRight : 5
                            }}>
                            {m.time}
                          </Text>
                          <Text 
                          style={[styles.chat, styles.chat_me]}>
                            {m.text}
                          </Text>
                        </View>
                      </View>
                      :
                      <View  key={m.key}  style={styles.you}>
                        <Text> {m.name}</Text>
                        <View style={styles.concat_chattime}>
                          <Text 
                          style={[styles.chat, styles.chat_you]}>
                            {m.text}
                          </Text>
                          <Text style={
                            {marginTop : 6, marginLeft :5}
                          }>{m.time}</Text>
                        </View>
                      </View>
                  
                    )}
                })
              }
            </ScrollView>
            <TextInput
                style = {styles.input_message}
                onSubmitEditing = {this._send}
                returnKeyType={"done"} 
                value = {textvalue}
                onChangeText = {this._controlText}
                onFocus = {this._inputscroll}
                blurOnSubmit={false}
                ref={ref=>{this.inputref = ref}}
                >
            </TextInput>
          </View>
          
         
          </View>
        }
      </View>
      
      </>
    );
  };

  
  _loadname = async() =>{
    const {uid, name} = this.state;
    let user = await AsyncStorage.getItem("ID");
    
    user = JSON.parse(user);
    if(user!=null)
      this.setState({
        uid : user.id,
        name : user.name
      })
  }

  _loadchat = (list) =>{
    const {chat} = this.state;
    this.setState({
      chat : list,
      loaded : true
    })
  }



  _register = () =>{
    const {name, uid, textvalue} = this.state;
    if(textvalue!=""){
      let id = v4();
      AsyncStorage.setItem('ID', JSON.stringify({id,textvalue}));
      this.setState({
          name : textvalue,
          uid : id,
          textvalue : ""
      })
    }
  }

  _receive = (message)=>{
    const {chat} = this.state;
    let list = chat;
    console.log(message)
    list.push(JSON.parse(message))
    this.setState({
     chat : list
    })
  }
  
  _send = () =>{   
    const {name, textvalue} = this.state;
    const date = new Date();
    var time = date.getHours() +':' + date.getMinutes();
    const id = v4();
    socket.emit('message', JSON.stringify({
      name : name,
      text: textvalue,
      time : time,
      key : id
    })
    );
    this.setState({
      textvalue : ""
    })
    
  }
  

  _controlText = (text) =>{
    this.setState({
      textvalue : text
    })
  } 

  _scrolling=()=>{
    this.scrollref.scrollToEnd({animated:false});
  }

  _inputscroll = ()=>{
    setTimeout(() => {
      this.scrollref.scrollToEnd({animated:true})
    }, 500);
  }
};


const styles = StyleSheet.create({
  container: {
    width : width,
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width:200, 
    height:40, 
    marginTop : 30,
    marginBottom : 12
  },
  card : {
    flex : 1,
    backgroundColor : "white",
    alignItems : 'center'

  },
  register : {
    alignItems : "center"
  },

  input_name : {
    backgroundColor : "#bbb",
    textAlign : 'center',
    borderRadius : 15,
    fontSize : 20
  },

  messages : {
    flex:1,
    backgroundColor : 'rgb(230,230,255)',
    width : width-10,
    borderTopRightRadius : 15,
    borderTopLeftRadius : 15,
    borderColor : "black",
    borderWidth : 0.7,

  },
  

  scroll : {
    flexDirection : 'column'
  },

  me : {
    textAlign : 'right',
    alignItems : 'flex-end',
    marginRight : 5,
    marginTop : 3,
    marginBottom : 3,
    marginLeft : 50
    
  },
  you : {
    textAlign : 'left',
    alignItems : 'flex-start',
    marginLeft : 5,
    marginTop : 3,
    marginBottom : 3,
    marginRight : 50
  },

  chat : {
    paddingHorizontal : 10,
    paddingVertical : 5,
    borderRadius : 15,
    backgroundColor : "black",
    fontSize : 18,
  },
  concat_chattime : {
    flexDirection : 'row'
  },
  chat_you : {
    backgroundColor : "rgb(230,230,230)",
   
  },
  chat_me : {
    backgroundColor : "rgb(123,123,255)",
    color : "white",
  },
  chat_time: {
    marginTop : 10,
  },
    
  input_message : {
    borderWidth : 0.7,
    fontSize : 20,
    height : 50,
    borderColor : 'black',
    backgroundColor : 'white',
    width : width-10,
    paddingLeft : 5,
  },

});
