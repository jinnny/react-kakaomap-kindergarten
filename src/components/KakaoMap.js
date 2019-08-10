import React, { Component } from 'react';
import axios from 'axios';

class KakaoMap extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            sdkLoaded: false,
            locations: [],
            geoLocation: [],
        };
    }
    loadKakaoSdk = () => {
        const { apiKey } = this.props;
        ((d, s, id, cb) => {
            const element = d.getElementsByTagName(s)[0];
            const fjs = element;
            let js = element;
            js = d.createElement(s);
            js.id = id;
            js.src =
                `https://dapi.kakao.com/v2/maps/sdk.js?appKey=${apiKey}&libraries=services,clusterer,drawing&autoload=false`;
            fjs.parentNode.insertBefore(js, fjs);
            js.onload = cb;
        })(document, 'script', 'kakaomap-sdk', () => {
            this.el = document.getElementById('kakao-map');
            this.kakao = window.kakao;
            this.kakao.maps.load( () => {
                // 위치 받아오기
                this._getLocation();
                let centerLatLng = new this.kakao.maps.LatLng(this.props.lat, this.props.lng);
                if(this.state.geoLocation.length === 0 ){
                    centerLatLng = new this.kakao.maps.LatLng(this.props.lat, this.props.lng);
                    console.log(centerLatLng,'빈값');
                }else {
                    centerLatLng = new this.kakao.maps.LatLng(this.state.geoLocation[0], this.state.geoLocation[1]);
                    console.log(centerLatLng,'안빈값');
                }
                this.map = new this.kakao.maps.Map(this.el, {
                    level: 3,
                    center: centerLatLng
                });

                axios.get('http://kindergarten.qp3gauimxr.ap-northeast-2.elasticbeanstalk.com/kindergarten/addr/제주') // JSON File Path
                    .then( response => {
                        this.setState(
                            // 비동기처리이기 떄문에, 콜백을 호출해줘야 해당 데이터가 받아올때까지 기다리게됨.
                            {locations: response.data.data}, () => this.setKinderInfoClusterer()
                        );
                })
                .catch(function (error) {
                    console.log(error);
                });
            });
        });
    };
    // 위치가져오기
    setKinderInfoClusterer = () => {
        const kinderInfo = this.state.locations;

        // 마커 클러스터러를 생성합니다 
        const clusterer = new this.kakao.maps.MarkerClusterer({
            map: this.map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
            averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
            minLevel: 10 // 클러스터 할 최소 지도 레벨 
        });

        const imageSrc = "http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
        // 마커 이미지의 이미지 크기 입니다
        const imageSize = new this.kakao.maps.Size(24, 35); 
                    
        // 마커 이미지를 생성합니다    
        const markerImage = new this.kakao.maps.MarkerImage(imageSrc, imageSize); 
        const markers = kinderInfo.map((position) => {
            return new this.kakao.maps.Marker({
                title : position.name, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다,
                position : new this.kakao.maps.LatLng(position.geo.coordinates[1], position.geo.coordinates[0]),
                image : markerImage // 마커 이미지 
            });
        });

        // 마커에 표시할 인포윈도우를 생성합니다 
        const infowindow = kinderInfo.map((position) => {
            return new this.kakao.maps.InfoWindow({
                content: position.name+'<p>'+ position.tel+'</p>' // 인포윈도우에 표시할 내용
            });
        });

        // 클러스터러에 마커들을 추가합니다
        clusterer.addMarkers(markers);
    }
    
    // 어린이집정보세팅 후 뿌려주는 함수
    setKinderInfo = () => {
        // 마커를 표시할 위치와 title 객체 배열입니다 
        const kinderInfo = this.state.locations;

        // 마커 이미지의 이미지 주소입니다
        const imageSrc = "http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
        console.log(kinderInfo);
        for (let i = 0; i < kinderInfo.length; i ++) {
            // console.log(kinderInfo.length, kinderInfo[i].name);
            // 마커 이미지의 이미지 크기 입니다
            const imageSize = new this.kakao.maps.Size(24, 35); 
            
            // 마커 이미지를 생성합니다    
            const markerImage = new this.kakao.maps.MarkerImage(imageSrc, imageSize); 
            
            // 마커를 생성합니다
            const marker = new this.kakao.maps.Marker({
                map: this.map, // 마커를 표시할 지도
                position: new this.kakao.maps.LatLng(kinderInfo[i].geo.coordinates[1],kinderInfo[i].geo.coordinates[0]), // 마커를 표시할 위치
                title : kinderInfo[i].name, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
                image : markerImage // 마커 이미지 
            });
              // 마커에 표시할 인포윈도우를 생성합니다 
            const infowindow = new this.kakao.maps.InfoWindow({
                content: kinderInfo[i].name+'<p>'+kinderInfo[i].tel+'</p>' // 인포윈도우에 표시할 내용
            });

            // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
            // 이벤트 리스너로는 클로저를 만들어 등록합니다 
            // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
            this.kakao.maps.event.addListener(marker, 'mouseover', this.makeOverListener(this.map, marker, infowindow));
            this.kakao.maps.event.addListener(marker, 'mouseout', this.makeOutListener(infowindow));
            this.kakao.maps.event.addListener(marker, 'click', function() {
                // 마커 위에 인포윈도우를 표시합니다
                infowindow.open(this.map, marker);  
          });
        } 
    }

    // 지도위치 중앙으로 옮기는 함수
    setCenter = (_latitude, _longitude) => {            
        // 이동할 위도 경도 위치를 생성합니다
        console.log(_longitude , _latitude);
        let moveLatLon = new this.kakao.maps.LatLng(_latitude, _longitude);
        
        // 지도 중심을 이동 시킵니다
        this.map.setCenter(moveLatLon);
    }
    
    // 위치 가져오기 성공했을 때 함수입니다.
    getSuccess = (position) => {
        let crd = position.coords;
        this.setState({
            geoLocation: this.state.geoLocation.concat(crd.latitude, crd.longitude)
        });
        this.setCenter(this.state.geoLocation[0], this.state.geoLocation[1]);
    };
      
    getError = (err) => {
        console.warn('ERROR(' + err.code + '): ' + err.message);
        alert('현재 위치를 찾을 수 없습니다. 설정에서 위치동의를 허용해주세요.')
        this.setState({
            geoLocation: this.state.geoLocation.concat(this.props.lat, this.props.lng)
        })
    };
    
    // 내 위치를 가져오는 함수입니다.
    _getLocation = () => {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          };
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(this.getSuccess , this.getError, options);
        } else {
            alert('현재 위치를 찾을 수 없습니다. chorme 브라우저를 이용해주세요.')
            /* 지오로케이션 사용 불가능 */ 
            this.setState({
                geoLocation: this.state.geoLocation.concat(this.props.lat, this.props.lng)
            })
          }
    }
    // 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
    makeOverListener = (map, marker, infowindow) => {
        return function() {
            infowindow.open(map, marker);
        };
    }

    // 인포윈도우를 닫는 클로저를 만드는 함수입니다 
    makeOutListener = (infowindow)  => {
        return function() {
            infowindow.close();
        };
    }
    componentWillMount() {
        axios.get('default.data.json') // JSON File Path
            .then( response => {
            this.setState({
                locations: response.data
            });
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    sdkLoaded() {
        this.setState({ sdkLoaded: true });
    }
    componentDidMount() {
        if (document.getElementById('kakaomap-sdk')) {
            this.sdkLoaded();
        }
        this.loadKakaoSdk();
        let kakaoMapRoot = document.getElementById('kakao-map');
        if (!kakaoMapRoot) {
            kakaoMapRoot = document.createElement('main');
            kakaoMapRoot.id = 'kakao-map';
            document.body.appendChild(kakaoMapRoot);
        }
        // root 에 높이값부여
        kakaoMapRoot.style.height = '100vh';
    }
    render() {
        return (React.createElement('main', { id: "kakao-map" }));
    }
}

export default KakaoMap;
