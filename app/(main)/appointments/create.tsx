import { CalendarCheck, CalendarClock, CalendarDays, CalendarSync, Check, CheckCircle, ChevronDown, ChevronLeft, Clock, Edit3, FileText, Info, LayoutList, MessageSquare, Package, Search, Stethoscope } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View, Alert, ScrollView } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { appointmentService } from "@/shared/services/appointment.service";
import { invalidate, setCached } from "@/shared/cache/appointmentCache";
import { doctorService, DoctorBase, DoctorSchedule } from "@/shared/services/doctor.service";
import { serviceService, ServiceResponse } from "@/shared/services/service.service";
import { formatToAMPM } from "@/shared/utils/date.utils";
import { SkeletonLayout } from "@/components/common/Skeleton";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { BookingCalendar } from "@/components/appointments/BookingCalendar";
import { AppointmentSection } from "@/components/appointments/AppointmentSection";

type MonthAvailability = {
  year: number;
  month: number;
  map: Map<string, number>;
};

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rescheduleId?: string; doctorId?: string; serviceId?: string }>();
  const isReschedule = !!params.rescheduleId;
  const scrollRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const skeletonOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const [saving, setSaving] = useState(false);

  const [doctors, setDoctors] = useState<DoctorBase[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorBase | null>(null);
  const [doctorPickerOpen, setDoctorPickerOpen] = useState(false);

  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceResponse | null>(null);
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [, setDoctorSchedules] = useState<DoctorSchedule[]>([]);


  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthAvailability, setMonthAvailability] = useState<Map<string, number>>(new Map());
  const [loadingMonth, setLoadingMonth] = useState(false);
  const monthCacheRef = useRef<Map<string, MonthAvailability>>(new Map());
  const monthRequestIdRef = useRef(0);
  const slotsRequestIdRef = useRef(0);

  const previewServices = useMemo(() => {
    if (!selectedService) return services.slice(0, 3);
    const others = services
      .filter((s) => s.id !== selectedService.id)
      .slice(0, 2);
    return [selectedService, ...others];
  }, [services, selectedService]);

  useEffect(() => {
    if (!loading && showSkeleton) {
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(skeletonOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => setShowSkeleton(false));
    }
  }, [loading, showSkeleton, contentOpacity, skeletonOpacity]);

  useEffect(() => {
    (async () => {
      try {
        const allDoctors: DoctorBase[] = [];
        let cursor: string | undefined;
        do {
          const res = await doctorService.getAllPublic({ limit: 100, ...(cursor ? { cursor } : {}) });
          allDoctors.push(...(res.doctors ?? []));
          cursor = res.nextCursor ?? undefined;
        } while (cursor);
        setDoctors(allDoctors);
      } catch {
        Alert.alert("Error", "No se pudieron cargar los doctores");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedDoctor) {
      setServices([]);
      setDoctorSchedules([]);
      setSelectedService(null);
      return;
    }
    const today = new Date();
    setSelectedService(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
    setSelectedDate(null);
    setMonthAvailability(new Map());
    monthCacheRef.current.clear();
    setCalendarYear(today.getFullYear());
    setCalendarMonth(today.getMonth() + 1);
    setLoadingServices(true);
    (async () => {
      try {
        const [schedules, doctorServices] = await Promise.all([
          doctorService.getSchedulesPublic(selectedDoctor.id),
          serviceService.getByDoctorPublic(selectedDoctor.id),
        ]);
        setDoctorSchedules(schedules);
        setServices(doctorServices.filter((s) => s.isActive));
      } catch {
        setDoctorSchedules([]);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    })();
  }, [selectedDoctor]);

  const isoDate = useMemo(() => selectedDate ?? "", [selectedDate]);

  useEffect(() => {
    if (!selectedDoctor || !selectedService) return;
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
    const cacheKey = `${selectedDoctor.id}-${selectedService.id}-${calendarYear}-${calendarMonth}`;
    const cached = monthCacheRef.current.get(cacheKey);
    if (cached) {
      setMonthAvailability(cached.map);
      return;
    }
    const requestId = ++monthRequestIdRef.current;
    setLoadingMonth(true);
    (async () => {
      try {
        const res = await appointmentService.getMonthlyAvailability(
          selectedDoctor.id,
          selectedService.id,
          calendarYear,
          calendarMonth,
        );
        if (requestId !== monthRequestIdRef.current) return;
        const map = new Map<string, number>(
          res.days.map((d) => {
            const iso = typeof d.date === "string" ? d.date.slice(0, 10) : String(d.date);
            return [iso, d.availableSlots] as [string, number];
          }),
        );
        monthCacheRef.current.set(cacheKey, { year: calendarYear, month: calendarMonth, map });
        setMonthAvailability(map);
      } catch {
        if (requestId !== monthRequestIdRef.current) return;
        setMonthAvailability(new Map());
      } finally {
        if (requestId === monthRequestIdRef.current) {
          setLoadingMonth(false);
        }
      }
    })();
  }, [selectedDoctor, selectedService, calendarYear, calendarMonth]);

  useEffect(() => {
    if (!selectedDoctor || !selectedService || !selectedDate) {
      setAvailableSlots([]);
      setSelectedSlot(null);
      return;
    }
    const requestId = ++slotsRequestIdRef.current;
    setLoadingSlots(true);
    setSelectedSlot(null);
    setAvailableSlots([]);
    (async () => {
      try {
        const res = await appointmentService.getAvailableSlots(
          selectedDoctor.id,
          selectedService.id,
          selectedDate,
        );
        if (requestId !== slotsRequestIdRef.current) return;
        setAvailableSlots(res.slots);
      } catch {
        if (requestId !== slotsRequestIdRef.current) return;
        setAvailableSlots([]);
      } finally {
        if (requestId === slotsRequestIdRef.current) {
          setLoadingSlots(false);
        }
      }
    })();
  }, [selectedDoctor, selectedService, selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDoctor) { Alert.alert("Validación", "Selecciona un doctor"); return; }
    if (!selectedService) { Alert.alert("Validación", "Selecciona un servicio"); return; }
    if (!selectedDate) { Alert.alert("Validación", "Selecciona una fecha del calendario"); return; }
    if (!selectedSlot) { Alert.alert("Validación", "Selecciona un horario disponible"); return; }
    if (!reason.trim()) { Alert.alert("Validación", "El motivo de la consulta es obligatorio"); return; }

    setSaving(true);
    try {
      const payload = {
        doctorId: selectedDoctor.id,
        serviceId: selectedService.id,
        scheduledAt: new Date(`${isoDate}T${selectedSlot}:00`).toISOString(),
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      };

      if (isReschedule && params.rescheduleId) {
        const updated = await appointmentService.reschedule(params.rescheduleId, payload.scheduledAt);
        invalidate(params.rescheduleId);
        setCached(updated);
        Alert.alert("Éxito", "Cita reagendada correctamente", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        await appointmentService.create(payload);
        Alert.alert("Éxito", "Cita registrada correctamente", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || (isReschedule ? "No se pudo reagendar la cita" : "No se pudo registrar la cita"));
    } finally {
      setSaving(false);
    }
  };

  const headerSubtitle = useMemo(() => {
    if (isReschedule) {
      if (!selectedDoctor) return "Selecciona el doctor";
      if (!selectedService) return "Elige el servicio";
      if (!selectedSlot) return "Escoge el nuevo horario";
      return "Confirma el reagendamiento";
    }
    if (!selectedDoctor) return "Paso 1: Selecciona un doctor";
    if (!selectedService) return "Paso 2: Elige un servicio";
    if (!selectedSlot) return "Paso 3: Escoge un horario";
    return "Revisa y confirma tu cita";
  }, [selectedDoctor, selectedService, selectedSlot, isReschedule]);

  if (showSkeleton) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <SkeletonLayout>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <SkeletonLayout.Block width={140} height={18} borderRadius={9} />
              <View style={{ height: 4 }} />
              <SkeletonLayout.Block width={200} height={12} borderRadius={6} />
            </View>
          </View>
          <Animated.View style={{ flex: 1, opacity: skeletonOpacity }}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.form}>
                <SkeletonLayout.Section>
                  <SkeletonLayout.Block width={100} height={18} borderRadius={9} style={{ marginBottom: 12 }} />
                  <SkeletonLayout.Block height={56} borderRadius={12} style={{ marginBottom: 8 }} />
                </SkeletonLayout.Section>
                <SkeletonLayout.Section>
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.Block width={80} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
                  <SkeletonLayout.Block height={80} borderRadius={10} />
                </SkeletonLayout.Section>
              </View>
        </ScrollView>
      </Animated.View>
        </SkeletonLayout>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Nueva Cita</Text>
          <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
        </View>
      </View>

      {isReschedule && (
        <View style={styles.rescheduleBanner}>
          <CalendarSync size={14} color="#0D9488" strokeWidth={2.5} />
          <Text style={styles.rescheduleBannerText}>Reagendando cita existente</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} style={{ flex: 1 }}>
      <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
        <ScrollView ref={scrollRef} style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <TouchableOpacity style={styles.doctorSelectorCard} onPress={() => setDoctorPickerOpen(true)} activeOpacity={0.7}>
              {selectedDoctor ? (
                <>
                  <View style={styles.doctorSelectorAvatar}>
                    <Text style={styles.doctorSelectorInitials}>
                      {selectedDoctor.firstName?.charAt(0)}{selectedDoctor.lastName?.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.doctorSelectorInfo}>
                    <Text style={styles.doctorSelectorName}>
                      {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </Text>
                    <Text style={styles.doctorSelectorSpecialty}>
                      {selectedDoctor.specialty || "Sin especialidad"}
                    </Text>
                  </View>
                  <ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
                </>
              ) : (
                <>
                  <View style={[styles.doctorSelectorAvatar, styles.doctorSelectorAvatarEmpty]}>
                    <Stethoscope size={22} color="#94A3B8" strokeWidth={2} />
                  </View>
                  <View style={styles.doctorSelectorInfo}>
                    <Text style={styles.doctorSelectorPlaceholder}>Seleccionar Doctor</Text>
                    <Text style={styles.doctorSelectorHint}>Toca para elegir un profesional</Text>
                  </View>
                  <ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.fieldHelper}>Toca para elegir el profesional que te atenderá. Solo verás doctores con disponibilidad en sus horarios configurados.</Text>

            {selectedDoctor && (
              <AppointmentSection title="Servicio" icon={Package}>
                <Text style={styles.fieldHelper}>Selecciona el tipo de consulta que necesitas. Cada servicio tiene una duración definida por el doctor.</Text>
                {loadingServices ? (
                  <ActivityIndicator style={{ paddingVertical: 16 }} color="#4CB1B1" />
                ) : services.length === 0 ? (
                  <Text style={styles.emptyText}>Este doctor no tiene servicios disponibles</Text>
                ) : (
                  <View style={styles.serviceScroll}>
                    {previewServices.map((svc) => {
                      const selected = selectedService?.id === svc.id;
                      return (
                        <TouchableOpacity
                          key={svc.id}
                          style={[styles.serviceOption, selected && styles.serviceOptionSelected]}
                          onPress={() => setSelectedService(svc)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.serviceDot, selected && styles.serviceDotSelected]} />
                          <View style={styles.serviceInfo}>
                            <Text style={[styles.serviceName, selected && styles.serviceNameSelected]} numberOfLines={1}>
                              {svc.name}
                            </Text>
                            <Text style={styles.serviceMeta}>
                              {svc.durationMin} min
                            </Text>
                          </View>
                          {selected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                        </TouchableOpacity>
                      );
                    })}
                    {services.length > 3 && (
                      <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => setServicePickerOpen(true)}
                        activeOpacity={0.7}
                      >
                        <LayoutList size={14} color="#4CB1B1" strokeWidth={2.5} />
                        <Text style={styles.viewAllText}>
                          Ver todos ({services.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </AppointmentSection>
            )}

            <AppointmentSection title="Fecha y Hora" icon={CalendarClock}>
              <Text style={styles.fieldHelper}>Los días marcados indican disponibilidad del doctor. Toca un día disponible y luego escoge la hora que prefieras.</Text>
              {selectedDoctor && selectedService ? (
                <>
                  <BookingCalendar
                    year={calendarYear}
                    month={calendarMonth}
                    onPrevMonth={() => {
                      if (calendarMonth === 1) {
                        setCalendarYear((y) => y - 1);
                        setCalendarMonth(12);
                      } else {
                        setCalendarMonth((m) => m - 1);
                      }
                    }}
                    onNextMonth={() => {
                      if (calendarMonth === 12) {
                        setCalendarYear((y) => y + 1);
                        setCalendarMonth(1);
                      } else {
                        setCalendarMonth((m) => m + 1);
                      }
                    }}
                    onGoToday={() => {
                      const today = new Date();
                      setCalendarYear(today.getFullYear());
                      setCalendarMonth(today.getMonth() + 1);
                    }}
                    selectedDate={selectedDate}
                    onSelectDate={(iso) => { setSelectedDate(iso); setSelectedSlot(null); }}
                    availabilityMap={monthAvailability}
                    loadingMonth={loadingMonth}
                    canGoNext={true}
                  />

                  {selectedDate && (
                    <View style={styles.inputWrapper}>
                      <View style={styles.slotsHeaderRow}>
                        <Text style={styles.fieldLabel}>Horarios Disponibles</Text>
                        <Text style={styles.slotsDateLabel}>
                          {(() => {
                            const [y, m, d] = selectedDate.split("-");
                            return `${d}/${m}/${y}`;
                          })()}
                        </Text>
                      </View>
                      {loadingSlots ? (
                        <ActivityIndicator style={{ paddingVertical: 16 }} color="#4CB1B1" />
                      ) : availableSlots.length === 0 ? (
                        <View style={styles.noSlots}>
                          <Clock size={24} color="#94A3B8" strokeWidth={1.5} />
                          <Text style={styles.noSlotsText}>
                            No hay horarios disponibles para esta fecha
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.slotsGrid}>
                          {availableSlots.map((slot) => {
                            const selected = selectedSlot === slot;
                            return (
                              <TouchableOpacity
                                key={slot}
                                style={[styles.slotChip, selected && styles.slotChipSelected]}
                                onPress={() => setSelectedSlot(slot)}
                                activeOpacity={0.7}
                              >
                                <Clock
                                  size={12}
                                  color={selected ? "#FFFFFF" : "#64748B"}
                                  strokeWidth={2.5}
                                  style={{ marginRight: 4 }}
                                />
                                <Text style={[styles.slotText, selected && styles.slotTextSelected]}>
                                  {formatToAMPM(slot)}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.calendarPlaceholder}>
                  <CalendarDays size={28} color="#94A3B8" strokeWidth={1.5} />
                  <Text style={styles.calendarPlaceholderText}>
                    {!selectedDoctor
                      ? "Selecciona un doctor para ver la disponibilidad"
                      : "Selecciona un servicio para ver la disponibilidad"}
                  </Text>
                </View>
              )}
            </AppointmentSection>

            <AppointmentSection title="Motivo de la Consulta" icon={MessageSquare}>
              <View style={styles.inputWrapper}>
                <Text style={styles.fieldLabel}>Motivo *</Text>
                <View style={styles.inputRow}>
                  <FileText size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Ej: Control de rutina, dolor de cabeza..."
                    placeholderTextColor="#C5CDD8"
                  />
                </View>
                <Text style={styles.fieldHelper}>En una frase breve indica por qué solicitas la cita (síntoma, control, seguimiento). Esto ayuda al doctor a prepararse antes de atenderte.</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.fieldLabel}>Notas adicionales (opcional)</Text>
                <View style={styles.inputRow}>
                  <Edit3 size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Cualquier información adicional..."
                    placeholderTextColor="#C5CDD8"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                <Text style={styles.fieldHelper}>Información complementaria que consideres relevante: alergias, medicamentos actuales, desde cuándo tienes los síntomas, etc.</Text>
              </View>
            </AppointmentSection>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Info size={16} color="#4CB1B1" strokeWidth={2.5} />
                <Text style={styles.summaryText}>
                  Recibirás una confirmación una vez el doctor apruebe la cita.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, saving && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <CalendarCheck size={20} color="#FFFFFF" strokeWidth={2.5} />
              )}
              <Text style={styles.submitText}>
                {saving ? "Programando..." : isReschedule ? "Reagendar Cita" : "Programar Cita"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
      </KeyboardAvoidingView>

      <BottomSheetModal
        visible={doctorPickerOpen}
        onClose={() => setDoctorPickerOpen(false)}
        height={0.7}
      >
        <Text style={styles.pickerTitle}>Seleccionar Doctor</Text>
        <View style={styles.pickerSearchRow}>
          <Search size={16} color="#94A3B8" strokeWidth={2} />
          <TextInput
            style={styles.pickerSearchInput}
            placeholder="Buscar doctor..."
            placeholderTextColor="#C5CDD8"
          />
        </View>
        {loading ? (
          <ActivityIndicator style={{ paddingVertical: 32 }} color="#4CB1B1" />
        ) : doctors.length === 0 ? (
          <Text style={styles.emptyDoctors}>No hay doctores disponibles</Text>
        ) : (
          <FlashList
            data={doctors}
            keyExtractor={(item) => item.id}
            style={styles.pickerList}
            contentContainerStyle={styles.pickerListContent}
            renderItem={({ item }) => {
              const selected = selectedDoctor?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.doctorOption, selected && styles.doctorOptionSelected]}
                  onPress={() => { setSelectedDoctor(item); setDoctorPickerOpen(false); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.doctorOptionAvatar}>
                    <Text style={styles.doctorOptionInitials}>
                      {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.doctorOptionInfo}>
                    <Text style={styles.doctorOptionName} numberOfLines={1}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={styles.doctorOptionSpecialty} numberOfLines={1}>
                      {item.specialty || "Sin especialidad"}
                    </Text>
                  </View>
                  {selected && (
                    <CheckCircle size={20} color="#4CB1B1" strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </BottomSheetModal>

      <BottomSheetModal
        visible={servicePickerOpen}
        onClose={() => setServicePickerOpen(false)}
        height={0.75}
      >
        <Text style={styles.pickerTitle}>Seleccionar Servicio</Text>
        <Text style={styles.pickerSubtitle}>
          {services.length} servicios disponibles
        </Text>
        {services.length === 0 ? (
          <Text style={styles.emptyDoctors}>No hay servicios disponibles</Text>
        ) : (
          <FlashList
            data={services}
            keyExtractor={(item) => item.id}
            style={styles.pickerList}
            contentContainerStyle={styles.servicePickerList}
            showsVerticalScrollIndicator
            renderItem={({ item }) => {
              const selected = selectedService?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.serviceOption, selected && styles.serviceOptionSelected]}
                  onPress={() => { setSelectedService(item); setServicePickerOpen(false); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.serviceDot, selected && styles.serviceDotSelected]} />
                  <View style={styles.serviceInfo}>
                    <Text style={[styles.serviceName, selected && styles.serviceNameSelected]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.serviceMeta}>
                      {item.durationMin} min
                    </Text>
                  </View>
                  {selected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", marginRight: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 1 },

  scrollView: { flex: 1 },
  form: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  row: { flexDirection: "row" },

  doctorSelectorCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: "#E2E8F0",
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  doctorSelectorAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "#F0FDFA", justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  doctorSelectorAvatarEmpty: { backgroundColor: "#F1F5F9" },
  doctorSelectorInitials: { fontSize: 16, fontWeight: "700", color: "#4CB1B1" },
  doctorSelectorInfo: { flex: 1 },
  doctorSelectorName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  doctorSelectorSpecialty: { fontSize: 12, color: "#64748B", fontWeight: "500", marginTop: 1 },
  doctorSelectorPlaceholder: { fontSize: 15, fontWeight: "600", color: "#94A3B8" },
  doctorSelectorHint: { fontSize: 12, color: "#CBD5E1", fontWeight: "500", marginTop: 1 },

  sectionCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: "#E2E8F0",
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  sectionIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#F0FDFA", alignItems: "center", justifyContent: "center",
  },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#0F172A", letterSpacing: -0.3 },

  emptyText: { fontSize: 14, color: "#94A3B8", fontWeight: "500", textAlign: "center", paddingVertical: 16 },

  serviceScroll: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    padding: 4,
  },
  serviceOption: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 10,
    overflow: "hidden",
  },
  serviceOptionSelected: { backgroundColor: "#F0FDF9", borderWidth: 1, borderColor: "#4CB1B1" },
  viewAllButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, marginTop: 4,
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
  },
  viewAllText: { fontSize: 13, fontWeight: "600", color: "#4CB1B1" },
  servicePickerList: { paddingBottom: 8, gap: 4 },
  serviceDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#E2E8F0", marginRight: 12,
  },
  serviceDotSelected: { backgroundColor: "#4CB1B1" },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  serviceNameSelected: { color: "#4CB1B1" },
  serviceMeta: { fontSize: 11, color: "#94A3B8", fontWeight: "500", marginTop: 2 },

  inputWrapper: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#64748B", marginBottom: 5, letterSpacing: 0.2 },
  fieldHelper: { fontSize: 11, color: "#94A3B8", marginTop: 4, lineHeight: 15, paddingHorizontal: 2 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12,
    borderWidth: 1, borderColor: "#E8EDF2", minHeight: 44,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#0F172A", fontWeight: "500", paddingVertical: 10 },
  textarea: { height: 80, paddingTop: 10, textAlignVertical: "top" },

  noSlots: { alignItems: "center", paddingVertical: 20, gap: 8 },
  noSlotsText: { fontSize: 13, color: "#94A3B8", fontWeight: "500", textAlign: "center" },

  slotsHeaderRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 8,
  },
  slotsDateLabel: {
    fontSize: 12, fontWeight: "600", color: "#0D9488",
    backgroundColor: "#F0FDFA", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  slotsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
  },
  slotChip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, backgroundColor: "#F8FAFC",
    borderWidth: 1, borderColor: "#E8EDF2",
  },
  slotChipSelected: { backgroundColor: "#4CB1B1", borderColor: "#4CB1B1" },
  slotText: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  slotTextSelected: { color: "#FFFFFF" },

  calendarPlaceholder: {
    alignItems: "center", paddingVertical: 28, gap: 10,
  },
  calendarPlaceholderText: {
    fontSize: 13, color: "#94A3B8", fontWeight: "500", textAlign: "center",
    maxWidth: 240, lineHeight: 18,
  },

  summaryCard: {
    backgroundColor: "#F0FDFA", borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "#CCFBF1",
  },
  summaryRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  summaryText: { flex: 1, fontSize: 12, color: "#0D9488", fontWeight: "500", lineHeight: 18 },

  submitButton: {
    flexDirection: "row", backgroundColor: "#4CB1B1", borderRadius: 14,
    paddingVertical: 15, alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: "#4CB1B1", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
  },
  submitText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },

  pickerList: { flex: 1, marginTop: 4 },
  pickerListContent: { paddingBottom: 8, gap: 4 },
  pickerTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", textAlign: "center", marginBottom: 4 },
  pickerSubtitle: { fontSize: 13, color: "#94A3B8", fontWeight: "500", textAlign: "center", marginBottom: 16 },
  pickerSearchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: "#E8EDF2", minHeight: 40, marginBottom: 12,
  },
  pickerSearchInput: {
    flex: 1, fontSize: 14, color: "#0F172A", fontWeight: "500",
    marginLeft: 8, paddingVertical: 8,
  },
  emptyDoctors: { textAlign: "center", paddingVertical: 24, fontSize: 14, color: "#94A3B8", fontWeight: "500" },
  doctorOption: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
  },
  doctorOptionSelected: { backgroundColor: "#F0FDF9" },
  doctorOptionAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  doctorOptionInitials: { fontSize: 14, fontWeight: "700", color: "#64748B" },
  doctorOptionInfo: { flex: 1 },
  doctorOptionName: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  doctorOptionSpecialty: { fontSize: 12, color: "#94A3B8", fontWeight: "500", marginTop: 1 },

  rescheduleBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: "#F0FDFA",
    borderBottomWidth: 1,
    borderBottomColor: "#A7F3D0",
  },
  rescheduleBannerText: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "600",
  },
});
