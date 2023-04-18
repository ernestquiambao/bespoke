import React, { useState } from 'react';



/*
 -Submitting the report will save to the same table as "post"
with some field to signify it as a report so it's view on the map can be managed.
 -Type will have limited options.  Hazard(road, theft) POI(resource(water fountain, repair station, bike shop))
 -Location field will be necessary to render to map (geolocation)
*/
const CreateReport = () => {

    //  add state
    const [body, setBody] = useState('');
    const [type, setType] = useState('');

    //  function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault(); // prevent page refresh on form submit
        const reportType = document.getElementById('report-type-input').value;
        const reportBody = document.getElementById('report-body-input').value;
        setBody(reportBody);
        setType(reportType);
    }

  return (
    <div>
      <div>
        <form onSubmit={handleSubmit}>
            <input id="report-type-input" type="text" placeholder='Report Type'/>
            <input id="report-body-input" type="text" placeholder='Comments'/>
            <input type="submit" value='submit' />
        </form>
        <p>Report Body: {body}</p>
        <p>Report Type: {type}</p>
      </div>
    </div>
  );
};

export default CreateReport;