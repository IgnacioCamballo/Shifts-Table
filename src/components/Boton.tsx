import React from 'react'
import { View, StyleSheet, Text, ColorValue } from 'react-native'
import theme from '../theme'
import { Link } from 'react-router-native'

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
        <Link onPress={press} disabled={block} to={to} activeOpacity={0.5} underlayColor="none">
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
        width: "auto",
        borderRadius: 10,
        alignSelf: "center"
    },
    texto: {
        fontSize: theme.fontSizes.F18,
        fontWeight: "500"    
    }
})