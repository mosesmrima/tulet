import {Button, Card, Layout, Text, Spinner} from "@ui-kitten/components";
import {StyleSheet, Image} from "react-native";
import {useState} from "react";
import PropertyDetailsCard from "./PropertyDetailsCard"


export default function PropertyOverviewCard({ title}) {
    const [isLoading, setIsLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    return (
        <Card disabled={true} style={styles.cardStyles}>

            <Layout style={styles.imageContainer}>
                {isLoading && (
                    <Spinner size="large" color="#0000ff" />
                )}
                <Image
                    source={{uri: "https://st.hzcdn.com/simgs/pictures/huse/interplan-arkitekttegnede-huse-interplan-a-s-img~8ca16eeb06cb06ae_4-5816-1-1254fc8.jpgu"}}
                    style={styles.imageStyle}
                    resizeMode="contain"
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                />
            </Layout>
            <Layout style={styles.descStyles}>
               <Text style={{fontWeight: "bold"}}>Nyali, Mombasa</Text>
               <Text appearance={"hint"} style={{fontWeight: "bold"}}>One bedroom</Text>
                <Text>Rent: ksh 12,000</Text>
            </Layout>
            <PropertyDetailsCard title={title} visible={visible} setVisible={setVisible}/>
            <Button onPress={() => setVisible(true)} style={{borderRadius: 10}} appearance={"outline"} size={"tiny"} >View</Button>
        </Card>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        width: "100%",
        height: "60%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageStyle: {
        width: "100%",
        height: "100%",
        position: "absolute"
    },
    cardStyles: {
        margin: 2,
        borderRadius: 10,
        width: "50%",
        height: 300
    },
    descStyles: {
        width: "100%",
        marginBottom: 8
    }
})