import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Modal, Platform, Keyboard, Animated, ScrollView } from 'react-native'
import ColorPicker, { HueSlider, Panel1, Preview, ColorFormatsObject } from 'reanimated-color-picker'
import Constants from "expo-constants"
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import useKeyboardBottomSpace from '@/hooks/useKeyboardBottomSpace'
import { EmployerProps, OvertimeRateType, RootStackParamList } from '@/types'
import theme from '@/theme/theme'
import { normalizeDecimalText, translate } from '@/utils'
import { DEFAULT_OVERTIME_RATE_TYPE } from '@/utils/overtime'

import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import Button from '@/components/Atoms/Buttons/Button'
import OvertimeRateTypePicker from '@/components/Molecules/OvertimeRateTypePicker'

export default function NewEmployer() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const { companysInfo, setCompanysInfo, lenguage, configInfo } = useCalendar()

  //bottom space follows the keyboard, the footer is absolute so its height is the minimum space kept
  const { ref: bottomSpaceRef, style: bottomSpaceStyle } = useKeyboardBottomSpace(theme.heigth.footer)

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [inputName, setInputName] = useState("")
  const [shortName, setShortName] = useState("")
  const [salary, setSalary] = useState("")
  //overtime pay the shifts of this employer start with, it is optional: empty means the employer has none
  const [overtimeRateType, setOvertimeRateType] = useState<OvertimeRateType>(DEFAULT_OVERTIME_RATE_TYPE)
  const [overtimeRate, setOvertimeRate] = useState("")
  const [defColor, setDefColor] = useState("#B4EF55")

  const [repeatedName, setRepeatedName] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [modal, setModal] = useState(false)
  const [tempColor, setTempColor] = useState("#B4EF55")

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  //Fields marked as missing once the user tried to save, each one clears as soon as it is filled
  const nameMissing = attempted && inputName.trim() === ""
  const shortMissing = attempted && shortName.trim() === ""
  const salaryMissing = attempted && isNaN(parseFloat(salary))
  const anyMissing = nameMissing || shortMissing || salaryMissing

  const dynamicStyles = {
    color: {
      ...styles.color,
      backgroundColor: `${defColor}`
    }
  }

  //Checks the employer is not repeted
  useEffect(() => {
    const repeated = companysInfo.find(employer => employer.name === inputName) !== undefined
    setRepeatedName(repeated)
  }, [inputName, companysInfo])

  //Next two required for managing the color selector
  useEffect(() => {
    setTempColor(defColor)
  }, [defColor])

  useEffect(() => {
    const normalized = salary
      .replace(/,/g, '.') //cambia comas por puntos
      .replace(/[^\d.]/g, '') //elimina cualquier caracter que no sea un dígito o un punto

    const [integerPart, ...decimalParts] = normalized.split('.') //separa la parte entera de la decimal para cortar el decimal a 2

    let correctedSalary = integerPart //define el salario corregido como la parte entera

    if (decimalParts.length > 0) { //si hay parte decimal, la corta a 2 dígitos y la agrega al salario corregido
      const decimalPart = decimalParts.join('').slice(0, 2)
      correctedSalary = `${integerPart}.${decimalPart}`
    }

    if (correctedSalary !== salary) { //si el salario corregido es diferente al ingresado, actualiza el estado del salario
      setSalary(correctedSalary) //evita buckes innecesarios cuando el valor es igual al ingresado
    }
  }, [salary])

  const handleColorChange = (color: ColorFormatsObject) => {
    const hexColor = color.hex
    setTempColor(hexColor)
  }

  //Saves the new employer
  const handleSaveEmployer = () => {
    if (inputName.trim() === "" || shortName.trim() === "" || isNaN(parseFloat(salary))) {
      setAttempted(true)
      return
    }

    const overtimeValue = parseFloat(overtimeRate)
    const newEmployer: EmployerProps = {
      key: new Date().getTime(),
      name: inputName,
      short: shortName,
      wage: parseFloat(salary),
      color: defColor,
      ...(isNaN(overtimeValue) ? {} : { overtimeRateType, overtimeRate: overtimeValue })
    }
    const updatedCompanys = [...companysInfo, newEmployer]
    setCompanysInfo(updatedCompanys)
    navigation.goBack()
  }

  return (
    // TouchableWithoutFeedback is used to dismiss the keyboard when tapping outside of the input fields
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <Animated.View ref={bottomSpaceRef} style={[styles.container, bottomSpaceStyle]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.9}
          style={styles.botonCerrar}
        >
          <ButtonSmall color={theme.colors.grisClaro}>
            <Text style={styles.textBotonChico}>x</Text>
          </ButtonSmall>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentContainer}
          style={styles.scrollView}
        >
        <View>
          <Text style={styles.textoConf}>{translateFn("newEmployer")}</Text>
        </View>

        <View style={styles.empleador}>
          <View style={[styles.line, nameMissing && styles.lineMissing]}>
            <Text style={styles.textLine}>{translateFn("name")}:</Text>

            <TextInput
              style={styles.textLine}
              onChangeText={setInputName}
              value={inputName}
              maxLength={25}
              placeholder={translateFn("placeholderName")}
              placeholderTextColor={theme.colors.grisMedio}
            />
          </View>

          <View style={[styles.line, shortMissing && styles.lineMissing]}>
            <Text style={styles.textLine}>{translateFn("shortName")}:</Text>

            <TextInput
              style={styles.textLine}
              onChangeText={setShortName}
              value={shortName}
              maxLength={3}
              placeholder={translateFn("placeholderShortName")}
              placeholderTextColor={theme.colors.grisMedio}
            />
          </View>

          <View style={[styles.line, salaryMissing && styles.lineMissing]}>
            <Text style={styles.textLine}>{translateFn("hourlyWage")}:</Text>

            <View style={styles.row}>
              <Text style={styles.textLine}>$ </Text>

              <TextInput
                style={[styles.textLine, { top: Platform.OS === 'ios' ? 0 : 2 }]}
                inputMode='numeric'
                keyboardType='numeric'
                onChangeText={setSalary}
                value={salary}
                placeholder="0"
                placeholderTextColor={theme.colors.grisMedio}
              />
            </View>
          </View>

          <View style={styles.line}>
            <Text style={styles.textLine}>{translateFn("overtimeWage")}:</Text>

            <View style={[styles.row, { gap: 8 }]}>
              <OvertimeRateTypePicker value={overtimeRateType} onChange={setOvertimeRateType} />

              <TextInput
                style={[styles.textLine, { top: Platform.OS === 'ios' ? 0 : 2 }]}
                inputMode='numeric'
                keyboardType='numeric'
                onChangeText={text => setOvertimeRate(normalizeDecimalText(text))}
                value={overtimeRate}
                placeholder="0"
                placeholderTextColor={theme.colors.grisMedio}
              />
            </View>
          </View>

          <View style={styles.line}>
            <View style={styles.contColor}>
              <Text style={styles.textLine}>{translateFn("color")}:</Text>

              <TouchableOpacity onPress={() => setModal(true)} style={dynamicStyles.color} />
            </View>
          </View>
        </View>

        {modal &&
          <Modal
            visible={modal}
            transparent={true}
            animationType='fade'
          >
            <View style={styles.modalContainer}>
              <View style={styles.modal}>
                <ColorPicker
                  style={styles.colorPicker}
                  value={tempColor}
                  onCompleteJS={color => handleColorChange(color)}
                >
                  <Preview hideText={true} hideInitialColor={true} />
                  <Panel1 />
                  <HueSlider />
                </ColorPicker>

                <View style={styles.botones}>
                  <TouchableOpacity
                    style={styles.boton}
                    activeOpacity={0.7}
                    onPress={() => { setModal(false), setTempColor(defColor) }}
                  >
                    <Text style={styles.botonText}>{translateFn("cancel")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.boton}
                    activeOpacity={0.7}
                    onPress={() => { setModal(false), setDefColor(tempColor) }}
                  >
                    <Text style={styles.botonText}>{translateFn("save")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        }

        <Button
          margintop={0}
          onPress={() => handleSaveEmployer()}
          block={repeatedName}
          color={configInfo.buttonsColor}
        >
          <Text style={styles.textoBoton}>{translateFn("createEmployer")}</Text>
        </Button>

        {repeatedName &&
          <Text style={styles.textAlert}>{translateFn("repeatedNameAlert")}</Text>
        }

        {anyMissing &&
          <Text style={styles.textAlert}>{translateFn("allFieldsRequiredAlert")}</Text>
        }
        </ScrollView>
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "white"
  },
  scrollView: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
    //the form starts 100px below the header
    paddingTop: 100
  },
  textoConf: {
    alignSelf: "center",
    color: theme.colors.grisOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
  },
  botonCerrar: {
    position: "absolute",
    top: 20,
    zIndex: 1,
    right: 20,
    width: "auto"
  },
  empleador: {
    borderTopWidth: 2,
    marginTop: 24,
    marginBottom: 24
  },
  line: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro,
    height: 68
  },
  lineMissing: {
    borderBottomWidth: 2,
    borderColor: theme.colors.rojoBin
  },
  textLine: {
    fontSize: theme.fontSizes.F20,
    fontWeight: '400',
    textAlign: "right",
    textAlignVertical: "center",
    color: theme.colors.negro
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  contColor: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10
  },
  color: {
    width: 20,
    height: 20,
    position: "relative",
    top: 4,
    left: 8
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
    width: "80%",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10
  },
  colorPicker: {
    width: '100%',
    gap: 20
  },
  botones: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  boton: {
    backgroundColor: theme.colors.grisClaro,
    alignItems: "center",
    width: 100,
    paddingVertical: 4,
    borderRadius: 8,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: theme.colors.negro,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 10,
    borderColor: theme.colors.grisMedio,
    borderWidth: Platform.OS === "android" ? 1 : 0,
  },
  botonText: {
    fontSize: theme.fontSizes.F20,
    color: theme.colors.negro
  },
  textAlert: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500",
    color: theme.colors.rojoBin,
    margin: 32,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center"
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500",
    color: theme.colors.negro
  },
  textBotonChico: {
    fontSize: theme.fontSizes.F20,
    fontWeight: "500",
    lineHeight: theme.fontSizes.F20,
    color: theme.colors.negro
  }
})