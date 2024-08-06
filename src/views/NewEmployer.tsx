import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Platform } from 'react-native'
import ColorPicker, { HueSlider, Panel1, Preview, returnedResults } from 'reanimated-color-picker'
import { Link } from 'react-router-native'
import Constants from "expo-constants"

import { EmployerProps } from '../types'
import useCalendar from '../hooks/useCalendar'
import theme from '../theme'
import Boton from '../components/Boton'
import BotonChico from '../components/BotonChico'

export default function NewEmployer() {
  const { companysInfo, setCompanysInfo } = useCalendar()

  const [inputName, setInputName] = useState("")
  const [shortName, setShortName] = useState("")
  const [salary, setSalary] = useState("")
  const [defColor, setDefColor] = useState("#B4EF55")

  const [repeatedName, setRepeatedName] = useState(false)
  const [modal, setModal] = useState(false)
  const [tempColor, setTempColor] = useState("#B4EF55")

  const dynamicStyles = {
    color: {
      ...styles.color,
      backgroundColor: `${defColor}`
    }
  }

  useEffect(() => {
    const repeated = companysInfo.find(employer => employer.name === inputName) !== undefined
    setRepeatedName(repeated)
  }, [inputName, companysInfo])

  //next two required for managing the color selector
  useEffect(() => {
    setTempColor(defColor)
  }, [defColor])

  const handleColorChange = (color: returnedResults) => {
    const hexColor = color.hex
    setTempColor(hexColor)
  }

  const handleSaveEmployer = () => {
    const newEmployer: EmployerProps = {
      name: inputName,
      short: shortName,
      wage: parseInt(salary),
      color: defColor
    }
    const updatedCompanys = [...companysInfo, newEmployer]
    setCompanysInfo(updatedCompanys)
  }

  return (
    <View style={styles.container}>
      <Link 
        to={'/config'}
        activeOpacity={0.7} 
        style={styles.botonCerrar}
        underlayColor="none"
        >
        <BotonChico text='x' icon="" color={theme.colors.grisClaro}/>
      </Link>

      <View>
        <Text style={styles.textoConf}>Nuevo Empleador</Text>
      </View>

      <View style={styles.empleador}>
        <View style={styles.line}>
          <Text style={styles.textLine}>Nombre:</Text>
          
          <TextInput
            style={styles.textLine}
            onChangeText={setInputName}
            value={inputName}
            maxLength={25}
            placeholder='Ingresa el nombre'
            placeholderTextColor={theme.colors.grisMedio}
          />
        </View>

        <View style={styles.line}>
          <Text style={styles.textLine}>Siglas:</Text>
          
          <TextInput
            style={styles.textLine}
            onChangeText={setShortName}
            value={shortName}
            maxLength={3}
            placeholder='Ingresa siglas'
            placeholderTextColor={theme.colors.grisMedio}
          />
        </View>

        <View style={styles.line}>
          <Text style={styles.textLine}>Salario por hora:</Text>
          
          <View style={styles.row}>
            <Text style={styles.textLine}>$ </Text>
            
            <TextInput 
              style={styles.textLine}
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
          <View style={styles.contColor}>
            <Text style={styles.textLine}>Color:</Text>
            
            <TouchableOpacity onPress={() => setModal(true)} style={dynamicStyles.color}/>
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
                onComplete={color => handleColorChange(color)}
              >
                <Preview hideText={true} hideInitialColor={true}/>
                <Panel1 />
                <HueSlider />
              </ColorPicker>

              <View style={styles.botones}>
                <TouchableOpacity 
                  style={styles.boton} 
                  activeOpacity={0.7}
                  onPress={() => {setModal(false), setTempColor(defColor)}}
                >
                  <Text style={styles.botonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.boton} 
                  activeOpacity={0.7}
                  onPress={() => {setModal(false), setDefColor(tempColor)}}
                >
                  <Text style={styles.botonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      }

      <Boton 
        margintop={0}
        press={() => handleSaveEmployer()}
        block={inputName === "" || salary === "" || repeatedName ? true : false}
        to='/config' 
        text="Registrar Empleado" 
        color={theme.colors.verdeBoton}
      />

      {repeatedName &&
        <Text style={styles.textAlert}>El nombre ya existe</Text>
      }
    </View>
  )
}

const styles = StyleSheet.create ({
  container: {
    padding: 8,
    marginTop: 100
  },
  textoConf: {
    alignSelf: "center",
    color: theme.colors.grisOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
  },
  botonCerrar: {
    position: "absolute",
    top: -80,
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
    borderColor: theme.colors.grisClaro
  },
  textLine: {
    fontSize: theme.fontSizes.F20,
    fontWeight: '400',
    textAlign: "right"
  },
  row: {
    flexDirection: "row"
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
    marginTop: Platform.OS === "ios" ? Constants.statusBarHeight +10 : Constants.statusBarHeight +12,
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
    shadowOffset: {width: 2, height: 2},
    shadowColor: theme.colors.negro,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 10,
    borderColor:theme.colors.grisMedio, 
    borderWidth: Platform.OS === "android" ? 1 : 0,
  },
  botonText: {
    fontSize: theme.fontSizes.F20
  },
  textAlert: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500",
    textTransform: "uppercase",
    color: theme.colors.rojoBin,
    backgroundColor: theme.colors.rojoClaro,
    margin: 32,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center"
  }
})