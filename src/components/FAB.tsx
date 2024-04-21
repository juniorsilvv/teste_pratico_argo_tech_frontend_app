
import { Pressable, StyleSheet, Text, Image } from "react-native"; 
import React from "react"; 

const FAB = (props:any) => { 
    return ( 
        <Pressable style={styles.container} 
            onPress={props.onPress}> 
            <Text style={styles.title}>
                +
            </Text> 
        </Pressable> 
    ); 
}; 
  
export default FAB; 
  
const styles = StyleSheet.create({ 
    container: { 
        justifyContent: "center", 
        alignItems: "center", 
        borderRadius: 50, 
        position: "absolute", 
        bottom: 40, 
        right: 30, 
        backgroundColor: "#4169E1", 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
    }, 
    title: { 
        fontSize: 25, 
        color: "#fff",
        alignItems: 'center',
        justifyContent: 'center',
    }, 
}); 