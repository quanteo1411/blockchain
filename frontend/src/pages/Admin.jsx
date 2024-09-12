import React from 'react';
import { Container, Box } from '@mui/material';
import AdminPanel from '../components/AdminPanel';
import TransactionHistory from '../components/TransactionHistory';

const AdminPage = ({ contractInstance, adminAddress }) => {
  return (
    <Container>
      <Box sx={{ padding: 4 }}>
        <AdminPanel contractInstance={contractInstance} adminAddress={adminAddress} />
        <TransactionHistory contractInstance={contractInstance} />
      </Box>
    </Container>
  );
};

export default AdminPage;
