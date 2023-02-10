import { useForm, isNotEmpty, isEmail, isInRange, hasLength, matches } from '@mantine/form';
import { Button, Group, TextInput, NumberInput, Box, Text } from '@mantine/core';


const NewPartnership = ({apis}) => {
    const form = useForm({
        initialValues: {
          name: '',
          apis: [],
          image: ''
        },
    
        validate: {
          name: hasLength({ min: 2, max: 10 }, 'Name must be 2-10 characters long'),
          apis: isInRange({ min: 1, max: 2 }, 'You must select 1-10 APIs')
        },
      });

    return (
        <div style={{display:'flex'}}>
            <div>
                <Text>New Partnership</Text>
            </div>
        </div>
    );
}

export default NewPartnership;