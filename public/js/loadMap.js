/* 리팩토링 필요 */

const mapContainer = document.getElementById('map')
const mapOption = {
  //접속했을 때 보이는 구역은 영등포구청
  center: new kakao.maps.LatLng(37.526297, 126.896373),
  level: 3
}
const map = new kakao.maps.Map(mapContainer, mapOption);

const newMarker = new kakao.maps.Marker({
  // 지도 중심좌표에 마커를 생성합니다 
  position: map.getCenter()
});
// 지도에 마커를 표시합니다
newMarker.setMap(map);

const mapClick = mouseEvent => {
  // 클릭한 위도, 경도 정보를 가져옵니다 
  const kakaoL = mouseEvent.latLng;

  // 마커 위치를 클릭한 위치로 옮깁니다
  newMarker.setPosition(kakaoL);

  const message = `${kakaoL.getLat().toFixed(6)}, ${kakaoL.getLng().toFixed(6)}`;

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = message;
  return kakaoL;
}

kakao.maps.event.addListener(map, 'click', mapClick);

kakao.maps.event.addListener(map, 'rightclick', function (mouseEvent) {
  // 클릭한 위도, 경도 정보를 가져옵니다 
  const kakaoL = mapClick(mouseEvent);
  const lat = kakaoL.getLat().toFixed(6);
  const lng = kakaoL.getLng().toFixed(6);
  let url = `위도 : ${lat} 경도 : ${lng},`;
  url += `${lat},${lng}`;
  window.open(`https://map.kakao.com/link/map/${url}`, '_blank');
});

const searchFunc = () => {
  if (search.value.trim() === '') return;
  searchPlace = search.value.trim();
  ps.keywordSearch(searchPlace, placesSearchCB);
}

const search = document.getElementById('search');
const searchBtn = document.querySelector('.search');
const ps = new kakao.maps.services.Places();
let searchPlace = '';
search.addEventListener('keydown', function (e) {
  if (e.keyCode !== 13) return;
  searchFunc();
})
searchBtn.addEventListener('click', searchFunc);

const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
// 키워드 검색 완료 시 호출되는 콜백함수 입니다
const markers = [];

function placesSearchCB(data, status, pagination) {
  if (status === kakao.maps.services.Status.OK) {

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
    // LatLngBounds 객체에 좌표를 추가합니다
    var bounds = new kakao.maps.LatLngBounds();
    markers.forEach(val => {
      val.setMap(null);
    })
    for (var i = 0; i < data.length; i++) {
      markers.push(displayMarker(data[i]));
      bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
    }

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);
  }
}

// 지도에 마커를 표시하는 함수입니다
function displayMarker(place) {
  // 마커를 생성하고 지도에 표시합니다
  var marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(place.y, place.x)
  });

  // 마커에 클릭이벤트를 등록합니다
  kakao.maps.event.addListener(marker, 'mouseover', function () {
    // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
    infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
    infowindow.open(map, marker);
  });
  kakao.maps.event.addListener(marker, 'click', function () {
    let message = `${place.place_name}<br><br>`;
    message += `위도 : ${marker.getPosition().getLat().toFixed(6)} `;
    message += `경도 : ${marker.getPosition().getLng().toFixed(6)}`;

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = message;
  });
  kakao.maps.event.addListener(marker, 'rightclick', function () {
    let url = `${place.place_name},`;
    url += `${marker.getPosition().getLat().toFixed(6)},`;
    url += `${marker.getPosition().getLng().toFixed(6)}`;
    window.open(`https://map.kakao.com/link/map/${encodeURIComponent(url)}`, '_blank');
  })
  return marker;
}

// 버튼이 클릭되면 호출되는 함수입니다
function setOverlayMapTypeId() {
  const chkRoadView = document.getElementById('roadview');
  const mapType = kakao.maps.MapTypeId.ROADVIEW;

  if (!chkRoadView.checked) {
    map.removeOverlayMapTypeId(mapType);
    return;
  }

  // maptype에 해당하는 지도타입을 지도에 추가합니다
  map.addOverlayMapTypeId(mapType);

  // 지도에 추가된 타입정보를 갱신합니다     
}

const fetchData = async () => {
  /* excel-read를 실행한다면 fetch() 안을 './latlng.json'으로 변경해야 함*/
  const response = await fetch('./latlng.json');
  const latlng = await response.json();

  // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
  const mapTypeControl = new kakao.maps.MapTypeControl();

  // 지도에 컨트롤을 추가해야 지도위에 표시됩니다
  // kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

  // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  const positions = [];

  const heading = document.querySelector('h2');
  if (latlng[0].dong === latlng[latlng.length - 1].dong) {
    heading.textContent = latlng[0].dong;
  } else {
    heading.textContent = `${latlng[0].dong} ~ ${latlng[latlng.length - 1].dong}`;
  }

  latlng.map(l => {
    positions.push({
      dong: l.dong,
      index: l.index,
      roadName: l.roadName,
      name: l.name,
      latlng: new kakao.maps.LatLng(l.lat, l.lng)
    });
  })

  // 마커 이미지의 이미지 주소입니다
  const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

  positions.map(position => {

    // 마커 이미지의 이미지 크기 입니다
    const imageSize = new kakao.maps.Size(24, 35);

    // 마커 이미지를 생성합니다    
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

    // 마커를 생성합니다
    const marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: position.latlng, // 마커를 표시할 위치
      title: `${position.index}`,
      // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
      image: markerImage, // 마커 이미지 
      opacity: 0.7,
      clickable: true // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
    });
    kakao.maps.event.addListener(marker, 'mouseover', () => {
      marker.setOpacity(1.0);
    });
    kakao.maps.event.addListener(marker, 'mouseout', () => {
      marker.setOpacity(0.7);
    });
    // 마커를 지도에 표시합니다.
    marker.setMap(map);

    // 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
    const iwContent = `<div style="width:auto;max-width:200px;height:auto;padding:7px">${marker.getTitle()}</div>`,
      // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
      iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다

    // 인포윈도우를 생성합니다
    const infowindow = new kakao.maps.InfoWindow({
      content: iwContent,
      removable: iwRemoveable
    });

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function () {
      // // 마커 위에 인포윈도우를 표시합니다
      // infowindow.open(map, marker);
      let message = `${marker.getTitle()} ${position.roadName} <br> ${position.name}<br><br>`;
      message += `위도 : ${marker.getPosition().getLat().toFixed(6)} `;
      message += `경도 : ${marker.getPosition().getLng().toFixed(6)}`;

      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = message;
    });
    kakao.maps.event.addListener(marker, 'rightclick', function () {
      let url = `${marker.getTitle()} ${position.roadName},`;
      url += `${marker.getPosition().getLat().toFixed(6)},`;
      url += `${marker.getPosition().getLng().toFixed(6)}`;
      window.open(`https://map.kakao.com/link/map/${url}`, '_blank');
    });
  });
}

window.onload = fetchData();
window.addEventListener('resize', () => {
  mapContainer.style.minHeight = window.innerHeight * 0.7 + 'px';
});
