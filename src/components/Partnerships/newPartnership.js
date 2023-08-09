import { useForm } from '@mantine/form';
import { useRouter } from 'next/router'
import { TextInput, Button, MultiSelect, Loader, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {useEffect, useState} from 'react';
import axios from 'axios';
import {useUser} from '@auth0/nextjs-auth0/client'

const NewPartnership= ({apis, organization, toggleModal}) => {
  const { user, error } = useUser();
  const [apiValue, onApiChange] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const SelectApi = ({apiOptions}) => {  
    return (
      <MultiSelect
        label={<Text sx={{fontSize: '20px', paddingBottom: 10, fontFamily: 'Visuelt'}}>
          Select Required APIs
        </Text>}
        maxSelectedValues={2}
        placeholder="Select up to 2 APIs"
        data={apiOptions}
        sx={{
          '& select': {
            border: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent',
          },
          
        }}
        value={apiValue}
        onChange={updateApiValue}
        />
      );
    };

  const updateApiValue = (value) => {
    onApiChange(value)
    form.setFieldValue('apis', value)
  }

  const form = useForm({
    initialValues: { name: '', apis: [] },
    validate: {
      name: (value) => (value.length < 1 ? 'Name must not be empty' : null),
      apis: (value) => (value.length < 1 ? null : 'Select at least one API.'),
    },
  });

  const handleError = (errors) => {
    // if (errors.name) {
    //   showNotification({ message: 'Please fill name field', color: 'red' });
    // } else if (errors.email) {
    //   showNotification({ message: 'Please provide a valid email', color: 'red' });
    // }
  };

  const handleSubmit = (values) => {
    const partnershipName = form.values.name
    const newValues = { partnershipName, apis: apiValue}
    createPartnership(newValues);
  };

  const createPartnership = (newValues) => {
    setLoading(true)
    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/new', 
     {
        name: newValues.partnershipName,
        interfaces: newValues.apis,
        workflows: [],
        organizationId: organization,
        created_by: user?.sub
     }
    )
    .then((response) => {
      router.push('/partnerships/'+ response.data.uuid)
      setLoading(false)
      console.log(response)
    })
    .catch((error) => {
      setLoading(false)
      console.log(error)
    })
  }

  useEffect(() => {
    if (form.values.name.length > 0 && apiValue.length > 0) {
      setCanSubmit(true)
    } else {
      setCanSubmit(false)
    }
  }, [form.values.name, apiValue])

  return loading? (
        <Loader />
  ) 
  : (
    <form onSubmit={form.onSubmit(handleSubmit, handleError)}>
      <TextInput sx={{paddingBottom: 20}} label={<Text sx={{paddingBottom: 10, fontSize: '20px', fontFamily: 'Visuelt'}}>
        Integration Name
      </Text>} placeholder="Enter a name for your partnership." {...form.getInputProps('name')} />
      <SelectApi apiOptions={
        apis.map((api) => {
          return { label: api.name, value: api.uuid }
        })} 
      />
      <div style={{paddingTop: 20}} />
      <Button sx={{
        width: '100%',
        backgroundColor: '#1A1A1A',
        color: 'white',
        '&:hover': {
          backgroundColor: '#3e3e3e',
          color: 'white',
        },
        }} onClick={handleSubmit} disabled={!canSubmit} type="submit" mt="sm">
        Create Integration
      </Button>
    </form>
  );
}

export default NewPartnership;



