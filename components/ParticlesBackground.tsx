import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';

interface Particle {
  translateX: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  speed: number;
  direction: number;
}

const createInitialParticles = (numParticles: number, width: number, height: number) => {
  return Array.from({ length: numParticles }, () => ({
    translateX: new Animated.Value(Math.random() * width),
    translateY: new Animated.Value(Math.random() * height),
    scale: new Animated.Value(Math.random() * 0.5 + 0.2),
    opacity: new Animated.Value(Math.random() * 0.3 + 0.2),
    speed: Math.random() * 0.8 + 0.2,
    direction: Math.random() * Math.PI * 2,
  }));
};

export default function ParticlesBackground() {
  // Return empty view for non-web platforms
  if (Platform.OS !== 'web') {
    return <View style={styles.container} />;
  }

  const { width, height } = Dimensions.get('window');
  const numParticles = 100;
  const particles = useRef<Particle[]>(createInitialParticles(numParticles, width, height));
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    const createParticleAnimation = (particle: Particle) => {
      const duration = 8000;
      const distance = Math.random() * 120 + 40;
      
      const targetX = Math.cos(particle.direction) * distance;
      const targetY = Math.sin(particle.direction) * distance;

      return Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.translateX, {
              toValue: targetX,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateX, {
              toValue: -targetX,
              duration: duration,
              useNativeDriver: true,
            })
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.translateY, {
              toValue: targetY,
              duration: duration * 1.2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateY, {
              toValue: -targetY,
              duration: duration * 1.2,
              useNativeDriver: true,
            })
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 0.6,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0.2,
              duration: 3000,
              useNativeDriver: true,
            })
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 0.8,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.3,
              duration: 4000,
              useNativeDriver: true,
            })
          ])
        )
      ]);
    };

    animationsRef.current?.forEach(animation => {
      if (animation) animation.stop();
    });

    animationsRef.current = particles.current.map((particle) => {
      return createParticleAnimation(particle);
    });

    animationsRef.current.forEach((animation, index) => {
      setTimeout(() => {
        animation.start();
      }, index * 20);
    });

    return () => {
      animationsRef.current?.forEach(animation => {
        if (animation) animation.stop();
      });
    };
  }, [width, height]);

  return (
    <View style={styles.container}>
      <View style={styles.gradient} />
      {particles.current.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.translateX },
                { translateY: particle.translateY },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
              filter: 'blur(3px)',
              boxShadow: '0 0 12px rgba(33, 150, 243, 0.9)',
              width: 4,
              height: 4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e3f2fd',
    overflow: 'hidden',
    zIndex: 0,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#2196F3',
    borderRadius: 10,
  },
});