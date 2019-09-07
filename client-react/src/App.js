import React from 'react';
import './App.css';
import { ThemeProvider, createTheme, Arwes } from 'arwes';
import Routes from './Routes';

const App = () => (
  <ThemeProvider theme={createTheme()}>
    <Arwes>
      <Routes />
    </Arwes>
  </ThemeProvider>
);

export default App;
