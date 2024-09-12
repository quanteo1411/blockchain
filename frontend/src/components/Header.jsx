import React from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { Button, Typography } from '@mui/material'

const Header = () => {
    const { address, connectWallet, provider, tokenABalance, nftBBalance, baseAPR } = useWeb3()

    const handleConnect = async () => {
        if (provider) {
            await connectWallet(provider);
        } else {
            console.error('No provider available');
            alert('Please install MetaMask!');
        }
    };    

    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <nav>
                    <ul className="flex space-x-4">
                        <li className='text-white hover:text-gray-400'><Link to="/">Home</Link></li>
                        <li className='text-white hover:text-gray-400'><Link to="/history">History</Link></li>
                        <li className='text-white hover:text-gray-400'><Link to="/admin">Admin</Link></li>
                    </ul>
                </nav>
                <div className="flex items-center space-x-4">
                    {baseAPR !== undefined && baseAPR !== null && (
                        <Typography variant="body2" className="text-yellow-400">
                            Base APR: {baseAPR}%
                        </Typography>
                    )}
                    {address ? (
                        <>
                            <span>TokenA: {tokenABalance}</span>
                            <span>NFTB: {nftBBalance}</span>
                            <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                        </>
                    ) : (
                        <Button variant="contained" color="primary" onClick={handleConnect}>
                            Connect Wallet
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header;
