import { useDirection } from "@/hooks/useDirection";
import { useGetAllBooking } from "@/service/ride-booking";
import { useCreateRideStore } from "@/store/useRideStore";
import { router } from "expo-router";
import { t } from "i18next";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AlertDialog from "@/components/ui/alert-dialog";

export default function BookingRequest() {
    const [bookingList, setBookingList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { isRTL, swap } = useDirection();
    const { polyline: EncodedPolyline, setPolyline } = useCreateRideStore();
    
    // Dialog state
    const [dialog, setDialog] = useState({
      visible: false,
      title: '',
      message: '',
      type: 'info' as 'info' | 'warning' | 'error' | 'success',
      onConfirm: () => {}
    });

    // Dialog helpers
    const showDialog = (
      title: string, 
      message: string, 
      type: 'info' | 'warning' | 'error' | 'success' = 'info',
      onConfirm?: () => void
    ) => {
      setDialog({
        visible: true,
        title,
        message,
        type,
        onConfirm: onConfirm || (() => setDialog(prev => ({ ...prev, visible: false })))
      });
    };

    const closeDialog = () => {
      setDialog(prev => ({ ...prev, visible: false }));
    };
  
    const fetchList = useCallback(async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      try {
        const res = await useGetAllBooking('published', 'requested');
        setBookingList(res?.data?.length ? res.data : []);
        console.log("response===========", res?.data);
      } catch (e: any) {
        console.error('Error fetching booking list:', e);
        
        let errorMessage = 'Failed to load booking requests. Please try again.';
        
        if (e?.response?.data?.message) {
          errorMessage = e.response.data.message;
        } else if (e?.message) {
          errorMessage = e.message;
        }
        
        // Handle network errors
        if (e?.code === 'NETWORK_ERROR' || e?.message?.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        showDialog('Error', errorMessage, 'error');
        setBookingList([]);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    }, []);

    const onRefresh = useCallback(() => {
      fetchList(true);
    }, [fetchList]);
  
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
        <ScrollView 
          bounces={false} 
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF4848']} // Android
              tintColor="#FF4848" // iOS
            />
          }
        >
          {/* ---- header ---- */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={() => router.replace('..')}
            >
              {swap(
                <ChevronLeft size={24} color="#3C3F4E" />,
                <ChevronRight size={24} color="#3C3F4E" />
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
              const bookedUser = item.user ?? {};
              return (
                <Pressable
                onPress={() => {
                  try {
                    if (!item?.rideRoute) {
                      showDialog(
                        'Error',
                        'Route information is not available for this booking.',
                        'error'
                      );
                      return;
                    }
                    
                    if (!item?.id) {
                      showDialog(
                        'Error',
                        'Booking information is incomplete. Please try again.',
                        'error'
                      );
                      return;
                    }
                    
                    setPolyline(item.rideRoute);
                    console.log("rideRoute==================", item);
                    
                    setTimeout(() => {
                      router.push({
                        pathname: '/(booking)/booking-approval',
                        params: { item: JSON.stringify(item) }
                      });
                    }, 100);
                  } catch (error) {
                    console.error('Error navigating to booking approval:', error);
                    showDialog(
                      'Error',
                      'Failed to open booking details. Please try again.',
                      'error'
                    );
                  }
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
                      {bookedUser.name || '—'}
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
        
        {/* Custom Alert Dialog */}
        <AlertDialog
          visible={dialog.visible}
          onClose={closeDialog}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          onConfirm={dialog.onConfirm}
          confirmText="OK"
        />
      </SafeAreaView>
    );
  }
  
  /* ---------- styles ---------- */
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 16, paddingTop: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    backButton: {
      width: 46,
      height: 46,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      borderColor: '#EBEBEB',
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