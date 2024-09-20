import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import theme from '../../theme/theme'
import { EmployerProps } from '../../types'
import useCalendar from '../../hooks/useCalendar'
import EditDeletButtons from './EditDeletButtons'
import translations from "../../lenguages/lenguages.json"


export default function Employer({ employer }: { employer: EmployerProps }) {
  const { companysInfo, setCompanysInfo, lenguage } = useCalendar()

  const { name, wage, color, key } = employer

  const showAlert = () => {
    Alert.alert(
      '',
      `${translations.employerDeleteAlert.find(i => i.lenguage === lenguage)?.text} ${name}?`,
      [
        {
          text: translations.cancel.find(i => i.lenguage === lenguage)?.text,
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
    const filtered = companysInfo.filter(employer => employer.key !== key)
    setCompanysInfo(filtered)
  }

  return (
    <View style={styles.empleador}>
      <View style={styles.line}>
        <Text style={styles.textLine}>{translations.name.find(i => i.lenguage === lenguage)?.text}:</Text>
        <Text style={styles.textLine}>{name}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translations.hourlyWage.find(i => i.lenguage === lenguage)?.text}:</Text>
        <Text style={styles.textLine}>{`$ ${wage}`}</Text>
      </View>

      <View style={styles.line}>
        <View style={styles.contColor}>
          <Text style={styles.textLine}>{translations.color.find(i => i.lenguage === lenguage)?.text}:</Text>
          <View style={[styles.color, {backgroundColor: color}]}></View>
        </View>
        <EditDeletButtons 
          DeleteAlert={showAlert} 
          link={`/config/editEmployer/${key}`}
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