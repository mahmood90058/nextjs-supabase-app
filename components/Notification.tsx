// components/Notification.tsx
import React, { useEffect, useState } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'info'; // Types for different notifications
    duration?: number; // Duration to display the notification
    onDismiss: () => void; // Callback to handle dismissal
}

const Notification: React.FC<NotificationProps> = ({ message, type, duration = 3000, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 300); // Wait for animation to finish before calling onDismiss
        }, duration); // Dismiss after specified duration

        return () => clearTimeout(timer); // Clean up the timer
    }, [duration, onDismiss]);

    return (
        <div
            className={`border-l-4 p-4 w-60 my-2 transition-opacity duration-300 transform ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            } ${
                type === 'success' ? 'bg-blue-700 text-white border-green-500' : 
                type === 'error' ? 'bg-red-100 border-red-500' : 
                'bg-blue-100 border-blue-500'
            }`}
        >
            <p className="text-sm">{message}</p>
        </div>
    );
};

export default Notification;
