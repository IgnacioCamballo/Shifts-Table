import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Animated, Easing, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-native'
import { Picker } from '@react-native-picker/picker'
import RNPickerSelect from 'react-native-picker-select'
import Icon from 'react-native-vector-icons/FontAwesome';

import useCalendar from '@/hooks/useCalendar'
import { translate } from '@/utils'
import theme from '@/theme/theme'
import { saveUserInfo } from '@/api/UserInfoAPI'

import DropDownAutoHeight from '@/components/Molecules/DropDownAutoHeight'
import ModalColorPicker from '@/components/Molecules/ModalColorPicker'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import Spinner from '@/components/Atoms/Spinner'
import { isSameDay } from '@/utils/datesCompare'

export default function ConfigSettings() {
  const {
    lenguage, setLenguage,
    shifts, setShifts,
    userInfo, setUserInfo,
    configInfo, setConfigInfo,
    companysInfo, setCompanysInfo,
    lastBackup, setLastBackup
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
  //for button animation
  const [successSave, setSuccessSave] = useState(false)
  const successAnimation = useRef(new Animated.Value(0)).current

  const { mutate, isPending } = useMutation({
    mutationFn: saveUserInfo,
    onError: (error) => {
      console.log(error)
    },
    onSuccess: () => {
      setLastBackup(new Date())
      setSuccessSave(true)
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false
      }).start(() => {
        setTimeout(() => {
          setSuccessSave(false)
          successAnimation.setValue(0)
        }, 1500);
      })
    }
  })

  const opacity = {
    opacity: successAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    })
  }
  const reverseOpacity = {
    opacity: successAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    })
  }
  const rotate = {
    transform: [
      {
        rotate: successAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"]
        })
      }
    ]
  }

  useEffect(() => {
    const configCopy = { ...configInfo, baseColor, buttonsColor }
    setConfigInfo(configCopy)
  }, [baseColor, buttonsColor])

  const endSessionAlert = () => {
    Alert.alert(
      '',
      translateFn(userInfo.premium ? "endSessionAlertPremium" : "endSessionAlert"),
      [
        {
          text: translateFn("cancel"),
          style: 'cancel'
        },
        {
          text: translateFn("logOut"),
          onPress: async () => {
            await AsyncStorage.multiRemove(["userData", "userToken"])
            setShifts([])
            setCompanysInfo([])
            setUserInfo({
              userName: "",
              mail: "",
              lastBackUp: null,
              premium: false
            })
            setConfigInfo({
              baseColor: theme.colors.verdeBase,
              buttonsColor: theme.colors.verdeBoton,
              configBreakEntry: null,
              configBreakExit: null,
              entry: null,
              exit: null
            })
            setLastBackup(null)
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
    if (isSameDay({ day1: lastBackup, day2: new Date() })) {
      Alert.alert(
        '',
        translateFn("secondSaveAlert"),
        [
          {
            text: "OK",
            style: 'cancel'
          },
        ],
        {
          cancelable: true
        }
      )
    } else {
      const saveData = { configInfo, employers: companysInfo, lenguage, shifts }
      mutate(saveData)
    }
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

        {Platform.OS === 'ios' ? (
          <View style={styles.pickerContainerIos}>
            <RNPickerSelect
              value={lenguage}
              onValueChange={value => setLenguage(value)}
              items={[
                { label: 'English', value: 'en' },
                { label: 'Español', value: 'es' },
                { label: 'Portugues', value: 'pt' }
              ]}
              placeholder={{}}
              style={{ inputIOS: styles.pickerInput }}
              useNativeAndroidPickerStyle={false}
            />
          </View>
        ) : (
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
        )}
      </View>

      {!userInfo.premium ? <></> :
        <>
          <View style={[styles.line, { flexDirection: "column", alignItems: "flex-start" }]}>
            <Text style={{ fontSize: 20 }}>{translateFn("color")}:</Text>
            <View style={styles.colorsContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{ alignItems: "center" }}
                onPress={() => setColorModal(true)}
              >
                <Text style={{ fontSize: 20 }}>{translateFn("baseColor")}</Text>
                <View style={[styles.colorRectangle, { backgroundColor: baseColor }]} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{ alignItems: "center" }}
                onPress={() => setButtonsColorModal(true)}
              >
                <Text style={{ fontSize: 20 }}>{translateFn("buttonsColor")}</Text>
                <View style={[styles.colorRectangle, { backgroundColor: buttonsColor }]} />
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
                  <Spinner borderWidth={6} size={28} style={{ marginBottom: 15 }} />
                  : successSave ?
                    <Animated.View style={[opacity, rotate, { padding: 10, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: -16 }]}>
                      <Icon
                        name='check-circle'
                        size={38}
                        color={theme.colors.verdeMedio}

                      />
                    </Animated.View>
                    :
                    <TouchableOpacity activeOpacity={0.8} onPress={() => securityCopy()}>
                      <Animated.View style={reverseOpacity}>
                        <ButtonSmall color={theme.colors.azulClaro} buttonStyles={{ marginBottom: 8 }}>
                          <Text style={[styles.textLine, styles.backup]}>{translateFn("securityCopy")}</Text>
                        </ButtonSmall>
                      </Animated.View>
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
      {userInfo.mail ?
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigate('/account/deleteAccount')}>
          <Text style={[styles.textLine, styles.deleteAccount]}>{translateFn("deleteAccount")}</Text>
        </TouchableOpacity>
        : <></>
      }
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
  pickerContainerIos: {
    height: 48,
    justifyContent: "center",
    shadowOffset: { width: 2, height: 2 },
    shadowColor: theme.colors.negro,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 4,
    borderColor: theme.colors.grisClaro,
    borderWidth: Platform.OS === "android" ? 1 : 0
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
  pickerInput: {
    fontSize: theme.fontSizes.F20,
    backgroundColor: theme.colors.grisClaro,
    height: 28,
    minWidth: 116,
    color: 'black',
    textAlign: 'center',
    borderRadius: 12,
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
  deleteAccount: {
    marginBottom: 2,
    marginTop: 16,
    color: theme.colors.rojo,
    fontWeight: 600,
    fontSize: theme.fontSizes.F16,
    textAlign: "center"
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