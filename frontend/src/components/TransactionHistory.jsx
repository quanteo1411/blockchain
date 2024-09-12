import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from '@mui/material';

const TransactionHistory = ({ contractInstance }) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [searchAddress, setSearchAddress] = useState('');
  const [sortedBy, setSortedBy] = useState('time');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      const totalTx = await contractInstance.methods.getTotalTransactions().call();
      setTotalPages(Math.ceil(totalTx / 10)); // Mỗi trang có 10 giao dịch
      const txs = await contractInstance.methods
        .getTransactions(page, sortedBy)
        .call();
      setTransactions(txs);
    };
    fetchTransactions();
  }, [page, sortedBy, contractInstance]);

  const handleSearch = async () => {
    const txs = await contractInstance.methods
      .searchTransactionsByWallet(searchAddress)
      .call();
    setTransactions(txs);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Transaction History
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
        <TextField
          label="Search by wallet address"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          variant="outlined"
          sx={{ marginRight: 2, width: '300px' }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => setSortedBy('time')}>Time</TableCell>
              <TableCell onClick={() => setSortedBy('amount')}>Amount</TableCell>
              <TableCell>Wallet Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(tx.time * 1000).toLocaleString()}</TableCell>
                <TableCell>{tx.amount}</TableCell>
                <TableCell>{tx.wallet}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, value) => setPage(value)}
        sx={{ marginTop: 2 }}
      />
    </Box>
  );
};

export default TransactionHistory;
