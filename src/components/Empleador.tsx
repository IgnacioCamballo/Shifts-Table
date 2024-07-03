import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Icon from "react-native-vector-icons/AntDesign"
import theme from '../theme'

export default function Empleador({padd}: {padd: number}) {
    const dynamicStyles = {
        empleador: {
            ...styles.empleador,
            marginTop: padd === 1 ? 0 : padd * 8,
            marginBottom: padd === 1 ? 0 : padd * 8
        },
        line: {
            ...styles.line,
            paddingVertical: padd * 4,
        }
    }

    return (
        <View style={dynamicStyles.empleador}>
            <View style={dynamicStyles.line}>
                <Text style={styles.textLine}>Nombre:</Text>
                <Text style={styles.textLine}>Nombre de empresa</Text>
            </View>

            <View style={dynamicStyles.line}>
                <Text style={styles.textLine}>Salario por hora:</Text>
                <Text style={styles.textLine}>$ 10</Text>
            </View>

            <View style={dynamicStyles.line}>
                <View style={styles.contColor}>
                    <Text style={styles.textLine}>Color:</Text>
                    <View style={styles.color}></View>
                </View>
                {padd === 1 && <Icon name='delete' color={theme.colors.rojoBin} size={20}/>}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    empleador: {
        borderTopWidth: 2,
    },
    line: {
        paddingHorizontal: 15,
        paddingVertical: 4,
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: theme.colors.grisClaro
    },
    textLine: {
    fontSize: theme.fontSizes.F20,
    fontWeight: '400'
    },
    contColor: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10
    },
    color: {
    width: 17,
    height: 17,
    backgroundColor: theme.colors.verdeMedio,
    position: "relative",
    top: 1.5
    }
})