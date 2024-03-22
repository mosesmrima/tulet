import {Button, Icon, Input, Layout, Spinner, Text} from "@ui-kitten/components";
import {Controller, useForm} from "react-hook-form";
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import {useState} from "react";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {Image} from "react-native";
import forgotImage from "../../assets/images/undraw_Forgot_password_re_hxwm.png";
import {router} from "expo-router";




export default function PasswordReset() {
    const [isLoading, setIsLoading] = useState(false);
    const [linkSent, setLinkSent] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: ""
        }
    });

    const onSubmit = data => {
        setIsLoading(true)
        sendPasswordResetEmail(auth, data.email)
            .then(() => {
              setIsLoading(false);
              setLinkSent(true)
                console.log("sent")
            })
            .catch((error) => {
                setIsLoading(false);
                console.error("Error sending password reset email: ", error);
            });
    }

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            resetScrollToCoords={{ x: 0, y: 0 }}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={false}
            enableOnAndroid={true}
        >
            <Layout style={{flex: 1, justifyContent: "space-evenly", alignItems: "center", gap: 12}}>
                <Layout style={{justifyContent: "center", alignItems: "center"}}>
                    <Image source={forgotImage} style={{width: 300, height: 200}}/>
                </Layout>
                    <Controller
                        control={control}
                        rules={{
                            required: {
                                value: true,
                                message: "email is required"
                            },
                            pattern: {
                                value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                message: "invalid email"
                            }
                        }}

                        render={({ field: { onChange, value } }) => (
                            <>
                                <Input
                                    status={`${errors.email? "danger": "basic"}`}
                                    style={{width: "80%", borderRadius: 20, alignItems: "center"}}
                                    placeholder="Enter your email"
                                    onChangeText={onChange}
                                    value={value}
                                    caption={errors.email?.message}
                                />
                            </>
                        )}
                        name="email"
                    />
                {isLoading && <Spinner/>}
                {linkSent &&  <Text status={"success"} category={"c1"}>Link Sent!</Text>}
                {linkSent?
                    <Button disabled={isLoading} onPress={() => router.replace("/login")} style={{borderRadius: 20}}>
                        Back to login
                    </Button>
                    :
                    <Button disabled={isLoading} onPress={handleSubmit(onSubmit)} style={{borderRadius: 20}}>
                        Reset Password
                    </Button>
                }
            </Layout>
        </KeyboardAwareScrollView>
    );
}