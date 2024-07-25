import React from 'react'
import { View, StyleSheet, Text, ColorValue, Linking } from 'react-native'
import theme from '../theme'
import { Link } from 'react-router-native'
import { TouchableOpacity } from 'react-native-gesture-handler';

interface ButtonProps {
    text: string;
    color: ColorValue;
    to: string;
    block: boolean;
    press: () => void,
    margintop: number
  }

export default function Boton({text, color, to, block, press, margintop} : ButtonProps) {
    let customeStyle = {
        boton: {
            ...styles.boton,
            backgroundColor: color,
            marginTop: margintop
        }
    }

    return (
        <Link activeOpacity={0.5} onPress={press} to={to} disabled={block} underlayColor="none">
            <View style={customeStyle.boton}>
                <Text style={styles.texto}>{text}</Text>
            </View>
        </Link>
    )
}

const styles = StyleSheet.create({
    boton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        maxWidth: "auto",
        borderRadius: 10,
        alignSelf: "center"
    },
    texto: {
        fontSize: theme.fontSizes.F18,
        fontWeight: "500"    
    }
})