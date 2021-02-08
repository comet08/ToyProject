import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions,
        TextInput, event} from 'react-native';
import propTypes from "prop-types";       

const {width, height} =  Dimensions.get("window");

export default class ToDo extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isEditing : false,
            toDoValue : props.text
        }
    }
    static propTypes = {
        text : propTypes.string.isRequired,
        isCompleted : propTypes.bool.isRequired,
        deleteToDo : propTypes.func.isRequired,
        updateToDo : propTypes.func.isRequired,
        toggleComplete : propTypes.func.isRequired,
        id : propTypes.string.isRequired,
        today :  propTypes.string.isRequired,
      }
    /*state = {
        isEditing : false,
        toDoValue : ""
    }*/
    render(){
        const { isEditing, toDoValue } = this.state;
        const { isCompleted, text, id, deleteToDo, today } = this.props;
        return(
            <View style={styles.container}>
                <View style={styles.column}>
                    <TouchableOpacity onPress={this._toggleComplete}>
                        <View style={[styles.circle, 
                            isCompleted ? 
                            styles.completedCircle : styles.uncompletedCircle]} />
                    </TouchableOpacity>
                    {isEditing ? 
                        (
                        <TextInput style={[styles.text, styles.input,
                            isCompleted ? styles.completedText : styles.uncompletedText]} 
                            value={toDoValue}
                        multiline={true} 
                        onChangeText = {this._controllInput}
                        onBlur={this._endEditing}
                        />
                        )
                        :
                        (
                        <Text style ={[styles.text, 
                            isCompleted ? styles.completedText : styles.uncompletedText]} >
                                {text}
                        </Text>
                        )
                    }
                </View>
                    { isEditing ? 
                        <View style={styles.actions}> 
                            <TouchableOpacity
                                onPressOut = {this._endEditing}> 
                                <View style={styles.actionContainer}>
                                    <Text style={styles.actionText}>✔</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        :
                        <View style={styles.actions}>
                            <TouchableOpacity 
                                onPress={this._startEditing}>
                                <View style={styles.actionContainer}>
                                    <Text style={styles.actionText}>🖋</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPressOut = {(event)=>{event.stopPropagation;
                                deleteToDo(today, id);}
                                }>
                                <View style={styles.actionContainer}>
                                    <Text style={styles.actionText}>❌</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                
                </View>

        );
    }
    _toggleComplete = (event) =>{
        event.stopPropagation();
        const {id, toggleComplete, isCompleted, today} = this.props;
       toggleComplete(today, id, isCompleted);
    }
    _startEditing = (event) =>{ //toggle안하는 이유는 더 필요한 작업이 있으니까
        event.stopPropagation();
        this.setState({  //그걸 app.js에서 해야하니까 복잡해질까봐!
                isEditing : true
        });
    }
    _endEditing = (event)=>{
        event.stopPropagation();
        const {toDoValue} = this.state;
        const {updateToDo, id, today} = this.props;
        updateToDo(today, id, toDoValue);
        this.setState({
            isEditing : false,
        })
    }
    _controllInput = (text) =>{
        this.setState({
            toDoValue : text
        })
    }
}



const styles = StyleSheet.create({
    container : {

        width : width - 50,
        borderBottomColor : "black",
        borderBottomWidth : StyleSheet.hairlineWidth,
        flexDirection : "row",
        alignItems : "center",
        justifyContent : "space-between"
    },
    circle:{
        width : 30, height : 30,
        borderRadius : 15, backgroundColor : "white",
        marginRight : 20,
        borderWidth : 3,
        borderColor : "rgb(70,70,150)"
    },
    text:{
        width : width/2 + 21,
        fontSize : 17,
        fontWeight : "600",
        marginVertical : 20,
        paddingLeft : 5,
    },
    completedCircle : {
        borderColor : "grey",
    },
    uncompletedCircle : {
        borderColor : "rgb(70,70,150)"
    },
    completedText : {
        color : "grey",
        textDecorationLine : "line-through"
    },
    uncompletedText : {
        color : "black"
    },
    column : {
        width : width/2,
        flexDirection : "row",
        alignItems : "center",

    },
    actions:{
        flexDirection : "row"
    },
    actionContainer : {
        marginVertical : 10, 
        marginHorizontal : 10
    },
    hide : {
        height : 0, width : 0
    },
    input : {

        marginVertical : 15,
        paddingTop : 4,
        paddingBottom : 3.2,
        color: "grey"
    }
});