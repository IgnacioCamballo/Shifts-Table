import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Picker } from '@react-native-picker/picker'

import useCalendar from '@/hooks/useCalendar'
import { translate } from '@/utils'
import theme from '@/theme/theme'

import DropDownAutoHeight from '@/components/Molecules/DropDownAutoHeight'
import ModalColorPicker from '@/components/Molecules/ModalColorPicker'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import { useNavigate } from 'react-router-native'

export default function ConfigSettings() {
  const { lenguage, setLenguage, configInfo, setConfigInfo, userInfo } = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const navigate = useNavigate()

  const [baseColor, setBaseColor] = useState(configInfo.baseColor || theme.colors.verdeBase)
  const [buttonsColor, setButtonsColor] = useState(configInfo.buttonsColor || theme.colors.verdeBoton)
  const [isOpen, setIsOpen] = useState(true)
  const [colorModal, setColorModal] = useState(false)
  const [buttonsColorModal, setButtonsColorModal] = useState(false)

  useEffect(() => {
    const configCopy = { ...configInfo, baseColor, buttonsColor }
    setConfigInfo(configCopy)
  }, [baseColor, buttonsColor])

  return (
    <DropDownAutoHeight
      duration={400}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      maxHeight={300}
      title={translateFn("userSettings")!}
      arrowColor={configInfo.baseColor}
      titleContainerStyle={[styles.tituloConf, styles.configGeneral]}
      titleStyle={styles.textoConf}
    >
      <View style={[styles.line, styles.lineLenguage]}>
        <Text style={styles.textLine}>{translateFn("lenguage")}</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={lenguage}
            onValueChange={newValue => setLenguage(newValue)}
            style={styles.picker}
            accessibilityLabel={translateFn("selectLenguage")}
            mode='dropdown'
          >
            <Picker.Item style={styles.pickerItem} label='English' value="en" />
            <Picker.Item style={styles.pickerItem} label='Español' value="es" />
            <Picker.Item style={styles.pickerItem} label='Portugues' value="pt" />
          </Picker>
        </View>

      </View>

      {!userInfo.premium ? <></> :
        <>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.line, styles.colorLine]}
            onPress={() => setColorModal(true)}
          >
            <Text style={styles.textLine}>{translateFn("baseColor")}:</Text>
            <View style={[styles.colorRectangle, { backgroundColor: baseColor }]} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.line, styles.colorLine]}
            onPress={() => setButtonsColorModal(true)}
          >
            <Text style={styles.textLine}>{translateFn("buttonsColor")}:</Text>
            <View style={[styles.colorRectangle, { backgroundColor: buttonsColor }]} />
          </TouchableOpacity>

        </>
      }
      
      {userInfo.userName ? 
        <>
          <View style={[styles.line, styles.user]}>
            <View style={[styles.line, {borderBottomWidth: 0}]}>
              <Text style={styles.textLine}>{translateFn("user")}: </Text>
              <Text style={styles.textLine}>{userInfo.userName}</Text>
            </View>

            {!userInfo.premium && 
            <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
              <ButtonSmall color={theme.colors.azulClaro} buttonStyles={{marginBottom: 8}}>
                <Text style={[styles.textLine, styles.backup]}>{translateFn("securityCopy")}</Text>
              </ButtonSmall>
            </TouchableOpacity>
            }
          
            <View style={[styles.line, {borderBottomWidth: 0, paddingTop: 0}]}>
              <Text style={styles.textLine}>{userInfo.mail}</Text>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
              <ButtonSmall color={theme.colors.grisOscuro} buttonStyles={{marginTop: 20}}>
                <Text style={[styles.textLine, styles.endSession]}>{translateFn("logOut")}</Text>
              </ButtonSmall>
            </TouchableOpacity>
          </View>
        </> : 
        <>
          <Text onPress={() => navigate('/account/lenguage')}>Inicia sesion</Text>
        </>
      }

      {colorModal ?
        <ModalColorPicker
          initialColor={baseColor}
          isOpen={colorModal}
          onCancel={() => setColorModal(false)}
          onConfirm={(col) => { setColorModal(false), setBaseColor(col) }}
          resetColorButtonTo={theme.colors.verdeBase}
        />
        : <></>}

      {buttonsColorModal ?
        <ModalColorPicker
          initialColor={buttonsColor}
          isOpen={buttonsColorModal}
          onCancel={() => setButtonsColorModal(false)}
          onConfirm={(col) => { setButtonsColorModal(false), setButtonsColor(col) }}
          resetColorButtonTo={theme.colors.verdeBoton}
        />
        : <></>
      }

      <Text>politicas de privacidad</Text>
      <Text>Guia de uso</Text>
      <View style={{ height: 40 }} />
    </DropDownAutoHeight>
  )
}

const styles = StyleSheet.create({
  configGeneral: {
    marginTop: 10,
    borderBottomWidth: 2,
    borderColor: theme.colors.negro,
    paddingVertical: 4,
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
  textLine: {
    fontSize: theme.fontSizes.F20,
    fontWeight: '400'
  },
  line: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro
  },
  colorLine: {
    justifyContent: "flex-start",
    gap: 20
  },
  lineLenguage: {
    paddingVertical: 0,
    alignItems: "center",
    width: "100%"
  },
  colorRectangle: {
    width: 20,
    height: 20,
    justifyContent: "center"
  },
  pickerContainer: {
    height: 36,
    justifyContent: "center",
    marginBottom: 4,
    marginTop: 4,
    borderColor: theme.colors.grisMedio,
    borderWidth: 1,
    borderRadius: 4
  },
  picker: {
    width: "auto",
    minWidth: 200
  },
  pickerItem: {
    textAlign: "center",
    fontSize: 20,
    color: "black"
  },
  user: {
    flexDirection: "column",
    gap: 4,
    borderBottomWidth: 0
  },
  endSession: {
    marginBottom: 2, 
    marginHorizontal: 20, 
    color: theme.colors.blanco,
    fontWeight: 600
  },
  backup: {
    marginBottom: 2, 
    marginHorizontal: 20, 
    fontWeight: 600
  }
})