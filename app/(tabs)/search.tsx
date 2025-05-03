import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePropertyStore } from "@/stores/propertyStore";
import { PropertyList } from "@/components/PropertyList";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, X, SlidersHorizontal } from "lucide-react-native";
import { FilterModal } from "@/components/FilterModal";
import { Property } from "@/types";

export default function SearchScreen() {
	const router = useRouter();
	const { properties, isLoading } = usePropertyStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
	const [filters, setFilters] = useState({
		minPrice: "",
		maxPrice: "",
		bedrooms: "",
		bathrooms: "",
		propertyType: "All",
	});

	useEffect(() => {
		if (properties) {
			applyFilters();
		}
	}, [searchQuery, filters, properties]);

	const applyFilters = () => {
		let filtered = [...properties];

		// Apply search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(property) =>
					property.title.toLowerCase().includes(query) ||
					property.location.toLowerCase().includes(query) ||
					property.description.toLowerCase().includes(query)
			);
		}

		// Apply price filters
		if (filters.minPrice) {
			filtered = filtered.filter(
				(property) => property.price >= parseInt(filters.minPrice)
			);
		}
		if (filters.maxPrice) {
			filtered = filtered.filter(
				(property) => property.price <= parseInt(filters.maxPrice)
			);
		}

		// Apply bedroom filter
		if (filters.bedrooms) {
			filtered = filtered.filter(
				(property) => property.bedrooms >= parseInt(filters.bedrooms)
			);
		}

		// Apply bathroom filter
		if (filters.bathrooms) {
			filtered = filtered.filter(
				(property) => property.bathrooms >= parseInt(filters.bathrooms)
			);
		}

		// Apply property type filter
		if (filters.propertyType !== "All") {
			filtered = filtered.filter(
				(property) => property.type === filters.propertyType
			);
		}

		setFilteredProperties(filtered);
	};

	const handleClearSearch = () => {
		setSearchQuery("");
	};

	const handlePropertyPress = (property: Property) => {
		router.push(`/property/${property.id}`);
	};

	const handleApplyFilters = (newFilters: typeof filters) => {
		setFilters(newFilters);
		setShowFilters(false);
	};

	const handleResetFilters = () => {
		setFilters({
			minPrice: "",
			maxPrice: "",
			bedrooms: "",
			bathrooms: "",
			propertyType: "All",
		});
		setShowFilters(false);
	};

	return (
		<SafeAreaView style={styles.container} edges={["bottom"]}>
			<View style={styles.searchContainer}>
				<View style={styles.searchInputContainer}>
					<Search size={20} color="#7f8c8d" style={styles.searchIcon} />
					<Input
						placeholder="Search by location, title, or description"
						value={searchQuery}
						onChangeText={setSearchQuery}
						style={styles.searchInput}
						containerStyle={styles.inputContainer}
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity
							onPress={handleClearSearch}
							style={styles.clearButton}
						>
							<X size={18} color="#7f8c8d" />
						</TouchableOpacity>
					)}
				</View>
				<TouchableOpacity
					style={styles.filterButton}
					onPress={() => setShowFilters(true)}
				>
					<SlidersHorizontal size={20} color="#4a6fa5" />
				</TouchableOpacity>
			</View>

			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#4a6fa5" />
				</View>
			) : (
				<View style={styles.resultsContainer}>
					<Text style={styles.resultsText}>
						{filteredProperties.length}{" "}
						{filteredProperties.length === 1 ? "result" : "results"} found
					</Text>
					<PropertyList
						properties={filteredProperties}
						onPropertyPress={handlePropertyPress}
					/>
				</View>
			)}

			<FilterModal
				visible={showFilters}
				onClose={() => setShowFilters(false)}
				filters={filters}
				onApply={handleApplyFilters}
				onReset={handleResetFilters}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f7f9fc",
	},
	searchContainer: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#ecf0f1",
		alignItems: "center",
	},
	searchInputContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f5f8fa",
		borderRadius: 8,
		paddingHorizontal: 12,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		height: 40,
		fontSize: 16,
		paddingVertical: 0,
	},
	inputContainer: {
		flex: 1,
		marginVertical: 0,
		borderWidth: 0,
		backgroundColor: "transparent",
	},
	clearButton: {
		padding: 4,
	},
	filterButton: {
		marginLeft: 12,
		width: 40,
		height: 40,
		borderRadius: 8,
		backgroundColor: "#e6edf5",
		justifyContent: "center",
		alignItems: "center",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	resultsContainer: {
		flex: 1,
		padding: 16,
	},
	resultsText: {
		fontSize: 14,
		color: "#7f8c8d",
		marginBottom: 16,
	},
});
