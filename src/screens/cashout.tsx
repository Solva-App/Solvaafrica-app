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
      Alert.alert("Error!", "Please fill all fields");
      return;
    }

    if (accountNumber.length !== 10) {
      Alert.alert("Error!", "Account number must be 10 digits.");
      return;
    }

    const amountNum = Number(amount.trim());
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error!", "Please enter a valid amount");
      return;
    }

    if (userBalance === null || userBalance === undefined) {
      Alert.alert("Error!", "Unable to retrieve your balance. Please try again.");
      return;
    }

    if (amountNum > userBalance) {
      Alert.alert("Error!", `Balance too low for withdrawal amount. Your balance is NGN ${userBalance.toFixed(2)}`);
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
      style={{ flex: 1, backgroundColor: "#ffffff" }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: hscale(40) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[globalStyles.screen, { minHeight: "100%" }]}>
          <EarningsBalanceView userBalance={userBalance} />
          
          <Text style={styles.sectionTitle}>
            Bank Details
          </Text>
          
          <View style={{ marginTop: hscale(20) }}>
            <InputView
              placeholder="Enter Account Name"
              value={bankDetailsForm.accountName}
              setForm={(value) => handleSetForm(value, "accountName")}
            />
            
            <InputView
              placeholder="Account Number"
              value={bankDetailsForm.accountNumber}
              setForm={(value) => handleSetForm(value, "accountNumber")}
              keyboardType="numeric"
            />
            
            <SelectBankInputView 
              selectedBank={bankDetailsForm.bankName}
              handleSetForm={handleSetForm} 
            />
            
            <InputView
              placeholder="Enter amount"
              value={bankDetailsForm.amount}
              setForm={(value) => handleSetForm(value, "amount")}
              keyboardType="numeric"
            />
          </View>

          <View style={{ marginTop: hscale(20) }}>
            <PrimaryButton
              text="Submit"
              onPress={handleSubmitForm}
              isLoading={submittingForm}
            />
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
}

const InputView = ({
  editable = true,
  value,
  placeholder,
  setForm,
  keyboardType,
  iconsLeft = false,
}: InputViewProps) => {
  return (
    <View style={styles.textInputView}>
      <TextInput
        value={value}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor="#888"
        style={styles.textInput}
        cursorColor={colors.primary}
        onChangeText={(text) => setForm && setForm(text)}
        keyboardType={keyboardType ? keyboardType : "default"}
      />
      {iconsLeft && <IconRight name="angle-down" size={mscale(20)} color="#333" />}
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
      <Text style={styles.earningsLabel}>Earnings</Text>
      {userBalance != null ? (
        <Text style={styles.earningsValue}>
          {`NGN ${userBalance.toFixed(2)}`}
        </Text>
      ) : (
        <Text style={styles.earningsLoading}>Loading balance...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: "Inter-Medium", // Fallback handles missing fonts slightly better than Inter-Bold on some devices
    fontWeight: "600",
    color: "#333",
    fontSize: mscale(18),
    marginTop: hscale(24),
    marginBottom: hscale(4),
  },
  
  // Earnings Box matching the screenshot
  earningsBox: {
    backgroundColor: "#F9F4FC", // Pale purple/pink tint
    paddingVertical: hscale(16),
    paddingHorizontal: wscale(20),
    borderRadius: mscale(16),
    marginTop: hscale(20),
    borderWidth: 1,
    borderColor: "#301934",
  },
  earningsLabel: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    fontSize: mscale(14),
    color: "#111",
    marginBottom: hscale(4),
  },
  earningsValue: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    fontSize: mscale(20),
    color: "#666",
  },
  earningsLoading: {
    fontFamily: "Inter-Regular",
    fontSize: mscale(14),
    color: "#999",
  },

  // Form Inputs
  textInputView: {
    height: hscale(56),
    backgroundColor: "#F9EDF5", // Pale pink matching the screenshot
    marginBottom: hscale(16),
    borderRadius: mscale(28),
    paddingHorizontal: wscale(24),
    flexDirection: "row",
    alignItems: "center",
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

  // Dropdown Modal
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

  // Success Modal
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