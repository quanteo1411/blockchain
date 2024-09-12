import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../contexts/Web3Context";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Select,
    MenuItem,
} from "@mui/material";
import { useSnackbar } from 'notistack'; // Import useSnackbar từ notistack

const History = () => {
    const { address, isAdmin, stakingContract, updateBaseAPR } = useWeb3();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("timestamp");
    const [sortOrder, setSortOrder] = useState("desc");
    const [newAPR, setNewAPR] = useState("");

    const { enqueueSnackbar } = useSnackbar(); // Sử dụng useSnackbar

    useEffect(() => {
        if (address) {
            fetchTransactions();
        }
    }, [address, isAdmin, page, limit, sortBy, sortOrder, searchQuery]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages); // Điều chỉnh trang nếu vượt quá tổng số trang
        }
    }, [totalPages, page]);

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = `${import.meta.env.VITE_BE_API}/transactions`;
            const url = isAdmin
                ? `${baseUrl}/all`
                : `${baseUrl}/user/${address}`;

            const queryParams = new URLSearchParams({
                page,
                limit,
                sortBy,
                sortOrder,
                search: searchQuery,
            }).toString();

            const response = await fetch(`${url}?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTransactions(data.docs);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setError(error.message);
            enqueueSnackbar(`Không thể lấy giao dịch: ${error.message}`, { variant: 'error' }); // Sử dụng enqueueSnackbar
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchTransactions();
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const handleSortOrderChange = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    const handleUpdateAPR = async () => {
        if (!newAPR || isNaN(newAPR) || newAPR <= 0) {
            enqueueSnackbar("Vui lòng nhập APR hợp lệ lớn hơn 0", { variant: 'error' }); // Sử dụng enqueueSnackbar
            return;
        }

        setLoading(true);
        try {
            const tx = await stakingContract.updateBaseAPR(
                Math.floor(newAPR * 100),
                { gasLimit: 900000 }
            );
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                enqueueSnackbar("Cập nhật APR thành công", { variant: 'success' }); // Sử dụng enqueueSnackbar
                updateBaseAPR();
                setNewAPR("");
            } else {
                enqueueSnackbar("Giao dịch thất bại. Vui lòng thử lại.", { variant: 'error' }); // Sử dụng enqueueSnackbar
            }
        } catch (error) {
            console.error("Lỗi giao dịch:", error);
            enqueueSnackbar(`Giao dịch thất bại: ${error.message}`, { variant: 'error' }); // Sử dụng enqueueSnackbar
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin && !address) {
        return (
            <Typography>
                Vui lòng kết nối ví của bạn để xem giao dịch.
            </Typography>
        );
    }

    return (
        <div className="container mx-auto bg-white-800 p-4">
            <Typography variant="h4" gutterBottom>
                {isAdmin ? "Tất cả giao dịch" : "Giao dịch của bạn"}
            </Typography>
            {isAdmin && (
                <div className="mb-4">
                    <TextField
                        label="APR mới (%)"
                        type="number"
                        value={newAPR}
                        onChange={(e) => setNewAPR(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateAPR}
                        disabled={loading || !newAPR || isNaN(newAPR)}
                    >
                        Cập nhật APR
                    </Button>
                </div>
            )}
            <div className="mb-4 flex items-center space-x-2">
                <TextField
                    label="Tìm kiếm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    disabled={!searchQuery}
                >
                    Tìm kiếm
                </Button>
                <Select value={sortBy} onChange={handleSortChange}>
                    <MenuItem value="timestamp">Thời gian</MenuItem>
                    <MenuItem value="eventType">Loại sự kiện</MenuItem>
                    <MenuItem value="amount">Số tiền</MenuItem>
                </Select>
                <Button variant="outlined" onClick={handleSortOrderChange}>
                    {sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
                </Button>
            </div>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Địa chỉ gửi</TableCell>
                                <TableCell>Địa chỉ nhận</TableCell>
                                <TableCell>Số tiền (TON)</TableCell>
                                <TableCell>Thời gian</TableCell>
                                <TableCell>Loại sự kiện</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx._id}>
                                    <TableCell>{tx.fromAddress}</TableCell>
                                    <TableCell>{tx.toAddress}</TableCell>
                                    <TableCell>
                                        {Number(ethers.utils.formatEther(tx.amount)).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(tx.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{tx.eventType}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <div className="mt-4 flex justify-between items-center">
                <div>
                    <Button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Trang trước
                    </Button>
                    <span className="mx-2">
                        Trang {page} của {totalPages}
                    </span>
                    <Button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Trang sau
                    </Button>
                </div>
                <Select
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                >
                    <MenuItem value={10}>10 mỗi trang</MenuItem>
                    <MenuItem value={25}>25 mỗi trang</MenuItem>
                </Select>
            </div>
        </div>
    );
};

export default History;
