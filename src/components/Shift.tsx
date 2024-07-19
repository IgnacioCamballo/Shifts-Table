import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Icon from "react-native-vector-icons/AntDesign"
import theme from '../theme'
import { ShiftProps } from '../types'
import useCalendar from '../hooks/useCalendar'
import { Link } from 'react-router-native'

export default function Shift({shift}: {shift: ShiftProps}) {
    const {companysInfo, setCompanysInfo, setEditEmployer} = useCalendar()

    const {employer, shiftEntry, shiftExit, shiftBreak} = shift

    const dynamicStyles = {
        color: {
            ...styles.color,
            backgroundColor: `${color}`
        }
    }

    const handleDeleteEmployer = () => {
        const filtered = companysInfo.filter(employer => employer.name !== name)
        setCompanysInfo(filtered)
    }

    return (
        <View style={styles.empleador}>
            <View style={styles.line}>
                <Text style={styles.textLine}>Nombre:</Text>
                <Text style={styles.textLine}>{name}</Text>
            </View>

            <View style={styles.line}>
                <Text style={styles.textLine}>Salario por hora:</Text>
                <Text style={styles.textLine}>{`$ ${wage}`}</Text>
            </View>

            <View style={styles.line}>
                <View style={styles.contColor}>
                    <Text style={styles.textLine}>Color:</Text>
                    <View style={dynamicStyles.color}></View>
                </View>
                <View style={styles.botones}>
                        <Link 
                            to={`/config/editEmployer/${companysInfo.findIndex(employer => employer.name === name)}`} 
                            onPress={() => setEditEmployer(employer)}
                            activeOpacity={0.7}
                            underlayColor={"none"}
                        >
                            <Icon
                                name='edit' 
                                color={theme.colors.verdeOscuro} 
                                size={20}
                                />
                        </Link>
                        <Icon 
                            name='delete' 
                            color={theme.colors.rojoBin} 
                            size={20}
                            onPress={() => handleDeleteEmployer()}
                        />
                </View>
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
        width: 20,
        height: 20,
        position: "relative",
        top: 3
    },
    botones: {
        flexDirection: "row",
        gap: 20
    }
})