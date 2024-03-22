import { Slot } from 'expo-router';
import {ApplicationProvider, IconRegistry, Divider, TopNavigation} from "@ui-kitten/components";
import {EvaIconsPack} from "@ui-kitten/eva-icons";
import * as eva from "@eva-design/eva";
import {SafeAreaProvider} from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

export default function () {
    return (

        <SafeAreaProvider>

            <IconRegistry icons={EvaIconsPack} />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ApplicationProvider {...eva} theme={eva.light}>
                    <TopNavigation/>
                    <Divider />
                    <Slot/>
                    <Toast/>
                </ApplicationProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}