import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  useEffect(() => {
    // Navigate to onboard screen after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/onboard');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#45086A', '#2A0244']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Brand Name */}
        <Text style={styles.brandName}>SOLVA</Text>
        
        {/* Glowing Line */}
        <View style={styles.glowLineWrapper}>
          <LinearGradient 
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']} 
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.glowLine}
          />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Always a good time to learn and{"\n"}earn.
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.separator} />
        <Text style={styles.statusText}>INITIALIZING ECOSYSTEM</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -40, // Adjust centering slightly upwards
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 48,
    fontFamily: 'serif',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  glowLineWrapper: {
    width: 120,
    height: 2,
    marginBottom: 24,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  glowLine: {
    width: '100%',
    height: '100%',
    borderRadius: 1,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    width: '100%',
  },
  separator: {
    height: 1,
    width: width * 0.6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  statusText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    letterSpacing: 3,
    fontFamily: 'Inter-Medium',
  },
});
