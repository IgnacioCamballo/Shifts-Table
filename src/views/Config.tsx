import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import theme from '../theme'
import Empleador from '../components/Empleador'
import Boton from '../components/Boton'
import { Link } from 'react-router-native'

export default function Config() {
  return (
    <View style={styles.container}>
      <View style={styles.configGeneral}>
        <View style={styles.tituloConf}>
          <Text style={styles.textoConf}>Configuracion General</Text>
        </View>

        <View>
          <View style={styles.line}>
            <Text style={styles.textLine}>Hora de entrada:</Text>
            <Text style={styles.textLine}>9:00</Text>
          </View>

          <View style={styles.line}>
            <Text style={styles.textLine}>Hora de salida:</Text>
            <Text style={styles.textLine}>15:00</Text>
          </View>

          <View style={styles.line}>
            <Text style={styles.textLine}>Descanso:</Text>
            <Text style={styles.textLine}>0Hs</Text>
          </View>
        </View>
      </View>

      <View style={styles.empleadores}>
        <View>
          <Text style={styles.textoConf}>Empleadores</Text>
        </View>

        <Empleador padd={1}/>
        
          <Boton to='/config/newEmployer' text="Registrar Empleado" color={theme.colors.verdeBoton}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create ({
  container: {
    padding: 8
  },
  configGeneral: {
    marginTop: 10
  },
  tituloConf: {
    borderBottomWidth: 2,
    width: "100%",
  },
  textoConf: {
    alignSelf: "center",
    color: theme.colors.verdeOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
    marginBottom: 3
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
  empleadores: {
    marginTop: 30
  }
})