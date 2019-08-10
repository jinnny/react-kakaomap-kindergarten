import React, { Component } from 'react';
import './assets/style/App.scss';
import Header from './components/Header';
// import KakaoMap from 'react-kakao-map';
import KakaoMap from './components/KakaoMap';

class App extends Component {
  
  componentDidMount() {

  }
  render () {
    return (
      <div className="App">
        <Header />
        <KakaoMap
          apiKey="725b06bbcc898a0aab70b933a5386549"
          lat={34.84276621}
          lng={127.8918157}
      />
      </div>
    )
  }
}


export default App;
