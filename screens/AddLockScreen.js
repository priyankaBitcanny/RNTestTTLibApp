import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    PermissionsAndroid,
    Button,
    FlatList,
    TouchableHighlight,
    Alert,
    DeviceEventEmitter,
    NativeEventEmitter,
    Modal,
    TextInput
} from 'react-native';
import Toast from 'react-native-simple-toast';
import TTLock from 'react-native-ttlock';


export default class AddLockScreen extends Component<{}> {

    static navigationOptions = {
        //title: 'Found Device'
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            error: null,
            refreshing: false
        }
        for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
            if (typeof this[name] === 'function') this[name] = this[name].bind(this);
    }

    componentWillMount() {
        let arr = this.state.data;
        console.log("this.state.data arr" , arr);
        TTLock.startScan();
        TTLock.on('foundDevice', this.showDevices);
        /*if (Platform.OS === 'ios') {
            //TTLock.scanDevice();
            const myModuleEvt = new NativeEventEmitter(TTLock);
            myModuleEvt.addListener('foundDevice', (device) => {
                console.log('foundDevice \n',device);
                this.showDevices(device);
            });
        }
        else{
            DeviceEventEmitter.addListener('foundDevice', (device) => {
                this.showDevices(device);
            });
        }*/

    }

    showDevices(device){
        console.log("this.state.data showDevices " , device);
        if(this.state.data){
            console.log("this.state.data " , this.state.data);

            let arr = this.state.data;
            if (!this.isDeviceFound(device)) {
                if (device.isSettingMode) {
                    arr.push(device);
                }
            } else if (!device.isSettingMode) {
                for (let i = 0; i < this.state.data.length; i++) {
                    if (arr[i].address === device.address)
                        arr.splice(i, 1);
                }
            }
            this.setState({data: arr});
        }

    }

    isDeviceFound(device) {
        console.log('Found ' + device.address);
        for (let i = 0; i < this.state.data.length; i++) {
            if (this.state.data[i].address == device.address)
                return true;
        }
        return false;
    }

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    backgroundColor: '#CED0CE'
                }}
            />
        );
    };

    render() {
        return(
            <FlatList
                data={this.state.data}
                extraData={this.state}
                renderItem={({ item }) =>
                    <TouchableHighlight
                        onPress={() => {
                            TTLock.addAdministrator(item.address,)
                                .then(({
                                           bleLockName, // String
                                           scienerLockAlias, // String
                                           lockMac, // String
                                           masterCode, // String
                                           pwdInfo, // String
                                           timestamp, // Number
                                           modelNum, // String
                                           hardwareVer, // String
                                           firmwareVer, // String
                                           battery, // Number
                                           lockVer, // String
                                           adminPs, // String
                                           lockKey, // String
                                           lockFlagPos, // Number
                                           aesKeyStr, // String
                                           startDate, // Number
                                           endDate, // Number
                                           userType, // String
                                           keyStatus, // String
                                           specialValue // Number
                                       }) => {
                                    // Success code
                                    console.log('Administrator added bleLockName:'+bleLockName
                                        +' scienerLockAlias:'+scienerLockAlias
                                        +' lockMac:'+lockMac
                                        +' masterCode:'+masterCode
                                        +' pwdInfo:'+pwdInfo
                                        +' timestamp:'+timestamp
                                        +' modelNum:'+modelNum
                                        +' hardwareVer:'+hardwareVer
                                        +' firmwareVer:'+firmwareVer
                                        +' battery:'+battery
                                        +' lockVer:'+lockVer
                                        +' adminPs:'+adminPs
                                        +' lockKey:'+lockKey
                                        +' lockFlagPos:'+lockFlagPos
                                        +' aesKeyStr:'+aesKeyStr
                                        +' startDate:'+startDate
                                        +' endDate:'+endDate
                                        +' userType:'+userType
                                        +' keyStatus:'+keyStatus
                                        +' specialValue:'+specialValue);
                                })
                                .catch((error) => {
                                    // Failure code
                                    console.log(error);
                                });
                        }}
                        underlayColor='#339944'
                    >
                        <Text style={{fontSize:24}}>{item.name}</Text>
                    </TouchableHighlight>
                }
                keyExtractor={item => item.address}
                ItemSeparatorComponent={this.renderSeparator}
                refreshing={this.state.refreshing}
                onRefresh={this.handleRefresh}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    listItem: {
        flex: 1,
        padding: 10
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
    }
});
