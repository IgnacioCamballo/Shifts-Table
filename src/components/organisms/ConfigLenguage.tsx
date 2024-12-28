import React from 'react'
import useCalendar from '../../hooks/useCalendar'
import { translate } from '../../utils'
import { View, Text, StyleSheet } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import theme from '../../theme/theme'

export default function ConfigLenguage() {
  const {lenguage, setLenguage} = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  return (
    <View style={styles.configGeneral}>
        <View style={styles.tituloConf}>
          <Text style={styles.textoConf}>{translateFn("lenguage")}</Text>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={lenguage}
            onValueChange={newValue => setLenguage(newValue)}
            style={styles.picker}
            accessibilityLabel={translateFn("selectLenguage")}
            mode='dropdown'
          >
            <Picker.Item style={styles.pickerItem} label='Español' value="es" />
            <Picker.Item style={styles.pickerItem} label='English' value="en" />
            <Picker.Item style={styles.pickerItem} label='Portugues' value="pt" />
          </Picker>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
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
  },pickerContainer: {
    height: 40,
    justifyContent: "center",
    marginBottom: 8,
    marginTop: 10,
    borderColor: theme.colors.grisMedio,
    borderWidth: 1,
    borderRadius: 4
  },
  picker: {
    marginLeft: "39%"
  }, 
  pickerItem: {
    textAlign: "center",
    fontSize: 20,
    color: "black"
  }
})