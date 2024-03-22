import {Layout, Text, Input, Icon, Button, Spinner} from "@ui-kitten/components";
import { TouchableWithoutFeedback} from 'react-native';
import signupImage from "../../assets/images/undraw_Welcome_re_h3d9.png";
import {Image} from "react-native";
import {useState} from "react";
import {Link, router} from "expo-router";
import { useForm, Controller } from "react-hook-form";
import {signUp} from "../authService";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


const addIcon = (props) => (
    <Icon
        {...props}
        name={"person-add"}
    />
);

export default function CreateAccount () {

    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [passwordMissmatch, setPasswordMissmatch] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [firebaseErr, setFirebaseErr] = useState("");
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            passwordConfirm: ""
        }
    });

    const onSubmit = data => {
        if (data.password !== data.passwordConfirm) {
            setPasswordMissmatch(true);
        } else {
            setPasswordMissmatch(false);
            setIsLoading(true);
            setFirebaseErr(false);
            signUp(data.email, data.password, data.fullName)
                .then((val) => {
                    console.log(val)
                    setIsLoading(false);
                    router.replace("/properties")
                })
                .catch( (err) => {
                    setIsLoading(false);
                    let errMessageParts = err.message.split(" ")
                    let filtered = errMessageParts.slice(1, errMessageParts.length-1)
                    setFirebaseErr(filtered.join(" "));
                    console.log(err.code)
                })

        }
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
                <Layout style={{justifyContent: "center", alignItems: "center", gap: 8}}>
                    <Text category={"h6"}>Let's Get Started</Text>
                    <Image source={signupImage} style={{width: 200, height: 200}}/>
                </Layout>
                {isLoading && <Spinner/>}
                {firebaseErr && <Text status={"danger"}>{firebaseErr}</Text>}
                <Layout style={{gap: 20, justifyContent: "center", alignItems: "center"}}>
                    <Controller
                        control={control}
                        rules={{
                            required: {
                                value: true,
                                message: "name is required"
                            }
                        }}

                        render={({ field: { onChange, value } }) => (
                            <>
                                <Input
                                    status={`${errors.fullName? "danger": "basic"}`}
                                    style={{width: "80%", borderRadius: 20, alignItems: "center"}}
                                    placeholder="Enter full name"
                                    onChangeText={onChange}
                                    value={value}
                                    caption={errors.fullName?.message}
                                />
                            </>
                        )}
                        name="fullName"
                    />

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
                                    status={`${errors.passwordConfirm? "danger": "basic"}`}
                                    style={{width: "80%", borderRadius: 20, alignItems: "center"}}
                                    placeholder="Retype Password"
                                    onChangeText={onChange}
                                    value={value}
                                    caption={errors.passwordConfirm?.message}
                                    accessoryRight={renderIcon}
                                    secureTextEntry={secureTextEntry}
                                />
                            </>
                        )}
                        name="passwordConfirm"
                    />
                    {passwordMissmatch && <Text status={"danger"} category={"c1"}>Passwords don't match</Text>}
                    <Button onPress={handleSubmit(onSubmit)} style={{borderRadius: 20}} accessoryLeft={addIcon}>
                        Create Account
                    </Button>
                </Layout>

                <Layout style={{ gap: 4, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                    <Text>Already have an account?</Text>
                    <Link href={"/login"}>
                        <Text status={"primary"}>Login</Text>
                    </Link>
                </Layout>
            </Layout>
        </KeyboardAwareScrollView>
    );
}
