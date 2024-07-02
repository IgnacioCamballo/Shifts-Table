import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  FlatList, 
  Animated
} from 'react-native';
import BotonChico from '../components/BotonChico';
import theme from '../theme';

let screenWidth = Dimensions.get("window").width
let lenguage = "es"

type DayProps = {

    key: string, 
    day: number, 
    isCurrentDay: boolean,
    shadowed: boolean
}

export default function Calendar() {
  const [currentDay, setCurrentDay] = useState(new Date());
  const [monthdays, setMonthDays] = useState<DayProps[]>([])
  const [position, setPosition] = useState(new Animated.Value(0))

  let currentDate = new Date()
  let actualyear = new Date().getFullYear()
  
  //arreglo weekDays con los dias de la semana de lunes a domingo, idioma ajustable
  const weekdaysArray = [...Array(7).keys()]
  const intlWeekDay = new Intl.DateTimeFormat(lenguage, {weekday: "short"})
  const weekDays = weekdaysArray.map(weekDayIndex => {
    const weekDayName = intlWeekDay.format(new Date(2021, 10, weekDayIndex +1))
    return weekDayName
  })

  //arreglo months con los meses, idioma ajustable
  const monthsArray = [...Array(12).keys()]
  const intlMonth = new Intl.DateTimeFormat(lenguage, {month: "short"})
  const months = monthsArray.map(monthIndex => {
    const month = intlMonth.format(new Date(actualyear, monthIndex))
    return month
  })

  useEffect(() => {
    const today = new Date();
    setCurrentDay(today);
  }, []);

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

  const renderItem = (item: DayProps) => {
    const {day, key, isCurrentDay, shadowed} = item

    return (
      <TouchableOpacity
        key={key}
        style={shadowed ? styles.dayContainerEmpty : styles.dayContainer}
        onPress={() => handleDayPress(day)}
      >
        <Text style={shadowed ? styles.emptyDayText : [styles.dayText, isCurrentDay && styles.selectedDayText]}>{day.toLocaleString()}</Text>
      </TouchableOpacity>
    )
  }

  const handleDayPress = (day: number) => {
    
  };

  const prevMonth = async () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() - 1);

    Animated.timing(position, {
      toValue: screenWidth,
      duration: 100,
      useNativeDriver: false
    }).start(() => {
      setCurrentDay(newDate)
      Animated.timing(position, {
        toValue: -screenWidth,
        duration: 0,
        useNativeDriver: false
      }).start(() => {
        Animated.timing(position, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        }).start()
      })
    })
  };

  const nextMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1);

    Animated.timing(position, {
      toValue: -screenWidth,
      duration: 100,
      useNativeDriver: false
    }).start(() => {
      setCurrentDay(newDate)
      Animated.timing(position, {
        toValue: screenWidth,
        duration: 0,
        useNativeDriver: false
      }).start(() => {
        Animated.timing(position, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        }).start()
      })
    })
  };

  return (
    <View style={styles.container}>
      <View style={styles.arrows}>
        <TouchableOpacity onPress={prevMonth}>
          <BotonChico color={theme.colors.grisMedio} text='<'/>
        </TouchableOpacity>

        <Text style={styles.monthText}>{currentDay.toLocaleDateString('es-ES', { month: 'long' })}</Text>
        
        <TouchableOpacity onPress={nextMonth}>
        <BotonChico color={theme.colors.grisMedio} text='>'/>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {weekDays.map(day => 
          <View key={day} style={styles.textDayContainer}>
            <Text style={styles.textDayContainerText}>{day}</Text>
          </View>
        )}
      </View>

      <Animated.View 
        style={[
          styles.daysContainer,
          {transform:[{translateX: position}]}
        ]}
      >
        <FlatList
          scrollEnabled={false}
          data={monthdays}
          renderItem={({item}) => renderItem(item)}
          numColumns={7}
          keyExtractor={(item) => item.key}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
   container: {
    flex: 1,
    padding: 10  
  },
  monthText: {
    fontSize: theme.fontSizes.F20,
    fontWeight: 'bold',
  },
  arrows: {
    height: 28,
    flexDirection: 'row',
    justifyContent: "space-between",
    paddingHorizontal: 48
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
    marginTop: 5
  },
  dayContainer: {
    height: theme.heigth.daysContainer,
    width: (screenWidth - 20)/7,
    borderColor: theme.colors.negro,
    borderWidth: 0.5,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 1,
    paddingRight: 3
  },
  dayContainerEmpty: {
    width: (screenWidth - 20)/7,
    height: theme.heigth.daysContainer,
    backgroundColor: theme.colors.grisMasClaro,
    borderColor: theme.colors.gris,
    borderWidth: 0.5,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 1,
    paddingRight: 3
  },
  dayText: {
    fontSize: theme.fontSizes.F12
  },
  emptyDayText: {
    fontSize: theme.fontSizes.F12,
    color: theme.colors.gris
  },
  selectedDayText: {
    color: theme.colors.rojo,
  },
});

