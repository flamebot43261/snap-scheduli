import React from 'react';
import { StyleSheet, View } from 'react-native';
import FormBack from './Components/FormBack';

const App = () => {
  return (
    <View style={styles.container}>
      <FormBack />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;