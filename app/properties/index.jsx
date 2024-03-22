import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
    BottomNavigation,
    BottomNavigationTab,
    Icon,
    Layout,
    Text,
    Button
} from '@ui-kitten/components';
import ExploreTab from "../../components/ExploreTab";
import PropertyManagementTab from "../../components/PropertyManagementTab";
import {signOutUser} from "../authService";
import {auth} from "../../firebaseConfig"
import {router} from "expo-router";
const PersonIcon = (props) => (
    <Icon {...props} name='person-outline' />
);

const Explore = (props) => (
    <Icon {...props} name='search-outline' />
);

const BookmarkIcon = (props) => (
    <Icon {...props} name='bookmark-outline' />
);

const MyPropertiesIcon = (props) => (
  <Icon {...props} name={"home-outline"}/>
);


const BookmarksTabContent = () => (
    <Layout style={styles.tabContent}>
        <Text>Bookmarks Tab Content</Text>
    </Layout>
);

const handleSignOut = () => {
    signOutUser(auth).then(() => {
        router.replace("/login")
    }).catch((error) => {
        // An error happened during sign-out.
        console.error("Error signing out: ", error);
    });
};

const ProfileTabContent = () => (
    <Layout style={styles.tabContent}>
        <Button onPress={handleSignOut}>Sign out</Button>
    </Layout>
);

export default function Home() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const renderContent = () => {
        switch (selectedIndex) {
            case 0:
                return <ExploreTab/>;
            case 1:
                return <BookmarksTabContent />;
            case 2:
                return <PropertyManagementTab/>;
            case 3:
                return <ProfileTabContent />;
            default:
                return null;
        }
    };



    return (
        <Layout style={styles.container}>
            {renderContent()}

            <BottomNavigation selectedIndex={selectedIndex} onSelect={setSelectedIndex}>
                <BottomNavigationTab title='Explore' icon={Explore} />
                <BottomNavigationTab title='Bookmarks' icon={BookmarkIcon} />
                <BottomNavigationTab title='My Properties' icon={MyPropertiesIcon} />
                <BottomNavigationTab title='Profile' icon={PersonIcon} />
            </BottomNavigation>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
