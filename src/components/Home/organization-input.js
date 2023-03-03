import { useState } from 'react';
import { Modal, Button, TextInput, createStyles } from '@mantine/core';

const useStyles = createStyles((theme, { floating }) => ({

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