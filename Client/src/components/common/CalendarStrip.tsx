import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface CalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Generate 9 days around today
  const days = Array.from({ length: 9 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - 1 + index); // Starts from yesterday
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    return {
      dateStr,
      dayName,
      dayNum,
      isToday,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Day-Wise Calendar Timeline</Text>
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
                isSelected && styles.dayCardSelected,
                day.isToday && !isSelected && styles.dayCardToday,
              ]}
              onPress={() => onSelectDate(day.dateStr)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.textSelected,
                  day.isToday && !isSelected && styles.textToday,
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  isSelected && styles.textSelected,
                  day.isToday && !isSelected && styles.textToday,
                ]}
              >
                {day.dayNum}
              </Text>
              {day.isToday && <View style={styles.dotIndicator} />}
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
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayCardSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#818CF8',
  },
  dayCardToday: {
    borderColor: '#38BDF8',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  dayNum: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  textToday: {
    color: '#38BDF8',
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
    marginTop: 4,
  },
});
