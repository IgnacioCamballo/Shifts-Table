import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {Animated as ReactAnimated, View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
//the container has 10 of padding at each side, the carousel cancels it so months slide edge to edge
const GRID_BLEED = 10
const MONTH_SLIDE_DURATION = 250

//creates the array with the month days to build the grid, filling past month last days and next month
//first days as necesary
const buildMonthDays = (month: Date): DayProps[] => {
  const today = new Date()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const emptyCellsBefore = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  const days: DayProps[] = [];

  for (let i = 1; i <= emptyCellsBefore; i++) {
    days.push({
      key: `-${i}`,
      day: new Date(month.getFullYear(), month.getMonth(), 0 - (emptyCellsBefore - i)).getDate(),
      isCurrentDay: false,
      shadowed: true
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      key: `${i}`,
      day: i,
      isCurrentDay: i === today.getDate() && isCurrentMonth,
      shadowed: false
    });
  }

  for (let i = 1; i <= (42 - emptyCellsBefore - daysInMonth); i++) {
    days.push({
      key: `${daysInMonth + i}`,
      day: new Date(month.getFullYear(), month.getMonth(), daysInMonth + i).getDate(),
      isCurrentDay: false,
      shadowed: true
    });
  }
  return days
}

const monthNumber = (date: Date) => date.getFullYear() * 12 + date.getMonth()

//the months are the faces of a prism seen from its center: the screen is the face in front and the camera is
//the center, so the prism turns around the camera
//angle between two neighbour faces: 90 is a cube, 60 an hexagon, 45 an octagon
const FACE_ANGLE_DEGREES = 40
const FACE_ANGLE = FACE_ANGLE_DEGREES * Math.PI / 180
//distance from the center to a face, the one that makes the face as wide as the screen seen from the center
const CUBE_RADIUS = (screenWidth / 2) / Math.tan(FACE_ANGLE / 2)
//distance from the screen to the virtual eye used for the perspective, must be more than the screen width or the
//faces close to the corners would pass behind the eye, higher is flatter
const CUBE_PERSPECTIVE = screenWidth * 1.5

type CubeFaceProps = {
  //how many months away from the first month shown this face is
  offset: number
  translationX: SharedValue<number>
  children: React.ReactNode
}

function CubeFace({ offset, translationX, children }: CubeFaceProps) {
  const animatedStyle = useAnimatedStyle(() => {
    //0 when the face is in front of the screen, 1 or -1 when it is a full face away (one face angle turned)
    const progress = offset + translationX.value / screenWidth
    const angle = -progress * FACE_ANGLE
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    //turning around the center of the cube equals turning around the face and then moving it
    const moveX = -CUBE_RADIUS * sin
    const moveZ = CUBE_RADIUS * (1 - cos)
    const p = CUBE_PERSPECTIVE
    return {
      //a face one face angle away is out of the view of the center, so it is hidden
      opacity: Math.abs(progress) >= 1 ? 0 : 1,
      //rotateY * translate * perspective multiplied by hand, as matrix3d (column by column)
      transform: [{
        matrix: [
          cos, 0, -sin, sin / p,
          0, 1, 0, 0,
          sin, 0, cos, -cos / p,
          moveX, 0, moveZ, 1 - moveZ / p
        ]
      }]
    }
  })

  return <Animated.View style={[styles.monthPanel, animatedStyle]}>{children}</Animated.View>
}

export default function Calendar() {
  const {lenguage, addsInitialized, userInfo, animateReturnToCalendar, setAnimateReturnToCalendar, selectedDate} = useCalendar()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const [currentDay, setCurrentDay] = useState(new Date());
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

  //the month shown plus the previous and next one, all mounted so they slide together
  const months = useMemo(() => [-1, 0, 1].map(offset => {
    const date = new Date(currentDay.getFullYear(), currentDay.getMonth() + offset)
    return { date, days: buildMonthDays(date) }
  }), [currentDay])
  //days of the month shown, used by the press and the animation shell
  const monthdays = months[1].days

  //every month lives at a fixed horizontal position (its distance to the first month shown times the screen width),
  //so changing month is only moving the carousel to that position, no content has to jump back
  const baseMonth = useRef(monthNumber(currentDay)).current
  const restX = -(monthNumber(currentDay) - baseMonth) * screenWidth
  const isSliding = useRef(false)

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


  //the carousel is already at the new month position when the slide ends, this only updates the month shown
  const commitMonth = (direction: 1 | -1) => {
    setCurrentDay(new Date(currentDay.getFullYear(), currentDay.getMonth() + direction))
  }

  //slides to the previous (-1) or next (1) month, continuing from wherever the carousel is (finger or rest)
  const slideToMonth = (direction: 1 | -1) => {
    if (isSliding.current) return
    isSliding.current = true
    translationX.value = withTiming(
      restX - direction * screenWidth,
      { duration: MONTH_SLIDE_DURATION, easing: Easing.out(Easing.cubic) },
      finished => {
        if (finished) runOnJS(commitMonth)(direction)
      }
    )
  }

  const prevMonth = () => slideToMonth(-1)
  const nextMonth = () => slideToMonth(1)

  //when the month changes by any means (slide end, or jumping from shifts) the carousel rests at that month
  useLayoutEffect(() => {
    translationX.value = restX
    isSliding.current = false
  }, [currentDay])

  //reads screen to change month with swipe, the three months follow the finger
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      if (isSliding.current) return
      translationX.value = restX + event.translationX
    })
    .onFinalize(event => {
      if (isSliding.current) return
      if (event.translationX < -80) {
        nextMonth()
      } else if (event.translationX > 80) {
        prevMonth()
      } else {
        translationX.value = withTiming(restX, { duration: 150 })
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
        <View
          style={styles.grid}
          onLayout={event => {
            //the grid is wider than the days area (it cancels the container padding)
            gridOffset.x = event.nativeEvent.layout.x + GRID_BLEED
            gridOffset.y = event.nativeEvent.layout.y
            setGridHeight(event.nativeEvent.layout.height)
          }}
        >
          <View style={styles.carousel}>
            {months.map((month, index) =>
              <CubeFace
                key={monthNumber(month.date)}
                offset={monthNumber(month.date) - baseMonth}
                translationX={translationX}
              >
                <View style={styles.daysContainer}>
                  {gridHeight > 0 && month.days.map(monthDay =>
                    <RenderDayCalendar
                      isAnimationShell={false}
                      currentDay={month.date}
                      item={monthDay}
                      cellHeight={cellHeight}
                      //only the month shown can be pressed, the neighbours wait offscreen
                      onPress={index === 1 ? handleDayPress : () => {}}
                      key={monthDay.key}
                    />
                  )}
                </View>
              </CubeFace>
            )}
          </View>
        </View>
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
    flex: 1,
    marginHorizontal: -GRID_BLEED,
    overflow: "hidden"
  },
  carousel: {
    flex: 1
  },
  monthPanel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: screenWidth,
    paddingHorizontal: GRID_BLEED
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