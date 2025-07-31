import React from 'react';
import styles from '../app.module.css';

interface CustomFileUploadProps {
    UID: number;
    Name?: string;
    BeginDate?: Date;
    EndDate?: Date;
    BeginTime?: string;
    EndTime?: string;
    AllDay?: boolean;
    Description?: string;
    Location?: string;
    URL?: string;
}

const EventBubble: React.FC<CustomFileUploadProps> = ({ Name, BeginDate, EndDate, BeginTime, EndTime, AllDay, Description, Location, URL }) => {


    return (
        <>
            <div className={styles.EventBubble}>
                <label>
                    Event Name:
                    <input type="text" defaultValue={Name} />
                </label>
                <br />
                <label>
                    BeginDate:
                    <input type="date" defaultValue={BeginDate?.toISOString().split('T')[0]} />
                </label>
                <label>
                    EndDate:
                    <input type="date" defaultValue={EndDate?.toISOString().split('T')[0]} />
                </label>
                <br />
                <label>
                    BeginTime:
                    <input type="time" defaultValue={BeginTime} />
                </label>
                <label>
                    EndTime:
                    <input type="time" defaultValue={EndTime} />
                </label>
                <label>
                    All Day:
                    <input type="checkbox" defaultChecked={AllDay} />
                </label>
                <br />
                <label>
                    Description:
                    <textarea style={{
                        width: "100%",
                        height: "100px",
                        resize: "none",
                        overflowY: "auto",
                        overflowX: "hidden",
                        padding: "8px",
                        boxSizing: "border-box"
                    }} defaultValue={Description} />
                </label>
                <br />
                <label>
                    Location:
                    <input type="text" defaultValue={Location} />
                </label>
                <label>
                    URL:
                    <input type="text" defaultValue={URL} />
                </label>
            </div>
        </>

    );
}




export default EventBubble;