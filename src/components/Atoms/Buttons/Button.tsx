import React from 'react'
import { View, StyleSheet, ColorValue } from 'react-native'
import { Link } from 'react-router-native'

interface ButtonProps {
    children: React.ReactNode,
    color: ColorValue;
    to: string;
    block?: boolean;
    press?: () => void,
    margintop?: number
  }

export default function Button({children, color, to, block, press, margintop} : ButtonProps) {
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
                {children}
            </View>
        </Link>
    )
}

const styles = StyleSheet.create({
    boton: {
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 16,
        maxWidth: "auto",
        borderRadius: 10,
        alignSelf: "center"
    }
})