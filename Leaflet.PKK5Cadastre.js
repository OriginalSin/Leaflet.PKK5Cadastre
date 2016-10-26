(function () {
    'use strict';

    var layerGroup,
		searchControl,
		inputShowObject,
		exportIcon,
		lastFeature,
		lastFeatureId,
		lastOverlays = [],
		lastOverlayId,
		cadNeedClickLatLng,
		notHideDrawing = false,
		localeHash = {
			name: 'Кадастр Росреестра',
			doSearch: 'Найти'
		},
		getTxt = window._gtxt || function(key) {
			var arr = key.split('.');
			return localeHash[arr.length - 1] || '';
		};

	L.ImageOverlay.CrossOrigin = L.ImageOverlay.extend({
	  _updateOpacity: function () {
		this._image.crossOrigin = 'anonymous';
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	  },
	  remove: function () {
		  if (this._map) { this._map.removeLayer(this); }
	  },
	  onRemove: function (map) {
		L.ImageOverlay.prototype.onRemove.call(this, map);
		if (this._dObj && this._dObj._map) {
			this._dObj._map.removeLayer(this._dObj);
		}
	  },
	  exportGeometry: function () {
		var pathPoints = MSQR(this._image, {path2D: false, maxShapes: 10}),
			_map = this._map;
		var rings = pathPoints.map(function (it) {
			var ring = it.map(function (p) {
				return L.point(p.x, p.y);
			});
			ring = L.LineUtil.simplify(ring, 1);
			return ring.map(function (p) {
				return _map.containerPointToLatLng(p);
			});
		});
		if (rings.length) {
			var obj = rings.length > 1 ? L.multiPolygon(rings) : L.polygon(rings[0]),
				geo = _map.gmxDrawing.add(obj);

			_map.addLayer(geo);
			if (this.options.geoLink && !notHideDrawing) { this._dObj = geo; }
			this.bringToBack();
			_map._pathRoot.style.cursor = 'help';
			return geo;
		}
	  }
	});

	/*
		MSQR v0.2.1 alpha
		(c) 2016 K3N / Epistemex
		www.epistemex.com
		MIT License
	*/
	function MSQR(C,u){u=u||{};var g;if(C instanceof CanvasRenderingContext2D){g=C}else{if(C instanceof HTMLCanvasElement){g=C.getContext("2d")}else{if(C instanceof HTMLImageElement||C instanceof HTMLVideoElement){g=q(C)}else{throw"Invalid source."}}}var G=g.canvas.width,o=g.canvas.height,l=(u.x||0)|0,m=(u.y||0)|0,k=(u.width||G)|0,f=(u.height||o)|0,e,y=[],x,s=3,p,A,d=Math.max(1,u.bleed||5),t=Math.max(1,u.maxShapes||1),b=Math.max(0,Math.min(254,u.alpha||0)),v=u.padding||0,E=Math.max(0,u.tolerance||0),n=!!u.align,a=u.alignWeight||0.95,B=!!u.path2D,j,r;if(l<0||m<0||l>=G||m>=o||k<1||f<1||l+k>G||m+f>o){return[]}if(t>1||v){e=q(g.canvas);g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle=g.strokeStyle="#000";g.globalAlpha=1;g.shadowColor="rgba(0,0,0,0)";if(v){j=q(g.canvas);r=v<0?4:(v>5?16:8);g.globalCompositeOperation=v<0?"destination-in":"source-over";v=Math.min(10,Math.abs(v));for(var c=0,D=Math.PI*2/r;c<6.28;c+=D){g.drawImage(j.canvas,v*Math.cos(c),v*Math.sin(c))}}g.globalCompositeOperation="destination-out";g.lineWidth=d;g.miterLimit=1;do{x=F();if(x.length){y.push(B?z(x):x);g.beginPath();p=x.length-1;while(A=x[p--]){g.lineTo(A.x,A.y)}g.closePath();g.fill();g.stroke()}}while(x.length&&--t);g.globalCompositeOperation="source-over";g.clearRect(0,0,g.canvas.width,g.canvas.height);g.drawImage(e.canvas,0,0);g.restore();return y}else{x=F();y.push(B?z(x):x)}return y;function F(){var N=[],w,M,L,V,W,T,U,Q=-1,R,O=9,S=[9,0,3,3,2,0,9,3,1,9,1,1,2,0,2,9];w=new Uint32Array(g.getImageData(l,m,k,f).data.buffer);M=w.length;for(L=s;L<M;L++){if((w[L]>>>24)>b){Q=s=L;break}}if(Q>=0){V=T=(Q%k)|0;W=U=(Q/k)|0;do{R=J(V,W);if(R===0){W--}else{if(R===1){W++}else{if(R===2){V--}else{if(R===3){V++}}}}if(R!==O){N.push({x:V+l,y:W+m});O=R}}while(V!==T||W!==U);if(E){N=P(N,E)}if(n&&!v){N=h(N,a)}}function K(i,X){return(i>=0&&X>=0&&i<k&&X<f)?(w[X*k+i]>>>24)>b:false}function J(X,Y){var i=0;if(K(X-1,Y-1)){i|=1}if(K(X,Y-1)){i|=2}if(K(X-1,Y)){i|=4}if(K(X,Y)){i|=8}if(i===6){return O===0?2:3}else{if(i===9){return O===3?0:1}else{return S[i]}}}function P(ai,Z){var ag=ai.length-1;if(ag<2){return ai}var ab=ai[0],ah=ai[ag],aa=Z*Z,ac,ad=-1,X,Y=0,ae,af,aj,ak;for(ac=1;ac<ag;ac++){X=I(ai[ac],ab,ah);if(X>Y){Y=X;ad=ac}}if(Y>aa){ae=ai.slice(0,ad+1);af=ai.slice(ad);aj=P(ae,Z);ak=P(af,Z);return aj.slice(0,aj.length-1).concat(ak)}else{return[ab,ah]}}function I(Z,i,X){var Y=H(i,X),aa;if(!Y){return 0}aa=((Z.x-i.x)*(X.x-i.x)+(Z.y-i.y)*(X.y-i.y))/Y;if(aa<0){return H(Z,i)}else{if(aa>1){return H(Z,X)}else{return H(Z,{x:i.x+aa*(X.x-i.x),y:i.y+aa*(X.y-i.y)})}}}function H(Y,Z){var i=Y.x-Z.x,X=Y.y-Z.y;return i*i+X*X}function h(ad,ah){var aa=[1,-1,-1,1],ab=[1,1,-1,-1],ac,ae=0;while(ac=ad[ae++]){ac.x=Math.round(ac.x);ac.y=Math.round(ac.y);for(var Z=0,af,ag,X,Y;Z<4;Z++){X=aa[Z];Y=ab[Z];af=ac.x+(X<<1);ag=ac.y+(Y<<1);if(af>l&&ag>m&&af<k-1&&ag<f-1){if(!K(af,ag)){af-=X;ag-=Y;if(K(af,ag)){ac.x+=X*ah;ac.y+=Y*ah}}}}}return ad}return N}function q(w){var h=document.createElement("canvas"),i;h.width=w.naturalWidth||w.videoWidth||w.width;h.height=w.naturalHeight||w.videoHeight||w.height;i=h.getContext("2d");i.drawImage(w,0,0);return i}function z(I){var w=new Path2D(),h=0,H;while(H=I[h++]){w.lineTo(H.x,H.y)}w.closePath();return w}}MSQR.getBounds=function(g){var e=9999999,f=9999999,c=-9999999,d=-9999999,a,b=g.length;for(a=0;a<b;a++){if(g[a].x>c){c=g[a].x}if(g[a].x<e){e=g[a].x}if(g[a].y>d){d=g[a].y}if(g[a].y<f){f=g[a].y}}return{x:e|0,y:f|0,width:Math.ceil(c-e),height:Math.ceil(d-f)}};if(typeof exports!=="undefined"){exports.MSQR=MSQR};

    L.CadUtils = {
        setOverlay: function(it, map, flagExternalGeo) {
			var attr = L.CadUtils.getFeatureExtent(it, map),
				id = attr.id,
				layer = L.CadUtils.getCadastreLayer(id),
				ids = [0, 1 , 2, 3, 4, 5, 6, 7, 8, 9, 10],
                params = {
                    size: attr.size.join(','),
                    bbox: attr.bbox.join(','),
                    layers: 'show:' + ids.join(','),
                    layerDefs: '{' + ids.map(function(nm) {
                        return '\"' + nm + '\":\"ID = \'' + id + '\'"'
                    }).join(',') + '}',
                    format: 'png32',
                    dpi: 96,
                    transparent: 'true',
                    imageSR: 102100,
                    bboxSR: 102100
                },
                imageUrl = 'http://pkk5.rosreestr.ru/arcgis/rest/services/Cadastre/';
                
			imageUrl += (layer && layer.id === 10 ? 'ZONESSelected' : 'CadastreSelected') + '/MapServer/export?f=image';

            for (var key in params) {
                imageUrl += '&' + key + '=' + params[key];
            }
			if (exportIcon) { L.DomUtil.addClass(exportIcon, 'notVisible'); }
            var overlay = new L.ImageOverlay.CrossOrigin(imageUrl, map.getBounds(), {opacity: 0.5, geoLink: !flagExternalGeo, full: attr.full, id: id, it: it, clickable: true})
				.on('load', function(ev) {
					var target = ev.target,
						len = lastOverlays.length;

					if (len && target._leaflet_id === lastOverlays[len - 1]._leaflet_id) {
						L.CadUtils.clearOverlays(1);
						L.DomUtil.addClass(target._image, 'help-cadastre');
						if (inputShowObject && inputShowObject.checked) {
							var geo = target.exportGeometry();
							if (geo && lastFeature) {
								geo
									.setOptions({cadastreFeature: lastFeature})
									.on('addtomap', function() { inputShowObject.checked = true; })
									.on('removefrommap', function() { inputShowObject.checked = false; });
								if (exportIcon) { L.DomUtil.removeClass(exportIcon, 'notVisible'); }
							}
						}
					}
                });
			lastOverlayId = id;
            overlay.addTo(map);
			lastOverlays.push(overlay);
			L.CadUtils.clearOverlays(2);
            return overlay;
        },
        clearOverlays: function(nm) {	// оставить nm оверлеев
			lastOverlays.splice(0, lastOverlays.length - (nm || 0)).forEach(function(overlay) {
				overlay.remove();
				if (overlay._dObj && overlay._dObj._map) {
					overlay._dObj._map.removeLayer(overlay._dObj);
				}
			});
        },
        getFeature: function(id, cadCount, featureCont, layer, map) {
			lastFeature = null;
			L.gmxUtil.requestJSONP('http://pkk5.rosreestr.ru/api/features/' + layer.id + '/' + id, {},
				{
					callbackParamName: 'callback'
				}
			).then(function(data) {
				if (lastFeatureId !== id || !data.feature) { return; }
				var attrs = data.feature.attrs,
					stat = L.CadUtils.getState(attrs.statecd),
					address = attrs.address || attrs.desc || '',
					plans = '',
					trs = [];

				trs.push('<tr><td class="first">Тип:</td><td>' + layer.title + '</td></tr>');
				trs.push('<tr><td class="first">Кад.номер:</td><td>' + attrs.cn + '</td></tr>');
				plans += '<a href="http://pkk5.rosreestr.ru/plan.html?id=' + attrs.id + '&type=1" target="_blank">План ЗУ</a>' ;
				if (attrs.kvartal) {
					trs.push('<tr><td class="first">Кад.квартал:</td><td>' + attrs.kvartal_cn + '</td></tr>');
					plans += ' <a href="http://pkk5.rosreestr.ru/plan.html?id=' + attrs.id + '&parent=' + attrs.kvartal + '&type=2" target="_blank">План КК</a>';
				}
				if (stat) { trs.push('<tr><td class="first">Статус:</td><td>' + stat + '</td></tr>'); }
				if (attrs.name) {
					trs.push('<tr><td class="first">Наименование:</td><td>' + attrs.name + '</td></tr>');
				}
				if (attrs.cad_cost) {
					trs.push('<tr><td class="first">Кадастровая стоимость:</td><td>' + attrs.cad_cost + '</td></tr>');
				}
				if (attrs.area_value) {
					trs.push('<tr><td class="first">Общая площадь:</td><td>' + attrs.area_value + '</td></tr>');
				}

				if (address) {
					trs.push('<tr><td class="first">Адрес:</td><td>' + address + '</td></tr>');
				}
				if (attrs.category_type) {
					trs.push('<tr><td class="first">Категория земель:</td><td>' + L.CadUtils.getCategoryType(attrs.category_type) + '</td></tr>');
				}
				if (attrs.fp) {
					trs.push('<tr><td class="first">Форма собственности:</td><td>' + L.CadUtils.getOwnership(attrs.fp) + '</td></tr>');
				}
				if (attrs.util_code) {
					trs.push('<tr><td class="first">Разрешенное использование:</td><td>' + L.CadUtils.getUtilization(attrs.util_code) + '</td></tr>');
				}
				if (attrs.util_by_doc) {
					trs.push('<tr><td class="first">по документу:</td><td>' + attrs.util_by_doc + '</td></tr>');
				}
				if (attrs.cad_record_date) {
					trs.push('<tr><td class="first">Дата изменения сведений в ГКН:</td><td>' + attrs.cad_record_date + '</td></tr>');
				}
				featureCont.innerHTML = '';
				L.DomUtil.create('table', 'table', featureCont).innerHTML = trs.join('\n');
				if (layer.id === 1) {
					L.DomUtil.create('div', 'plans', cadCount).innerHTML = plans;
				}
				lastFeature = data.feature;
				var len = lastOverlays.length,
					overlay = len ? lastOverlays[len - 1] : null;
				if (overlay && overlay._dObj) {
					overlay._dObj.setOptions({cadastreFeature: lastFeature});
				}
			});
        },
        getFeatureExtent: function(attr, map) {
            var R = 6378137,
                crs = L.Projection.SphericalMercator,
                bounds = map.getPixelBounds(),
                ne = map.options.crs.project(map.unproject(bounds.getTopRight())),
                sw = map.options.crs.project(map.unproject(bounds.getBottomLeft())),
                latLngBounds = L.latLngBounds(
                    crs.unproject(L.point(attr.extent.xmin, attr.extent.ymin).divideBy(R)),
                    crs.unproject(L.point(attr.extent.xmax, attr.extent.ymax).divideBy(R))
                );

            return {
                map: map,
                full: (sw.x < attr.extent.xmin && ne.x > attr.extent.xmax) && (sw.y < attr.extent.ymin && ne.y > attr.extent.ymax),
                id: attr.attrs.id,
                type: attr.type,
                size: [bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y],
                bbox: [sw.x, sw.y, ne.x, ne.y],
                latlng: crs.unproject(L.point(attr.center.x, attr.center.y).divideBy(R)),
                latLngBounds: latLngBounds
            };
        },
        parseData: function(data, tolerance) {
            var out = [];
			for (var i = 0, len = data.features.length; i < len; i++) {
                var it = data.features[i],
					layer = L.CadUtils.getCadastreLayer(it.attrs.id || it.attrs.cn || '', it.type),
					cnArr = (it.attrs.cn || '').split(':');

				if (!layer) { continue; }
				if (!Number(cnArr[cnArr.length - 1])) { continue; }
				it.title = it.attrs.address || it.attrs.name || it.attrs.desc;
                // if (it.extent) {
                // if (it.extent && it.title && tolerance < Math.max(it.extent.xmax - it.extent.xmin, it.extent.ymax - it.extent.ymin)) {
                    out.push(it);
                // }
            }
            return out.sort(function (a, b) {
				return b.sort - a.sort;
			});
		},
        setBoundsView: function(id, it, cadastrePkk5, flagExternalGeo) {
            var map = cadastrePkk5._map,
				featureExtent = L.CadUtils.getFeatureExtent(it, map);

			var onViewreset = function() {
				map.off('moveend', onViewreset);
				L.CadUtils.setOverlay(it, map, flagExternalGeo);
			};
			map.on('moveend', onViewreset);

			// map.fitBounds(featureExtent.latLngBounds, {animate: false});
			map.fitBounds(featureExtent.latLngBounds, {reset: true});
        },
        getContent: function(cadastrePkk5, popup, skipOverlay) {
            var map = cadastrePkk5._map,
				curr = popup._itsCurr,
				len = popup._its.length,
				it = popup._its[curr],
				id = it.attrs.id || it.attrs.cn || '',
				cn = it.attrs.cn || '',
				layer = L.CadUtils.getCadastreLayer(id, it.type),
				title = (layer.title || '').toUpperCase(),
                res = L.DomUtil.create('div', 'cadInfo'),
                div = L.DomUtil.create('div', 'cadItem', res),
				cadNav = L.DomUtil.create('div', 'cadNav', div),
				featureCont = L.DomUtil.create('div', 'featureCont', div),
				operCont = L.DomUtil.create('div', 'operCont', div),
				cadLeft = L.DomUtil.create('span', 'cadLeft', cadNav),
				cadCount = L.DomUtil.create('span', 'cadCount', cadNav),
				cadRight = L.DomUtil.create('span', 'cadRight', cadNav);
		
			lastFeatureId = id;
			cadCount.innerHTML = title + ' (' + (curr + 1) + '/' + len + ')<br>' + id;

			cadLeft.style.visibility = curr ? 'visible' : 'hidden';
			cadLeft.innerHTML = '<';
			cadRight.style.visibility = curr < len - 1 ? 'visible' : 'hidden';
			cadRight.innerHTML = '>';
            L.DomEvent.on(cadLeft, 'click', function() {
                popup._itsCurr--;
				popup.setContent(L.CadUtils.getContent(cadastrePkk5, popup, true));
				L.CadUtils.setOverlay(popup._its[popup._itsCurr], map);
            });
            L.DomEvent.on(cadRight, 'click', function() {
                popup._itsCurr++;
				popup.setContent(L.CadUtils.getContent(cadastrePkk5, popup, true));
				L.CadUtils.setOverlay(popup._its[popup._itsCurr], map);
            });
			if (!skipOverlay) { L.CadUtils.setOverlay(it, map); }

            featureCont.innerHTML = it.title || '';
			if (notHideDrawing) {
				inputShowObject = L.DomUtil.create('button', 'ShowObject', operCont);
				inputShowObject.innerHTML = 'Выделить границу';
				L.DomEvent.on(inputShowObject, 'click', function(ev) {
					if (!inputShowObject.checked) {
						var id = this._cad;
						inputShowObject.checked = true;
						// inputShowObject.style.display = 'none';
						L.CadUtils.setBoundsView(id, popup._its[popup._itsCurr], cadastrePkk5, ev.ctrlKey);
					}
				});
			} else {
				inputShowObject = L.DomUtil.create('input', 'ShowObject', operCont);
				inputShowObject.type = 'checkbox';
				inputShowObject._cad = id;
				var showObject = L.DomUtil.create('span', 'ShowObjectLabel', operCont);
				showObject.innerHTML = 'Выделить границу';
				L.DomEvent.on(inputShowObject, 'click', function(ev) {
					var id = this._cad;
					if (this.checked) {
						L.CadUtils.setBoundsView(id, popup._its[popup._itsCurr], cadastrePkk5, ev.ctrlKey);
						if (exportIcon) { L.DomUtil.removeClass(exportIcon, 'notVisible'); }
					} else {
						var len = lastOverlays.length,
							overlay = len ? lastOverlays[len - 1] : null;
						if (overlay && overlay._dObj && overlay._dObj._map) {
							overlay._dObj._map.removeLayer(overlay._dObj);
						}
						if (exportIcon) { L.DomUtil.addClass(exportIcon, 'notVisible'); }
					}
				});
			}
			exportIcon = L.DomUtil.create('a', 'button notVisible', operCont);
			exportIcon.setAttribute('target', '_blank');
			exportIcon.setAttribute('href', '');
			exportIcon.innerHTML = 'Экспорт в GeoJSON';
			exportIcon.addEventListener('click', function () {
			  var len = lastOverlays.length,
				overlay = len ? lastOverlays[len - 1] : null;
			  if (overlay && overlay._dObj && overlay._dObj._map) {
				var dObj = overlay._dObj;
				var geoJSON = dObj.toGeoJSON();
				geoJSON.properties = it.attrs;
				var blob = new Blob([JSON.stringify(geoJSON, null, '\t')], {type: 'text/json;charset=utf-8;'});
				exportIcon.setAttribute('download', id + '.geojson');
				exportIcon.setAttribute('href', window.URL.createObjectURL(blob));
			  }
			}, false);

			L.CadUtils.getFeature(id, cadCount, featureCont, layer, map);
            return res;
        },
        _clearLastBalloon: function(map) {
			if (this._lastOpenedPopup && map.hasLayer(this._lastOpenedPopup)) { map.removeLayer(this._lastOpenedPopup); }
			this._lastOpenedPopup = null;
        },
        balloon: function(ev) {
            if (ev.type === 'click' && this._map) {
                var cadastrePkk5 = this,
                    map = this._map,
                    latlng = ev.latlng,
					tolerance = Math.floor(1049038 / Math.pow(2, map.getZoom()));

                L.CadUtils._clearLastBalloon(map);
                var popup = L.popup({minWidth: 350, className: 'cadasterPopup'}, cadastrePkk5)
                    .setLatLng(latlng)
                    .setContent('<div class="cadInfo">Поиск информации...</div>')
                    .openOn(map);

                L.CadUtils._lastOpenedPopup = popup;
                L.gmxUtil.getCadastreFeatures(L.extend(ev, {callbackParamName: 'callback'})).then(function(data) {
                    // var res = 'В данной точке объекты не найдены.<br><div class="red">Возможно участок свободен !</div>';
                    var res = 'В данной точке объекты не найдены.<br><div class="red"></div>';
                    var arr = L.CadUtils.parseData(data, tolerance);
                    if (arr.length) {
						popup._itsCurr = 0;
						for (var i = arr.length - 1; i >=0; i--) {
							var attrs = arr[i].attrs,
								id = attrs.id || attrs.cn
							if (id === ev.cn) {
								popup._itsCurr = i;
								break;
							}
						}
						
						popup._its = arr;
                        res = L.CadUtils.getContent(cadastrePkk5, popup);
                    // } else {
						// nsGmx.Utils.showDialog('Объект не найден!', '', 300, 150);
					}
                    popup.setContent(res);
                    return 1;
                });
            }
        },
		_parcelOwnership: {'200': 'Собственность публично-правовых образований', '100': 'Частная собственность'},
		getOwnership: function(id) {
			return this._parcelOwnership[id] || '';
        },
		_states: {'01': 'Ранее учтенный', '03': 'Условный', '04': 'Внесенный', '05': 'Временный (Удостоверен)', '06': 'Учтенный', '07': 'Снят с учета', '08': 'Аннулированный'},
		getState: function(id) {
			return this._states[id] || '';
        },
		_utilizations: { '141000000000': 'Для размещения объектов сельскохозяйственного назначения и сельскохозяйственных угодий', '141001000000': 'Для сельскохозяйственного производства', '141001010000': 'Для использования в качестве сельскохозяйственных угодий', '141001020000': 'Для размещения зданий, строений, сооружений, используемых для производства, хранения и первичной переработки сельскохозяйственной продукции', '141001030000': 'Для размещения внутрихозяйственных дорог и коммуникаций', '141001040000': 'Для размещения водных объектов', '141002000000': 'Для ведения крестьянского (фермерского) хозяйства', '141003000000': 'Для ведения личного подсобного хозяйства', '141004000000': 'Для ведения гражданами садоводства и огородничества', '141005000000': 'Для ведения гражданами животноводства', '141006000000': 'Для дачного строительства', '141007000000': 'Для размещения древесно-кустарниковой растительности, предназначенной для защиты земель от воздействия негативных (вредных) природных, антропогенных и техногенных явлений', '141008000000': 'Для научно-исследовательских целей', '141009000000': 'Для учебных целей', '141010000000': 'Для сенокошения и выпаса скота гражданами', '141011000000': 'Фонд перераспределения', '141012000000': 'Для размещения объектов охотничьего хозяйства', '141013000000': 'Для размещения объектов рыбного хозяйства', '141014000000': 'Для иных видов сельскохозяйственного использования', '142000000000': 'Для размещения объектов, характерных для населенных пунктов', '142001000000': 'Для объектов жилой застройки', '142001010000': 'Для индивидуальной жилой застройки', '142001020000': 'Для многоквартирной застройки', '142001020100': 'Для малоэтажной застройки', '142001020200': 'Для среднеэтажной застройки', '142001020300': 'Для многоэтажной застройки', '142001020400': 'Для иных видов жилой застройки', '142001030000': 'Для размещения объектов дошкольного, начального, общего и среднего (полного) общего образования', '142001040000': 'Для размещения иных объектов, допустимых в жилых зонах и не перечисленных в классификаторе', '142002000000': 'Для объектов общественно-делового значения', '142002010000': 'Для размещения объектов социального и коммунально-бытового назначения', '142002020000': 'Для размещения объектов здравоохранения', '142002030000': 'Для размещения объектов культуры', '142002040000': 'Для размещения объектов торговли', '142002040100': 'Для размещения объектов розничной торговли', '142002040200': 'Для размещения объектов оптовой торговли', '142002050000': 'Для размещения объектов общественного питания', '142002060000': 'Для размещения объектов предпринимательской деятельности', '142002070000': 'Для размещения объектов среднего профессионального и высшего профессионального образования', '142002080000': 'Для размещения административных зданий', '142002090000': 'Для размещения научно-исследовательских учреждений', '142002100000': 'Для размещения культовых зданий', '142002110000': 'Для стоянок автомобильного транспорта', '142002120000': 'Для размещения объектов делового назначения, в том числе офисных центров', '142002130000': 'Для размещения объектов финансового назначения', '142002140000': 'Для размещения гостиниц', '142002150000': 'Для размещения подземных или многоэтажных гаражей', '142002160000': 'Для размещения индивидуальных гаражей', '142002170000': 'Для размещения иных объектов общественно-делового значения, обеспечивающих жизнь граждан', '142003000000': 'Для общего пользования (уличная сеть)', '142004000000': 'Для размещения объектов специального назначения', '142004010000': 'Для размещения кладбищ', '142004020000': 'Для размещения крематориев', '142004030000': 'Для размещения скотомогильников', '142004040000': 'Под объектами размещения отходов потребления', '142004050000': 'Под иными объектами специального назначения', '142005000000': 'Для размещения коммунальных, складских объектов', '142006000000': 'Для размещения объектов жилищно-коммунального хозяйства', '142007000000': 'Для иных видов использования, характерных для населенных пунктов', '143000000000': 'Для размещения объектов промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, обеспечения космической деятельности, обороны, безопасности и иного специального назначения', '143001000000': 'Для размещения промышленных объектов', '143001010000': 'Для размещения производственных и административных зданий, строений, сооружений и обслуживающих их объектов', '143001010100': 'Для размещения производственных зданий', '143001010200': 'Для размещения коммуникаций', '143001010300': 'Для размещения подъездных путей', '143001010400': 'Для размещения складских помещений', '143001010500': 'Для размещения административных зданий', '143001010600': 'Для размещения культурно-бытовых зданий', '143001010700': 'Для размещения иных сооружений промышленности', '143001020000': 'Для добычи и разработки полезных ископаемых', '143001030000': 'Для размещения иных объектов промышленности', '143002000000': 'Для размещения объектов энергетики', '143002010000': 'Для размещения электростанций и обслуживающих сооружений и объектов', '143002010100': 'Для размещения гидроэлектростанций', '143002010200': 'Для размещения атомных станций', '143002010300': 'Для размещения ядерных установок', '143002010400': 'Для размещения пунктов хранения ядерных материалов и радиоактивных веществ энергетики', '143002010500': 'Для размещения хранилищ радиоактивных отходов', '143002010600': 'Для размещения тепловых станций', '143002010700': 'Для размещения иных типов электростанций', '143002010800': 'Для размещения иных обслуживающих сооружений и объектов', '143002020000': 'Для размещения объектов электросетевого хозяйства', '143002020100': 'Для размещения воздушных линий электропередачи', '143002020200': 'Для размещения наземных сооружений кабельных линий электропередачи', '143002020300': 'Для размещения подстанций', '143002020400': 'Для размещения распределительных пунктов', '143002020500': 'Для размещения других сооружений и объектов электросетевого хозяйства', '143002030000': 'Для размещения иных объектов энергетики', '143003000000': 'Для размещения объектов транспорта', '143003010000': 'Для размещения и эксплуатации объектов железнодорожного транспорта', '143003010100': 'Для размещения железнодорожных путей и их конструктивных элементов', '143003010200': 'Для размещения полос отвода железнодорожных путей', '143003010300': 'Для размещения, эксплуатации, расширения и реконструкции строений, зданий, сооружений, в том числе железнодорожных вокзалов, железнодорожных станций, а также устройств и других объектов, необходимых для эксплуатации, содержания, строительства, реконструкции, ремонта, развития наземных и подземных зданий, строений, сооружений, устройств и других объектов железнодорожного транспорта', '143003010301': 'Для размещения железнодорожных вокзалов', '143003010302': 'Для размещения железнодорожных станций', '143003010303': 'Для размещения устройств и других объектов, необходимых для эксплуатации, содержания, строительства, реконструкции, ремонта, развития наземных и подземных зданий, строений, сооружений, устройств и других объектов железнодорожного транспорта', '143003020000': 'Для размещения и эксплуатации объектов автомобильного транспорта и объектов дорожного хозяйства', '143003020100': 'Для размещения автомобильных дорог и их конструктивных элементов', '143003020200': 'Для размещения полос отвода', '143003020300': 'Для размещения объектов дорожного сервиса в полосах отвода автомобильных дорог', '143003020400': 'Для размещения дорожных сооружений', '143003020500': 'Для размещения автовокзалов и автостанций', '143003020600': 'Для размещения иных объектов автомобильного транспорта и дорожного хозяйства', '143003030000': 'Для размещения и эксплуатации объектов морского, внутреннего водного транспорта', '143003030100': 'Для размещения искусственно созданных внутренних водных путей', '143003030200': 'Для размещения морских и речных портов, причалов, пристаней', '143003030300': 'Для размещения иных объектов морского, внутреннего водного транспорта', '143003030400': 'Для выделения береговой полосы', '143003040000': 'Для размещения и эксплуатации объектов воздушного транспорта', '143003040100': 'Для размещения аэропортов и аэродромов', '143003040200': 'Для размещения аэровокзалов', '143003040300': 'Для размещения взлетно-посадочных полос', '143003040400': 'Для размещения иных наземных объектов воздушного транспорта', '143003050000': 'Для размещения и эксплуатации объектов трубопроводного транспорта', '143003050100': 'Для размещения нефтепроводов', '143003050200': 'Для размещения газопроводов', '143003050300': 'Для размещения иных трубопроводов', '143003050400': 'Для размещения иных объектов трубопроводного транспорта', '143003060000': 'Для размещения и эксплуатации иных объектов транспорта', '143004000000': 'Для размещения объектов связи, радиовещания, телевидения, информатики', '143004010000': 'Для размещения эксплуатационных предприятий связи и обслуживания линий связи', '143004020000': 'Для размещения кабельных, радиорелейных и воздушных линий связи и линий радиофикации на трассах кабельных и воздушных линий связи и радиофикации и их охранные зоны', '143004030000': 'Для размещения подземных кабельных и воздушных линий связи и радиофикации и их охранные зоны', '143004040000': 'Для размещения наземных и подземных необслуживаемых усилительных пунктов на кабельных линиях связи и их охранные зоны', '143004050000': 'Для размещения наземных сооружений и инфраструктур спутниковой связи', '143004060000': 'Для размещения иных объектов связи, радиовещания, телевидения, информатики', '143005000000': 'Для размещения объектов, предназначенных для обеспечения космической деятельности', '143005010000': 'Для размещения космодромов, стартовых комплексов и пусковых установок', '143005020000': 'Для размещения командно-измерительных комплексов, центров и пунктов управления полетами космических объектов, приема, хранения и переработки информации', '143005030000': 'Для размещения баз хранения космической техники', '143005040000': 'Для размещения полигонов приземления космических объектов и взлетно-посадочных полос', '143005050000': 'Для размещения объектов экспериментальной базы для отработки космической техники', '143005060000': 'Для размещения центров и оборудования для подготовки космонавтов', '143005070000': 'Для размещения других наземных сооружений и техники, используемых при осуществлении космической деятельности', '143006000000': 'Для размещения объектов, предназначенных для обеспечения обороны и безопасности', '143006010000': 'Для обеспечения задач обороны', '143006010100': 'Для размещения военных организаций, учреждений и других объектов', '143006010200': 'Для дислокации войск и сил флота', '143006010300': 'Для проведения учений и иных мероприятий', '143006010400': 'Для испытательных полигонов', '143006010500': 'Для мест уничтожения оружия и захоронения отходов', '143006010600': 'Для создания запасов материальных ценностей в государственном и мобилизационном резервах (хранилища, склады и другие)', '143006010700': 'Для размещения иных объектов обороны', '143006020000': 'Для размещения объектов (территорий), обеспечивающих защиту и охрану Государственной границы Российской Федерации', '143006020100': 'Для обустройства и содержания инженерно-технических сооружений и заграждений', '143006020200': 'Для обустройства и содержания пограничных знаков', '143006020300': 'Для обустройства и содержания пограничных просек', '143006020400': 'Для обустройства и содержания коммуникаций', '143006020500': 'Для обустройства и содержания пунктов пропуска через Государственную границу Российской Федерации', '143006020600': 'Для размещения иных объектов для защиты и охраны Государственной границы Российской Федерации', '143006030000': 'Для размещения иных объектов обороны и безопасности', '143007000000': 'Для размещения иных объектов промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, обеспечения космической деятельности, обороны, безопасности и иного специального назначения', '144000000000': 'Для размещения особо охраняемых историко-культурных и природных объектов (территорий)', '144001000000': 'Для размещения особо охраняемых природных объектов (территорий)', '144001010000': 'Для размещения государственных природных заповедников (в том числе биосферных)', '144001020000': 'Для размещения государственных природных заказников', '144001030000': 'Для размещения национальных парков', '144001040000': 'Для размещения природных парков', '144001050000': 'Для размещения дендрологических парков', '144001060000': 'Для размещения ботанических садов', '144001070000': 'Для размещения объектов санаторного и курортного назначения', '144001080000': 'Территории месторождений минеральных вод, лечебных грязей, рапы лиманов и озер', '144001090000': 'Для традиционного природопользования', '144001100000': 'Для размещения иных особо охраняемых природных территорий (объектов)', '144002000000': 'Для размещения объектов (территорий) природоохранного назначения', '144003000000': 'Для размещения объектов (территорий) рекреационного назначения', '144003010000': 'Для размещения домов отдыха, пансионатов, кемпингов', '144003020000': 'Для размещения объектов физической культуры и спорта', '144003030000': 'Для размещения туристических баз, стационарных и палаточных туристско-оздоровительных лагерей, домов рыболова и охотника, детских туристических станций', '144003040000': 'Для размещения туристических парков', '144003050000': 'Для размещения лесопарков', '144003060000': 'Для размещения учебно-туристических троп и трасс', '144003070000': 'Для размещения детских и спортивных лагерей', '144003080000': 'Для размещения скверов, парков, городских садов', '144003090000': 'Для размещения пляжей', '144003100000': 'Для размещения иных объектов (территорий) рекреационного назначения', '144004000000': 'Для размещения объектов историко-культурного назначения', '144004010000': 'Для размещения объектов культурного наследия народов Российской Федерации (памятников истории и культуры), в том числе объектов археологического наследия', '144004020000': 'Для размещения военных и гражданских захоронений', '144005000000': 'Для размещения иных особо охраняемых историко-культурных и природных объектов (территорий)', '145000000000': 'Для размещения объектов лесного фонда', '145001000000': 'Для размещения лесной растительности', '145002000000': 'Для восстановления лесной растительности', '145003000000': 'Для прочих объектов лесного хозяйства', '146000000000': 'Для размещения объектов водного фонда', '146001000000': 'Под водными объектами', '146002000000': 'Для размещения гидротехнических сооружений', '146003000000': 'Для размещения иных сооружений, расположенных на водных объектах', '147000000000': 'Земли запаса (неиспользуемые)', '014001000000': 'Земли жилой застройки', '014001001000': 'Земли под жилыми домами многоэтажной и повышенной этажности застройки', '014001002000': 'Земли под домами индивидуальной жилой застройкой', '014001003000': 'Незанятые земли, отведенные под жилую застройку', '014002000000': 'Земли общественно-деловой застройки', '014002001000': 'Земли гаражей и автостоянок', '014002002000': 'Земли под объектами торговли, общественного питания, бытового обслуживания, автозаправочными и газонаполнительными станциями, предприятиями автосервиса', '014002003000': 'Земли учреждений и организаций народного образования, земли под объектами здравоохранения и социального обеспечения физической культуры и спорта, культуры и искусства, религиозными объектами', '014002004000': 'Земли под административно-управлен-ческими и общественными объектами, земли предприятий, организаций, учреждений финансирования, кредитования, страхования и пенсионного обеспечения', '014002005000': 'Земли под зданиями (строениями) рекреации', '014003000000': 'Земли под объектами промышленности', '014004000000': 'Земли общего пользования (геонимы в поселениях)', '014005000000': 'Земли под объектами транспорта, связи, инженерных коммуникаций', '014005001000': 'Под объектами железнодорожного транспорта', '014005002000': 'Под объектами автомобильного транспорта', '014005003000': 'Под объектами морского, внутреннего водного транспорта', '014005004000': 'Под объектами воздушного транспорта', '014005005000': 'Под объектами иного транспорта, связи, инженерных коммуникаций', '014006000000': 'Земли сельскохозяйственного использования', '014006001000': 'Земли под крестьянскими (фермерскими) хозяйствами', '014006002000': 'Земли под предприятиями, занимающимися сельскохозяйственным производством', '014006003000': 'Земли под садоводческими объединениями и индивидуальными садоводами', '014006004000': 'Земли под огородническими объединениями и индивидуальными огородниками', '014006005000': 'Земли под дачными объединениями', '014006006000': 'Земли под личными подсобными хозяйствами', '014006007000': 'Земли под служебными наделами', '014006008000': 'Земли оленьих пастбищ', '014006009000': 'Для других сельскохозяйственных целей', '014007000000': 'Земли под лесами в поселениях (в том числе городскими лесами), под древесно-кустарниковой растительностью, не входящей в лесной фонд (в том числе лесопарками, парками, скверами, бульварами)', '014008000000': 'Земли, занятые водными объектами, земли водоохранных зон водных объектов, а также земли, выделяемые для установления полос отвода и зон охраны водозаборов, гидротехнических сооружений и иных водохозяйственных сооружений, объектов.', '014009000000': 'Земли под военными и иными режимными объектами', '014010000000': 'Земли под объектами иного специального назначения', '014011000000': 'Земли, не вовлеченные в градостроительную или иную деятельность (земли – резерв)', '014012000000': 'Неопределено', '014013000000': 'Значение отсутствует' },
		getUtilization: function(id) {
			return this._utilizations[id] || '';
        },
		_category_types: { '003001000000': 'Земли сельскохозяйственного назначения', '003002000000': 'Земли поселений (земли населенных пунктов)', '003003000000': 'Земли промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, земли для обеспечения космической деятельности, земли обороны, безопасности и земли иного специального назначения', '003004000000': 'Земли особо охраняемых территорий и объектов', '003005000000': 'Земли лесного фонда', '003006000000': 'Земли водного фонда', '003007000000': 'Земли запаса', '003008000000': 'Категория не установлена' },
		getCategoryType: function(id) {
			return this._category_types[id] || '';
        },
		_cadastreLayers: [
			{id: 5, title: 'ОКС', 		reg: /^\d\d:\d+:\d+:\d+:\d+$/},
			{id: 1, title: 'Участок', 	reg: /^\d\d:\d+:\d+:\d+$/},
			{id: 2, title: 'Квартал',	reg: /^\d\d:\d+:\d+$/},
			{id: 3, title: 'Район', 	reg: /^\d\d:\d+$/},
			{id: 4, title: 'Округ', 	reg: /^\d\d$/},
			{id: 10, title: 'ЗОУИТ', 	reg: /^\d+\.\d+\.\d+/}
			// ,
			// {id: 7, title: 'Границы', 	reg: /^\w+$/},
			// {id: 6, title: 'Тер.зоны', 	reg: /^\w+$/},
			// {id: 12, title: 'Лес', 		reg: /^\w+$/},
			// {id: 13, title: 'Красные линии', 		reg: /^\w+$/},
			// {id: 15, title: 'СРЗУ', 	reg: /^\w+$/},
			// {id: 16, title: 'ОЭЗ', 		reg: /^\w+$/},
			// {id: 9, title: 'ГОК', 		reg: /^\w+$/},
			// /[^\d\:]/g,
			// /\d\d:\d+$/,
			// /\d\d:\d+:\d+$/,
			// /\d\d:\d+:\d+:\d+$/
		],
		getCadastreLayer: function (str, type) {
			str = str.trim();
			for (var i = 0, len = this._cadastreLayers.length; i < len; i++) {
				var it = this._cadastreLayers[i];
				if (it.id === type) { return it; }
				if (it.reg.exec(str)) { return it; }
			}
			return null;
		}
    };

	L.PKK5Cadastre = L.LayerGroup.extend({
		options: {
			layers: [
				{mapID: 'E7FDC4AA37E94F8FB7F7DA8D62D92D2E', layerID: '601A1D04DD5140388BF5C1A3AD5588F5'}
				// ,
				// zones: {mapID: 'E7FDC4AA37E94F8FB7F7DA8D62D92D2E', layerID: 'D72C86EE75A145A7BA0DAA657E28B700'},
				// addon: {mapID: 'E7FDC4AA37E94F8FB7F7DA8D62D92D2E', layerID: '112286131D8C41019BB3188CFD8E614A'}
			]
		},
		onAdd: function (map) {
			var _container = L.LayerGroup.prototype.onAdd.call(this, map),
				_this = this;

			L.gmx.loadLayers(this.options.layers).then(function(cadastreLayer, zones, addon) {
				_this._cadastreLayer = cadastreLayer;
				cadastreLayer.options.zIndex = 1000000;
				_this.addLayer(cadastreLayer);
				if (zones) { _this.addLayer(zones); }
				if (addon) { _this.addLayer(addon); }
				cadastreLayer.getContainer().style.cursor = 'help';
				if (window.location.search) {
				  var st = window.location.search,
					match = st.match(/latlng=([^&]+)/),
					cdMatch = st.match(/cad=([^&]+)/);

				  if (cdMatch) {
					lastOverlayId = cdMatch[1];
				  }
				  if (match) {
					  cadNeedClickLatLng = L.latLng(match[1].split(','));
				  }
				}
				if (lastOverlayId) {
					_this.searchHook(lastOverlayId);
				} else if (cadNeedClickLatLng) {
					_this.clickOn({latlng: cadNeedClickLatLng});
				}
				cadastreLayer.on('popupclose', function() {
					L.CadUtils.clearOverlays();
				});
			});
			map
				.on('click', this.clickOn, this)
				.on('moveend', this.onMoveend, this);
			var overlayPane = map.getPanes().overlayPane;
			if (overlayPane) {
				overlayPane.style.cursor = 'help';
			}
			if (map._pathRoot) {
				map._pathRoot.style.cursor = 'help';
			}
			return _container;
		},
		onRemove: function (map) {
			L.LayerGroup.prototype.onRemove.call(this, map);
			lastOverlayId = null;
			L.CadUtils.clearOverlays();
			L.CadUtils._clearLastBalloon(map);
			var overlayPane = map.getPanes().overlayPane;
			if (overlayPane) {
				overlayPane.style.cursor = 'default';
			}
			if (map._pathRoot) {
				map._pathRoot.style.cursor = 'default';
			}
			map
				.off('click', this.clickOn, this)
				.off('moveend', this.onMoveend, this);
		},
		onMoveend: function(ev) {
			var len = lastOverlays.length;
			if (len) {
				var overlay = lastOverlays[len - 1];
				if (!overlay.options.full) {
					L.CadUtils.setOverlay(overlay.options.it, map);
				}
			}
		},
		clickOn: function(ev) {
			if (this._map) {
				this._map._skipClick = true;
				this._cadClickLatLng = ev.latlng;
				L.CadUtils.balloon.call(this._cadastreLayer, {type: 'click', latlng: this._cadClickLatLng});
			}
		},
		searchHook: function(str) {
			str = str.trim();
			var it = L.CadUtils.getCadastreLayer(str),
				_this = this;
			if (!it) { return false; }
			L.gmxUtil.requestJSONP('http://pkk5.rosreestr.ru/api/features/' + it.id,
				{
					WrapStyle: 'func',
					text: str,
					limit: it.limit || 11,
					tolerance: it.tolerance || 64
				},
				{
					callbackParamName: 'callback'
				}
			).then(function(result) {
				// console.log('result', result);
				if (result && result.features && result.features.length) {
					// addLayer().then(function() {
						var res = result.features[0];
						L.CadUtils.setBoundsView(res.attrs.cn, res, _this._cadastreLayer);

						var featureExtent = L.CadUtils.getFeatureExtent(res, _this._cadastreLayer._map);							
						_this._cadClickLatLng = featureExtent.latlng;
						L.CadUtils.balloon.call(_this._cadastreLayer, {type: 'click', latlng: featureExtent.latlng, cn: str});
					// });
				} else {
					showErrorMessage(it.title + '`' + str + '`' + ' не найден!', true, 'Поиск по кадастровым номерам');
				}
			});
			return true;
		}
    });
	L.pkk5Cadastre = function (options) {
	  return new L.PKK5Cadastre(options);
	};
})();
