import React from 'react';

interface CustomFileUploadProps {
  Name?: string;
  Date?: Date;
  Time?: string;
  Location?: string;
}

const EditPage: React.FC<CustomFileUploadProps> = ({ Name, Date, Time, Location }) => {


    return (
        <>
            <div>
                <label>
                    Event Name:
                    <input type="text" defaultValue={Name} />
                </label>
                <label>
                    Date:
                    <input type="date" defaultValue={Date?.toISOString().split('T')[0]} />
                </label>
                <label>
                    Time:
                    <input type="time" defaultValue={Time} />
                </label>
                <label>
                    Location:
                    <input type="text" defaultValue={Location} />
                </label>
                <button type="submit">Confirm Changes</button>
            </div>
        </>

    );
}




export default EditPage;