import { useDirection } from "@/hooks/useDirection";
import { useGetAllBooking } from "@/service/ride-booking";
import { useCreateRideStore } from "@/store/useRideStore";
import { router } from "expo-router";
import { t } from "i18next";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BookingRequest() {
    const [bookingList, setBookingList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isRTL, swap } = useDirection();
    const { polyline: EncodedPolyline ,setPolyline} = useCreateRideStore();
  
    const fetchList = useCallback(async () => {
      setLoading(true);
      try {
        const res = await useGetAllBooking('published', 'requested');
        setBookingList(res?.data?.length ? res.data : []);
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Failed to load data');
        setBookingList([]);
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      fetchList();
    }, [fetchList]);
  
    /* ---------- helpers ---------- */
    const fmtDate = (iso: string) =>
      new Date(iso).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
      });
  
    const fmtTime = (iso: string) =>
      new Date(iso).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
  
    /* ---------- render ---------- */
    return (
      <SafeAreaView style={{ flex: 1, paddingTop: 25 }}>
        <ScrollView style={styles.container}>
          {/* ---- header ---- */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={() => router.replace('..')}
            >
              {swap(
                <ChevronLeft color="#000" />,
                <ChevronRight color="#000" />
              )}
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('Booking Request')}</Text>
          </View>
  
          {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading…</Text>
          ) : bookingList.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40 }}>No requests</Text>
          ) : (
            bookingList.map((item) => {
              const passenger = item.passengers?.[0] ?? {};
              return (
                <Pressable
                onPress={()=>{
                    setPolyline(item.rideRoute)
                    console.log("rideRoute==================",item)
                    setTimeout(()=>{
                        router.push({pathname:'/(booking)/booking-approval',params:{item:JSON.stringify(item)}})
                    },100)
                    }}
                  key={item.id}
                  style={styles.cardWrapper}
                >
                  <Image
                    source={require('../../../public/avatar-dummy.png')}
                    style={styles.avatar}
                  />
                  <View style={styles.card}>
                    <Text style={styles.name}>
                      {passenger.name || '—'} {passenger.lastName || ''}
                    </Text>
                    <Text style={styles.route}>
                      {item.pickupAddress} → {item.dropAddress}
                    </Text>
                    <View style={styles.row}>
                      <Text style={styles.date}>{fmtDate(item.pickupTime)}</Text>
                      <Text style={styles.time}>{fmtTime(item.pickupTime)}</Text>
                    </View>
                  </View>
                  <ChevronRight color="#000" />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  /* ---------- styles ---------- */
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 16, paddingTop: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    backButton: {
      width: 45,
      height: 45,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: { fontSize: 22, color: '#000', fontWeight: '500' },
    cardWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 2,
      borderStyle: 'dashed',
      borderColor: '#e5e7eb',
      paddingVertical: 12,
    },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    card: { flex: 1, paddingHorizontal: 10 },
    name: { fontSize: 16, fontWeight: '600', color: '#111827' },
    route: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    row: { flexDirection: 'row', gap: 5, marginTop: 2 },
    date: { fontSize: 12, color: '#374151' },
    time: { fontSize: 12, fontWeight: '500', color: '#111827' },
  });