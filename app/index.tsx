import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import ApiCall from './apiCall';

const App = () => {
  const [clickedButton, setClickedButton] = useState(false);
  const handleClick = () => {
    setClickedButton(true);
  };

  return (
    <View>
      <button onClick={handleClick}>Click button</button>
      {clickedButton && <ApiCall />}
    </View>
  );
};

export default App;