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
            keyList: [],
            loading: false,
            access_token: props.navigation.state.params.access_token,
            openid: props.navigation.state.params.openid,
            data: [],
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
            //this.getKeyList();
        }
    }

    componentWillMount() {
        TTLock.startScan();
        TTLock.on('foundDevice', this.foundDevice);
        NetInfo.addEventListener('connectionChange', this.connectionChange);
    }

    componentDidMount() {
        this.getKeyList();
        /*if (!this.state.netConnected) {
            Alert.alert(
                'componentDidMount Network Error',
                `Please check your network connection. ERRCODE: ${Error.NET_DISCONNECTED}`,
                [{text:'OK', onPress:()=>{}}],
                { cancelable: false }
            );
        } else {
            this.getKeyList();
        }*/
    }

    componentWillUnmount() {
        NetInfo.removeEventListener('connectionChange', this.connectionChange);
        TTLock.removeListener('foundDevice', this.foundDevice);
    }

    isInList(address) {
        return this.state.data.find(key => key.lockMac === address);
    }

    getSerialNumber(address) {
        return fetch(`https://secure.rently.com/api/lockboxes/find_serial_by_mac?mac_address=${address}`)
            .then(res => res.json())
            .then(({ sciener_serial, error }) => {
                if (error)
                    throw new Error(error);
                else return sciener_serial;
            });
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
            this.getSerialNumber(device.address)
                .then(serial => {
                    if (!serial) return;
                    const key = this.getEkey(device.address);
                    if (!key) return;
                    key.serialNumber = serial;
                    key.deviceName = device.name;
                    key.settingMode = device.settingMode;
                    key.touch = device.touch;
                    key.battery = device.battery;
                    key.rssi = device.rssi;
                    key.scienerOpenId = parseInt(-1+serial);
                    key.lockVer = JSON.stringify(key.lockVersion);// key.lockVersion;
                    key.userType = key.userType.toString();
                    key.adminPs = key.adminPwd;
                    if (this.isInList(device.address)) return;
                    const { data } = this.state;
                    data.push(key);
                    this.setState({ data });
                })
                .catch(error => {
                    Alert.alert(
                        'foundDevice Network Error',
                        `Please check your network connection. ERRCODE: ${Error.NET_FAILED_TO_GET_SERIAL}`,
                        [{text:'Cancel', onPress:()=>{}}],
                        { cancelable: false }
                    );
                });
        }
    }



    getKeyList() {
        //this.showProgress();
        //this.setState({ loading: true });
        return this.syncData(this.state.access_token)
            .then(list => {
                console.log('list',list);
                this.hideProgress();
                this.setState({
                    keyList:list.keyList,
                    loading: false,
                    refreshing: false,
                }
                /*,()=>{
                    list.keyList.forEach((ekey,index)=>{
                        this.getSerialNumber(ekey.lockMac)
                            .then(serial => {
                                if (!serial) return;
                                const key = this.getEkey(ekey.lockMac);
                                if (!key) return;
                                key.serialNumber = serial;
                                key.touch = false;
                                key.scienerOpenId = parseInt(-1+serial);
                                key.lockVer = JSON.stringify(key.lockVersion);// key.lockVersion;
                                key.userType = key.userType.toString();
                                key.adminPs = key.adminPwd;
                                if (this.isInList(ekey.lockMac)) return;
                                const { data } = this.state;
                                data.push(key);
                                this.setState({ data });
                            })
                            .catch(error => {
                                Alert.alert(
                                    'foundDevice Network Error',
                                    `Please check your network connection. ERRCODE: ${error}`,
                                    [{text:'Cancel', onPress:()=>{}}],
                                    { cancelable: false }
                                );
                            });
                    });
                }*/
                );
            })
            .catch(error => {
                this.hideProgress();
                Alert.alert(
                    'getKeyList Network Error',
                    `Please check your network connection. ERRCODE: ${error}`,
                    [
                        {text:'Retry', onPress:this.getKeyList},
                        {text:'Cancel', onPress:()=>{}}
                    ],
                    { cancelable: false }
                );
            });
    }

    syncData(access_token){

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

        /*
        var d = new Date();
        var n = d.getMilliseconds();
        var lastUpdateDate = 0;


        var postData = {"client_id":clientId,
            "accessToken":access_token,
            "lastUpdateDate":lastUpdateDate,
            "date":d.getTime()
        };
        return fetch('https://api.ttlock.com.cn/v3/key/syncdata', {
            method: 'POST',
            body: JSON.stringify(postData)
        }).then(res => {
            console.log('syncData response',res);
            return res.json();
        })*/
    }

    getEkey(lockMac) {
        return this.state.keyList.find(key => key.lockMac === lockMac);
    }

    syncTime(key) {
        this.showProgress();
        TTLock.setLockTime(key, Date.now())
            .then(() => TTLock.getLockTime(key))
            .then(time => {
                Alert.alert(
                    'Success',
                    `Lock ${key.serialNumber} is set for ${this.formatDate(new Date(time))}.`,
                    [{text:'OK', onPress:()=>{}}],
                    { cancelable: false }
                );
            })
            .catch(error => {
                const errcode =
                    error.message === 'Lock disconnected' ? Error.BT_DISCONNECTED :
                        error.message === 'Operation timed out' ? Error.BT_TIMED_OUT :
                            Error.BT_ERROR;

                Alert.alert(
                    'Oops!',
                    `Please check that Bluetooth is on. Place your palm on the keypad of the lock to wake the lock up and try again. ERRCODE: ${errcode}`,
                    [
                        {text:'Retry', onPress:()=>{this.syncTime(key)}},
                        {text:'Cancel', onPress:()=>{}}
                    ],
                    { cancelable: false }
                );
            })
            .finally(this.hideProgress)
    }

    formatDate(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let month;
        switch(date.getMonth()) {
            case 0: month = 'January'; break;
            case 1: month = 'February'; break;
            case 2: month = 'March'; break;
            case 3: month = 'April'; break;
            case 4: month = 'May'; break;
            case 5: month = 'June'; break;
            case 6: month = 'July'; break;
            case 7: month = 'August'; break;
            case 8: month = 'September'; break;
            case 9: month = 'October'; break;
            case 10: month = 'November'; break;
            case 11: month = 'December'; break;
            default: month = '';
        }
        let day;
        switch(date.getDay()) {
            case 0: day = 'Sunday'; break;
            case 1: day = 'Monday'; break;
            case 2: day = 'Tuesday'; break;
            case 3: day = 'Wednesday'; break;
            case 4: day = 'Thursday'; break;
            case 5: day = 'Friday'; break;
            case 6: day = 'Saturday'; break;
            default: day = '';
        }
        let theDate = date.getDate();
        let year = date.getFullYear();
        return `${day} ${month} ${theDate}, ${year} ${hours}:${minutes} ${ampm}`;
    }

    renderItem({ item: key }) {
        return(
            <TouchableHighlight
                onPress={() => {
                    //this.syncTime(key);
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
            }, this.getKeyList)
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
