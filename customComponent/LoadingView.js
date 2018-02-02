import React, {Component} from "react";
import {
    View,
    ActivityIndicator,
    StyleSheet
} from 'react-native';

export default class spinner extends Component<{}> {

    constructor(props) {
        super(props)
        this.state = {showProgress: this.props.showProgress}
    }

    render() {
        var spinner = (this.props.showProgress?
                <View style = {stylesDev.loader}>
                    <ActivityIndicator color="#000000" size="large" animating={this.props.showProgress}/>
                </View> : null
        ) ;
        return (
            {spinner}
        );
    }
}

const Dimensions = require('Dimensions');
const window = Dimensions.get('window');
const headerHeight = 74;
const stylesDev = StyleSheet.create({
    loader: {
        position:'absolute',
        flex:1,
        alignItems:'center',
        justifyContent: 'center',
        left: 0,
        top: headerHeight,
        width:window.width,
        height:window.height-headerHeight,
        backgroundColor:'#40111111'
    }
});