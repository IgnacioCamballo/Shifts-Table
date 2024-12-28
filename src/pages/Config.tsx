import React, { useRef, useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View, Platform, Alert, ScrollView, Animated } from 'react-native'
import DatePicker from 'react-native-date-picker'
import Constants from "expo-constants"
import useCalendar from '../hooks/useCalendar'
import theme from '../theme/theme'
import Employer from '../components/Molecules/Employer'
import { formattedMinutes, translate } from '../utils'
import Icon from 'react-native-vector-icons/AntDesign';
import { Picker } from '@react-native-picker/picker'
import Button from '../components/Atoms/Buttons/Button'
import ConfigLenguage from '../components/organisms/ConfigLenguage'
import ConfigDefaultTimes from '../components/organisms/ConfigDefaultTimes'
import { PanGestureHandler } from 'react-native-gesture-handler'

export default function Config() {
  const {
    configInfo,
    companysInfo,
    lenguage,
    setConfigInfo
  } = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  let config = { ...configInfo }

  const [timeType, setTimeType] = useState("")
  const [date, setDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const [hoursOpen, setHoursOpen] = useState(false)
  const [employersOpen, setEmployersOpen] = useState(false)

  

  
 
  //manage the employers animations
  const employersValue = useRef(new Animated.Value(hoursOpen ? 1 : 0)).current
  const handlePressEmployer = () => {
    Animated.parallel([
      Animated.timing(employersValue, {
        toValue: employersOpen ? 0 : 1,
        duration: 400,
        useNativeDriver: false,
      })
    ]).start();
    setEmployersOpen(!employersOpen);
  }
  const heightEmpChange = {
    maxHeight: employersValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 350]
    })
  }
  const rotateEmpArrow = {
    transform: [
      {
        rotate: employersValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["-90deg", "0deg"]
        })
      },
      {
        translateY: employersValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -2]
        })
      }
    ]
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <ConfigLenguage />

      <ConfigDefaultTimes />

      <View style={styles.empleadores}>
        <TouchableOpacity 
          activeOpacity={0.8}
          style={styles.tituloConf}
          onPress={() => handlePressEmployer()}
        >
          <Animated.View style={[rotateEmpArrow]}>
            <Icon
              name="caretdown"
              color={theme.colors.verdeBase}
              size={20}
              style={styles.arrow}
            />
          </Animated.View>
          <Text style={styles.textoConf}>{translateFn("employers")}</Text>
        </TouchableOpacity>

        <Animated.ScrollView 
          showsVerticalScrollIndicator={false} 
          style={[styles.heightAuto, heightEmpChange]}
          nestedScrollEnabled={true}
        >
          {companysInfo.length === 0 ? <Text style={styles.textNotEmployers}>{translateFn("noEmployersYet")}</Text> :
            companysInfo.map(employer => (
              <Employer key={employer.key} employer={employer} />
            ))
          }
        </Animated.ScrollView>

        <Button margintop={20} to='/config/newEmployer' color={theme.colors.verdeBoton}>
          <Text style={styles.textoBoton}>{translateFn("createNewEmployer")}</Text>
        </Button>
      </View>
      <View style={{height: 30}}/>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    maxHeight: theme.heigth.noFooterNoHeader
  },
  configGeneral: {
    marginVertical: 10
  },
  tituloConf: {
    flexDirection: "row",    
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    width: "100%",
    gap: 12
  },
  textoConf: {
    alignSelf: "center",
    color: theme.colors.grisOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
    marginBottom: 3
  },
  arrow: {
    position: "relative",
    width: 20,
    height: 20
  },
  line: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro
  },
  textLine: {
    fontSize: theme.fontSizes.F20,
    fontWeight: '400'
  },
  heightAuto: {
    height: "auto",
    overflow: "hidden"
  },
  empleadores: {
    marginTop: 30
  },
  textNotEmployers: {
    textAlign: "center",
    paddingTop: 20,
    fontSize: theme.fontSizes.F16,
    borderTopWidth: 2,
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? Constants.statusBarHeight + 10 : Constants.statusBarHeight + 12,
    marginBottom: 76,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 40,
    borderRadius: 10
  },
  modalTitleContainer: {
    alignSelf: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%"
  },
  modalTitle: {
    fontSize: 24
  },
  delete: {
    position: "relative",
    top: 7
  },
  view: {
    height: 180
  },
  modalButtons: {
    flexDirection: "row",
    gap: 28,
    alignSelf: "flex-end"
  },
  modalButton: {
    fontSize: theme.fontSizes.F18
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500"
  }
})