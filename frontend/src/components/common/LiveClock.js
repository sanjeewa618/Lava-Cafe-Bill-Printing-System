import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';

const LiveClock = ({ color = '#FFFFFF', size = '0.85rem' }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  return (
    <Box sx={{ textAlign: 'right' }}>
      <Typography variant="caption" sx={{ color, fontSize: size, fontWeight: 500, display: 'block', letterSpacing: '0.05em' }}>
        {formatDate(time)}
      </Typography>
      <Typography variant="caption" sx={{ color: '#FFC107', fontSize: size, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        {formatTime(time)}
      </Typography>
    </Box>
  );
};

export default LiveClock;
