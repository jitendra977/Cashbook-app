import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    Chip,
    Typography
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const UserTable = ({ users, onEdit, onDelete }) => {
    // Safety check - ensure users is an array
    const safeUsers = Array.isArray(users) ? users : [];

    if (safeUsers.length === 0) {
        return (
            <Paper sx={{ p: 3 }}>
                <Typography align="center" color="textSecondary">
                    No users found
                </Typography>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {safeUsers.map((user) => (
                        <TableRow key={user.id} hover>

                            <TableCell>{user.id}</TableCell>
                            <TableCell>
                                <img src={user.profile_image} alt={user.username} width={50} height={50} />
                            </TableCell>
                            <TableCell>
                                <Chip label={user.username} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.user_permissions || '-'}</TableCell>
                            <TableCell>
                                {user.first_name} {user.last_name}
                            </TableCell>
                            <TableCell>{user.phone_number || '-'}</TableCell>
                            <TableCell align="center">
                                <Box display="flex" gap={1} justifyContent="center">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Edit />}
                                        onClick={() => onEdit(user)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => onDelete(user.id)}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserTable;