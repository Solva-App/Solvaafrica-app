import {
  Alert,
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import IconRight from "@expo/vector-icons/FontAwesome";
import BankIcon from "@expo/vector-icons/FontAwesome";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import FeatherIcon from "@expo/vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";
import ToastManager, { Toast } from "toastify-react-native";

import { hscale, mscale, wscale } from "../helpers/metric";
import PrimaryButton from "../components/primaryButton";
import { AUTH_API_CLIENT } from "../api/apiClient";
import { globalStyles } from "../styles/global";
import { colors } from "../constants/theme";
import { BANKS } from "../constants/data";
import ErrorModal from "../components/errorModal";

interface BankDetailForm {
  accountName: string;
  accountNumber: string;
  bankName: string;
  amount: string;
}

type FormFields = "accountName" | "accountNumber" | "bankName" | "amount";

export default function Cashout() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [showModal, setShowModal] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [bankDetailsForm, setBankDetailsForm] = useState<BankDetailForm>({
    accountName: "",
    accountNumber: "",
    bankName: "",
    amount: "",
  });
  const [submittingForm, setSubmittingForm] = useState(false);

  useEffect(() => {
    if (params.balance) {
      const balanceValue = parseFloat(params.balance as string);
      setUserBalance(isNaN(balanceValue) ? null : balanceValue);
    }
  }, [params.balance]);

  const handleSetForm = (value: string, formField: FormFields | undefined) => {
    if (!formField) return;
    setBankDetailsForm((prev) => ({ ...prev, [formField]: value }));
  };

  const handleSubmitForm = async () => {
    const { accountName, accountNumber, amount, bankName } = bankDetailsForm;
    
    if (
      !accountName.trim() ||
      !amount.trim() ||
      !accountNumber.trim() ||
      !bankName.trim()
    ) {
      Toast.error("Please fill all fields");
      return;
    }

    if (accountNumber.length !== 10) {
      Toast.error("Account number must be 10 digits.");
      return;
    }

    const amountNum = Number(amount.trim());
    if (isNaN(amountNum) || amountNum <= 0) {
      Toast.error("Please enter a valid amount");
      return;
    }

    if (userBalance === null || userBalance === undefined) {
      Toast.error("Unable to retrieve your balance. Please try again.");
      return;
    }

    if (amountNum > userBalance) {
      Toast.error(`Balance too low. Your balance is NGN ${userBalance.toFixed(2)}`);
      return;
    }

    const requestForm = {
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      amount: amountNum,
    };
    
    try {
      setSubmittingForm(true);
      const response = await AUTH_API_CLIENT.post("/cashouts/create", requestForm);
      if (response.status === 200) {
        setShowModal(true);
      }
    } catch (error: any) {
      let message = "Error, Something went wrong, try again later!";
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      setErrorMessage(message);
      setErrorVisible(true);
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F0EDF6" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ToastManager />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: hscale(48) }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FeatherIcon name="arrow-left" size={22} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cashout</Text>
        </View>

        <View style={{ paddingHorizontal: wscale(20) }}>
          {/* ── Total Earnings Card ── */}
          <EarningsBalanceView userBalance={userBalance} />

          {/* ── Bank Details ── */}
          <Text style={styles.sectionTitle}>Bank Details</Text>

          <View style={{ marginTop: hscale(16) }}>
            {/* Account Name */}
            <Text style={styles.fieldLabel}>Account Name</Text>
            <InputView
              placeholder="Enter Account Name"
              value={bankDetailsForm.accountName}
              setForm={(value) => handleSetForm(value, "accountName")}
            />

            {/* Account Number */}
            <Text style={styles.fieldLabel}>Account Number</Text>
            <InputView
              placeholder="Account Number"
              value={bankDetailsForm.accountNumber}
              setForm={(value) => handleSetForm(value, "accountNumber")}
              keyboardType="numeric"
            />

            {/* Bank */}
            <Text style={styles.fieldLabel}>Bank</Text>
            <SelectBankInputView
              selectedBank={bankDetailsForm.bankName}
              handleSetForm={handleSetForm}
            />

            {/* Withdrawal Amount */}
            <Text style={styles.fieldLabel}>Withdrawal Amount</Text>
            <InputView
              placeholder="Enter amount"
              value={bankDetailsForm.amount}
              setForm={(value) => handleSetForm(value, "amount")}
              keyboardType="numeric"
              showNairaPrefix
            />
            <Text style={styles.minNote}>Minimum withdrawal: ₦1000.00</Text>
          </View>

          {/* ── Submit Button ── */}
          <TouchableOpacity
            style={[styles.submitBtn, submittingForm && { opacity: 0.75 }]}
            onPress={handleSubmitForm}
            disabled={submittingForm}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {submittingForm ? "Submitting..." : "Submit Request"}
            </Text>
          </TouchableOpacity>

          {/* ── Info Banner ── */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={mscale(20)} color={colors.primary} style={{ marginRight: wscale(10), marginTop: 2 }} />
            <Text style={styles.infoText}>
              Cashout requests are typically processed within 48-72 hours. Ensure your bank details are correct to avoid delays.
            </Text>
          </View>
        </View>
      </ScrollView>

      <SuccessModal showModal={showModal} setShowModal={setShowModal} />
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const SuccessModal = ({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const handleOkPress = () => {
    setShowModal(false);
    router.back();
  };

  return (
    <Modal
      animationType="fade"
      visible={showModal}
      onRequestClose={() => setShowModal(false)}
      transparent={true}
    >
      <View style={styles.successModalOverlay}>
        <View style={styles.successModalContent}>
          <Image
            source={require("../../assets/images/success.png")}
            style={{
              width: wscale(150),
              height: hscale(150),
              marginVertical: hscale(20),
            }}
          />
          <Text style={[globalStyles.headlineText, { marginBottom: hscale(8) }]}>
            Successfully Added
          </Text>
          <Text style={[globalStyles.bodyText, { fontSize: mscale(14), textAlign: "center" }]}>
            Your application for withdrawal has been submitted, wait for 1-2
            business working days to receive funds in your account.
          </Text>
          <View style={{ flexDirection: "row", marginVertical: hscale(20), alignItems: "center" }}>
            <Image
              source={require("../../assets/images/bi_question.png")}
              style={{ width: wscale(30), height: wscale(30), marginRight: wscale(10) }}
            />
            <Text style={{ flex: 1, fontFamily: "Inter-Regular", fontSize: mscale(13), color: "#555" }}>
              Delay not yet received? Send complaints to support.
            </Text>
          </View>

          <PrimaryButton text="Ok" onPress={handleOkPress} />
        </View>
      </View>
    </Modal>
  );
};

interface InputViewProps {
  editable?: boolean;
  value?: string;
  placeholder: string;
  setForm?: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  iconsLeft?: boolean;
  showNairaPrefix?: boolean;
}

const InputView = ({
  editable = true,
  value,
  placeholder,
  setForm,
  keyboardType,
  iconsLeft = false,
  showNairaPrefix = false,
}: InputViewProps) => {
  return (
    <View style={styles.textInputView}>
      {showNairaPrefix && (
        <Text style={styles.nairaPrefix}>₦</Text>
      )}
      <TextInput
        value={value}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor="#BBBBC0"
        style={styles.textInput}
        cursorColor={colors.primary}
        onChangeText={(text) => setForm && setForm(text)}
        keyboardType={keyboardType ? keyboardType : "default"}
      />
      {iconsLeft && <FeatherIcon name="chevron-down" size={mscale(18)} color="#888" />}
    </View>
  );
};

const SelectBankInputView = ({
  selectedBank,
  handleSetForm,
}: {
  selectedBank: string;
  handleSetForm: (value: string, formField: FormFields | undefined) => void;
}) => {
  const [showDropDown, setShowDropDown] = useState(false);

  const handleSetSelectedBank = (bank: string) => {
    handleSetForm(bank, "bankName");
    setShowDropDown(false);
  };

  return (
    <>
      <Pressable onPress={() => setShowDropDown(true)}>
        <InputView
          editable={false}
          value={selectedBank}
          placeholder="Select Bank"
          iconsLeft={true}
        />
      </Pressable>

      <Modal
        visible={showDropDown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropDown(false)}
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDropDown(false)}
        >
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Bank</Text>
              <TouchableOpacity onPress={() => setShowDropDown(false)} hitSlop={8}>
                <FeatherIcon name="x" size={mscale(24)} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <FlashList
                estimatedItemSize={BANKS.length}
                showsVerticalScrollIndicator={true}
                data={BANKS}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSetSelectedBank(item)}
                    style={styles.dropdownItem}
                  >
                    <BankIcon name="bank" size={mscale(16)} color="#555" />
                    <Text style={styles.dropDownText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const EarningsBalanceView = ({
  userBalance,
}: {
  userBalance: number | null | any;
}) => {
  return (
    <View style={styles.earningsBox}>
      <View style={styles.earningsAccent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.earningsLabel}>TOTAL EARNINGS</Text>
        {userBalance != null ? (
          <Text style={styles.earningsValue}>
            <Text style={styles.earningsCurrencySmall}>NGN</Text>
            {` ${userBalance.toFixed(2)}`}
          </Text>
        ) : (
          <Text style={styles.earningsLoading}>Loading balance...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wscale(20),
    paddingTop: hscale(16),
    paddingBottom: hscale(12),
    gap: wscale(14),
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(18),
    color: "#1A1A2E",
  },

  // ── Earnings card ──
  earningsBox: {
    flexDirection: "row",
    backgroundColor: "#F5EEF9",
    borderRadius: mscale(16),
    marginBottom: hscale(28),
    marginTop: hscale(8),
    overflow: "hidden",
    paddingVertical: hscale(20),
    paddingHorizontal: wscale(20),
  },
  earningsAccent: {
    width: 5,
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginRight: wscale(16),
  },
  earningsLabel: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(11),
    color: "#888",
    letterSpacing: 1.1,
    marginBottom: hscale(6),
    textTransform: "uppercase",
  },
  earningsValue: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(30),
    color: colors.primary,
    lineHeight: mscale(36),
  },
  earningsCurrencySmall: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(16),
    color: colors.primary,
  },
  earningsLoading: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#999",
  },

  // ── Section title ──
  sectionTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(22),
    color: "#1A1A2E",
    marginBottom: hscale(4),
  },

  // ── Field label ──
  fieldLabel: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    color: "#888",
    marginBottom: hscale(6),
    marginLeft: wscale(4),
  },

  // ── Text inputs ──
  textInputView: {
    height: hscale(52),
    backgroundColor: "#FFFFFF",
    marginBottom: hscale(18),
    borderRadius: mscale(12),
    paddingHorizontal: wscale(16),
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E0F0",
  },
  nairaPrefix: {
    fontFamily: "Inter-Medium",
    fontSize: mscale(16),
    color: "#555",
    marginRight: wscale(6),
  },
  textInput: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(15),
    color: "#333",
    flex: 1,
    ...Platform.select({
      web: { outlineStyle: "none" } as any,
    }),
  },

  // ── Min note ──
  minNote: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(12),
    color: "#888",
    marginTop: -hscale(10),
    marginBottom: hscale(28),
    marginLeft: wscale(4),
  },

  // ── Submit button ──
  submitBtn: {
    backgroundColor: "#3D006E",
    borderRadius: mscale(32),
    paddingVertical: hscale(18),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hscale(20),
  },
  submitBtnText: {
    fontFamily: "Inter-SemiBold",
    fontSize: mscale(17),
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // ── Info banner ──
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FDF0F5",
    borderRadius: mscale(12),
    paddingVertical: hscale(14),
    paddingHorizontal: wscale(16),
    marginBottom: hscale(20),
  },
  infoText: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontSize: mscale(13),
    color: "#555",
    lineHeight: mscale(20),
  },

  // ── Dropdown Modal ──
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  dropdownModalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: mscale(24),
    borderTopRightRadius: mscale(24),
    height: "60%",
    paddingTop: hscale(20),
    paddingBottom: hscale(40),
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wscale(20),
    marginBottom: hscale(16),
  },
  dropdownTitle: {
    fontFamily: "Inter-Bold",
    fontSize: mscale(18),
    color: "#111",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hscale(16),
    paddingHorizontal: wscale(24),
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEF5",
  },
  dropDownText: {
    fontFamily: "Inter-Regular",
    color: "#333",
    fontSize: mscale(15),
    marginLeft: wscale(16),
    flex: 1,
  },

  // ── Success Modal ──
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModalContent: {
    backgroundColor: "#ffffff",
    width: "85%",
    borderRadius: mscale(16),
    paddingVertical: hscale(30),
    paddingHorizontal: wscale(24),
    alignItems: "center",
  },
});