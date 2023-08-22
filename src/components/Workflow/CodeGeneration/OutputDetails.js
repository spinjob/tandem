import React from "react";
import { Text } from "@mantine/core";
const OutputDetails = ({ outputDetails }) => {
  return (
    <div style={{border:'1px solid black', padding: 10, borderRadius: 10}}>
      <div style={{display:'flex', flexDirection: 'row', alignItems:'center', height: 40}}>
        <Text style={{fontFamily: 'Visuelt'}}>
                Status: 
        </Text>
        <div style={{width: 10}} />
        <Text style={{fontFamily: 'apercu-regular-pro', fontWeight:'light'}}>
            {outputDetails?.status?.description}
        </Text>
      </div>
      <div style={{display:'flex', flexDirection: 'row', alignItems:'center', height: 40}}>
        <Text style={{fontFamily: 'Visuelt'}}>
                Memory: 
        </Text>
        <div style={{width: 10}} />
        <Text style={{fontFamily: 'apercu-regular-pro', fontWeight:'light'}}>
            {outputDetails?.memory}
        </Text>
      </div>
      <div style={{display:'flex', flexDirection: 'row', alignItems:'center', height: 40}}>
        <Text style={{fontFamily: 'Visuelt'}}>
                Time: 
        </Text>
        <div style={{width: 10}} />
        <Text style={{fontFamily: 'apercu-regular-pro', fontWeight:'light'}}>
            {outputDetails?.time}
        </Text>
      </div> 
    </div>
  );
};

export default OutputDetails;