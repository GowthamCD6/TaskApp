import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const { colors } = useTheme();

  const getLocalYYYYMMDD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalYYYYMMDD(new Date());

  // Generate 9 days around today
  const days = Array.from({ length: 9 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - 1 + index); // Starts from yesterday
    const dateStr = getLocalYYYYMMDD(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const isToday = todayStr === dateStr;

    return {
      dateStr,
      dayName,
      dayNum,
      isToday,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.cardBorder,
        },
      ]}
    >
      <Text style={[styles.headerTitle, { color: colors.subText }]}>Day-Wise Calendar Timeline</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map(day => {
          const isSelected = day.dateStr === selectedDate;
          return (
            <TouchableOpacity
              key={day.dateStr}
              style={[
                styles.dayCard,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.surface,
                  borderColor: isSelected
                    ? colors.primary
                    : day.isToday
                    ? colors.secondary
                    : colors.inputBorder,
                },
              ]}
              onPress={() => onSelectDate(day.dateStr)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayName,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : day.isToday
                      ? colors.secondary
                      : colors.subText,
                  },
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : day.isToday
                      ? colors.secondary
                      : colors.text,
                  },
                ]}
              >
                {day.dayNum}
              </Text>
              {day.isToday && (
                <View
                  style={[
                    styles.dotIndicator,
                    { backgroundColor: isSelected ? '#FFFFFF' : colors.secondary },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  dayCard: {
    width: 60,
    height: 70,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNum: {
    fontSize: 17,
    fontWeight: '800',
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
