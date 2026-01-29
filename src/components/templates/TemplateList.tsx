import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add,
  Description,
  Edit,
  Delete,
  ContentCopy,
  Assessment,
} from '@mui/icons-material';
import { DocumentTemplate } from '@/types/document';

interface TemplateListProps {
  templates: DocumentTemplate[];
  onCreateTemplate: () => void;
  onEditTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Description color="primary" />
            </Paper>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Document Templates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage your templates
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
            >
              View Reports
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={onCreateTemplate}
            >
              New Template
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ p: 4 }}>
        {templates.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 12,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: 'action.hover',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Description sx={{ fontSize: 48, color: 'text.secondary' }} />
            </Paper>
            <Typography variant="h6" gutterBottom>
              No templates yet
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400, mb: 3 }}>
              Create your first template to start generating professional documents with consistent headers and footers.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={onCreateTemplate}
            >
              Create Your First Template
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 3,
            }}
          >
            {templates.map((template) => (
              <Card
                key={template.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => onEditTemplate(template.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        backgroundColor: 'primary.main',
                        borderRadius: 1,
                      }}
                    >
                      <Description sx={{ color: 'primary.contrastText' }} />
                    </Paper>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {template.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Updated {formatDate(template.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 40,
                  }}>
                    {template.headerContent ? 'Header configured' : 'No header'} • 
                    {template.footerContent ? ' Footer configured' : ' No footer'}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTemplate(template.id);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicate">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateTemplate(template.id);
                      }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTemplate(template.id);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
