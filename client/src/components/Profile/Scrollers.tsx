import React, { useRef, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Root, { UserContext } from '../../Root';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { exiledRedHeadedStepChildrenOptionGroups } from '../../../profile-assets';

const Scrollers = () => {
  const [ref] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: 'free',
    slides: {
      perView: 3,
      spacing: 15,
    },
  });

  const [rideSpeed, setRideSpeed] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [clickedHours, setClickedHours] = useState(false);
  const [clickedMinutes, setClickedMinutes] = useState(false);

  const { workout, durationHours, durationMinutes } =
    exiledRedHeadedStepChildrenOptionGroups;

  const user = useContext(UserContext);

  let weight = user?.weight ?? 0;

  let totalTime = Number(hours) * 60 + Number(minutes);

  useEffect(() => {
    if (clickedHours && clickedMinutes) {
      totalTime = Number(hours) * 60 + Number(minutes);
      console.log(totalTime);
    }
  }, [clickedHours, clickedMinutes]);

  const enterWorkout = () => {
    axios.get('/profile/workout', {
      params: {
        activity: rideSpeed,
        duration: totalTime,
        weight: weight,
      },
    });
  };

  return (
    <div>
      <div>
        <button type='button'>Enter Ride Stats</button>
      </div>
      <div>
        {rideSpeed}
        {hours}
        {minutes}
      </div>
      <div ref={ref} className='keen-slider'>
        {workout.map((activity) => {
          return (
            <React.Fragment key={activity.value}>
              <div className='keen-slider__slide number-slide1'>
                <button
                  type='button'
                  className='customButton'
                  onClick={() => {
                    setRideSpeed(activity.label);
                  }}
                >
                  {activity.label}
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div ref={ref} className='keen-slider'>
        {durationHours.map((hour) => {
          return (
            <React.Fragment key={`${hour.value}-hour`}>
              <div className='keen-slider__slide number-slide1'>
                <button
                  type='button'
                  className='customButton'
                  onClick={() => {
                    setHours(hour.label);
                  }}
                >
                  {hour.label}
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div ref={ref} className='keen-slider'>
        {durationMinutes.map((minute) => {
          return (
            <React.Fragment key={`${minute.value}-minute`}>
              <div className='keen-slider__slide number-slide1'>
                <button
                  type='button'
                  className='customButton'
                  onClick={() => {
                    setMinutes(minute.label);
                  }}
                >
                  {minute.label}
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div>
        <button type='button' onClick={() => enterWorkout()}>Get Ride Stats</button>
      </div>
    </div>
  );
};

export default Scrollers;
