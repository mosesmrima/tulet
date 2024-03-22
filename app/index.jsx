import {Button, Layout, Spinner, Text} from '@ui-kitten/components';
import {Image} from "react-native";
import Relaxing from "../assets/images/undraw_Relaxing_at_home_re_mror.png";
import Logo from "../assets/images/splash.png"
import { Link, router} from "expo-router";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useEffect, useState } from 'react';


export default function App () {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoading(false);
            if (user) {
                setIsLoggedIn(true);
                router.replace('/properties');
            } else {
                setIsLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);


    return (
        <Layout style={{flex: 1, justifyContent: 'space-evenly', alignItems: 'center'}}>
            { isLoading? (<Spinner size={"giant"}/>): (
                <>
                    <Layout style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                        <Image source={Logo} style={{width: 100, height: 100}}/>
                        <Layout>
                            <Text category={"h1"} style={{fontWeight: "bold"}}>TuLet</Text>
                            <Text category={"c2"}>Safe & Seamless</Text>
                        </Layout>
                    </Layout>
                    <Layout style={{justifyContent: "center", alignItems: "center"}}>
                        <Text category={"h6"}>House hunt at the comfort of your phone</Text>
                        <Image source={Relaxing} style={{width: 300, height: 200}}/>
                    </Layout>

                    <Layout style={{justifyContent: "center", alignItems: "center", gap: 8}}>
                        <Button onPress={() => router.replace('/create_account')} style={{borderRadius: 20}}>Create Account</Button>
                        <Layout style={{ gap: 4, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                            <Text>Already have an account?</Text>
                            <Link href={"/login"}>
                                <Text status={"primary"}>Log In</Text>
                            </Link>
                        </Layout>
                    </Layout>
                </>
            )}
        </Layout>
    );
}