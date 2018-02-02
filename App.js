/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import {
    Image,
    View
} from 'react-native';
import { StackNavigator, Header } from 'react-navigation';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import OperationsScreen from './screens/OperationsScreen';
import AddLockScreen from './screens/AddLockScreen';
import ViewLogScreen from './screens/ViewLogScreen';

export default RootNavigator = StackNavigator({
    Login: {
        screen: LoginScreen
    },
    Home: {
        screen: HomeScreen
    },
    Operations: {
        screen: OperationsScreen
    },
    AddLock: {
        screen: AddLockScreen
    },
    ViewLog: {
        screen: ViewLogScreen
    }
}, {
    navigationOptions: {
        headerTitleStyle: { color: '#fff' },
        header: (props) => <ImageHeader {...props} />,
        headerStyle: {
            backgroundColor: 'transparent'
        }
    },
});

const ImageHeader = props => (
    <View style={{backgroundColor:'#eee', elevation: 4 }}>
        <Image
            source={require('./res/Rently-Blue-Logo.png')}
            style={{
                position: 'absolute',
                top: 20,
                right: 0,
                bottom: 0,
                left: 0,
                height: undefined,
                width: undefined,

            }}
            resizeMode='contain'
        />
        <Header {...props} style={{ backgroundColor: 'transparent' }}/>
    </View>
);