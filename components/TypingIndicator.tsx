import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TypingIndicatorProps {
    label?: string;
}

const TypingIndicator = ({ label }: TypingIndicatorProps) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 400);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {label} {dots}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 2,
    },
    text: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
        fontWeight: '500',
    },
});

export default TypingIndicator;
