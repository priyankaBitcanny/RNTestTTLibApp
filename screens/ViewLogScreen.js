import React,{Component} from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    Text
} from 'react-native';

export default class ViewLogScreen extends Component<{}> {

    constructor(props) {
        super(props)
        this.state = {
            logsArray: props.navigation.state.params.logsArray,
        }
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.contentContainer}>

                {
                    this.state.logsArray.map((item, index) => (
                    <View key = {item.recordId} style = {styles.item}>
                    <Text>{JSON.stringify(item)}</Text>
                    </View>
                    ))
                }

            </ScrollView>
        );
    }
}

const Dimensions = require('Dimensions');
const window = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    contentContainer: {
        paddingVertical: 20
    },
    header: {
        height: 75,
        width: 300,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50,
        fontSize: 30,
        color:'blue'
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 2,
        borderColor: 'gray',
        borderWidth: 1,
        backgroundColor: 'white'
    }
});