import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, StyleSheet, TextInput, TouchableOpacity, View, Alert, ScrollView } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as LucideIcons from "lucide-react-native";
import { useRouter } from "expo-router";
import { appointmentService } from "@/shared/services/appointment.service";
import { doctorService, DoctorBase, DoctorSchedule } from "@/shared/services/doctor.service";
import { serviceService, ServiceResponse } from "@/shared/services/service.service";
import { SkeletonLayout } from "@/components/common/Skeleton";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { BookingCalendar } from "@/components/appointments/BookingCalendar";
import { toISODate, isSameMonth } from "@/shared/utils/date.utils";

type MonthAvailability = {
  year: number;
  month: number;
  map: Map<string, number>;
};

type SectionIcon = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: SectionIcon;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Icon size={17} color="#0D9488" strokeWidth={2.5} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function CreateAppointmentScreen() {
  const router = useRouter();
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
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);

  const [date, setDate] = useState("");
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
      console.log("[DEBUG] create payload", payload);
      const result = await appointmentService.create(payload);
      console.log("[DEBUG] create result", result);
      Alert.alert("Éxito", "Cita registrada correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.log("[DEBUG] create error", {
        status: err?.status,
        message: err?.message,
        data: err?.data,
        full: err,
      });
      Alert.alert("Error", err.message || "No se pudo registrar la cita");
    } finally {
      setSaving(false);
    }
  };

  const headerSubtitle = useMemo(() => {
    if (!selectedDoctor) return "Paso 1: Selecciona un doctor";
    if (!selectedService) return "Paso 2: Elige un servicio";
    if (!selectedSlot) return "Paso 3: Escoge un horario";
    return "Revisa y confirma tu cita";
  }, [selectedDoctor, selectedService, selectedSlot]);

  if (showSkeleton) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="light" />
        <LinearGradient colors={['#4CB1B1', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.headerGradient} />
        <SkeletonLayout>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <LucideIcons.ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
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
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4CB1B1', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <LucideIcons.ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Nueva Cita</Text>
          <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
        <ScrollView ref={scrollRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                    <View style={styles.doctorSelectorPriceRow}>
                      <LucideIcons.DollarSign size={12} color="#4CB1B1" strokeWidth={3} />
                      <Text style={styles.doctorSelectorPrice}>
                        {selectedDoctor.consultationPrice?.toFixed(2) ?? "—"} $
                      </Text>
                    </View>
                  </View>
                  <LucideIcons.ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
                </>
              ) : (
                <>
                  <View style={[styles.doctorSelectorAvatar, styles.doctorSelectorAvatarEmpty]}>
                    <LucideIcons.Stethoscope size={22} color="#94A3B8" strokeWidth={2} />
                  </View>
                  <View style={styles.doctorSelectorInfo}>
                    <Text style={styles.doctorSelectorPlaceholder}>Seleccionar Doctor</Text>
                    <Text style={styles.doctorSelectorHint}>Toca para elegir un profesional</Text>
                  </View>
                  <LucideIcons.ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
                </>
              )}
            </TouchableOpacity>

            {selectedDoctor && (
              <FormSection title="Servicio" icon={LucideIcons.Package}>
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
                              {svc.durationMin} min {svc.price != null ? `| ${svc.price.toFixed(2)} $` : ""}
                            </Text>
                          </View>
                          {selected && <LucideIcons.Check size={16} color="#FFFFFF" strokeWidth={3} />}
                        </TouchableOpacity>
                      );
                    })}
                    {services.length > 3 && (
                      <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => setServicePickerOpen(true)}
                        activeOpacity={0.7}
                      >
                        <LucideIcons.LayoutList size={14} color="#4CB1B1" strokeWidth={2.5} />
                        <Text style={styles.viewAllText}>
                          Ver todos ({services.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </FormSection>
            )}

            <FormSection title="Fecha y Hora" icon={LucideIcons.CalendarClock}>
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
                      const today = new Date();
                      const next = calendarMonth === 12
                        ? { year: calendarYear + 1, month: 1 }
                        : { year: calendarYear, month: calendarMonth + 1 };
                      if (next.year > today.getFullYear() ||
                          (next.year === today.getFullYear() && next.month > today.getMonth() + 1)) {
                        return;
                      }
                      setCalendarYear(next.year);
                      setCalendarMonth(next.month);
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
                    canGoNext={(() => {
                      const today = new Date();
                      const currentNext = calendarMonth === 12
                        ? { year: calendarYear + 1, month: 1 }
                        : { year: calendarYear, month: calendarMonth + 1 };
                      return currentNext.year < today.getFullYear() ||
                        (currentNext.year === today.getFullYear() && currentNext.month <= today.getMonth() + 1);
                    })()}
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
                          <LucideIcons.Clock size={24} color="#94A3B8" strokeWidth={1.5} />
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
                                <LucideIcons.Clock
                                  size={12}
                                  color={selected ? "#FFFFFF" : "#64748B"}
                                  strokeWidth={2.5}
                                  style={{ marginRight: 4 }}
                                />
                                <Text style={[styles.slotText, selected && styles.slotTextSelected]}>
                                  {slot}
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
                  <LucideIcons.CalendarDays size={28} color="#94A3B8" strokeWidth={1.5} />
                  <Text style={styles.calendarPlaceholderText}>
                    {!selectedDoctor
                      ? "Selecciona un doctor para ver la disponibilidad"
                      : "Selecciona un servicio para ver la disponibilidad"}
                  </Text>
                </View>
              )}
            </FormSection>

            <FormSection title="Motivo de la Consulta" icon={LucideIcons.MessageSquare}>
              <View style={styles.inputWrapper}>
                <Text style={styles.fieldLabel}>Motivo *</Text>
                <View style={styles.inputRow}>
                  <LucideIcons.FileText size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Ej: Control de rutina, dolor de cabeza..."
                    placeholderTextColor="#C5CDD8"
                  />
                </View>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.fieldLabel}>Notas adicionales (opcional)</Text>
                <View style={styles.inputRow}>
                  <LucideIcons.Edit3 size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
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
              </View>
            </FormSection>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <LucideIcons.Info size={16} color="#4CB1B1" strokeWidth={2.5} />
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
                <LucideIcons.CalendarCheck size={20} color="#FFFFFF" strokeWidth={2.5} />
              )}
              <Text style={styles.submitText}>
                {saving ? "Programando..." : "Programar Cita"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      <BottomSheetModal
        visible={doctorPickerOpen}
        onClose={() => setDoctorPickerOpen(false)}
        height={0.7}
      >
        <Text style={styles.pickerTitle}>Seleccionar Doctor</Text>
        <View style={styles.pickerSearchRow}>
          <LucideIcons.Search size={16} color="#94A3B8" strokeWidth={2} />
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
          <FlatList
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
                    <LucideIcons.CheckCircle size={20} color="#4CB1B1" strokeWidth={2.5} />
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
          <FlatList
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
                      {item.durationMin} min {item.price != null ? `| ${item.price.toFixed(2)} $` : ""}
                    </Text>
                  </View>
                  {selected && <LucideIcons.Check size={16} color="#FFFFFF" strokeWidth={3} />}
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
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 140 },

  header: {
    position: "relative",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 1 },

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
  doctorSelectorPriceRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  doctorSelectorPrice: { fontSize: 12, color: "#4CB1B1", fontWeight: "600" },
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
});
