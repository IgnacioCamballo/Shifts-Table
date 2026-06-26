import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

import theme from "@/theme/theme";

type EditDeleteProps = {
  DeleteAlert: () => void,
  onPressEdit: () => void
}

export default function EditDeletButtons({DeleteAlert, onPressEdit}: EditDeleteProps) {
  return (
    <View style={styles.botones}>
      <TouchableOpacity
        onPress={onPressEdit}
        activeOpacity={0.7}
      >
        <Icon
          name='edit'
          color={theme.colors.verdeOscuro}
          size={20}
        />
      </TouchableOpacity>
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
