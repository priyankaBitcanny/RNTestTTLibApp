import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableHighlight,
    Alert,
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
            homeWillAppear: props.navigation.state.params.homeWillAppear,
            access_token: props.navigation.state.params.access_token,
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
        TTLock.on('foundDevice', this.foundDevice);
    }

    componentWillUnmount() {
        TTLock.removeListener('foundDevice', this.foundDevice);
    }

    foundDevice(device){
        console.log("this.state.data foundDevice " , device);
        if(this.state.data){
            console.log("this.state.data " , this.state.data);

            let arr = this.state.data;
            if (!this.isDeviceFound(device)) {
                console.log('Not Found ' + device.address);
                if (device.settingMode) {
                    arr.push(device);
                }
            } else if (!device.settingMode) {
                console.log('Found ' + device.address);
                for (let i = 0; i < this.state.data.length; i++) {
                    if (arr[i].address === device.address)
                        arr.splice(i, 1);
                }
            }
            this.setState({data: arr});
        }

    }

    isDeviceFound(device) {
        for (let i = 0; i < this.state.data.length; i++) {
            if (this.state.data[i].address == device.address)
                return true;
        }
        return false;
    }

    addAdminEkey({bleLockName,scienerLockAlias,lockMac,masterCode,pwdInfo,timestamp,modelNum,hardwareVer,firmwareVer,battery,lockVer,adminPs,lockKey,lockFlagPos,aesKeyStr,startDate,endDate,userType,keyStatus,specialValue
                 }){
        if(this.state.loading){
            return;
        }
        this.setState({loading:true});
        var url = 'https://managerapp-stage.rentlystaging.com/blue/api/locks/?' +
            'bleLockName=' + bleLockName +
            '&lockMac=' + lockMac +
            '&lockKey=' + lockKey +
            '&lockFlagPos=' + lockFlagPos +
            '&aesKeyStr=' + aesKeyStr +
            '&lockVer=' + lockVer +
            '&adminPs=' + adminPs +
            '&masterCode=' + masterCode +
            '&pwdInfo=' + pwdInfo +
            '&timestamp=' + timestamp +
            '&specialValue=' + specialValue +
            '&battery=' + battery +
            '&modelNum=' + modelNum +
            '&hardwareVer=' + hardwareVer +
            '&firmwareVer=' + firmwareVer +
            '&rentlyCompanyId=2' +
            '&userType=' + userType +
            '&keyStatus=' + keyStatus +
            '&startDate=' + startDate +
            '&endDate=' + endDate;

        console.log('addAdminEkey : ',url);
        fetch(url, {
            method: 'POST',
            headers:{'Authorization':`Bearer ${this.state.access_token}`}
        })
            .then(res => res.json())
            .then(({ success, serialNo, message }) => {
                this.setState({loading:false},()=>{
                    console.log("addAdminEkey success: " + success + " serialNo : " + serialNo + " message : " + message);
                    if (success)
                    {
                        Alert.alert("Lock Added successfully");
                    }
                    else {
                        Alert.alert(message);
                    }
                });

            })
            .catch(error=>Alert.alert(error));

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
                                .then(({bleLockName,scienerLockAlias,lockMac,masterCode,pwdInfo,timestamp,
                                           modelNum,hardwareVer,firmwareVer,battery,lockVer,adminPs,lockKey,lockFlagPos,
                                           aesKeyStr,startDate,endDate,userType,keyStatus,specialValue}) => {
                                    // Success code
                                    console.log('Administrator added bleLockName:'+bleLockName +' scienerLockAlias:'+scienerLockAlias
                                        +' lockMac:'+lockMac +' masterCode:'+masterCode +' pwdInfo:'+pwdInfo
                                        +' timestamp:'+timestamp +' modelNum:'+modelNum +' hardwareVer:'+hardwareVer
                                        +' firmwareVer:'+firmwareVer +' battery:'+battery +' lockVer:'+lockVer
                                        +' adminPs:'+adminPs +' lockKey:'+lockKey +' lockFlagPos:'+lockFlagPos
                                        +' aesKeyStr:'+aesKeyStr +' startDate:'+startDate +' endDate:'+endDate
                                        +' userType:'+userType +' keyStatus:'+keyStatus +' specialValue:'+specialValue);
                                    this.addAdminEkey({bleLockName,scienerLockAlias,lockMac,masterCode,pwdInfo,timestamp,
                                        modelNum,hardwareVer,firmwareVer,battery,lockVer,adminPs,lockKey,lockFlagPos,
                                        aesKeyStr,startDate,endDate,userType,keyStatus,specialValue});

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
