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
            macs:[],
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
        console.log('lockMac: ' + lockMac + 'this.state.devices : ',this.state.devices);
        return this.state.devices[lockMac];
    }

    foundDevice(device) {

        let key = this.isInList(device.address);

        if (key && ((key.touch !== device.touch) || (key.rssi !== device.rssi))) {
            const { data } = this.state;
            for (let i = 0; i < data.length; i++) {
                if (data[i].lockMac === device.address){
                    data[i].deviceName = device.name;
                    data[i].settingMode = device.settingMode;
                    data[i].touch = device.touch;
                    data[i].battery = device.battery;
                    data[i].rssi = device.rssi;
                }

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
        if(this.state.loading){
            return;
        }
        this.setState({loading:true});
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
                this.setState({loading:false},()=>{
                    console.log("getAdminEkey success: " + success + " message : " + message + " keys : ",keys);
                    var { data } = this.state;
                    data = [];
                    if (success)
                    {
                        keys.forEach(item =>{
                            const key = item.eKey;
                            key.id = item.id;
                            key.serialNumber = item.lockSerial;

                            const device = this.getDevice(item.eKey.lockMac);
                            if(device){
                                console.log('device found',device);
                                key.deviceName = device.name;
                                key.settingMode = device.settingMode;
                                key.touch = device.touch;
                                key.battery = device.battery;
                                key.rssi = device.rssi;
                            }
                            else {
                                console.log('device not found');
                            }


                            data.push(key);
                        })

                    }
                    else {
                        //TTLock.stopScan();
                        console.log(message);
                    }
                    this.setState({ data });

                });

            })
            .catch(error=>console.log(error));

    }
    
    renderItem({ item: key }) {
        return(
            <TouchableHighlight
                onPress={() => {
                    TTLock.removeListener('foundDevice', this.foundDevice);
                    this.props.navigation.navigate('Operations',{access_token:this.state.access_token,key,homeWillAppear:this.homeWillAppear.bind(this)});
                }}
                underlayColor='#EF6C00'
            >
                <View style={styles.listItem}>

                    {
                        key.touch ?
                        <View style={{width:20, height:20, margin:5, marginRight:10, backgroundColor:'blue', borderRadius:15}}/>
                            :
                            <View style={{width:20, height:20, margin:5, marginRight:10, backgroundColor:'gray', borderRadius:15}}/>
                    }
                    <View>
                        <Text style={styles.listItemText}>
                            {key.deviceName + ' (' + key.serialNumber + ')\nUser Type: '}
                            {key.userType == '110301'? ' Admin' : ' User'}
                            {'\nSettingMode: '}{ key.settingMode? 'On' : 'Off'}
                            {'\nBattery: ' + key.battery + ',  ' +
                            'RSSI: ' + key.rssi +
                            '\nMAC: ' + key.lockMac
                            }
                        </Text>
                    </View>

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

    homeWillAppear(){
        console.log('homeWillAppear');
        TTLock.on('foundDevice', this.foundDevice);
    }
    onPressAddDevice() {
        TTLock.removeListener('foundDevice', this.foundDevice);
        this.props.navigation.navigate('AddLock',{access_token:this.state.access_token,homeWillAppear:this.homeWillAppear.bind(this)});
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
                    <Button title="Add Device" onPress={this.onPressAddDevice}/>
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
        fontSize:22
    },
    button: {
        margin:20,
        height:40,
        width: 200,
        borderRadius:5,
        backgroundColor: 'yellow',
    },
});
