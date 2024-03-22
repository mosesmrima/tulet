import {Layout, Text, Input, Icon, Button, Spinner} from "@ui-kitten/components";
import { TouchableWithoutFeedback} from 'react-native';
import loginImage from "../../assets/images/undraw_Login_re_4vu2.png";
import {Image} from "react-native";
import {useState} from "react";
import {Link, router} from "expo-router";
import { useForm, Controller } from "react-hook-form";
import {signIn} from "../authService";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


export default function Login () {
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const[invalidCreds, setInvalidCreds] = useState(false);


    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            password: "",
            email: ""
        }
    });
    const onSubmit = data => {
        setIsLoading(true)
        setInvalidCreds(false)
        signIn(data.email, data.password)
            .then(userCredential => {
                setInvalidCreds(true);
                setIsLoading(false);
                router.replace("/properties");
            })
            .catch(err => {
                setIsLoading(false)
                if (err.message === "Firebase: Error (auth/invalid-credential).") {
                    setInvalidCreds(true);
                }
            });
    }

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    const renderIcon = (props) => (
        <TouchableWithoutFeedback onPress={toggleSecureEntry}>
            <Icon
                {...props}
                name={secureTextEntry ? 'eye-off' : 'eye'}
            />
        </TouchableWithoutFeedback>
    );

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            resetScrollToCoords={{ x: 0, y: 0 }}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={false}
            enableOnAndroid={true}
        >
            <Layout  style={{flex: 1, justifyContent: 'space-evenly', alignItems: 'center', gap: 8}}>
                <Layout style={{justifyContent: "center", alignItems: "center"}}>
                    <Text category={"h6"}>Welcome Back</Text>
                    <Image source={loginImage} style={{width: 300, height: 200}}/>
                </Layout>
                {invalidCreds && <Text category={"c2"} status={"danger"}>Invalid username/password</Text>}
                <Layout style={{gap: 20, justifyContent: "center", alignItems: "center"}}>
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
                                    placeholder="Enter email"
                                    onChangeText={onChange}
                                    value={value}
                                    caption={errors.email?.message}
                                />
                            </>
                        )}
                        name="email"
                    />
                    <Controller
                        control={control}
                        rules={{
                            required: {
                                value: true,
                                message: "password is required"
                            }
                        }}

                        render={({ field: { onChange, value } }) => (
                            <>
                                <Input
                                    status={`${errors.password? "danger": "basic"}`}
                                    style={{width: "80%", borderRadius: 20, alignItems: "center"}}
                                    placeholder="Enter your password"
                                    onChangeText={onChange}
                                    value={value}
                                    caption={errors.password?.message}
                                    accessoryRight={renderIcon}
                                    secureTextEntry={secureTextEntry}
                                />
                            </>
                        )}
                        name="password"
                    />

                    <Link href={"/password_reset"}>
                        <Text status={"primary"}>Forgot Password?</Text>
                    </Link>
                    {isLoading && <Spinner/>}

                    <Button disabled={isLoading} onPress={handleSubmit(onSubmit)} style={{borderRadius: 20}}>
                        Sign In
                    </Button>
                </Layout>

                <Layout style={{ gap: 4, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                    <Text>Don't have an account?</Text>
                    <Link href={"/create_account"}>
                        <Text status={"primary"}>Create</Text>
                    </Link>
                </Layout>
            </Layout>
        </KeyboardAwareScrollView>
    );
}
