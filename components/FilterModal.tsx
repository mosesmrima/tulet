import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { X } from "lucide-react-native";
import { propertyTypes } from "@/constants/propertyTypes";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
    propertyType: string;
  };
  onApply: (filters: FilterModalProps["filters"]) => void;
  onReset: () => void;
}

export function FilterModal({ visible, onClose, filters, onApply, onReset }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key: keyof typeof filters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Properties</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.row}>
              <Input
                label="Min Price"
                placeholder="0"
                value={localFilters.minPrice}
                onChangeText={(value) => handleChange("minPrice", value)}
                keyboardType="numeric"
                containerStyle={styles.halfInput}
                leftElement={<Text style={styles.currencySymbol}>$</Text>}
              />
              <Input
                label="Max Price"
                placeholder="Any"
                value={localFilters.maxPrice}
                onChangeText={(value) => handleChange("maxPrice", value)}
                keyboardType="numeric"
                containerStyle={[styles.halfInput, styles.rightInput]}
                leftElement={<Text style={styles.currencySymbol}>$</Text>}
              />
            </View>

            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.row}>
              <Input
                label="Bedrooms"
                placeholder="Any"
                value={localFilters.bedrooms}
                onChangeText={(value) => handleChange("bedrooms", value)}
                keyboardType="numeric"
                containerStyle={styles.halfInput}
              />
              <Input
                label="Bathrooms"
                placeholder="Any"
                value={localFilters.bathrooms}
                onChangeText={(value) => handleChange("bathrooms", value)}
                keyboardType="numeric"
                containerStyle={[styles.halfInput, styles.rightInput]}
              />
            </View>

            <Select
              label="Property Type"
              value={localFilters.propertyType}
              onValueChange={(value) => handleChange("propertyType", value)}
              items={[
                { label: "All", value: "All" },
                ...propertyTypes.map(type => ({ label: type, value: type }))
              ]}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button 
              onPress={handleReset}
              variant="outline"
              style={styles.resetButton}
            >
              Reset
            </Button>
            <Button 
              onPress={handleApply}
              style={styles.applyButton}
            >
              Apply Filters
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  rightInput: {
    marginLeft: "auto",
  },
  currencySymbol: {
    fontSize: 16,
    color: "#2c3e50",
    marginRight: 8,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 2,
    marginLeft: 8,
  },
});