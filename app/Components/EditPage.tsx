import React from 'react';
import styles from '../app.module.css';
import EventBubble from './EventBubble';

interface CustomFileUploadProps {
  onApiComplete: (status: boolean) => void;
  width?: string;
  height?: string;
}

const EditPage: React.FC<CustomFileUploadProps> = ({ width, height, onApiComplete }) => {

    const handleSubmit = () => {
        onApiComplete(true);
        console.log("ICS file ready for download");
    }

    return (
        <>
            <div style={{ overflowY: 'scroll', height: '100%', width: '100%', alignContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <form style={{gap: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <h1>Revise Events As Needed</h1>
                    <EventBubble
                        UID={1}
                        Name="Sample Event"
                        BeginDate={new Date()}
                        EndDate={new Date()}
                        BeginTime="09:00"
                        EndTime="10:00"
                        AllDay={false}
                        Description="This is a sample event description."
                        Location="Sample Location"
                        URL="http://example.com"
                    />
                    <EventBubble
                        UID={2}
                        Name="Another Event"
                        BeginDate={new Date()}
                        EndDate={new Date()}
                        BeginTime="11:00"
                        EndTime="12:00"
                        AllDay={true}
                        Description="This is another sample event description."
                        Location="Another Location"
                        URL="http://example.com/another"
                    />
                    <EventBubble
                        UID={3}
                        Name="Third Event"
                        BeginDate={new Date()}
                        EndDate={new Date()}
                        BeginTime="13:00"
                        EndTime="14:00"
                        AllDay={false}
                        Description="This is a third sample event description."
                        Location="Third Location"
                        URL="http://example.com/third"
                    />
                    <button type="submit" onClick={handleSubmit} className={styles.uploadButton}>Get Downloadable ICS File</button>
                </form> 
            </div>
                
        </>

    );
}




export default EditPage;