import { StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import { Link } from "react-router-native";
import theme from "../../theme/theme";
import React from "react";

type EditDeleteProps = {
  DeleteAlert: () => void,
  link: string
}

export default function EditDeletButtons({DeleteAlert, link}: EditDeleteProps) {
  return (
    <View style={styles.botones}>
      <Link
        to={link}
        activeOpacity={0.7}
        underlayColor={"none"}
      >
        <Icon
          name='edit'
          color={theme.colors.verdeOscuro}
          size={20}
        />
      </Link>
      <Icon
        name='delete'
        color={theme.colors.rojoBin}
        size={20}
        onPress={DeleteAlert}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  botones: {
    flexDirection: "row",
    gap: 20
  }
})
