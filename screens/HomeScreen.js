import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableHighlight,
    Alert,
    NetInfo,
    Button,
    ScrollView,
    Image,
} from 'react-native';
import TTLock from 'react-native-ttlock';
import Spinner from 'react-native-loading-spinner-overlay';
import md5 from 'react-native-md5';
//import { Icon } from 'react-native-elements';

const clientId = '7946f0d923934a61baefb3303de4d132';
const clientSecret = '56d9721abbc3d22a58452c24131a5554';
const redirectUri = 'http://www.sciener.cn';
const username = 'clark@rently.com';
const password = 'Rently2017';

const Error = {
    NET_DISCONNECTED: 0,
    NET_FAILED_TO_GET_SERIAL: 1,
    NET_FAILED_TO_GET_KEYLIST: 2,
    BT_DISCONNECTED: 3,
    BT_TIMED_OUT: 4,
    BT_ERROR: 5,
};

export default class HomeScreen extends Component<{}> {

    static navigationOptions = ({ navigation }) => {
        return {
            //headerLeft: null,
            // headerRight: <Button title="Help" onPress={()=>{navigation.navigate('Help')}} />,
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            access_token: props.navigation.state.params.access_token,
            data: [],
            macs:[],//"DB:42:31:2A:6B:85"
            devices:[],
            error: null,
            refreshing: false,
            showProgress: false,
            netConnected: props.navigation.state.params.netConnected,
        };

        for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
            if (typeof this[name] === 'function') this[name] = this[name].bind(this);
    }

    connectionChange(connectionInfo) {
        if (connectionInfo.type === 'none') {
            this.setState({ netConnected: false });
            Alert.alert(
                'connectionChange Network Error',
                `Please check your network connection. ERRCODE: ${Error.NET_DISCONNECTED}`,
                [{text:'OK', onPress:()=>{}}],
                { cancelable: false }
            );
        } else {
            this.setState({ netConnected: true });
        }
    }

    componentWillMount() {
        TTLock.startScan();
        TTLock.on('foundDevice', this.foundDevice);
        NetInfo.addEventListener('connectionChange', this.connectionChange);
    }

    componentDidMount() {
        console.log('componentDidMount access_token : ',this.state.access_token);
        //this.getAdminEkey();
    }

    componentWillUnmount() {
        NetInfo.removeEventListener('connectionChange', this.connectionChange);
        TTLock.removeListener('foundDevice', this.foundDevice);
    }

    isInList(address) {
        return this.state.data.find(key => key.lockMac === address);
    }

    getDevice(lockMac) {
        return this.state.devices.find(device => device.address === lockMac);
    }

    foundDevice(device) {

        let key = this.isInList(device.address);

        if (key && (key.touch !== device.touch)) {
            const { data } = this.state;
            for (let i = 0; i < data.length; i++) {
                if (data[i].lockMac === device.address)
                    data[i].touch = device.touch;
            }
            this.setState({ data });
        } else if (!key) {

            if (!this.state.netConnected) return;

            const { macs } = this.state;
            const { devices } = this.state;
            macs.push(device.address);
            devices[device.address] = device;
            this.setState({ macs , devices},()=>this.getAdminEkey());
        }
    }
    
    getAdminEkey(){
        var url = 'https://managerapp-stage.rentlystaging.com/api/keys/adminKeyListByMac';
        var macs = this.state.macs;
        for (var i=0; i<macs.length; ++i) {
            if (url.indexOf('?') === -1) {
                url = url + '?macs[]=' + macs[i];
            }else {
                url = url + '&macs[]=' + macs[i];
            }
        }
    console.log('this.state.macs : ',url);
        fetch(url, {
            method: 'GET',
            headers:{'Authorization':`Bearer ${this.state.access_token}`}
        })
            .then(res => res.json())
            .then(({ keys,success, message }) => {
                console.log("getAdminEkey success: " + success + " message : " + message + " keys : ",keys);
                if (success)
                {
                    keys.forEach(item =>{
                        const key = item.eKey;
                        key.id = item.id;
                        key.serialNumber = item.lockSerial;

                        const device = this.getDevice(item.eKey.lockMac);
                        if(device){
                            key.deviceName = device.name;
                            key.settingMode = device.settingMode;
                            key.touch = device.touch;
                            key.battery = device.battery;
                            key.rssi = device.rssi;
                        }

                        const { data } = this.state;
                        data.push(key);
                        this.setState({ data });
                    })

                }
                else {
                    alert(message);
                }
            })
            .catch(error=>console.log(error));

    }

    syncData(access_token){

        return fetch('https://managerapp-stage.rentlystaging.com/api/keys', {
            method: 'GET',
            headers:{'Authorization':`Bearer ${this.state.access_token}`}
        }).then(res => {
            return res.json();
        })

        /*
        return new Promise((resolve, reject)=> {
            return resolve({
                "keyList": [{
                    "adminPwd": "MzMsMzMsNDAsMzYsMzIsMzYsMzcsMzIsMzcsMzIsMTEx",
                    "aesKeyStr": "2d,e0,bf,30,b3,1b,7f,f8,b9,ac,04,ae,a8,21,cf,54",
                    "date": 1517572407602,
                    "deletePwd": "",
                    "electricQuantity": 65,
                    "endDate": 0,
                    "keyId": 969570,
                    "keyRight": 0,
                    "keyStatus": 110401,
                    "lockAlias": "RNTTLockBit_856b2a",
                    "lockFlagPos": 0,
                    "lockId": 60759,
                    "lockKey": "NjUsNzEsNjcsNjgsNjQsNjcsNzIsNjcsNzAsNjgsMTU=",
                    "lockMac": "DB:42:31:2A:6B:85",
                    "lockName": "RNTTLockBit_856b2a",
                    "lockVersion": {
                        "groupId": 10,
                        "logoUrl": "",
                        "orgId": 6,
                        "protocolType": 5,
                        "protocolVersion": 3,
                        "scene": 2,
                        "showAdminKbpwdFlag": 1
                    },
                    "noKeyPwd": 8592631,
                    "remarks": "",
                    "startDate": 0,
                    "timezoneRawOffset": 28800000,
                    "userType": 110301
                }]
            });
        });
        */
    }

    
    renderItem({ item: key }) {
        return(
            <TouchableHighlight
                onPress={() => {
                    this.props.navigation.navigate('Operations',{key});
                }}
                underlayColor='#EF6C00'
            >
                <View style={styles.listItem}>

                    {
                        key.touch ?
                        <Text style={{width:30, height:30, margin:10, padding:5, fontSize:30, backgroundColor:'green', borderRadius:15, color:'yellow'}}> + </Text>
                            :
                            <Text style={{width:30, height:30,margin:10, fontSize:30}}>  </Text>
                    }
                    <Text style={styles.listItemText}>
                        {key.deviceName + ' (' + key.serialNumber + ')\nUser Type: '}
                        {key.userType == '110301'? ' Admin' : ' User'}
                        {'\nSettingMode: '}{ key.settingMode? 'On' : 'Off'}
                        {'\nBattery: ' + key.battery + ',  ' +
                        'RSSI: ' + key.rssi +
                        '\nAddress: ' + key.lockMac
                        }
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }

    renderSeparator() {
        return (<View style={styles.separator}/>);
    }

    renderHeader() {
        return (<Text style={styles.title}>Serial Number</Text>);
    }

    handleRefresh() {
        if (this.state.netConnected) {
            this.setState({
                //refreshing: true
            }, this.getAdminEkey)
        } else {
            Alert.alert(
                'handleRefresh Network Error',
                `Please check your network connection. ERRCODE: ${Error.NET_DISCONNECTED}`,
                [{text:'Cancel', onPress:()=>{}}]
            )
        }

    }

    onPressHelp() {
        this.props.navigation.navigate('AddLock');
    }

    render() {
        return(
            <View style={styles.container}>
                <FlatList
                    data={this.state.data}
                    extraData={this.state}
                    renderItem={this.renderItem}
                    keyExtractor={eKey => eKey.lockMac}
                    ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeader}
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                />
                <View style={styles.button}>
                    <Button title="Add Device" onPress={this.onPressHelp}/>
                </View>
                {/*<Spinner
                    visible={this.state.showProgress}
                    textStyle={{color: '#FFF'}}
                />*/}
            </View>
        );
    }

    showProgress() {
        this.setState({
            showProgress: true,
        });
    }

    hideProgress() {
        this.setState({
            showProgress: false,
            progressText: '',
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        // fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#CED0CE'
    },
    listItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5,
    },
    listItemText: {
        fontSize:22,
    },
    button: {
        margin:20,
        height:40,
        width: 200,
        borderRadius:5,
        backgroundColor: 'yellow',
    },
});
