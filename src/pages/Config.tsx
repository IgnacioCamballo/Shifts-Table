import React, { useState } from 'react'
import { StyleSheet, Text, View, Platform, ScrollView } from 'react-native'
import Constants from "expo-constants"

import useCalendar from '@/hooks/useCalendar'
import { translate } from '@/utils'
import theme from '@/theme/theme'

import Button from '@/components/Atoms/Buttons/Button'
import ConfigSettings from '@/components/organisms/ConfigSettings'
import Employer from '@/components/Molecules/Employer'
import ConfigDefaultTimes from '@/components/organisms/ConfigDefaultTimes'
import DropDownAutoHeight from '@/components/Molecules/DropDownAutoHeight'
import BannerPremium from '@/components/Atoms/Buttons/BannerPremium'

export default function Config() {
  const { companysInfo, lenguage, configInfo, userInfo } = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [employersOpen, setEmployersOpen] = useState(false)

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.p8}>

        <ConfigDefaultTimes />

        <DropDownAutoHeight
          duration={400}
          isOpen={employersOpen}
          setIsOpen={setEmployersOpen}
          maxHeight={350}
          title={translateFn("employers")!}
          titleStyle={styles.textoConf}
          titleContainerStyle={[styles.tituloConf, styles.empleadores]}
          arrowColor={configInfo.baseColor}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={[styles.heightAuto]}
            nestedScrollEnabled={true}
          >

            {companysInfo.length === 0 ? <Text style={styles.textNotEmployers}>{translateFn("noEmployersYet")}</Text> :
              companysInfo.map(employer => (
                <Employer key={employer.key} employer={employer} />
              ))
            }
          </ScrollView>
        </DropDownAutoHeight>

        <Button
          margintop={20}
          to='/config/newEmployer'
          color={theme.colors.grisMasClaro}
          buttonStyles={styles.botonStyle}
        >
          <Text style={styles.textoBoton}>{translateFn("createNewEmployer")}</Text>
        </Button>

        <View style={{ height: 20 }} />

        <ConfigSettings />
      </View>
      {!userInfo.premium && <BannerPremium />}

      <View style={{ height: 10 }} />

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    maxHeight: theme.heigth.noFooterNoHeader,
  },
  p8: {
    padding: 8
  },
  configGeneral: {
    marginVertical: 10
  },
  tituloConf: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: theme.colors.negro,
    paddingVertical: 4,
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
    transform: [{ translateY: -2 }],
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
  },
  botonStyle: {
    borderWidth: 1,
    borderColor: theme.colors.grisMedio,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: theme.colors.negro,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 5,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 4,
    paddingBottom: 6
  }
})