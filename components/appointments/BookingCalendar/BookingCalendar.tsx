import { Text } from "@/components/common/SText";
import * as LucideIcons from "lucide-react-native";
import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  WEEKDAY_LETTERS,
  MONTH_NAMES,
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameMonth,
  toISODate,
  todayISO,
  tomorrowISO,
} from "@/shared/utils/date.utils";

interface BookingCalendarProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToday: () => void;
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
  availabilityMap: Map<string, number>;
  loadingMonth: boolean;
  canGoNext: boolean;
}

const CELL_SIZE = 40;

export const BookingCalendar = ({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onGoToday,
  selectedDate,
  onSelectDate,
  availabilityMap,
  loadingMonth,
  canGoNext,
}: BookingCalendarProps) => {
  const today = todayISO();
  const minDate = tomorrowISO();
  const onCurrentMonth = useMemo(() => {
    const now = new Date();
    return isSameMonth(year, month, now.getFullYear(), now.getMonth() + 1);
  }, [year, month]);

  const days = useMemo(() => {
    const totalDays = getDaysInMonth(year, month);
    const firstWeekday = getFirstDayOfMonth(year, month);
    const cells: Array<{ iso: string; day: number } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ iso: toISODate(year, month, d), day: d });
    }
    return cells;
  }, [year, month]);

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity style={styles.navButton} onPress={onPrevMonth} activeOpacity={0.7}>
          <LucideIcons.ChevronLeft size={18} color="#0D9488" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.monthLabelWrap}>
          {loadingMonth && (
            <ActivityIndicator size="small" color="#0D9488" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[month - 1]} {year}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {!onCurrentMonth && (
            <TouchableOpacity style={styles.todayButton} onPress={onGoToday} activeOpacity={0.7}>
              <Text style={styles.todayButtonText}>Hoy</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            onPress={onNextMonth}
            disabled={!canGoNext}
            activeOpacity={0.7}
          >
            <LucideIcons.ChevronRight size={18} color={canGoNext ? "#0D9488" : "#CBD5E1"} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAY_LETTERS.map((letter, idx) => (
          <View key={`${letter}-${idx}`} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{letter}</Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((cell, idx) => {
          if (!cell) {
            return <View key={`empty-${idx}`} style={styles.dayCell} />;
          }
          const { iso, day } = cell;
          const isBeforeMin = iso < minDate;
          const isToday = iso === today;
          const isSelected = iso === selectedDate;
          const slotsCount = availabilityMap.get(iso);
          const hasAvailability = slotsCount !== undefined && slotsCount > 0;
          const isDisabled = isBeforeMin || slotsCount === undefined || slotsCount === 0;

          const dayCellStyle = [
            styles.dayCell,
            isSelected && styles.dayCellSelected,
            !isSelected && hasAvailability && styles.dayCellAvailable,
            isToday && !isSelected && styles.dayCellToday,
          ];

          const dayTextStyle = [
            styles.dayText,
            isSelected && styles.dayTextSelected,
            isDisabled && !isSelected && styles.dayTextDisabled,
          ];

          return (
            <TouchableOpacity
              key={iso}
              style={dayCellStyle}
              onPress={() => !isDisabled && onSelectDate(iso)}
              activeOpacity={isDisabled ? 1 : 0.7}
              disabled={isDisabled}
            >
              <Text style={dayTextStyle}>{day}</Text>
              {hasAvailability && (
                <View
                  style={[
                    styles.slotDot,
                    isSelected && styles.slotDotSelected,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthLabelWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  navButton: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "#F0FDFA",
    alignItems: "center", justifyContent: "center",
  },
  navButtonDisabled: { backgroundColor: "#F1F5F9" },
  todayButton: {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
  },
  todayButtonText: { fontSize: 12, fontWeight: "600", color: "#0D9488" },

  weekdaysRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekdayCell: {
    width: CELL_SIZE + 6, height: 24,
    alignItems: "center", justifyContent: "center",
    marginHorizontal: 1,
  },
  weekdayText: { fontSize: 11, fontWeight: "600", color: "#94A3B8" },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: CELL_SIZE + 6, height: CELL_SIZE + 6,
    alignItems: "center", justifyContent: "center",
    marginVertical: 2,
    marginHorizontal: 1,
    borderRadius: 12,
  },
  dayCellToday: { borderWidth: 1, borderColor: "#0D9488" },
  dayCellAvailable: { backgroundColor: "#F0FDFA" },
  dayCellSelected: { backgroundColor: "#0D9488" },

  dayText: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  dayTextSelected: { color: "#FFFFFF" },
  dayTextDisabled: { color: "#CBD5E1" },

  slotDot: {
    position: "absolute",
    bottom: 4,
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: "#0D9488",
  },
  slotDotSelected: { backgroundColor: "#FFFFFF" },
});
