import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import theme from '../theme'
import Boton from '../components/Boton'
import Empleador from '../components/Empleador'
import BotonChico from '../components/BotonChico'
import { Link } from 'react-router-native'

export default function NewEmployer() {
  return (
    <View style={styles.container}>
      <Link 
        to={'/config'}
        activeOpacity={0.7} 
        style={styles.botonCerrar}
        underlayColor="none"
        >
        <BotonChico text='x' color={theme.colors.grisClaro}/>
      </Link>

      <View>
        <Text style={styles.textoConf}>Nuevo Empleador</Text>
      </View>

      <Empleador padd={3}/>

      <Boton to='' text="Registrar Empleado" color={theme.colors.verdeBoton}/>
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
    color: theme.colors.verdeOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
  },
  botonCerrar: {
    position: "absolute",
    top: -80,
    right: 20,
    width: "auto"
  }
})