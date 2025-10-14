// src/components/stores/StoreCard.jsx
import React, { useState } from 'react';
import {
  Card, CardContent, CardActions, Typography, Box,
  Button, IconButton, Chip, Avatar, Divider,
  Menu, MenuItem, alpha, useTheme
} from '@mui/material';
import {
  Edit, Visibility, Store, MoreVert, Star, StarBorder,
  LocationOn, Phone, Email, Share, Delete
} from '@mui/icons-material';

const StoreCard = ({ 
  store, 
  onEdit, 
  onDelete, 
  onView, 
  onToggleFavorite 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'default';
      case 'Maintenance':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Card
      onClick={() => onView(store.id)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
          borderColor: alpha(theme.palette.primary.main, 0.4)
        }
      }}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="flex-start" 
          mb={2}
        >
          <Box display="flex" gap={2} flex={1} minWidth={0}>
            <Avatar 
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                color: theme.palette.primary.main, 
                width: 50, 
                height: 50 
              }}
            >
              <Store sx={{ fontSize: 28 }} />
            </Avatar>
            <Box minWidth={0} flex={1}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 0.5, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}
              >
                {store.name}
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                <Chip 
                  label={`ID: ${store.id}`} 
                  size="small" 
                  variant="outlined" 
                />
                {store.cashbook_count !== undefined && (
                  <Chip 
                    label={`${store.cashbook_count} Cashbook${store.cashbook_count !== 1 ? 's' : ''}`} 
                    size="small" 
                    color="primary" 
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
            <IconButton
              size="small"
              onClick={(e) => { 
                e.stopPropagation(); 
                onToggleFavorite(store.id); 
              }}
              sx={{
                bgcolor: store.isFavorite 
                  ? alpha(theme.palette.warning.main, 0.15) 
                  : 'transparent',
                '&:hover': { 
                  bgcolor: alpha(theme.palette.warning.main, 0.25) 
                }
              }}
            >
              {store.isFavorite ? (
                <Star sx={{ color: theme.palette.warning.main }} />
              ) : (
                <StarBorder />
              )}
            </IconButton>

            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Description */}
        {store.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {store.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Contact Info */}
        <Box display="flex" flexDirection="column" gap={1}>
          {store.address && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                noWrap
                sx={{ flex: 1 }}
              >
                {store.address}
              </Typography>
            </Box>
          )}
          {store.contact_number && (
            <Box display="flex" alignItems="center" gap={1}>
              <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {store.contact_number}
              </Typography>
            </Box>
          )}
          {store.email && (
            <Box display="flex" alignItems="center" gap={1}>
              <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {store.email}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status & Dates */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip
            label={store.status || 'Active'}
            size="small"
            color={getStatusColor(store.status || 'Active')}
            variant="outlined"
          />
          <Box>
            {store.updated_at && (
              <Typography variant="caption" color="text.secondary">
                Updated: {new Date(store.updated_at).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Card Actions */}
      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button 
          size="small" 
          variant="outlined" 
          startIcon={<Visibility />} 
          fullWidth 
          onClick={(e) => { 
            e.stopPropagation(); 
            onView(store.id); 
          }}
        >
          View
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          startIcon={<Edit />} 
          fullWidth 
          onClick={(e) => { 
            e.stopPropagation(); 
            onEdit(store); 
          }}
        >
          Edit
        </Button>
      </CardActions>

      {/* Context Menu */}
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => { 
            onEdit(store); 
            handleMenuClose(); 
          }}
        >
          <Edit sx={{ mr: 1, fontSize: 20 }} /> Edit Store
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            onView(store.id); 
            handleMenuClose(); 
          }}
        >
          <Visibility sx={{ mr: 1, fontSize: 20 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Share sx={{ mr: 1, fontSize: 20 }} /> Share Store
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => { 
            onDelete(store.id, store.name); 
            handleMenuClose(); 
          }} 
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1, fontSize: 20 }} /> Delete Store
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default StoreCard;