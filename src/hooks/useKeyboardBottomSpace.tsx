import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Keyboard, Platform, View } from 'react-native'

//android has no keyboardWill* events, so there the animation starts when the keyboard has already moved
const KEYBOARD_SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
const KEYBOARD_HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
//android events send duration 0, so a fixed one is used
const ANDROID_KEYBOARD_DURATION = 250
//approximation of the curve iOS uses to move the keyboard
const KEYBOARD_EASING = Easing.bezier(0.17, 0.59, 0.4, 0.77)

//Bottom space of a screen that follows the keyboard, so the content shrinks and the focused input stays visible.
//The space is the part of the wrapped view that the keyboard covers (measured, so a footer of any size that sits
//below the view is discounted by itself). minSpace is only for an absolute footer that is drawn over the view's bottom.
//usage: const { ref, style } = useKeyboardBottomSpace()
//       <Animated.View ref={ref} style={[{ flex: 1 }, style]}> wrapping the ScrollView
const useKeyboardBottomSpace = (minSpace = 0) => {
  const ref = useRef<View>(null)
  const [space] = useState(() => new Animated.Value(minSpace))

  useEffect(() => {
    //layout prop (paddingBottom), so the native driver can't be used
    const animateTo = (toValue: number, duration: number) => {
      Animated.timing(space, {
        toValue,
        duration: duration || ANDROID_KEYBOARD_DURATION,
        easing: KEYBOARD_EASING,
        useNativeDriver: false
      }).start()
    }

    const show = Keyboard.addListener(KEYBOARD_SHOW_EVENT, (e) => {
      //the view is measured when the keyboard opens, because its position depends on the screen
      ref.current?.measureInWindow((_x, y, _width, height) => {
        const covered = Math.max(y + height - e.endCoordinates.screenY, 0)
        animateTo(Math.max(covered, minSpace), e.duration)
      })
    })
    const hide = Keyboard.addListener(KEYBOARD_HIDE_EVENT, (e) => {
      animateTo(minSpace, e.duration)
    })
    return () => {
      show.remove()
      hide.remove()
      space.stopAnimation()
    }
  }, [space, minSpace])

  return { ref, style: { paddingBottom: space } }
}

export default useKeyboardBottomSpace
