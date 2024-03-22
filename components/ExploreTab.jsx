import {Button, Icon, Layout} from "@ui-kitten/components";
import {FlatList, StyleSheet} from "react-native";
import PropertyOverviewCard from "./PropertyOverviewCard";



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


const FilterIcon = (props) => (
    <Icon
        {...props}
        name={"funnel-outline"}
    />
);
export default function ExploreTab() {
    return (
        <Layout style={styles.tabContent}>
         <Layout style={{ justifyContent: "flex-end" ,flexDirection: "row", padding: 5, width: "100%"}}>
             <Button
                 accessoryLeft={FilterIcon}
                 appearance={"outline"}
                 size={"small"} style={{borderRadius: 20}}>
                 Filters
             </Button>
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
