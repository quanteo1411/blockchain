import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import { useWeb3 } from './contexts/Web3Context';
import { Alert, Container } from '@mui/material';
import { useSnackbar } from 'notistack'; // Import useSnackbar từ notistack
import 'bootstrap/dist/css/bootstrap.min.css';
import AppRoutes from './AppRoutes';

function App() {
    const { chainId } = useWeb3();
    const TESTNET_CHAIN_ID = 97; // Chain ID của BSC Testnet
    const { enqueueSnackbar } = useSnackbar(); // Sử dụng enqueueSnackbar để hiển thị thông báo

    useEffect(() => {
        // Không cần toast.configure() nữa
    }, []);

    useEffect(() => {
        if (chainId && chainId !== TESTNET_CHAIN_ID) {
            // Hiển thị thông báo lỗi bằng Notistack
            enqueueSnackbar("You are connected to the wrong network. Please switch to the BSC Testnet.", { 
                variant: 'error',
                autoHideDuration: 3000, 
                anchorOrigin: { vertical: 'top', horizontal: 'right' } 
            });

            if (window.ethereum) {
                window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x61' }] // Chain ID của BSC Testnet dưới dạng hex
                }).catch((error) => {
                    console.error("Error when switching network:", error);
                });
            } else {
                console.warn("Metamask is not installed.");
            }
        }
    }, [chainId, enqueueSnackbar]);

    return (
        <Router>
            <div className="App">
                <Header />
                {chainId && chainId !== TESTNET_CHAIN_ID && (
                    <Container className="mt-3">
                        <Alert severity="error">
                            You are connected to the wrong network. Please switch to the BSC Testnet.
                        </Alert>
                    </Container>
                )}
                <AppRoutes />
            </div>
        </Router>
    );
}

export default App;
