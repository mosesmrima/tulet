import {Button, Card, Layout, Modal, Text} from "@ui-kitten/components";
import {Dimensions, StyleSheet, Image, View} from "react-native";

import Carousel from "react-native-reanimated-carousel";


const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function PropertyDetailsCard({visible, setVisible, title}) {

    const imageURLS = [
        "https://st.hzcdn.com/simgs/pictures/huse/interplan-arkitekttegnede-huse-interplan-a-s-img~8ca16eeb06cb06ae_4-5816-1-1254fc8.jpg",
        "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?cs=srgb&dl=pexels-binyamin-mellish-106399.jpg&fm=jpg",
        "https://img.freepik.com/free-photo/blue-house-with-blue-roof-sky-background_1340-25953.jpg",
    ];
    return (
        <Modal
            visible={visible}
            backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)'}}
            style={styles.mainCard}
            animationType={"slide"}
        >
            <Card disabled={true} style={{width: "100%", minHeight: "100%", justifyContent: "center", alignItems: "center"}}>

                <Carousel
                    snapEnabled={true}
                    mode={"parallax"}
                    loop
                    width={screenWidth * 0.9}
                    height={screenWidth / 2}
                    data={imageURLS} // Corrected data array
                    scrollAnimationDuration={1000}
                    onSnapToItem={(index) => console.log('current index:', index)}
                    renderItem={({ item }) => ( // Changed from index to item
                        <Image
                            source={{ uri: item }}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            resizeMode="cover"
                        />
                    )}
                />
                <Layout>
                    <Text category={"h4"} style={{textAlign: "center"}}>{title}</Text>
                    <Text category={"h6"} appearance={"hint"} style={{textAlign: "center"}}>Nyali, Mombasa</Text>
                    <Text category={"h6"}  style={{textAlign: "center"}}>Rent: 12,000/month</Text>
                </Layout>
                <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", margin: 10}}>
                    <Button style={{borderRadius: 20}} appearance={"outline"} onPress={setVisible}>
                        hide
                    </Button>
                    <Button style={{borderRadius: 20}} >
                        Book Tour
                    </Button>
                </View>
            </Card>
        </Modal>
    );
}


const styles = StyleSheet.create({
    mainCard: {
        flex: 1,
        flexDirection: "column",
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
    }
});