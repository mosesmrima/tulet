import React, { useState } from 'react';
import {View, Image, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import {Button, Icon, Input, Text, Select, SelectItem, IndexPath, Toggle} from "@ui-kitten/components";

const TrashIcon = (props) => (
    <Icon
        {...props}
        name={"trash-2-outline"}
    />
);
const propertyTypes = ["Bedsitter", "1 Bedroom", "2 Bedroom", "More than 3 bedrooms", "Bungalow", "Studio", "Apartment"];

export default function PropertiesForm({setVisible}) {
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            description: '',
            rental: false,
            price: '',
            location: '',
            type: "",
        }
    });
    const [images, setImages] = useState([]);

    const removeImage = (uri) => {
        setImages(images.filter(image => image !== uri));
    };

    const onSubmit = data => {
        console.log(data);
        console.log(images);
        console.log(images.length);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: false,
            quality: 1,
            allowsEditing: true,
        });
        if (!result.cancelled) {
            console.log(result)
            const uri = result.assets[0].uri;
            setImages([...images, uri]);
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("You've refused to allow this app to access your camera!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync();
        if (!result.cancelled) {
            const uri = result.assets[0].uri;
            setImages([...images, uri]);
        }
    };

    return (
        <View style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Text style={{textAlign: "center", margin: 8}} category={"h5"}>New Property</Text>
            {/* Name Input */}
            <Controller
                control={control}
                rules={{
                    required: "Name is required"
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        status={errors.name ? "danger" : "basic"}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="Name"
                        style={styles.input}
                        caption={errors.name?.message}
                    />
                )}
                name="name"
            />

            {/* Price Input */}
            <Controller
                control={control}
                rules={{
                    required: "Price is required"
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        status={errors.price ? "danger" : "basic"}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="Price"
                        keyboardType="numeric"
                        style={styles.input}
                        caption={errors.price?.message}
                    />
                )}
                name="price"
            />

            {/* Location Input */}
            <Controller
                control={control}
                rules={{
                    required: "Location is required"
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        status={errors.location ? "danger" : "basic"}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="Location"
                        style={styles.input}
                        caption={errors.location?.message}
                    />
                )}
                name="location"
            />

            {/* Description Input */}
            <Controller
                control={control}
                rules={{
                    required: "Description is required"
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        status={errors.description ? "danger" : "basic"}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="Description"
                        textStyle={styles.inputTextStyle}
                        multiline={true}
                        style={styles.input}
                        caption={errors.description?.message}
                    />
                )}
                name="description"
            />

            <View style={{margin: 7}}>
                <Text category={"h6"}>Add Pictures</Text>
                <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", margin: 8}}>
                    <Button appearance={"outline"} style={{width: "45%", borderRadius: 20}} onPress={pickImage}>Gallery</Button>
                    <Button appearance={"outline"} style={{width: "45%", borderRadius: 20}} onPress={takePhoto}>Camera</Button>
                </View>
            </View>

            {/* Rental Switch */}
            <Controller
                control={control}
                name="rental"
                render={({ field: { onChange, value } }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text>Rental:</Text>
                        <Toggle
                            onChange={onChange}
                            checked={value}
                        />
                    </View>
                )}
            />

            {/* Type Select */}
            <Controller
                control={control}
                rules={{
                    required: "Property type is required"
                }}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                    const selectedIndex = value ? new IndexPath(propertyTypes.indexOf(value)) : null;
                    return (
                        <Select
                            label="Type"
                            placeholder="Select Type"
                            selectedIndex={selectedIndex}
                            onSelect={index => onChange(propertyTypes[index.row])}
                            status={error ? "danger" : "basic"}
                            style={styles.input}
                        >
                            {propertyTypes.map((type, index) => (
                                <SelectItem key={index} title={type} />
                            ))}
                        </Select>
                    );
                }}
                name="type"
            />



                <FlatList
                    data={images}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.imageContainer}>
                            <Image
                                resizeMode="cover"
                                source={{ uri: item }}
                                style={styles.image}
                            />
                            <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(item)}>
                                <TrashIcon width={24} height={24} fill='red' />
                            </TouchableOpacity>
                        </View>
                    )}
                    horizontal={true}
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={{ alignItems: 'center'}}
                />
            <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", margin: 8}}>
                <Button  style={{width: "40%", borderRadius: 20}} onPress={handleSubmit(onSubmit)}>Save</Button>
                <Button appearance={"outline"}  style={{width: "40%", borderRadius: 20}} onPress={()=>setVisible(false)}>Cancel</Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        width: "80%",
        borderRadius: 20,
        marginVertical: 2,
    },
    inputTextStyle: {
        minHeight: 100, // Ensures the input field is large enough to accommodate multiple lines
    },
    imageContainer: {
        position: 'relative',
        margin: 10,
    },
    image: {
        width: 100,
        height: 100,
    },
    removeIcon: {
        position: 'absolute',
        top: -10,
        left: -10,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 2,
    },
});
