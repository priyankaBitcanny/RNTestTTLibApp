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
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import TTLock from 'react-native-ttlock';

export default class Operations extends React.Component {
    static navigationOptions = {
        //title: 'Operations',
    }

    constructor(props) {
        super(props);
        this.key = props.navigation.state.params.key;
        this.passcodeType = 'PERMANENT';
        this.operation = '';
        this.passcodeId;
        this.passcode;
        this.operations = {
            SET_TIME: 'Set Lock Time',
            GET_TIME: 'Get Lock Time',
            UNLOCK: 'Unlock',
            GET_BATTERY_LEVEL: 'Get Battery Level',
            GET_LOG: 'Get Logs',
            ADD_PERIOD_PASSCODE: 'Add period password',
            MODIFY_PASSCODE: 'Modify User password',
            DELETE_PASSCODE: 'Delete one (permanent) keyboard password',
            DELETE_ALL_PASSCODES: 'Delete all passwords',
            SET_AUTOLOCK_TIME: 'Set Auto-Lock Time',
            MODIFY_ADMIN_PASSCODE: 'Modify Admin password',
            RESET_LOCK: 'Reset lock',
        };
        this.state = {
            modalVisible: false,
            text: '',
            text2: '',
            pwdType: 'PERMANENT',
            passcodeDic: {},
            keyboardType1: 'numeric',
            keyboardType2: 'numeric',
            modalHeaderStr: '',
            placeHolder1: '',
            placeholder2: '',
        }
    }

    componentWillMount(){
        console.log("this.state.key => ",this.key);
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    modalOKOnClick(valueText,valueText2) {

        let hour = 1000 * 60 * 60;
        let start = Math.floor(Date.now() / hour) * hour;
        let end = start + hour;
        this.state.text = '';
        this.state.text2 = '';
        console.log("start = " + start);
        console.log("end = " + end);

        this.setModalVisible(false);
        switch (this.operation) {

            case this.operations.ADD_PERIOD_PASSCODE:
                TTLock.addPeriodPasscode(this.key, valueText, start, end)
                    .then(() => Toast.show('Password added successfully'))
                    .catch(err => Toast.show('addPeriodPasscode :' + err.message));
                break;

            case this.operations.MODIFY_PASSCODE:
                TTLock.changePasscode(this.key, 3, valueText, valueText2, start, end)
                    .then(() => Toast.show('Password changed to ' + valueText2 + ' successfully'))
                    .catch(err => Toast.show('changePasscode :' + err.message));
                break;

            case this.operations.DELETE_PASSCODE:
                TTLock.deletePasscode(this.key, valueText)
                    .then(() => Toast.show('Password deleted successfully: ' + valueText))
                    .catch(err => Toast.show('deletePasscode :' + err.message));
                break;

            case this.operations.SET_AUTOLOCK_TIME:
                TTLock.setAutoLockTime(this.key,parseInt(valueText))
                    .then(() => Toast.show('auto-lock set for ' + valueText + ' seconds'))
                    .catch(err => Toast.show('setAutoLockTime :' + err.message));
                break;

            case this.operations.MODIFY_ADMIN_PASSCODE:
                console.log('MODIFY_ADMIN_PASSCODE ',valueText,this.key);
                TTLock.changeAdminPasscode(this.key, valueText)
                    .then(() => Toast.show('Admin password changed'))
                    .catch(err => Toast.show('changeAdminPasscode :' + err.message));
                break;

            default:
                Toast.show('Unknown operation');

        }
    }

    renderSeparator() {
        return (<View style={styles.separator}/>);
    }

    renderHeader() {
        return (<Text style={styles.title}>Operations</Text>);
    }

    render() {
        return (
            <View>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => this.setModalVisible(!this.state.modalVisible)}
                >

                    <View style={{marginTop: 22, flex:1}}>
                        <View style={{margin: 22, flex:1}}>
                            <Text style={{marginTop: 20}}>{this.state.modalHeaderStr}</Text>

                            <TextInput
                                ref={'textInput'}
                                keyboardType={this.state.keyboardType1}
                                placeholder = {this.state.placeHolder1}
                                style={{marginTop: 20, height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 5}}
                                onChangeText={(text) => this.setState({text})}
                                value={this.state.text}
                            />
                            {this.operation === this.operations.MODIFY_PASSCODE?
                            <TextInput
                                ref={'textInput2'}
                                keyboardType={this.state.keyboardType2}
                                placeholder = {this.state.placeHolder2}
                                style={{marginTop: 20, height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 5}}
                                onChangeText={(text2) => this.setState({text2})}
                                value={this.state.text2}
                            />
                            :
                            null
                            }
                            <View style={{flexDirection: 'row',marginTop: 20}}>
                                <Button
                                    style={styles.dialogButton}
                                    title="Cancel"
                                    onPress={() => this.setModalVisible(!this.state.modalVisible)}
                                />

                                <Button
                                    style={styles.dialogButton}
                                    title="OK"
                                    onPress={() => this.modalOKOnClick(this.state.text,this.state.text2)}
                                />
                            </View>

                        </View>
                    </View>

                </Modal>

                <FlatList
                    data={Object.values(this.operations)}
                    renderItem={({ item, index }) =>
                        <TouchableHighlight onPress={() => {
                            this.operation = Object.values(this.operations)[index];
                            switch (this.operation) {

                                case this.operations.SET_TIME:
                                    TTLock.setLockTime(this.key,Date.now())
                                        .then(() => TTLock.getLockTime(this.key))
                                        .then((time) => Alert.alert(`Time set successfully. lock time: ${new Date(time)}`))
                                        .catch(err => Alert.alert(err.message));
                                    break;

                                case this.operations.GET_TIME:
                                    TTLock.getLockTime(this.key)
                                        .then((time) => Alert.alert(`lock time: ${new Date(time)}`))
                                        .catch(err => Alert.alert(err.message));
                                    break;

                                case this.operations.UNLOCK:
                                    TTLock.unlock(this.key)
                                        .then(() => {
                                            Alert.alert("Unlock successful");
                                        })
                                        .catch(err => Alert.alert(err.message));
                                    break;

                                case this.operations.GET_BATTERY_LEVEL:
                                    TTLock.getBattery(this.key)
                                        .then((battery) => Alert.alert('Battery: ' + battery))
                                        .catch(err => Alert.alert(err.message));
                                    break;

                                case this.operations.GET_LOG:
                                    TTLock.getLog(this.key)
                                        .then((logsArray) => {
                                            this.props.navigation.navigate('ViewLog',{logsArray});
                                        })
                                        .catch(err => Alert.alert(err.message));
                                    break;

                                case this.operations.ADD_PERIOD_PASSCODE:
                                    this.setState({
                                        keyboardType1: 'numeric',
                                        modalHeaderStr: 'Add custom password (4-9 digits)',
                                        placeHolder1: 'password',
                                        modalVisible: true
                                    });
                                    break;

                                case this.operations.MODIFY_PASSCODE:
                                    this.setState({
                                        keyboardType1: 'numeric',
                                        keyboardType2: 'numeric',
                                        modalHeaderStr: 'Modify User Custom password (between 4-9 digits)',
                                        placeHolder1: 'old password',
                                        placeHolder2: 'new password',
                                        modalVisible: true
                                    });
                                    break;

                                case this.operations.DELETE_PASSCODE:
                                    this.setState({
                                        keyboardType1: 'numeric',
                                        modalHeaderStr: 'Delete User Custom password',
                                        placeHolder1: 'old password',
                                        modalVisible: true
                                    });
                                    break;

                                case this.operations.DELETE_ALL_PASSCODES:
                                    TTLock.deleteAllPasscodes(this.key)
                                        .then(() => Alert.alert('All passwords deleted successfully'))
                                        .catch(err => Alert.alert(err.message));
                                    break;

                                case this.operations.SET_AUTOLOCK_TIME:
                                    this.setState({
                                        keyboardType1: 'numeric',
                                        modalHeaderStr: 'Set Auto Lock Time (between 5 to 120 seconds)(set 0 for Off)',
                                        placeHolder1: 'time',
                                        modalVisible: true
                                    });
                                    break;

                                case this.operations.MODIFY_ADMIN_PASSCODE:
                                    this.setState({
                                        keyboardType1: 'numeric',
                                        keyboardType2: 'numeric',
                                        modalHeaderStr: 'Modify Admin password (between 7-9 digits)',
                                        placeHolder1: 'new password',
                                        modalVisible: true
                                    });
                                    break;

                                case this.operations.RESET_LOCK:
                                    Alert.alert(
                                        'Warning',
                                        'Are you sure you want to reset lock? This cannot be undone.',
                                        [
                                            {text: 'Cancel', onPress: () => {}},
                                            {text: 'Reset', onPress: () => {
                                                    TTLock.resetLock(this.key)
                                                        .then(() => {
                                                            Alert.alert("Lock reset successfully");
                                                        })
                                                        .catch(err => Alert.alert(err.message));
                                                }}
                                        ]
                                    );
                                    break;


                                default:
                                    Alert.alert('Unknown operation');
                            }
                        }}
                                            underlayColor='#339944'>
                            <Text style={styles.listItem}>{item}</Text>
                        </TouchableHighlight>
                    }
                    keyExtractor={(item, index) => index}
                    ItemSeparatorComponent={this.renderSeparator}
                />

            </View>
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
        fontSize: 24,
        padding: 10,
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