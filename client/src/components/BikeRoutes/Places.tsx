import React, { useState } from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from 'react-places-autocomplete';
import {
  InputLayout,
  AutoCompleteDropdownLayout,
  RouteButtonContainer,
} from '../../StyledComp';
import { Button } from '@mui/material';
// import NavigationIcon from '@mui/icons-material/Navigation';
// import SaveAltIcon from '@mui/icons-material/SaveAlt';
// import SearchIcon from '@mui/icons-material/Search';

// Starting Props //
type PlaceProps = {
  setStartingPoint: (position: google.maps.LatLngLiteral) => void;
  fetchDirections: () => void;
  selected: google.maps.LatLngLiteral | undefined;
  setOpenPopup: React.Dispatch<React.SetStateAction<boolean>>;
  directions: google.maps.DirectionsResult | undefined;
  setOpenSearch: React.Dispatch<React.SetStateAction<boolean>>;
};

const Places = ({
  setStartingPoint,
  fetchDirections,
  selected,
  setOpenPopup,
  directions,
  setOpenSearch,
}: PlaceProps) => {
  const [currAdd, setCurrAdd] = useState<string>('');

  // Handle the input box //
  const handleChange = (value: string): void => {
    setCurrAdd(value);
  };

  const handleSelect = (value: string): void => {
    // setCurrAdd(value);
    geocodeByAddress(value).then((result: any): void => {
      setCurrAdd(result[0].formatted_address);
      getLatLng(result[0]).then((coordinates) => {
        setStartingPoint({
          lat: coordinates.lat,
          lng: coordinates.lng,
        });
      });
    });
  };
  // End of the input handlers //

  const handleRoute = (): void => {
    fetchDirections();
  };

  return (
    <div style={{ position: 'relative' }}>
      <PlacesAutocomplete
        value={currAdd}
        onChange={handleChange}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            {/* <RouteButtonContainer>
              <Button
                variant='contained'
                sx={{ marginRight: '5px', marginLeft: '5px' }}
                onClick={handleRoute}
              >
                <NavigationIcon />
              </Button>
              <Button
                variant='contained'
                sx={{ marginRight: '5px', marginLeft: '5px' }}
                onClick={() => {
                  if (directions) {
                    setOpenPopup(true);
                  }
                }}
              >
                <SaveAltIcon />
              </Button>
              <Button
                variant='contained'
                sx={{ marginRight: '5px', marginLeft: '5px' }}
                onClick={() => setOpenSearch(true)}
              >
                <SearchIcon />
              </Button>
            </RouteButtonContainer> */}

            <InputLayout
              id='address-input'
              {...getInputProps({
                placeholder: 'Set Staring Location ...',
                className: 'location-search-input',
              })}
            />

            {suggestions.length > 0 && (
              <AutoCompleteDropdownLayout>
                {loading && <div>Loading...</div>}
                {suggestions.map((suggestion) => {
                  const className = suggestion.active
                    ? 'suggestion-item--active'
                    : 'suggestion-item';
                  // inline style for demonstration purpose
                  const style = suggestion.active
                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                  const key = suggestion.placeId;

                  return (
                    <div
                      {...getSuggestionItemProps(suggestion, {
                        className,
                        style,
                      })}
                      key={key}
                    >
                      <span>{suggestion.description}</span>
                    </div>
                  );
                })}
              </AutoCompleteDropdownLayout>
            )}
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  );
};

export default Places;
