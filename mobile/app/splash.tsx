import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Page = () => {
    const router = useRouter();
    return (
        <View style={styles.mainContainer}>
            <View style={styles.splashContainer}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>🤖</Text>
                </View>
                <Text style={styles.title}>SyncAI</Text>
                <Text style={styles.subtitle}>Your Personal AI Assistant</Text>
                <TouchableOpacity style={styles.glowBar} onPress={() => {
                    router.push("/login")
                }}>
                    <Text>
                        Start
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#111827',
    },
    splashContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: '#ffffff',
        marginTop: 20,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 18,
        color: '#94a3b8',
        marginTop: 8,
    },
    logoContainer: {
        padding: 30,
        borderRadius: 30,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        marginBottom: 20,
    },
    logo: {
        fontSize: 80,
    },
    glowBar: {
        padding: 15,
        width: 200,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        backgroundColor: '#3b82f6',
        borderRadius: 2,
        marginTop: 30,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        color: '#ffffff',
    }
});

export default Page;
