import React from 'react'
import { View, StyleSheet, Text, ColorValue, TouchableOpacity } from 'react-native'
import { Platform } from 'react-native';
import theme from '../theme'

interface ButtonProps {
    text: string;
    color: ColorValue;
  }

export default function BotonChico({text, color} : ButtonProps) {
    let customeStyle = {
        boton: {
            ...styles.boton,
            backgroundColor: color,
        }
    }

    return (
            <View style={customeStyle.boton}>
                <Text style={styles.texto}>{text}</Text>
            </View>
    )
}

const styles = StyleSheet.create({
    boton: {
        paddingVertical: 2,
        paddingHorizontal: 12,
        width: "auto",
        borderRadius: 15,
        shadowOffset: {width: 2, height: 2},
        shadowColor: theme.colors.negro,
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 10,
        borderColor:theme.colors.grisMedio, 
        borderWidth: Platform.OS === "android" ? 1 : 0,
        justifyContent: "center",
        alignItems: "center"
    },
    texto: {
        fontSize: theme.fontSizes.F20,
        fontWeight: "500",
        lineHeight: theme.fontSizes.F20
    }
})