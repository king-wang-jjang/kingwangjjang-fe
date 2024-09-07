import { Box, Typography } from "@mui/material";

interface props {
    label: string
    bgcolor: string
}

const Label = ({label, bgcolor}: props) =>{
    const width = `${label.length * 14}px`;
    return (
        <Box sx={{
            width: width,
            height: 'fit-content',
            borderRadius: 1,
            bgcolor: bgcolor,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant='caption' color={'white'}>
              {label}
            </Typography>
        </Box>
    )
}

export default Label
