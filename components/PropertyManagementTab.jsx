import {Button, Icon, Layout, Modal, Card, Text} from "@ui-kitten/components";
import React, {useState} from "react";
import {FlatList, StyleSheet} from "react-native";
import PropertyOverviewCard from "./PropertyOverviewCard";
import PropertiesForm from "./ImagePicker";


const data = [
    {id: 1, title: "House 1"},
    {id: 2, title: "House 2"},
    {id: 3, title: "House 3"},
    {id: 4, title: "House 4"},
    {id: 5, title: "House 1"},
    {id: 6, title: "House 2"},
    {id: 7, title: "House 3"},
    {id: 8, title: "House 4"},
    {id: 9, title: "House 1"},
    {id: 10, title: "House 2"},
    {id: 11, title: "House 3"},
    {id: 12, title: "House 4"},
    {id: 13, title: "House 1"},
    {id: 14, title: "House 2"},
    {id: 15, title: "House 3"},
    {id: 16, title: "House 4"},
]
const renderItem = ({item}) => (
    <PropertyOverviewCard title={item.title}/>
);
const AddIcon = (props) => (
    <Icon
        {...props}
        name={"plus-outline"}
    />
);


export default function PropertyManagementTab() {
    const [visible, setVisible] = useState(false);
    return (
        <Layout style={styles.tabContent}>
            <Layout style={{ justifyContent: "center" ,flexDirection: "row", padding: 5, width: "100%"}}>
                <Button
                    accessoryLeft={AddIcon}
                    size={"small"} style={{borderRadius: 20}}
                    onPress={() => setVisible(true)}
                >
                    <Text>Add Your Property</Text>
                </Button>
                <Modal
                    visible={visible}
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)'}}
                    style={{width: "100%", justifyContent: "center", alignItems: "center"}}
                >
                    <Card disabled={true} style={{width: "85%"}}>
                        <PropertiesForm setVisible={setVisible}/>
                    </Card>
                </Modal>
            </Layout>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
            />
        </Layout>
    );
}


const styles = StyleSheet.create({
    tabContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
