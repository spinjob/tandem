import { useRef, useState } from 'react';
import { Text, Group, Card,Button, createStyles} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import {CiImport} from 'react-icons/ci'
import {VscBracketError} from 'react-icons/vsc'
import {TbFileCode} from 'react-icons/tb'
import axios from 'axios';

type Props = {
  owning_organization: string;
  importing_organization: string;
  userId: string;
  setUploadJob: (job: any | undefined) => void;
  addToPartnership: boolean | undefined;
  partnershipId: string | undefined;
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    marginBottom: 30,
  },

  dropzone: {
    borderWidth: 1,
    paddingBottom: 50,
  },

  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4],
  },

  control: {
    position: 'absolute',
    width: 250,
    left: 'calc(50% - 125px)',
    bottom: -20,
  },
}));

async function processJsonFile (file: any, userId: string, owning_organization: string, importing_organization: string, addToPartnership: boolean = false, partnershipId: string = '') {

  var updatedFile = {
    "spec": file,
    "userId": userId,
    "owning_organization": owning_organization,
    "importing_organization": importing_organization
  }
  return new Promise((resolve, reject) => {
    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL+'/interfaces/upload', updatedFile).then((res) => {
      
      if(res.status === 200) {
        if(addToPartnership) {
          // New API request to get the actual API's UUID
          axios.get(process.env.NEXT_PUBLIC_API_BASE_URL+'/interfaces', {params:{job: res.data.uuid}}).then((res2) => {
            axios.put(process.env.NEXT_PUBLIC_API_BASE_URL+'/projects/'+partnershipId, {
              'interfaces':[res2.data.uuid]
            }).then((res3) => {
              resolve(res3.data)
            }).catch((err) => {
              console.log(err)
              reject({status: 'Error',message: err})
            })
          }).catch((err) => {
            console.log(err)
            reject({status: 'Error',message: err})
          })
        } else {
          resolve(res.data)
        }
      }
    }).catch((err) => {
      console.log(err)
      reject({status: 'Error',message: err})
    })
  });
}

const ImportApiDropzone: React.FC<Props> = ({owning_organization, importing_organization, userId, setUploadJob, addToPartnership, partnershipId}) => {
  const { classes, theme } = useStyles();
  const openRef = useRef<() => void>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  return (

    <div className={classes.wrapper}>
      <Dropzone
        loading={isLoading}
        openRef={openRef}
        
        onDrop={(acceptedFiles) => {
          acceptedFiles.forEach((file) => {
            console.log(file)
            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = () => {
              const binaryStr = reader.result;
              var json = JSON.parse(binaryStr as string)
              processJsonFile(json, userId, owning_organization, importing_organization, addToPartnership, partnershipId).then((res) => {
                setResult(res)
                setUploadJob(res)
                setIsLoading(false);
              }).catch((err) => {
                console.log(err)
                setResult(err)
                setIsLoading(false);
              })
            };
            reader.readAsText(file);
          })
        }}
        className={classes.dropzone}
        radius="md"
        accept={['application/json']}
        style={{backgroundColor: '#F8F6F3', border: '0px'}}
      >
        <div style={{ pointerEvents: 'none' }}>
          <Text align="center" style={{fontFamily: 'Visuelt', color:'#5A5A5A'}} size="lg" mt="xl">
            <Dropzone.Accept>
              <CiImport size={50} color={'#b4f481'}/>
              <Text>Drop to Import</Text>
            </Dropzone.Accept>
            <Dropzone.Reject>
              <VscBracketError size={50} color={'#ff7e35'}/>
              <Text>File must be in JSON</Text>
            </Dropzone.Reject>
            <Dropzone.Idle>
                <TbFileCode
                  size={50}
                  color={'#BABABA'}
                />
                <Text style={{fontSize: '15px', paddingTop: 10}} >Click to upload or drag & drop</Text>
            </Dropzone.Idle>
          </Text>
        </div>
      </Dropzone>

      {/* <Button className={classes.control} sx={{
        fontFamily: 'Visuelt', 
        fontWeight: 100, 
        backgroundColor: '#9595ff', 
        color: 'white',
        '&:hover': {
          backgroundColor: '#b5b6ff',
        }
      }} size="md" radius="xl" onClick={() => openRef.current?.()}>
        Select files
      </Button> */}
    </div>
  );
}

export default ImportApiDropzone;