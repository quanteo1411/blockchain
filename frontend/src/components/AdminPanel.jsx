import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import Web3 from 'web3';

const AdminPanel = ({ contractInstance, adminAddress }) => {
  const [apr, setApr] = useState(0);
  const [newApr, setNewApr] = useState('');

  useEffect(() => {
    const fetchApr = async () => {
      const currentApr = await contractInstance.methods.getApr().call();
      setApr(currentApr);
    };
    fetchApr();
  }, [contractInstance]);

  const handleAprUpdate = async () => {
    if (newApr) {
      try {
        await contractInstance.methods
          .setApr(newApr)
          .send({ from: adminAddress });
        setApr(newApr);
        alert('APR updated successfully');
      } catch (error) {
        console.error('Error updating APR:', error);
      }
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        APR Management
      </Typography>
      <Typography variant="body1" gutterBottom>
        Current APR: {apr}%
      </Typography>
      <TextField
        label="Enter new APR"
        type="number"
        value={newApr}
        onChange={(e) => setNewApr(e.target.value)}
        variant="outlined"
        sx={{ marginBottom: 2, width: '300px' }}
      />
      <Button variant="contained" color="primary" onClick={handleAprUpdate}>
        Update APR
      </Button>
    </Box>
  );
};

export default AdminPanel;
