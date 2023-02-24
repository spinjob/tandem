import {Button, Modal} from '@mantine/core'
import {useState} from 'react'
import axios from 'axios'
import ConfigurationTable from '../../../components/Partnerships/configuration-table'

const PartnershipConfigurations = ({ partnership }) => {

    const testData = [{
        id: 1,
        key: 'test',
        value: 'test_value',
        type: 'String'
    }]

    const [modalOpened, setModalOpened] = useState(false)

    return (
        <div>
            
            <ConfigurationTable data={testData}/>
            <div style={{height: 50}}/>
            <div 
                style={{
                    width: '100%', 
                    backgroundColor:'#F8F6F3', 
                    height: 90,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 30,
                    borderRadius: 10
                }}>
                <Button
                    sx={{
                        backgroundColor: '#B4F481',
                        color: 'black',
                        fontFamily: 'Visuelt', 
                        fontSize: '16px',
                        borderColor: 'black',
                        border: '2px solid black',
                        '&:hover': {
                            backgroundColor: '#D9FAC0',
                        }
                    }}    
                    size={'lg'}>
                    Add New
                </Button>
                <Button
                    sx={{
                        backgroundColor: 'white',
                        color: 'black',
                        fontFamily: 'Visuelt', 
                        fontSize: '16px',
                        borderColor: 'black',
                        border: '2px solid black',
                        '&:hover': {
                            backgroundColor: '#FBFAF9'
                        }
                    }}    
                    size={'lg'}>
                    Edit Keys
                </Button>
            </div>
        </div>
    )
}

export default PartnershipConfigurations