import React from 'react'
import { View, StyleSheet, ColorValue, StyleProp, ViewStyle, TouchableOpacity } from 'react-native'

interface ButtonProps {
    children: React.ReactNode,
    color: ColorValue;
    block?: boolean;
    onPress?: () => void,
    margintop?: number,
    buttonStyles?: StyleProp<ViewStyle>
  }

export default function Button({children, color, block, onPress, margintop, buttonStyles} : ButtonProps) {
    let customeStyle = {
        boton: {
            ...styles.boton,
            backgroundColor: color,
            marginTop: margintop
        }
    }

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={block}>
            <View style={[customeStyle.boton, buttonStyles]}>
                {children}
            </View>
        </TouchableOpacity>
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