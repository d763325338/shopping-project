window.onload=function(){
    var oKeyword = document.getElementById("keyword");
    var oProvince = document.getElementById("province");
    var oCity = document.getElementById("city");
    var oAddress = document.getElementById("address");

    var foo = {
        //后面的操作，都是把地址信息填入这个address，所以传给后台的时候就可以直接传这个数据
        address : {
            province : '',
            provinceCode : '0',
            city : '',
            cityCode : '0',
            district : '',
            districtCode : '0',
            longitude : '',
            latitude : ''
        },
        // 根据point来初始化地图
        initMap : function(lng,lat){
            var _this = this;

            var map = new BMap.Map("map");  // 创建Map实例
            var point = new BMap.Point(lng, lat)    // 创建点坐标
            map.centerAndZoom(point, 15);   // 初始化地图,设置中心点坐标和地图级别
            map.enableScrollWheelZoom(true);    //开启鼠标滚轮缩放

            // map.addControl(new BMap.MapTypeControl());   //添加地图类型控件

            // 地图的一些配置项
            var navigationControl = new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_TOP_LEFT,   // 靠左上角位置
                type: BMAP_NAVIGATION_CONTROL_LARGE,    // LARGE类型
                enableGeolocation: true // 启用显示定位
            });
            map.addControl(navigationControl);// 缩放标尺

            // 添加中心小红点
            var centerPoint = new BMap.Marker(point);
            map.addOverlay(centerPoint);

            // 当前位置写入右侧input
            var myGeo = new BMap.Geocoder();
            myGeo.getLocation(new BMap.Point(lng, lat),function (result) {
                _this.callBack(result,'drag')
            });

            _this.dragMap(map,centerPoint); //添加拖拽事件

            //建立一个自动完成的对象，keyword出现下拉选择
            var ac = new BMap.Autocomplete({
                "input" : "keyword",
                "location" : map
            });
            ac.addEventListener("onconfirm", function(e) {
                // console.log(e)
                var thisValue = e.item.value;
                // console.log(thisValue)
                var thisProvince = thisValue.province;
                var thisCity = thisValue.city;
                var thisDistrict = thisValue.district;
                var thisStreet = thisValue.street;
                var thisStreetNumber = thisValue.streetNumber;
                var thisBusiness = thisValue.business;

                var thisKey = thisProvince+thisCity+thisDistrict+thisStreet+thisStreetNumber+thisBusiness;

                _this.searchByKey(map,thisKey,centerPoint);
            })
        },
        // 地图拖拽
        dragMap : function(map,centerPoint){
            var _this = this;
            var myGeo = new BMap.Geocoder();

            map.addEventListener("dragging", function showInfo() {
                var cp = map.getCenter();
                centerPoint.setPosition(new BMap.Point(cp.lng, cp.lat));
                map.panTo(new BMap.Point(cp.lng, cp.lat));
                map.centerAndZoom(centerPoint.getPosition(), map.getZoom());
            });

            map.addEventListener("dragend",function showInfo() {
                var cp = map.getCenter();
                myGeo.getLocation(new BMap.Point(cp.lng, cp.lat),function (result) {
                    // console.log(result)
                    centerPoint.setPosition(new BMap.Point(cp.lng, cp.lat));
                    map.panTo(new BMap.Point(cp.lng, cp.lat));
                    map.centerAndZoom(centerPoint.getPosition(), map.getZoom());

                    _this.callBack(result,'drag')
                });
            });
        },
        // 地图拖拽后 和 输入关键字后选择 的回调函数
        callBack : function(result,tag){
            var _this = this;
            var thisAddress = result.addressComponents;
            if(thisAddress.province == "新疆维吾尔自治区" || thisAddress.province == "西藏自治区"){
                alert("很抱歉，新疆和西藏地区暂不支持该服务，敬请期待。");
                oKeyword.value = "";
                oProvince.value = "";
                oCity.value = "";
                oAddress.value = "";
            }else{
                if(tag==='drag'){
                    oKeyword.value = result.address;
                }
                oProvince.value = thisAddress.province;
                oCity.value = thisAddress.city;
                oAddress.value = thisAddress.district + thisAddress.street + thisAddress.streetNumber;

                // console.log(result);
                _this.address.province = thisAddress.province;
                _this.address.city = thisAddress.city;
                _this.address.district = thisAddress.district;
                _this.address.longitude = result.point.lng;
                _this.address.latitude = result.point.lat;
            }
            console.log(JSON.stringify(_this.address))
        },
        // 输入关键字搜索，根据关键字更新地图并获取信息
        searchByKey : function(map,keyword,centerPoint){
            var _this = this;

            var localSearch = new BMap.LocalSearch(map);
            localSearch.enableAutoViewport();
            localSearch.search(keyword);
            localSearch.setSearchCompleteCallback(function (searchResult) {
                if(searchResult && searchResult.getPoi(0)){
                    var poi = searchResult.getPoi(0);
                    if(poi.point){
                        map.centerAndZoom(poi.point,15);
                        centerPoint.setPosition(poi.point);

                        var myGeo = new BMap.Geocoder();
                        myGeo.getLocation(poi.point, function(result){
                            _this.callBack(result)
                        });
                    }
                }
            })
        },
        // 一般初始化地图，设置嘉兴学院
        init : function(){
            _this.initMap(120.727992,30.745027)
        },
        // 初始化当前城市
        initLocalCity : function(){
            var _this = this;

            var map = new BMap.Map("map");
            var myCity = new BMap.LocalCity();
            myCity.get(function(result){
                console.log(result);
                // var point = result.center;
                var lng = result.center.lng;
                var lat = result.center.lat;

                _this.initMap(lng,lat)
            });
        },
        // 初始化当前位置
        initLocalPoint : function(){
            var _this = this;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var lng = position.coords.longitude;
                    var lat = position.coords.latitude;
                    console.log(lng+':'+lat);
                    var gpsPoint = new BMap.Point(lng, lat);

                    // 坐标转成百度需要的坐标，并初始化地图
                    // gpsPoint：转换前坐标，第二个参数为转换方法，0表示gps坐标转换成百度坐标，callback回调函数，参数为新坐标点
                    BMap.Convertor.translate(gpsPoint, 0, function(data){
                        _this.initMap(data.lng,data.lat);
                    })
                })
            } else {
                alert("Your browser does not support Geolocation!");
            }
        }
    }

    // foo.init(); //以北京初始化地图
    foo.initLocalCity(); //以当前城市初始化地图
    // foo.initLocalPoint(); //以当前坐标初始化地图

    // 输入关键字的时候，清空input里面的城市信息
    oKeyword.oninput=function(){
        oProvince.value = "";
        oCity.value = "";
        oAddress.value = "";
    }
    //弹窗
    $(".dizhi").click(function(){
        $(".mymap").fadeIn().delay(500).slideDown();
        $(".tangram-suggestion").fadeIn().delay(500).slideDown();
      });
    $(".closemap").click(function(){
        $(".mymap").fadeOut().delay(500);
      });

    $('.subaddress').click(function(){
         $(".dizhi").text(oKeyword.value);
         $(".mymap").fadeOut().delay(500);
    })

}