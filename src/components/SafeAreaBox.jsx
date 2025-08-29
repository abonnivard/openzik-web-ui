import React from 'react';
import { Box } from '@mui/material';
import { isIOS } from '../utils/platform';

const SafeAreaBox = ({ children, top = true, bottom = true, ...props }) => {
  if (!isIOS()) {
    return <Box {...props}>{children}</Box>;
  }

  return (
    <Box
      {...props}
      sx={{
        ...props.sx,
        paddingTop: top ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: bottom ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {children}
    </Box>
  );
};

export default SafeAreaBox;
