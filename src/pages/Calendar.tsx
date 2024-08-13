import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  Easing, 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';
import theme from '../theme/theme';
import { firstLetterUpper, weekdays } from '../utils';
import SwiftArrows from '../components/Molecules/SwiftArrows';
import { DayProps } from '../types';
import RenderDayCalendar from '../components/Atoms/RenderDayCalendar';
import useCalendar from '../hooks/useCalendar';

let screenWidth = Dimensions.get("window").width

export default function Calendar() {
  const {lenguage} = useCalendar()

  const [currentDay, setCurrentDay] = useState(new Date());
  const [monthdays, setMonthDays] = useState<DayProps[]>([])
  const [nav, setNav] = useState(false)
  const [pressedDate, setPressedDate] = useState<Date>()

  const translationX = useSharedValue(0)
  const prevTranslationX = useSharedValue(0)

  
  useEffect(() => {
    const today = new Date();
    setCurrentDay(today);
  }, []);
  
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

  //navigate to the day pressed on the screen
  const handleDayPress = (key: string) => {
    const selected = monthdays.find(arrayDay => arrayDay.key === key)

    if (selected!.shadowed === false) {
      const pressed = new Date(currentDay.getFullYear(), currentDay.getMonth(), selected?.day)
      setPressedDate(pressed)
    } else if (parseInt(selected!.key) < 0) {
      const pressed = new Date(currentDay.getFullYear(), currentDay.getMonth()-1, selected?.day)
      setPressedDate(pressed)
    } else {
      const pressed = new Date(currentDay.getFullYear(), currentDay.getMonth()+1, selected?.day)
      setPressedDate(pressed)
    }
    setNav(true)
  };

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
    <View style={styles.container}>
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
        <Animated.ScrollView 
          style={[animatedStyles]}
          >
          <View style={styles.daysContainer}>
            {monthdays.map(monthDay => 
              <RenderDayCalendar 
                currentDay={currentDay} 
                item={monthDay} 
                nav={nav} 
                onPress={handleDayPress} 
                pressedDate={pressedDate!}
                key={monthDay.key}
              />
            )}
          </View>
        </Animated.ScrollView>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
   container: {
    flex: 1,
    padding: 10  
  },
  textDayContainer: {
    height: 20,
    width: (screenWidth - 20) / 7,
    alignItems: "center"
  },  
  textDayContainerText: {
    fontSize: theme.fontSizes.F16,
    textTransform: "uppercase",
    fontWeight: "bold"
  },
  weekDays: {
    flexDirection: "row",
    marginTop: 10,
    height: 20
  },
  daysContainer: {
    flex: 1,
    marginTop: 5,
    width: screenWidth - 20,
    flexDirection: "row", 
    flexWrap: "wrap"
  },
  dayContainer: {
    height: theme.heigth.daysContainer,
    width: (screenWidth - 20)/7,
    borderColor: theme.colors.negro,
    borderWidth: 0.5
  },
  dayContainerEmpty: {
    width: (screenWidth - 20)/7,
    height: theme.heigth.daysContainer,
    backgroundColor: theme.colors.grisMasClaro,
    borderColor: theme.colors.gris,
    borderWidth: 0.5    
  },
  dayText: {
    position: "absolute",
    top: 1,
    right: 3,
    fontSize: theme.fontSizes.F12
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
  }
});