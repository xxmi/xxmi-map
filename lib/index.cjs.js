'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 地图坐标点转换工具类，PointUtils 各地图API坐标系统比较与转换;
 * WGS84坐标系：即地球坐标系，国际上通用的坐标系。设备一般包含GPS芯片或者北斗芯片获取的经纬度为WGS84地理坐标系,
 * 谷歌地图采用的是WGS84地理坐标系（中国范围除外，中国用GCJ-02）;
 * GCJ02坐标系：即火星坐标系，是由中国国家测绘局制订的地理信息系统的坐标系统，由WGS84坐标系经加密后的坐标系。
 * 谷歌中国地图、搜搜中国地图、高德中国地图、采用的是GCJ02地理坐标系;
 * BD09坐标系：即百度坐标系，由GCJ02坐标系加密后的坐标系;
 * 搜狗坐标系、图吧坐标系等，估计也是在GCJ02基础上加密而成的。
 */
const xPi = 3.14159265358979324 * 3000.0 / 180.0;
const pi = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;
/**
 * 判断坐标是否超出中国国土范围
 */

const outOfChina = function (lon, lat) {
  if (lon < 72.004 || lon > 137.8347) {
    return true;
  }

  if (lat < 0.8293 || lat > 55.8271) {
    return true;
  }

  return false;
};

const transformLat = function (x, y) {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
  return ret;
};

const transformLng = function (x, y) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
  return ret;
};

const transform = function (lon, lat) {
  if (outOfChina(lon, lat)) {
    return {
      lon,
      lat
    };
  }

  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLng(lon - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * pi;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * pi);
  dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * pi);
  const mgLat = lat + dLat;
  const mgLon = lon + dLon;
  return {
    lon: mgLon,
    lat: mgLat
  };
};
/**
 * GPS（WGS-84） 经纬度坐标 转 GCJ-02（中国标准坐标），谷歌采用的是 GCJ-02<br>
 * GPS ：坐标即 WGS-84 国际标准坐标<br>
 * GCJ-02 ：中国标准坐标
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const wgs84ToGcj02 = function (lng, lat) {
  if (outOfChina(lng, lat)) {
    return null;
  }

  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLon = transformLng(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * pi;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * pi);
  dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * pi);
  const mgLat = lat + dLat;
  const mgLon = lng + dLon;
  return {
    lon: mgLon,
    lat: mgLat
  };
};
/**
 * GCJ-02（中国标准坐标）转 GPS（WGS-84） 经纬度坐标，谷歌采用的是 GCJ-02<br>
 * GPS ：坐标即 WGS-84 国际标准坐标<br>
 * GCJ-02 ：中国标准坐标
 *
 * @param lon
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const gcj02ToWgs84 = function (lon, lat) {
  const point = transform(lon, lat);
  const lngtitude = lon * 2 - point.lon;
  const latitude = lat * 2 - point.lat;
  return {
    lon: lngtitude,
    lat: latitude
  };
};
/**
 * GCJ-02 转 BD-09，谷歌采用的是 GCJ-02<br>
 * GCJ-02 ：中国标准坐标<br>
 * BD-09：百度在 GCJ-02 坐标基础上加偏移得到了 BD-09
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const gcj02ToBd09 = function (lng, lat) {
  const x = lng;
  const y = lat;
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * xPi);
  const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * xPi);
  const bdLon = z * Math.cos(theta) + 0.0065;
  const bdLat = z * Math.sin(theta) + 0.006;
  return {
    lon: bdLon,
    lat: bdLat
  };
};
/**
 * 图吧 转 WGS-84（国际坐标）
 *
 * @param lon
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const tubaToWgs84 = function (lon, lat) {
  lon = lon * 100000 % 36000000;
  lat = lat * 100000 % 36000000;
  const x1 = -(Math.cos(lat / 100000) * (lon / 18000) + Math.sin(lon / 100000) * (lat / 9000)) + lon;
  const y1 = -(Math.sin(lat / 100000) * (lon / 18000) + Math.cos(lon / 100000) * (lat / 9000)) + lat;
  const x2 = -(Math.cos(y1 / 100000) * (x1 / 18000) + Math.sin(x1 / 100000) * (y1 / 9000)) + lon + (lon > 0 ? 1 : -1);
  const y2 = -(Math.sin(y1 / 100000) * (x1 / 18000) + Math.cos(x1 / 100000) * (y1 / 9000)) + lat + (lat > 0 ? 1 : -1);
  return {
    lon: x2 / 100000.0,
    lat: y2 / 100000.0
  };
};
/**
 * WGS-84（国际坐标） 转 图吧
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const wgs84ToTuba = function (lng, lat) {
  lng = lng * 100000 % 36000000;
  lat = lat * 100000 % 36000000;

  const _X = Math.cos(lat / 100000) * (lng / 18000) + Math.sin(lng / 100000) * (lat / 9000) + lng;

  const _Y = Math.sin(lat / 100000) * (lng / 18000) + Math.cos(lng / 100000) * (lat / 9000) + lat;

  return {
    lon: _X / 100000.0,
    lat: _Y / 100000.0
  };
};
/**
 * WGS-84（国际坐标） 转 BD09（百度坐标）
 *
 * @param lon
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const wgs84ToBd09 = function (lon, lat) {
  const gcj02 = wgs84ToGcj02(lon, lat);
  return gcj02ToBd09(gcj02.lon, gcj02.lat);
};
/**
 * BD-09 转 GCJ-02,即百度坐标转中国标准坐标 ==（百度坐标 转 谷歌坐标） BD-09：百度在 GCJ-02 坐标基础上加偏移得到了
 * BD-09 GCJ-02 ：中国标准坐标<br>
 *
 * @param lon
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const bd09ToGcj02 = function (lon, lat) {
  const x = lon - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * xPi); // 运来是PI
  // 没有xPi精度高

  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * xPi);
  const ggLon = z * Math.cos(theta);
  const ggLat = z * Math.sin(theta);
  return {
    lon: ggLon,
    lat: ggLat
  };
};
/**
 * BD-09 转 WGS-84，即百度坐标转国际坐标（WGS-84 == GPS）
 *
 * @param lon
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const bd09ToWgs84 = function (lon, lat) {
  // 1.BD-09 转 GCJ-02
  const gcj02 = bd09ToGcj02(lon, lat); // 2.GCJ-02 转 WGS-84

  return gcj02ToWgs84(gcj02.lon, gcj02.lat);
};
/**
 * 图吧 转 GCJ-02（Google 坐标）
 *
 * @param lon
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const tubaToGcj02 = function (lon, lat) {
  const wgs84 = tubaToWgs84(lon, lat);
  return wgs84ToGcj02(wgs84.lon, wgs84.lat);
};
/**
 * 百度坐标 转 图吧
 *
 * @param lon
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const baiduToTuba = function (lon, lat) {
  const wgs84 = bd09ToWgs84(parseFloat(lon), parseFloat(lat));
  return wgs84ToTuba(wgs84.lon, wgs84.lat);
};
/**
 * 百度（BD09）转 Google（GCJ-02）
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const baiduToGoogle = function (lng, lat) {
  return bd09ToGcj02(parseFloat(lng), parseFloat(lat));
};
/**
 * 百度（BD09） 转 GPS（WGS-84）
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const baiduToGps = function (lng, lat) {
  return bd09ToWgs84(parseFloat(lng), parseFloat(lat));
};
/**
 * 图吧 转 百度坐标
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const tubaToBaidu = function (lng, lat) {
  // 1. 图吧 转 GPS（WGS-84）
  const wgs84 = tubaToWgs84(parseFloat(lng), parseFloat(lat)); // 2. GPS ( WGS-84 ) 转 百度（BD-09）

  return wgs84ToBd09(wgs84.lon, wgs84.lat);
};
/**
 * 图吧 转 Google 坐标
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const tubaToGoogle = function (lng, lat) {
  return tubaToGcj02(parseFloat(lng), parseFloat(lat));
};
/**
 * 图吧 转 GPS（WGS-84）
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const tubaToGps = function (lng, lat) {
  return tubaToWgs84(parseFloat(lng), parseFloat(lat));
};
/**
 * Google 转 图吧
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const googleToTuba = function (lng, lat) {
  const wgs84 = gcj02ToWgs84(parseFloat(lng), parseFloat(lat));
  return wgs84ToTuba(wgs84.lon, wgs84.lat);
};
/**
 * Google（GCJ-02） 转 百度（BD09）
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const googleToBaidu = function (lng, lat) {
  return gcj02ToBd09(parseFloat(lng), parseFloat(lat));
};
/**
 * Google（GCJ-02） 转 GPS（WGS-84）
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const googleToGps = function (lng, lat) {
  return gcj02ToWgs84(parseFloat(lng), parseFloat(lat));
};
/**
 * GPS（WGS-84） 转 百度（BD09）
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const gpsToBaidu = function (lng, lat) {
  return wgs84ToBd09(parseFloat(lng), parseFloat(lat));
};
/**
 * GPS（WGS-84） 转 Google（GCJ-02）
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const gpsToGoogle = function (lng, lat) {
  return wgs84ToGcj02(parseFloat(lng), parseFloat(lat));
};
/**
 * GPS（WGS-84） 转 图吧
 *
 * @param lng
 *            经度
 * @param lat
 *            纬度
 * @return
 */


const gpsToTuba = function (lng, lat) {
  return wgs84ToTuba(parseFloat(lng), parseFloat(lat));
};
/**
 * 把待转换类型 转换为 目标类型
 *
 * @param lon
 *            经度
 * @param lat
 *            纬度
 * @param targetPointType
 *            目标类型
 * @param pointType
 *            待转换类型
 * @returns {lon,lat}
 */


const convertPoint = function (lon, lat, targetPointType, pointType) {
  let point = {
    lon,
    lat
  };

  switch (pointType) {
    case 'gps':
      switch (targetPointType) {
        case 'baidu':
          point = gpsToBaidu(lon, lat);
          break;

        case 'google':
          point = gpsToGoogle(lon, lat);
          break;

        case 'tuba':
          point = gpsToTuba(lon, lat);
          break;

        default:
          break;
      }

      break;

    case 'baidu':
      switch (targetPointType) {
        case 'gps':
          point = baiduToGps(lon, lat);
          break;

        case 'google':
          point = baiduToGoogle(lon, lat);
          break;

        case 'tuba':
          point = baiduToTuba(lon, lat);
          break;

        default:
          break;
      }

      break;

    case 'google':
      switch (targetPointType) {
        case 'gps':
          point = googleToGps(lon, lat);
          break;

        case 'baidu':
          point = googleToBaidu(lon, lat);
          break;

        case 'tuba':
          point = googleToTuba(lon, lat);
          break;

        default:
          break;
      }

      break;

    case 'tuba':
      switch (targetPointType) {
        case 'gps':
          point = tubaToGps(lon, lat);
          break;

        case 'baidu':
          point = tubaToBaidu(lon, lat);
          break;

        case 'google':
          point = tubaToGoogle(lon, lat);
          break;

        default:
          break;
      }

      break;

    default:
      point = null;
      break;
  }

  return point;
};

var lonlatConver = /*#__PURE__*/Object.freeze({
  wgs84ToGcj02: wgs84ToGcj02,
  gcj02ToWgs84: gcj02ToWgs84,
  gcj02ToBd09: gcj02ToBd09,
  bd09ToGcj02: bd09ToGcj02,
  bd09ToWgs84: bd09ToWgs84,
  tubaToWgs84: tubaToWgs84,
  wgs84ToTuba: wgs84ToTuba,
  wgs84ToBd09: wgs84ToBd09,
  tubaToGcj02: tubaToGcj02,
  baiduToTuba: baiduToTuba,
  baiduToGoogle: baiduToGoogle,
  baiduToGps: baiduToGps,
  tubaToBaidu: tubaToBaidu,
  tubaToGoogle: tubaToGoogle,
  tubaToGps: tubaToGps,
  googleToTuba: googleToTuba,
  googleToBaidu: googleToBaidu,
  googleToGps: googleToGps,
  gpsToBaidu: gpsToBaidu,
  gpsToGoogle: gpsToGoogle,
  gpsToTuba: gpsToTuba,
  convertPoint: convertPoint
});

exports.LonLatConvert = lonlatConver;
