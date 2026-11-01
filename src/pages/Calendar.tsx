import React, { useState, useEffect, useRef } from 'react';
import {Animated as ReactAnimated, View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import useCalendar from '@/hooks/useCalendar';
import theme from '@/theme/theme';
import { firstLetterUpper, weekdays } from '@/utils';
import SwiftArrows from '@/components/Molecules/SwiftArrows';
import { DayProps, RootStackParamList } from '@/types';
import RenderDayCalendar from '@/components/Atoms/RenderDayCalendar';
import { BannerAdds } from '@/components/Atoms/BannerAdds';

let screenWidth = Dimensions.get("window").width
const DAYS_ROWS = 6
const DAYS_CONTAINER_MARGIN_TOP = 5
//same width RenderDayCalendar gives each day cell
const DAY_CELL_WIDTH = (screenWidth - 22) / 7

export default function Calendar() {
  const {lenguage, addsInitialized, userInfo, animateReturnToCalendar, setAnimateReturnToCalendar, selectedDate} = useCalendar()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const [currentDay, setCurrentDay] = useState(new Date());
  const [monthdays, setMonthDays] = useState<DayProps[]>([])
  //space left for the days grid, measured, so the cells fill it whatever the device and the banner are
  const [gridHeight, setGridHeight] = useState(0)
  //position of the grid inside the container, needed to know where a day cell is without measuring it
  const gridOffset = useRef({ x: 0, y: 0 }).current
  const cellHeight = Math.floor((gridHeight - DAYS_CONTAINER_MARGIN_TOP * 2) / DAYS_ROWS)
  const showBanner = addsInitialized && !userInfo.premium

  const [daySelectedInfo, setDaySelectedInfo] = useState<{ index: number, color: string }| null>(null)
  const animationParams = useRef({ x: 0, y: 0, width: 0, height: 0 }).current
  const changeToShiftsAnimationValue = useRef(new ReactAnimated.Value(0)).current

  const translationX = useSharedValue(0)
  const prevTranslationX = useSharedValue(0)
  
  //creates the array with the month days to build the grid, filling past month last days and next month
  //first days as necesary
  let currentDate = new Date()
  useEffect(() => {
    const daysInMonth = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDay.getFullYear(), currentDay.getMonth(), 1).getDay();
    const emptyCellsBefore = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const isCurrentMonth = (currentDay.getFullYear(), currentDay.getMonth()) === (currentDate.getFullYear(), currentDate.getMonth());
    
    const days: DayProps[] = [];

    for (let i = 1; i <= emptyCellsBefore; i++) {
      days.push({ 
        key: `-${i}`, 
        day: new Date(currentDay.getFullYear(), currentDay.getMonth(), 0 - (emptyCellsBefore - i)).getDate(), 
        isCurrentDay: false,
        shadowed: true
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isCurrentDay = i === currentDate.getDate() && isCurrentMonth;
      days.push({
        key: `${i}`,
        day: i,
        isCurrentDay,
        shadowed: false
      });
    }

    for (let i = 1; i <= (42 - emptyCellsBefore - daysInMonth); i++) {
      days.push({ 
        key: `${daysInMonth + i}`, 
        day: new Date(currentDay.getFullYear(), currentDay.getMonth(), daysInMonth + i).getDate(), 
        isCurrentDay: false,
        shadowed: true
      });
    }
    setMonthDays(days);
  }, [currentDay])

  const animateTransitionStyle = {
    backgroundColor: changeToShiftsAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [daySelectedInfo?.color || theme.colors.blanco, theme.colors.blanco]
    }),
    width: changeToShiftsAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [animationParams.width, Dimensions.get("screen").width]
    }),
    height: changeToShiftsAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [animationParams.height, Dimensions.get("screen").height]
    }),
    top: changeToShiftsAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [animationParams.y, 0]
    }),
    left: changeToShiftsAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [animationParams.x, 0]
    }),
    opacity: changeToShiftsAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.1]
    })
  }

  //navigate to the day pressed on the screen
  const handleDayPress = (layout: { x: number, y: number, width: number, height: number }, key: string) => {
    const selected = monthdays.find(arrayDay => arrayDay.key === key)
    if (!selected) return

    const selectedIndex = monthdays.findIndex(arrayDay => arrayDay.key === key)
    
    function getDate() {
      if (selected!.shadowed === false) {
        const pressed = new Date(currentDay.getFullYear(), currentDay.getMonth(), selected?.day)
        return pressed
      } else if (parseInt(selected!.key) < 0) {
        const pressed = new Date(currentDay.getFullYear(), currentDay.getMonth()-1, selected?.day)
        return pressed
      } else {
        const pressed = new Date(currentDay.getFullYear(), currentDay.getMonth()+1, selected?.day)
        return pressed
      }
    }
    const date = getDate() //gets the date pressed to navigate to the shifts of that day
    
    //sets the layout of the day pressed to animate the transition to the shifts screen
    animationParams.x = layout.x
    //need to subtract the height of the header to get the correct position of the day pressed, as the layout 
    // mesured is from screen but the element is absolute to calendar
    animationParams.y = layout.y - (Platform.OS === "ios" ? 88 : 36)
    animationParams.width = layout.width
    animationParams.height = layout.height
    //sets the index and color of selected day wich trigers the load of the shell to animate
    setDaySelectedInfo({ index: selectedIndex, color: selected.shadowed ? theme.colors.grisMasClaro : theme.colors.blanco })
    
    //animates the transition to the shifts screen
    ReactAnimated.timing(changeToShiftsAnimationValue, {
      toValue: 1,
      duration: 350,
      useNativeDriver: false
    }).start(() => {
      navigation.navigate("Shifts", { date: date.toISOString() })
    })
  };

  const handleReturnToCalendarAnimation = () => {
    //animates the transition back to the calendar screen
    if(animateReturnToCalendar) {
      ReactAnimated.timing(changeToShiftsAnimationValue, {
        toValue: 0,
        duration: 450,
        useNativeDriver: false
      }).start(() => {
        setDaySelectedInfo(null)
        setAnimateReturnToCalendar(false)
      })
    }
  }

  useEffect(() => {
    handleReturnToCalendarAnimation()
  }, [animateReturnToCalendar])

  //when the day changes inside shifts, moves the shell (hidden under shifts) to that day so the return
  //animation shrinks into the right cell
  useEffect(() => {
    if (!selectedDate || !daySelectedInfo) return

    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay()
    const emptyCellsBefore = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
    const index = emptyCellsBefore + selectedDate.getDate() - 1

    animationParams.x = gridOffset.x + (index % 7) * DAY_CELL_WIDTH
    animationParams.y = gridOffset.y + DAYS_CONTAINER_MARGIN_TOP + Math.floor(index / 7) * cellHeight
    animationParams.width = DAY_CELL_WIDTH
    animationParams.height = cellHeight

    setCurrentDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth()))
    //the day is always in the month shown, so it is never shadowed
    setDaySelectedInfo({ index, color: theme.colors.blanco })
  }, [selectedDate])


  //change to previous month with animation
  const prevMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() - 1);
    setTimeout(() => {
      setCurrentDay(newDate)
    }, 100);

    translationX.value = withSequence(
      withTiming(screenWidth, {duration: 200, easing: Easing.in(Easing.quad)}),
      withTiming(-screenWidth, {duration: 0}),
      withTiming(0, {duration: 200, easing: Easing.out(Easing.quad)}),
    ) 
  };

  //change to next month with animation
  const nextMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1);
    setTimeout(() => {
      setCurrentDay(newDate)
    }, 100);
    
    translationX.value = withSequence(
      withTiming(-screenWidth, {duration: 200, easing: Easing.in(Easing.quad)}),
      withTiming(screenWidth, {duration: 0}),
      withTiming(0, {duration: 200, easing: Easing.out(Easing.quad)}),
    ) 
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
  }));

  //reads screen to change month with swipe
  const panGesture = Gesture.Pan()
    .onStart(() => {
      prevTranslationX.value = translationX.value
    })
    .onUpdate(event => {
      translationX.value = prevTranslationX.value + event.translationX
    })
    .onFinalize(() => {
      if(translationX.value < -80){
        nextMonth()
      } else if (translationX.value > 80) {
        prevMonth()
      } else {
        translationX.value = 0
      }
    })
    .runOnJS(true)

  return (
    <View style={[styles.container, !showBanner && styles.containerNoBanner]}>
      <SwiftArrows
        leftAction={prevMonth} 
        text={`${firstLetterUpper(currentDay.toLocaleDateString(lenguage, { month: 'long' }))}`}
        rightAction={nextMonth} 
      />

      <View style={styles.weekDays}>
        {weekdays(lenguage).map(day => 
          <View key={day} style={styles.textDayContainer}>
            <Text style={styles.textDayContainerText}>{day}</Text>
          </View>
        )}
      </View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.grid, animatedStyles]}
          onLayout={event => {
            gridOffset.x = event.nativeEvent.layout.x
            gridOffset.y = event.nativeEvent.layout.y
            setGridHeight(event.nativeEvent.layout.height)
          }}
        >
          <View style={styles.daysContainer}>
            {gridHeight > 0 && monthdays.map(monthDay =>
              <RenderDayCalendar
                isAnimationShell={false}
                currentDay={currentDay}
                item={monthDay}
                cellHeight={cellHeight}
                onPress={handleDayPress}
                key={monthDay.key}
              />
            )}
          </View>
        </Animated.View>
      </GestureDetector>

      {showBanner && (
        <View style={styles.banner}>
          <BannerAdds />
        </View>
      )}

      {daySelectedInfo && (
        <ReactAnimated.View 
          style={[styles.shell, 
            {
              backgroundColor: animateTransitionStyle.backgroundColor,
              width: animateTransitionStyle.width,
              height: animateTransitionStyle.height,
              top: animateTransitionStyle.top,
              left: animateTransitionStyle.left
            }
          ]}
        >
          <ReactAnimated.View style={{flex: 1, opacity: animateTransitionStyle.opacity}}>
            <RenderDayCalendar 
              isAnimationShell={true}
              currentDay={currentDay} 
              item={monthdays[daySelectedInfo.index]}
              cellHeight={cellHeight}
              onPress={handleDayPress}
              key={daySelectedInfo.index}
            />
          </ReactAnimated.View>
        </ReactAnimated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
   container: {
    flex: 1,
    padding: 10,
    //the banner goes right above the footer, so there is no space below it
    paddingBottom: 0,
    //footer is absolute, so the margin makes the calendar end where the footer starts
    marginBottom: theme.heigth.footer,
    backgroundColor: '#ffffff'
  },
  containerNoBanner: {
    paddingBottom: 10
  },
  grid: {
    flex: 1
  },
  textDayContainer: {
    height: 20,
    width: (screenWidth - 20) / 7,
    alignItems: "center"
  },  
  textDayContainerText: {
    fontSize: theme.fontSizes.F16,
    textTransform: "uppercase",
    fontWeight: "bold",
    color: theme.colors.negro
  },
  weekDays: {
    flexDirection: "row",
    marginTop: 10,
    height: 20
  },
  daysContainer: {
    flex: 1,
    marginBlock: DAYS_CONTAINER_MARGIN_TOP,
    width: screenWidth - 20,
    flexDirection: "row", 
    flexWrap: "wrap"
  },
  dayText: {
    position: "absolute",
    top: 1,
    right: 3,
    fontSize: theme.fontSizes.F12,
    color: theme.colors.negro
  },
  emptyDayText: {
    position: "absolute",
    top: 1,
    right: 3,
    fontSize: theme.fontSizes.F12,
    color: theme.colors.gris
  },
  selectedDayText: {
    color: theme.colors.rojo,
  },
  coloredShiftBox: {
    flex:1,
    alignItems: "center",
    justifyContent: "center"
  },
  coloredShiftText: {
    color: theme.colors.negro,
    fontSize: theme.fontSizes.F18,
    fontWeight: "400"
  },
  banner:{
    //the ad is as wide as the screen, so it cancels the horizontal padding of the container
    marginHorizontal: -10
  },
  shell: {
    position: "absolute",
    flex: 1,
    zIndex: 30
  }
});