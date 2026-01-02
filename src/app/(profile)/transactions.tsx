// TransactionTableScreen.tsx
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { useDirection } from '@/hooks/useDirection';
import { useGetTransactions } from '@/service/profile';
import { API_URL } from '@env';
import { router, useFocusEffect } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

/* -------------------------------------------------------------------------- */
/*                                    types                                   */
/* -------------------------------------------------------------------------- */
type StatusT = 'Completed' | 'Pending' | 'Failed';
interface TxApi {
  id: number;
  ref: string;
  pickupAddress: string;
  dropAddress: string;
  amount: string;
  status: number;
  createdAt: string;
  driver: { id: number; name: string; profile: null };
}

/* -------------------------------------------------------------------------- */
/*                              service call                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                              UI helpers                                      */
/* -------------------------------------------------------------------------- */
const COL_WIDTH = 120;

const Cell: React.FC<{ text: string; isHeader?: boolean }> = ({ text, isHeader }) => (
  <View style={[styles.cell, isHeader && styles.headerCell]}>
    <Text style={[styles.cellText, isHeader && styles.headerText]}>{text}</Text>
  </View>
);

const StatusBadge: React.FC<{ status: StatusT }> = ({ status }) => (
  <View style={[styles.badge, status === 'Completed' && styles.badgeGreen]}>
    <Text style={styles.badgeText}>{status}</Text>
  </View>
);

const renderRow = (tx: TxApi) => {
  const statusText: StatusT = tx.status === 1 ? 'Completed' : 'Pending';
  return (
    <View key={tx.id} style={styles.dataRow}>
      <Cell text={tx.driver?.name || '-'} />
      <Cell text={new Date(tx.createdAt).toLocaleDateString()} />
      <Cell text={tx.pickupAddress.split(',')[0]} />
      <Cell text={tx.dropAddress.split(',')[0]} />
      <View style={styles.cell}>
        <StatusBadge status={statusText} />
      </View>
      <Cell text={`SAR ${tx.amount}`} />
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                              component                                       */
/* -------------------------------------------------------------------------- */
const TransactionTableScreen: React.FC = () => {
  const { isRTL, swap } = useDirection();

  const [list, setList] = useState<TxApi[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const perPage = 15;

  const fetchPage = useCallback(
    async (nextPage: number) => {
      if (nextPage === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await useGetTransactions(nextPage, perPage);
        const newRows = res?.data ?? [];
        setList((prev) => (nextPage === 1 ? newRows : [...prev, ...newRows]));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [perPage]
  );

  useFocusEffect(
    useCallback(() => {
      fetchPage(1);
    }, [fetchPage])
  );

  const loadMore = () => {
    if (loadingMore) return;
    const next = page + 1;
    setPage(next);
    fetchPage(next);
  };

  const screenHeight = Dimensions.get('window').height;
  const tableHeight = screenHeight - 200; // Adjust based on header height

  return (
    <View style={styles.container}>
      {/* header */}
      <View className="flex-row items-center px-6 pt-16 pb-4 gap-3 bg-white">
        <TouchableOpacity
          className="size-[45px] rounded-full border border-[#EBEBEB] bg-white items-center justify-center"
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          {swap(<ChevronLeft size={24} />, <ChevronRight size={24} />)}
        </TouchableOpacity>
        <Text className="text-2xl font-[Kanit-SemiBold] text-gray-800">Transaction History</Text>
      </View>

      {/* table */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      >
        <View style={{ minWidth: Dimensions.get('window').width - 32 }}>
          {/* sticky header */}
          <View style={styles.headerRow}>
            <Cell text="Driver" isHeader />
            <Cell text="Date" isHeader />
            <Cell text="From" isHeader />
            <Cell text="To" isHeader />
            <Cell text="Status" isHeader />
            <Cell text="Amount" isHeader />
          </View>

          {/* rows */}
          <ScrollView 
            style={{ maxHeight: tableHeight }}
            showsVerticalScrollIndicator={false}
          >
            {loading && (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF4848" />
                <Text className="mt-2 text-gray-600 font-[Kanit-Light]">Loading transactions...</Text>
              </View>
            )}

            {!loading && list.length === 0 && (
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <Text className="text-gray-400 font-[Kanit-Light]">No transactions found</Text>
              </View>
            )}

            {!loading && list.map(renderRow)}

            {/* load more */}
            {!loading && list.length >= perPage && (
              <TouchableOpacity 
                style={styles.loadMore} 
                onPress={loadMore} 
                disabled={loadingMore}
                activeOpacity={0.7}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color="#FF4848" />
                ) : (
                  <Text style={styles.loadMoreTxt}>Load more</Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    styles                                  */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb',
  },
  headerRow: { 
    flexDirection: 'row', 
    backgroundColor: '#F5F5F5', 
    borderTopLeftRadius: 8, 
    borderTopRightRadius: 8,
    marginTop: 16,
  },
  dataRow: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderColor: '#e5e7eb',
  },
  cell: { 
    width: COL_WIDTH, 
    paddingHorizontal: 12, 
    paddingVertical: 14, 
    justifyContent: 'center',
  },
  headerCell: { 
    paddingVertical: 12,
  },
  cellText: { 
    fontSize: 14, 
    color: '#111827',
    fontFamily: 'Kanit-Light',
  },
  headerText: { 
    color: '#000', 
    fontWeight: '600',
    fontFamily: 'Kanit-Medium',
  },
  badge: { 
    backgroundColor: '#d1fae5', 
    borderRadius: 12, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    alignSelf: 'flex-start',
  },
  badgeGreen: { 
    backgroundColor: '#d1fae5',
  },
  badgeText: { 
    fontSize: 12, 
    color: '#065f46', 
    fontWeight: '600',
    fontFamily: 'Kanit-Regular',
  },
  loadMore: { 
    paddingVertical: 16, 
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadMoreTxt: { 
    color: '#FF4848', 
    fontWeight: '600',
    fontFamily: 'Kanit-Regular',
  },
});

export default TransactionTableScreen;