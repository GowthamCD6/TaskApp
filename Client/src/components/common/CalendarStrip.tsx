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
  markedDates?: string[]; // Dates that contain tasks/data
  taskCountsByDate?: Record<string, number>; // Count of tasks per date
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
  markedDates = [],
  taskCountsByDate = {},
}) => {
  const { colors } = useTheme();

  const normalizeDate = (dStr?: string) => {
    if (!dStr) return '';
    return dStr.split('T')[0].split(' ')[0].trim();
  };

  const getLocalYYYYMMDD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalYYYYMMDD(new Date());
  const normalizedSelected = normalizeDate(selectedDate) || todayStr;

  // Generate 14 days centered around today (3 past days + today + 10 future days)
  const days = Array.from({ length: 14 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + index);
    const dateStr = getLocalYYYYMMDD(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const isToday = todayStr === dateStr;
    const taskCount = taskCountsByDate[dateStr] || (markedDates.includes(dateStr) ? 1 : 0);

    return {
      dateStr,
      dayName,
      dayNum,
      isToday,
      hasData: taskCount > 0,
      taskCount,
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
          const isSelected = day.dateStr === normalizedSelected;
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
                    : day.hasData
                    ? 'rgba(99, 102, 241, 0.4)'
                    : colors.inputBorder,
                },
              ]}
              onPress={() => onSelectDate(day.dateStr)}
              activeOpacity={0.7}
            >
              {day.hasData && (
                <View
                  style={[
                    styles.dataBadge,
                    {
                      backgroundColor: isSelected ? '#FFFFFF' : colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dataBadgeText,
                      { color: isSelected ? colors.primary : '#FFFFFF' },
                    ]}
                  >
                    {day.taskCount}
                  </Text>
                </View>
              )}

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
              {day.isToday && !day.hasData && (
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
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    position: 'relative',
  },
  dataBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  dataBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
