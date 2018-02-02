import React,{Component} from "react";
import {
    StyleSheet,
    TextInput,
    TouchableHighlight,
    Text,
    View,
    ActivityIndicator,
    Alert
} from 'react-native';
//import Spinner from 'react-native-loading-spinner-overlay';
import md5 from 'react-native-md5';

const clientId = '';
const clientSecret = '';
const redirectUri = '';
const username = '';
const password = '';

export default class LoginScreen extends Component<{}> {

    constructor(props) {
        super(props)
        this.state = {
            userEmail: username,
            userPassword: password,
            netConnected: false,
            showProgress: false,
            count: 0 }
    }

    showProgress() {
        this.setState({
            showProgress: true,
        });
    }

    hideProgress() {
        this.setState({
            showProgress: false,
        });
    }

    onPress = () => {
        this.login();
    }

    login(){
        this.showProgress();
        this.auth()
            .then(({ access_token='', openid=0 }) => {
                this.hideProgress();
                console.log('access_token:' + access_token + ' openid:' + openid);
                this.props.navigation.navigate('Home', {netConnected: this.state.netConnected, access_token, openid});
            })
            .catch(error => {
                this.hideProgress();
                Alert.alert(
                    'Error!!',
                    `Failed to authenticate for: ${error}`,
                    [
                        {text:'Cancel', onPress:()=>{}}
                    ],
                    { cancelable: false }
                );
            });
    }

    auth() {
        return fetch(`https://api.sciener.cn/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=password&username=${username}&password=${md5.hex_md5(password)}&redirect_uri=${redirectUri}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).then(res => res.json())
    }

    render() {
        var spinner = (this.state.showProgress?
                <View style = {styles.loader}>
                    <ActivityIndicator color="#000000" size="large" animating={this.state.showProgress}/>
                </View> : null
        ) ;
        return (
            <View style={styles.container}>
                <Text style={styles.header}>
                    Welcome to Rently Blue Lock!
                </Text>
                <Text style={styles.label}>
                    Email Id:
                </Text>
                <TextInput
                    style={styles.textField}
                    placeholder={'Email'}
                    onChangeText={(userEmail) => this.setState({userEmail})}
                    value={this.state.userEmail}
                />
                <Text style={styles.label}>
                    Password:
                </Text>
                <TextInput
                    style={styles.textField}
                    placeholder={'Password'}
                    secureTextEntry ={true}
                    onChangeText={(userPassword) => this.setState({userPassword})}
                    value={this.state.userPassword}
                />
                <TouchableHighlight
                    style={styles.button}
                    onPress={this.onPress}
                >
                    <Text style={{color:'white'}}> Login </Text>
                </TouchableHighlight>
                {spinner}
            </View>
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
    header: {
        height: 75,
        width: 300,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50,
        fontSize: 30,
        color:'blue'
    },
    label: {
        height: 20,
        width: 300,
        textAlign: 'left',
        marginTop: 20,
    },
    textField: {
        height: 40,
        width: 300,
        marginTop: 5,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
    },
    button: {
        alignItems: 'center',
        backgroundColor: 'blue',
        marginTop: 20, 
        padding: 10,
        borderRadius: 5,
    },
    loader: {
        position:'absolute',
        flex:1,
        alignItems:'center',
        justifyContent: 'center',
        left: 0,
        top: 0,
        width:window.width,
        height:window.height,
        backgroundColor:'#40111111'
    }
});