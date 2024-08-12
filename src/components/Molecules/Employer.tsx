import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import theme from '../../theme/theme'
import { EmployerProps } from '../../types'
import useCalendar from '../../hooks/useCalendar'
import EditDeletButtons from './EditDeletButtons'

export default function Employer({ employer }: { employer: EmployerProps }) {
  const { companysInfo, setCompanysInfo } = useCalendar()

  const { name, wage, color } = employer

  const dynamicStyles = {
    color: {
      ...styles.color,
      backgroundColor: `${color}`
    }
  }

  const showAlert = () => {
    Alert.alert(
      '',
      "¿seguro deseas eliminar este empleador?",
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => handleDeleteEmployer(),
          style: 'cancel'
        },
      ],
      {
        cancelable: true
      }
    )
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
        <EditDeletButtons 
          DeleteAlert={showAlert} 
          link={`/config/editEmployer/${companysInfo.findIndex(employer => employer.name === name)}`}
        />
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
})