import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, TextField, Box, Grid, Typography } from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';
import { TOKEN_A_ADDRESS, TOKEN_B_ADDRESS, STAKING_CONTRACT_ADDRESS } from '../config/contracts';
import { useSnackbar } from 'notistack';

const Home = () => {
    const { account } = useWeb3();
    const [balanceA, setBalanceA] = useState(0);
    const [balanceB, setBalanceB] = useState(0);
    const [totalSupplyA, setTotalSupplyA] = useState(0);
    const [userAPRA, setUserAPRA] = useState(0);
    const [tokenBNFTCount, setTokenBNFTCount] = useState(0);
    const [aprIncrease, setAprIncrease] = useState(0);
    const [pendingRewardA, setPendingRewardA] = useState(0);
    const [lockTimeA, setLockTimeA] = useState('');
    const [depositTimestampB, setDepositTimestampB] = useState('');

    const { enqueueSnackbar } = useSnackbar();

    const stakingAbi = [
        "function totalSupply() view returns (uint256)",
        "function getAPR(address) view returns (uint256)",
        "function getPendingReward(address) view returns (uint256)",
        "function getLockTime(address) view returns (uint256)",
        "function deposit(uint256 amount) public",
        "function withdraw(uint256 amount) public"
    ];

    const tokenAbi = [
        "function balanceOf(address owner) view returns (uint256)"
    ];

    const nftAbi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function deposit(uint256 tokenId) public",
        "function withdraw(uint256 tokenId) public"
    ];

    const getTotalSupplyAndAPR = async () => {
        if (!TOKEN_A_ADDRESS || !account) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const tokenAContract = new ethers.Contract(TOKEN_A_ADDRESS, stakingAbi, signer);
            const totalSupply = await tokenAContract.totalSupply();
            setTotalSupplyA(ethers.utils.formatUnits(totalSupply, 18));

            const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingAbi, signer);
            const apr = await stakingContract.getAPR(account);
            setUserAPRA(ethers.utils.formatUnits(apr, 2));

            const pendingReward = await stakingContract.getPendingReward(account);
            setPendingRewardA(ethers.utils.formatUnits(pendingReward, 18));

            const lockTime = await stakingContract.getLockTime(account);
            const lockDate = new Date(lockTime * 1000).toLocaleString();
            setLockTimeA(lockDate);
        } catch (error) {
            console.error('Error getting total supply, APR, and pending rewards:', error);
            enqueueSnackbar('Failed to retrieve data', { variant: 'error' });
        }
    };

    const getBalance = async () => {
        if (!TOKEN_A_ADDRESS || !TOKEN_B_ADDRESS || !account) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const tokenAContract = new ethers.Contract(TOKEN_A_ADDRESS, tokenAbi, signer);
            const tokenBContract = new ethers.Contract(TOKEN_B_ADDRESS, nftAbi, signer);

            const balanceA = await tokenAContract.balanceOf(account);
            const balanceB = await tokenBContract.balanceOf(account);

            setBalanceA(ethers.utils.formatUnits(balanceA, 18));
            setBalanceB(balanceB.toString());

            setAprIncrease(balanceB * 2);
            setDepositTimestampB(new Date().toLocaleString());
        } catch (error) {
            console.error('Error getting balance:', error);
            enqueueSnackbar('Failed to retrieve token balances', { variant: 'error' });
        }
    };

    const depositTokenA = async (amount) => {
        try {
            const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
            const signer = provider.getSigner();
            const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingAbi, signer);

            const tx = await stakingContract.deposit(ethers.utils.parseUnits(amount, 18));
            await tx.wait();

            console.log('Deposit Token A successful');
            enqueueSnackbar('Deposit Token A successful', { variant: 'success' });
        } catch (error) {
            console.error('Error depositing Token A:', error);
            enqueueSnackbar('Failed to deposit Token A', { variant: 'error' });
        }
    };

    const withdrawTokenA = async (amount) => {
        try {
            const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
            const signer = provider.getSigner();
            const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingAbi, signer);

            const tx = await stakingContract.withdraw(ethers.utils.parseUnits(amount, 18));
            await tx.wait();

            console.log('Withdraw Token A successful');
            enqueueSnackbar('Withdraw Token A successful', { variant: 'success' });
        } catch (error) {
            console.error('Error withdrawing Token A:', error);
            enqueueSnackbar('Failed to withdraw Token A', { variant: 'error' });
        }
    };

    const depositTokenB = async (tokenId) => {
        try {
            const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
            const signer = provider.getSigner();
            const nftContract = new ethers.Contract(TOKEN_B_ADDRESS, nftAbi, signer);

            const tx = await nftContract.deposit(tokenId);
            await tx.wait();

            console.log('Deposit Token B (NFT) successful');
            enqueueSnackbar('Deposit Token B (NFT) successful', { variant: 'success' });
        } catch (error) {
            console.error('Error depositing Token B:', error);
            enqueueSnackbar('Failed to deposit Token B', { variant: 'error' });
        }
    };

    const withdrawTokenB = async (tokenId) => {
        try {
            const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
            const signer = provider.getSigner();
            const nftContract = new ethers.Contract(TOKEN_B_ADDRESS, nftAbi, signer);

            const tx = await nftContract.withdraw(tokenId);
            await tx.wait();

            console.log('Withdraw Token B (NFT) successful');
            enqueueSnackbar('Withdraw Token B (NFT) successful', { variant: 'success' });
        } catch (error) {
            console.error('Error withdrawing Token B:', error);
            enqueueSnackbar('Failed to withdraw Token B', { variant: 'error' });
        }
    };

    useEffect(() => {
        if (account) {
            getBalance();
            getTotalSupplyAndAPR();
        }
    }, [account]);

    return (
        <Box sx={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#e1e1e1', minHeight: '100vh' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ backgroundColor: '#2b2b2b', padding: '20px', borderRadius: '10px' }}>
                        <Typography variant="h6" sx={{ color: '#00ff80', marginBottom: '15px' }}>
                            Token Information
                        </Typography>

                        <Typography variant="h6" sx={{ color: '#3399ff' }}>Token A</Typography>
                        <Typography variant="body1">Address: {TOKEN_A_ADDRESS}</Typography>
                        <TextField fullWidth label="Total Supply" variant="outlined" value={totalSupplyA} disabled sx={{ marginY: '10px' }} />
                        <TextField fullWidth label="Token A Balance" variant="outlined" value={balanceA} disabled sx={{ marginY: '10px' }} />
                        <TextField fullWidth label="User APR" variant="outlined" value={userAPRA} disabled sx={{ marginY: '10px' }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', gap: '10px' }}>
                            <Button variant="contained" color="primary" onClick={() => depositTokenA(prompt('Enter amount to deposit Token A:'))}>Deposit Token A</Button>
                            <Button variant="contained" color="error" onClick={() => withdrawTokenA(prompt('Enter amount to withdraw Token A:'))}>Withdraw</Button>
                        </Box>

                        <Typography variant="h6" sx={{ color: '#3399ff', marginTop: '20px' }}>Token B (NFT)</Typography>
                        <Typography variant="body1">Address: {TOKEN_B_ADDRESS}</Typography>
                        <TextField fullWidth label="NFT Balance" variant="outlined" value={balanceB} disabled sx={{ marginY: '10px' }} />
                        <TextField fullWidth label="APR Increase" variant="outlined" value={`${aprIncrease}%`} disabled sx={{ marginY: '10px' }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', gap: '10px' }}>
                            <Button variant="contained" color="primary" onClick={() => depositTokenB(prompt('Enter Token ID to deposit Token B:'))}>Deposit Token B</Button>
                            <Button variant="contained" color="error" onClick={() => withdrawTokenB(prompt('Enter Token ID to withdraw Token B:'))}>Withdraw Token B</Button>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box sx={{ backgroundColor: '#2b2b2b', padding: '20px', borderRadius: '10px' }}>
                        <Typography variant="h6" sx={{ color: '#00ff80', marginBottom: '15px' }}>Staking Information</Typography>

                        <Typography variant="h6" sx={{ color: '#3399ff' }}>Token A Balance</Typography>
                        <Typography>Your Token A deposit balance: {balanceA}</Typography>
                        <Typography>Your pending reward: {pendingRewardA}</Typography>
                        <Typography>Deposit is locked until: {lockTimeA}</Typography>

                        <Typography variant="h6" sx={{ color: '#3399ff', marginTop: '20px' }}>Token B Balance</Typography>
                        <Typography>Your Token B deposit balance: {balanceB}</Typography>
                        <Typography>Token B deposit timestamp: {depositTimestampB}</Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Home;
