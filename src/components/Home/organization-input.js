import { useState } from 'react';
import { Modal, Button, TextInput, createStyles } from '@mantine/core';

const useStyles = createStyles((theme, { floating }) => ({
  root: {
    position: 'relative',
  },

  label: {
    position: 'absolute',
    zIndex: 2,
    left: theme.spacing.sm,
    pointerEvents: 'none',
    color: floating
      ? theme.colorScheme === 'dark'
        ? theme.white
        : theme.black
      : theme.colorScheme === 'dark'
      ? theme.colors.dark[3]
      : theme.colors.gray[5],
    transition: 'transform 150ms ease, color 150ms ease, font-size 150ms ease',
    transform: floating ? `translate(-${theme.spacing.sm}px, -33px)` : 'none',
    fontFamily:'Visuelt',
    fontSize: floating ? theme.fontSizes.xs : theme.fontSizes.sm,
    fontWeight: floating ? 500 : 400,
  },

  required: {
    transition: 'opacity 150ms ease',
    opacity: floating ? 1 : 0,
  },

  input: {
    '&::placeholder': {
      transition: 'color 150ms ease',
      color: !floating ? 'transparent' : true,
    },
  },
}));

function FloatingLabelInput() {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const { classes } = useStyles({ floating: value.trim().length !== 0 || focused });

  return (
    <TextInput
      label="Company Code"
      required
      classNames={classes}
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      mt="md"
      autoComplete="nope"
    />
  );
}

const OrganizationInput = () => {
    return (
            <div style={{display:'flex', justifyContent:'center'}}>
                <FloatingLabelInput style={{ height: 30}} />
            </div>
        
    );
}
export default OrganizationInput;