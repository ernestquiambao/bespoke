import React, { useEffect, useContext, createContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../../Root';
import { useNavigate } from 'react-router-dom';
import ReportsMap from './ReportsMap';
import { Report } from '@prisma/client';
import ReportsList from './ReportsList';
import { BandAid } from '../../StyledComp';

const CreateReport = () => {
  // const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [body, setBody] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const user = useContext(UserContext);

  const handleTypeText = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value);
  };

  const handleTitleText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleBodyText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBody(event.target.value);
  };

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImage(event.target.files?.[0] || null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    try {
      if (!currentLocation) {
        throw new Error('Current location not available');
      }
      const { email, id } = user;
      const formData = new FormData();
      formData.append('userId', id);
      formData.append('userEmail', email);
      formData.append('body', body);
      formData.append('type', type);
      formData.append('title', title);
      formData.append('latitude', currentLocation.lat.toString());
      formData.append('longitude', currentLocation.lng.toString());
      image && formData.append('file', image);

      console.log(formData);
      const response = await axios.post<Report>('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setReports([...reports, response.data]);
      setBody('');
      setType('');
      setImage(null);
    } catch (error: any) {
      console.error(error.message);
      setError(error.message);
    }
  };

  //interval used to have its type set to: NodeJS.Timeout | null
  useEffect(() => {
    let interval: any | undefined;
    if (navigator.geolocation) {
      interval = setInterval(() => {
        if (!navigator.geolocation) {
          setError('Geolocation is not supported by this browser.');
          clearInterval(interval!);
          return;
        }
        var geoOps = {
          enableHighAccuracy: false,
          timeout: 10000,
        };
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            clearInterval(interval!);
            interval = null;
          },
          (error) => {
            setError(error.message);
          },
          geoOps
        );
      }, 1000);
    } else {
      setError('Geolocation is not supported by this browser.');
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, []);

  return (
    <BandAid>
      <h1>Reports</h1>
      <div>
        <ReportsMap />
      </div>
      <h2>Make a Report</h2>
      <form onSubmit={handleSubmit}>
        <select id='report-type-input' onChange={handleTypeText}>
          <option value=''>Select a Report Type</option>
          <option value='Road Hazard'>Road Hazard</option>
          <option value='Theft Alert'>Theft Alert</option>
          <option value='Collision'>Collision</option>
          <option value='Point of Interest'>Point of Interest</option>
        </select>
        <input
          id='report-title-input'
          type='text'
          placeholder='Report Title'
          onChange={handleTitleText}
        />
        <input
          id='report-body-input'
          type='text'
          placeholder='Comments'
          onChange={handleBodyText}
        />
        <input
          id='file'
          type='file'
          name='file'
          accept='image/*'
          onChange={handleImage}
        />
        <input type='submit' value='submit' />
      </form>
    </BandAid>
  );
};

export default CreateReport;
