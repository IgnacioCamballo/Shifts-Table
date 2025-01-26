import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-native'
import { Picker } from '@react-native-picker/picker'

import useCalendar from '@/hooks/useCalendar'
import { translate } from '@/utils'
import theme from '@/theme/theme'
import { saveUserInfo } from '@/api/UserInfoAPI'

import DropDownAutoHeight from '@/components/Molecules/DropDownAutoHeight'
import ModalColorPicker from '@/components/Molecules/ModalColorPicker'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import Spinner from '@/components/Atoms/Spinner'

export default function ConfigSettings() {
  const { 
    lenguage, setLenguage,
    shifts,
    userInfo,
    configInfo, setConfigInfo,
    companysInfo
  } = useCalendar()
  const navigate = useNavigate()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [baseColor, setBaseColor] = useState(configInfo.baseColor || theme.colors.verdeBase)
  const [buttonsColor, setButtonsColor] = useState(configInfo.buttonsColor || theme.colors.verdeBoton)
  const [isOpen, setIsOpen] = useState(true)
  const [colorModal, setColorModal] = useState(false)
  const [buttonsColorModal, setButtonsColorModal] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: saveUserInfo,
    onError: (error) => {
      console.log(error)
    },
    onSuccess: (data) => {
      console.log(data)
    }
  })

  useEffect(() => {
    const configCopy = { ...configInfo, baseColor, buttonsColor }
    setConfigInfo(configCopy)
  }, [baseColor, buttonsColor])

  const endSessionAlert = () => {
    Alert.alert(
      '',
      translateFn("endSessionAlert"),
      [
        {
          text: translateFn("cancel"),
          style: 'cancel'
        },
        {
          text: translateFn("logOut"),
          onPress: async () => {             
            await AsyncStorage.multiRemove(["userData", "userToken"])
            navigate("/")
          },
          style: 'cancel'
        },
      ],
      {
        cancelable: true
      }
    )
  }

  const securityCopy = () => {
    const saveData = { configInfo, employers: companysInfo, lenguage, shifts }
    mutate(saveData)
  }

  return (
    <DropDownAutoHeight
      duration={400}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      maxHeight={340}
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
          <View style={[styles.line, {flexDirection: "column", alignItems: "flex-start"}]}>
            <Text style={{fontSize: 20}}>{translateFn("color")}:</Text>
            <View style={styles.colorsContainer}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={{alignItems: "center"}}
                onPress={() => setColorModal(true)}
                >
                <Text style={{fontSize: 20}}>{translateFn("baseColor")}</Text>
                <View style={[styles.colorRectangle, {backgroundColor: baseColor}]}/>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{alignItems: "center"}}
                onPress={() => setButtonsColorModal(true)}
                >
                <Text style={{fontSize: 20}}>{translateFn("buttonsColor")}</Text>
                <View style={[styles.colorRectangle, {backgroundColor: buttonsColor}]} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      }

      {userInfo.mail ?
        <>
          <View style={[styles.line, styles.user]}>
            <View style={[styles.line, { borderBottomWidth: 0 }]}>
              <Text style={styles.textLine}>{translateFn("user")}: </Text>
              <Text style={styles.textLine}>{userInfo.userName}</Text>
            </View>

            {!userInfo.premium &&
              <>
                {isPending ?
                  <Spinner borderWidth={6} size={28} />
                  :
                  <TouchableOpacity activeOpacity={0.8} onPress={() => securityCopy()}>
                    <ButtonSmall color={theme.colors.azulClaro} buttonStyles={{ marginBottom: 8 }}>
                      <Text style={[styles.textLine, styles.backup]}>{translateFn("securityCopy")}</Text>
                    </ButtonSmall>
                  </TouchableOpacity>
                }
              </>
            }

            <View style={[styles.line, { borderBottomWidth: 0, paddingTop: 0 }]}>
              <Text style={styles.textLine}>{userInfo.mail}</Text>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={() => endSessionAlert()}>
              <Text style={[styles.textLine, styles.endSession]}>{translateFn("logOut")}</Text>
            </TouchableOpacity>
          </View>
        </> :
        <>
          <Text style={styles.centeredLogin} onPress={() => navigate(`/account/${lenguage}`)}>{translateFn("login")} / {translateFn("createAccount")}</Text>
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
      
      <Text style={styles.centeredText} onPress={() => Linking.openURL("https://cambadev.netlify.app/Shifts-Table/privacy-policy")}>{translateFn("privacyPolicies")}</Text>
      <Text style={styles.centeredText} onPress={() => Linking.openURL("https://cambadev.netlify.app/Shifts-Table/guide")}>{translateFn("guide")}</Text>
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
    width: 100, 
    height: 20, 
    borderRadius: 10,
    marginBottom: 4
  }
  ,
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
    color: theme.colors.rojo,
    fontWeight: 600,
    fontSize: theme.fontSizes.F18
  },
  backup: {
    marginBottom: 2,
    marginHorizontal: 20,
    fontWeight: 600
  },
  centeredLogin: {
    textAlign: "center",
    marginVertical: 12,
    fontSize: theme.fontSizes.F16
  },
  centeredText: {
    textAlign: "center",
    marginVertical: 2
  },
  colorsContainer: {
    marginTop: -8,
    flexDirection: "row", 
    width: "100%", 
    justifyContent: "space-around"
  }
})