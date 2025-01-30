import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const pulseAnim = new Animated.Value(1);

    // Pulse animation for the AI icon
    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleLogin = () => {
        // Implement your login logic here
        console.log('Login attempt:', email, password);
    };

    // return (
    //     <LinearGradient
    //         colors={['#1a2151', '#0a0a2e']}
    //         style={styles.container}
    //     >
    
            <View style={styles.content}>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <MaterialIcons name="speed" size={80} color="#00f2fe" />
                </Animated.View>
                
                <Text style={styles.title}>AI Sync</Text>
                <Text style={styles.subtitle}>Welcome back</Text>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={24} color="#00f2fe" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#6c7693"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" size={24} color="#00f2fe" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#6c7693"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    {/* <LinearGradient
                        colors={['#00f2fe', '#4facfe']}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    > */}
                        <Text style={styles.buttonText}>Login</Text>
                    {/* </LinearGradient> */}
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
        {/* </LinearGradient> */}
    // );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#6c7693',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#fff',
        fontSize: 16,
    },
    loginButton: {
        height: 50,
        borderRadius: 25,
        marginTop: 20,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        marginTop: 15,
        alignItems: 'center',
    },
    forgotPasswordText: {
        color: '#6c7693',
        fontSize: 14,
    },
});