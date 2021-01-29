import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  Dimensions,
  Platform,
  state,
  Image
} from 'react-native';


import AsyncStorage from '@react-native-async-storage/async-storage';

import ToDo from "./ToDo"
import  'react-native-get-random-values'; 
import {v4 as uuidv4} from "uuid"
import AppLoading from 'expo-app-loading'
const {height, width} = Dimensions.get("window");


export default class App extends React.Component{
  
  state = {
    newToDo : "",
    loadedToDos : false,
    toDos : {
      
    }
  };
  componentDidMount= ()=>{
    this._loadedToDos();
  }

  render(){
    const {newToDo, loadedToDos, toDos } = this.state;

    if(!loadedToDos)
      <AppLoading />
    return( 
      <>
     
      <View style={styles.container}> 
      <StatusBar barStyle="light-content" />
        <Image style={styles.title} source={
          require('./inner.png')} />
        <View style={styles.card}>
          <TextInput style = {styles.input} 
          placeholder={"New To Do"} value={newToDo} 
          onChangeText={this._controlNewToDo}
          placeholderTextColor={"#999"} 
          returnKeyType={"done"} 
          onSubmitEditing = {this._addToDo}
          />
         
          <ScrollView contentContainerStyle={styles.todos}>
            {Object.entries(toDos).map(([key, value]) =>
              <View style={styles.day}>
                <Text style = {styles.category}> {key} </Text>
                {
                  Object.values(value).map(
                    too=>{   
                    return (<ToDo key={too.id} {...too}
                      today = {key}
                      deleteToDo = {this._deleteToDo}
                      toggleComplete = {this._toggle}
                      updateToDo = {this._updateToDo}
                       />)
                    })
                    
                }
              </View>


            )          
            }
          </ScrollView>
          
        </View>
      </View>
     
      </>
    );
    };
    
    _loadedToDos = async ()=>{
      try{
        const toDos = await AsyncStorage.getItem("toDos");
        const toDolist = JSON.parse(toDos);
        // AsyncStorage.setItem("toDos", JSON.stringify({}))
        if(toDolist==null){
          toDolist = {};
          AsyncStorage.set("toDos", JSON.stringify(toDolist));
        }
          this.setState({
            loadedToDos : true, 
            toDos : {...toDolist}
          })
      }catch(err){
        console.log(err)
      }
      
    }


    _ToDayis = () =>{
      const date = new Date();
      let day = date.getDate();
      let month = date.getMonth()+1;
      if(day < 10) day = '0'+day;
      if(month < 10) month = '0'+month;
      return month + '-' + day;
    }

    _addToDo = () =>{
      const {newToDo} = this.state;
      this.setState(prevState=>{
        const ID = uuidv4();
        const today = this._ToDayis(); 
        let newToDos = {
          [ID] : {
            id : ID,
            isCompleted : false,
            text : newToDo,
            date : Date.now()
          }
        }
        let todaytodo = {
          [today] : {
            ...newToDos
          }
        };
        if(prevState.toDos.hasOwnProperty(today)){
          todaytodo = {
            [today] : {
              ...prevState.toDos[today],
              ...newToDos
            }
          }
        }
        
        const newState = {
          ...this.prevState,
          newToDo : "",
          toDos : {
            ...prevState.toDos,
            ...todaytodo
          }
        }
        newState.toDos = this._sortobj(newState.toDos);
        this._saveToDos(newState.toDos);
        return{
          ...newState
        }
      });
    }

    _deleteToDo = (today, ID) =>{
    
      this.setState(prevState=>{
        const toDos = prevState.toDos;
        delete toDos[today][ID];
        if(Object.keys(toDos[today]).length == 0)
          delete toDos[today];
        const newState = {
          ...prevState,
          toDos : {
            ...prevState.toDos,
            ...toDos
          }
        }
        newState.toDos = this._sortobj(newState.toDos);
        this._saveToDos(newState.toDos);
        return{...newState}
      })
    }

    _updateToDo = (today, ID, changetext) =>{
      this.setState(prevState=>{
        const newState = {
          ...prevState,
          toDos : {
            ...prevState.toDos,
          [today] : {
            ...prevState.toDos[today],
            [ID]:{
              ...prevState.toDos[today][ID],
              text : changetext
            }
          }
          }
        }
        newState.toDos = this._sortobj(newState.toDos);
        this._saveToDos(newState.toDos);
        return {...newState}
      })
    }
    _toggle = (today, ID, isCompleted)=>{
      this.setState(prevState=>{
        const newState = {
          ...prevState,
          toDos : {
            ...prevState.toDos,
          [today] : {
            ...prevState.toDos[today],
            [ID] : {
              ...prevState.toDos[today][ID],
              isCompleted : !isCompleted
            }
          }
          }
        }
        newState.toDos = this._sortobj(newState.toDos);
        this._saveToDos(newState.toDos);
        return {...newState}
      })
    }

    _controlNewToDo = (text)=>{
      this.setState({
        newToDo : text
      })
    }
    
    _saveToDos = (newToDos) =>{
      const saveToDos = AsyncStorage.setItem("toDos",
      JSON.stringify(newToDos));
    }
  
    _sortobj = (obj) =>{
      var key, arr = [],
      sorted = {};

      for(key in obj)
        arr.push(key);
      arr.sort();
      for(key=0;key<arr.length; key++)
        sorted[arr[key]] = obj[arr[key]];
      return sorted;
    }
}


// <View style={{flex:1}}></View>


const styles = StyleSheet.create({
  container:{
    flex : 1,
    backgroundColor : "rgb(200, 200, 255)",
    alignItems : "center"
  },
  title:{ 
    color : "white",
    marginTop : 30,
    marginBottom : 15,
    width : 100,
    height : 100
  },
  card:{
    backgroundColor : "white",
    flex : 1,
    width : width - 25,
    borderTopLeftRadius : 10,
    borderTopRightRadius : 10,
    ...Platform.select({
      ios : {
        shadowColor : "black",
        shadowOpacity : 0.5,
        shadowRadius : 5,
        shadowOffset : {
          height : -1,
          width : 0
        }
      },
      android: {
        elevation : 5
      }
    })
  },
  input: {
    padding : 20,
    borderBottomColor : "#bbb",
    borderBottomWidth : 1,
    fontSize : 25,
  },
  todos : {
    alignItems : "center"
  },
  day : {
    width : width-50,

  },
  category : {
    color:"black",
    fontSize : 15,
    marginTop : 5
  }
});