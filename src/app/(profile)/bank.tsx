import { useDirection } from '@/hooks/useDirection';
import { handleBankDelete, handleBankUpdate } from '@/service/auth';
import { useGetBankDetails } from '@/service/profile';
import { router, useFocusEffect } from 'expo-router';
import { t } from 'i18next';
import {
    ChevronLeft,
    ChevronRight,
    CirclePlus,
    Pencil,
    Trash,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';

type BankAccount = {
    id: number;
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    iban: string;
    swift_code: string;
    bank_branch: string;
};

export default function BankScreen() {
    const { isRTL, swap } = useDirection();

    /* ------------------------------------------------------------------ */
    /*  API integration                                                   */
    /* ------------------------------------------------------------------ */
    const [bankList, setBankList] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true; // prevents state update if screen blurs quickly

            (async () => {
                setLoading(true);
                try {
                    const res = await useGetBankDetails();
                    if (isActive && res?.data) setBankList(res.data);
                } catch (err) {
                    console.error('Bank list error:', err);
                } finally {
                    if (isActive) setLoading(false);
                }
            })();

            return () => {
                isActive = false; // cleanup
            };
        }, [])
    );


    const handleDeleteBank =async(id:number)=>{
        setLoading(true)
        const req ={id}
        const res = await handleBankDelete(req)
        if(res.ok){
          Alert.alert("Bank removed successfully")
          setLoading(false)
        }
      }

    /* ------------------------------------------------------------------ */
    /*  Render                                                            */
    /* ------------------------------------------------------------------ */
    return (
        <SafeAreaView className="flex-1 p-4 bg-white">
            <ScrollView bounces={false} className="px-4 pt-6">
                {/* -------------------- Header -------------------- */}
                <View className="flex-row items-center my-8 gap-3">
                    <TouchableOpacity
                        className="size-[45px] rounded-full border border-[#EBEBEB] bg-white items-center justify-center"
                        onPress={() => router.replace('..')}
                        activeOpacity={0.8}
                    >
                        {swap(<ChevronLeft />, <ChevronRight />)}
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-800">
                        Bank Accounts
                    </Text>
                </View>

                {/* -------------------- Loader -------------------- */}
                {loading && (
                    <View className="py-8 items-center">
                        <ActivityIndicator size="small" color="#dc2626" />
                    </View>
                )}

                {/* -------------------- Cards -------------------- */}
                {!loading &&
                    bankList.map((b, idx) => (
                        <View
                            key={b.id}
                            className="border border-gray-200 rounded-xl p-4 mb-4"
                        >
                            {/* Top bar */}
                            <View className="flex-row border-b-2 border-gray-300 border-dashed py-3 items-center justify-between mb-3">
                                <Text className="text-lg font-semibold text-gray-700">
                                    Bank ({idx + 1})
                                </Text>
                                <View className="flex-row gap-2 items-center space-x-3">
                                    <TouchableOpacity onPress={() => {
                                        router.push({ pathname: '/bank-save', params: { path: "bank-list", data: JSON.stringify(b) } })
                                    }} className="py-1 px-2 flex-row border border-gray-400 rounded-full justify-center items-center gap-2">
                                        <Pencil color="red" size={12} />
                                        <Text className="text-[#000] text-[10px] font-[Kanin-Light]">
                                            Edit
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={()=>handleDeleteBank(b.id)} className="py-1 px-2 flex-row border border-gray-400 rounded-full justify-center items-center gap-2">
                                        <Trash color="red" size={12} />
                                        <Text className="text-[#000] font-[Kanin-Light] text-[10px]">
                                            Remove
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Rows */}
                            <Field label="Account Holder Name" value={b.account_holder_name} />
                            <Field label="Bank Name" value={b.bank_name} />
                            <Field label="Account Number" value={b.account_number} />
                            <Field label="IBAN" value={b.iban} />
                            <Field label="SWIFT Code" value={b.swift_code} />
                            <Field label="Branch" value={b.bank_branch} />
                        </View>
                    ))}

                {/* -------------------- Add button -------------------- */}
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/bank-save', params: { path: "bank-list" } })}
                    className="flex-row items-center justify-center h-14 rounded-full bg-red-500 mt-4"
                    activeOpacity={0.8}
                >
                    <CirclePlus size={20} color="#fff" strokeWidth={1} />
                    <Text className="ml-2 text-lg text-white text-[18px] font-[Kanit-Regular]">
                        {t('Add Bank')}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

/* Helper to keep the code clean */
function Field({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[12px] font-[Kanin-Light] text-gray-500">
                {label}
            </Text>
            <Text className="text-[14px] font-[Kanin-SemiBold] text-black mt-1">
                {value}
            </Text>
        </View>
    );
}