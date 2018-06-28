import { Geometry, Matrix4, FaceColors, Vector2, Vector3, Face3, Color, Mesh, MeshPhongMaterial, Texture } from 'three'

/* eslint-disable */
/**
 * @namespace
 */
var vox = {};

export default vox;

(function() {

		/**
		 * @constructor
		 * @property {Object} size {x, y, z}
		 * @property {Array} voxels [{x, y, z, colorIndex}...]
		 * @property {Array} palette [{r, g, b, a}...]
		 */
		vox.VoxelData = function() {
				this.size = null;
				this.voxels = [];
				this.palette = [];

				this.anim = [{
						size: null,
						voxels: [],
				}];
		};

})();

(function() {

		vox.Xhr = function() {};
		vox.Xhr.prototype.getBinary = function(url) {
				return new Promise(function(resolve, reject) {
						var xhr = new XMLHttpRequest();
						xhr.open("GET", url, true);
						xhr.responseType = "arraybuffer";
						xhr.onreadystatechange = function() {
								if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
										var arrayBuffer = xhr.response;
										if (arrayBuffer) {
												var byteArray = new Uint8Array(arrayBuffer);
												resolve(byteArray);
										}
								}
						};
						xhr.send(null);
				});
		};

})();

(function() {

		/**
		 * @constructor
		 */
		vox.Parser = function() {};

		/**
		 * 戻り値のPromiseは成功すると{@link vox.VoxelData}を返す.
		 * @param {String} url
		 * @return {Promise}
		 */
		vox.Parser.prototype.parse = function(url) {
				var self = this;
				var xhr = new vox.Xhr();
				return xhr.getBinary(url).then(function(uint8Array) {
						return new Promise(function(resolve, reject) {
								self.parseUint8Array(uint8Array, function(error, voxelData) {
										if (error) {
												reject(error);
										} else {
												resolve(voxelData);
										}
								});
						});
				});
		};

		// if (typeof(require) !== "undefined") {
		//     var fs from "fs");
		//     /**
		//      * for node.js
		//      * @param {String} path
		//      * @param {function} callback
		//      */
		//     vox.Parser.prototype.parseFile = function(path, callback) {
		//         fs.readFile(path, function(error, data) {
		//             if (error) {
		//                 return callback(error);
		//             } else {
		//                 var uint8Array = new Uint8Array(new ArrayBuffer(data.length));
		//                 for (var i = 0, len = data.length; i < len; i++) {
		//                     uint8Array[i] = data[i];
		//                 }
		//                 this.parseUint8Array(uint8Array, callback);
		//             }
		//         }.bind(this));
		//     };
		// }

		/**
		 * @param {Uint8Array} uint8Array
		 * @param {function} callback
		 */
		vox.Parser.prototype.parseUint8Array = function(uint8Array, callback) {
				var dataHolder = new DataHolder(uint8Array);
				try {
						root(dataHolder);
						dataHolder.data.size = dataHolder.data.anim[0].size;
						dataHolder.data.voxels = dataHolder.data.anim[0].voxels;
						if (dataHolder.data.palette.length === 0) {
								// console.debug("(use default palette)");
								dataHolder.data.palette = vox.defaultPalette;
						} else {
								dataHolder.data.palette.unshift(dataHolder.data.palette[0]);
								dataHolder.data.palette.pop();
						}

						callback(null, dataHolder.data);
				} catch (e) {
						callback(e);
				}
		};

		var DataHolder = function(uint8Array) {
				this.uint8Array = uint8Array;
				this.cursor = 0;
				this.data = new vox.VoxelData();

				this._currentChunkId = null;
				this._currentChunkSize = 0;
		};
		DataHolder.prototype.next = function() {
				return this.uint8Array[this.cursor++];
		};
		DataHolder.prototype.hasNext = function() {
				return this.cursor < this.uint8Array.byteLength;
		};

		var root = function(dataHolder) {
				magicNumber(dataHolder);
				versionNumber(dataHolder);
				chunk(dataHolder); // main chunk
		};

		var magicNumber = function(dataHolder) {
				var str = "";
				for (var i = 0; i < 4; i++) {
						str += String.fromCharCode(dataHolder.next());
				}

				if (str !== "VOX ") {
						throw new Error("invalid magic number '" + str + "'");
				}
		};

		var versionNumber = function(dataHolder) {
				var ver = 0;
				for (var i = 0; i < 4; i++) {
						ver += dataHolder.next() * Math.pow(256, i);
				}
		};

		var chunk = function(dataHolder) {
				if (!dataHolder.hasNext()) return false;

				chunkId(dataHolder);
				sizeOfChunkContents(dataHolder);
				totalSizeOfChildrenChunks(dataHolder);
				contents(dataHolder);
				while (chunk(dataHolder));
				return dataHolder.hasNext();
		};

		var chunkId = function(dataHolder) {
				var id = "";
				for (var i = 0; i < 4; i++) {
						id += String.fromCharCode(dataHolder.next());
				}
				dataHolder._currentChunkId = id;
				dataHolder._currentChunkSize = 0;

				// console.debug("chunk id = " + id);
		};

		var sizeOfChunkContents = function(dataHolder) {
				var size = 0;
				for (var i = 0; i < 4; i++) {
						size += dataHolder.next() * Math.pow(256, i);
				}
				dataHolder._currentChunkSize = size;

				// console.debug("  size of chunk = " + size);
		};

		var totalSizeOfChildrenChunks = function(dataHolder) {
				var size = 0;
				for (var i = 0; i < 4; i++) {
						size += dataHolder.next() * Math.pow(256, i);
				}

				// console.debug("  total size of children chunks = " + size);
		};

		var contents = function(dataHolder) {
				switch (dataHolder._currentChunkId) {
				case "PACK":
						contentsOfPackChunk(dataHolder);
						break;
				case "SIZE":
						contentsOfSizeChunk(dataHolder);
						break;
				case "XYZI":
						contentsOfVoxelChunk(dataHolder);
						break;
				case "RGBA":
						contentsOfPaletteChunk(dataHolder);
						break;
				case "MATT":
						contentsOfMaterialChunk(dataHolder);
						break;
				}
		};

		var contentsOfPackChunk = function(dataHolder) {
				var size = 0;
				for (var i = 0; i < 4; i++) {
						size += dataHolder.next() * Math.pow(256, i);
				}

				// console.debug("  num of SIZE and XYZI chunks = " + size);
		};

		var contentsOfSizeChunk = function(dataHolder) {
				var x = 0;
				for (var i = 0; i < 4; i++) {
						x += dataHolder.next() * Math.pow(256, i);
				}
				var y = 0;
				for (var i = 0; i < 4; i++) {
						y += dataHolder.next() * Math.pow(256, i);
				}
				var z = 0;
				for (var i = 0; i < 4; i++) {
						z += dataHolder.next() * Math.pow(256, i);
				}
				// console.debug("  bounding box size = " + x + ", " + y + ", " + z);

				var data = dataHolder.data.anim[dataHolder.data.anim.length - 1];
				if (data.size) {
						data = { size: null, voxels: [] };
						dataHolder.data.anim.push(data);
				}
				data.size = {
						x: x,
						y: y,
						z: z,
				};
		};

		var contentsOfVoxelChunk = function(dataHolder) {
				var num = 0;
				for (var i = 0; i < 4; i++) {
						num += dataHolder.next() * Math.pow(256, i);
				}
				// console.debug("  voxel size = " + num);

				var data = dataHolder.data.anim[dataHolder.data.anim.length - 1];
				if (data.voxels.length) {
						data = { size: null, voxels: [] };
						dataHolder.data.anim.push(data);
				}
				for (var i = 0; i < num; i++) {
						data.voxels.push({
								x: dataHolder.next(),
								y: dataHolder.next(),
								z: dataHolder.next(),
								colorIndex: dataHolder.next(),
						});
				}
		};

		var contentsOfPaletteChunk = function(dataHolder) {
				// console.debug("  palette");
				for (var i = 0; i < 256; i++) {
						var p = {
								r: dataHolder.next(),
								g: dataHolder.next(),
								b: dataHolder.next(),
								a: dataHolder.next(),
						};
						dataHolder.data.palette.push(p);
				}
		};

		var contentsOfMaterialChunk = function(dataHolder) {
				// console.debug("  material");
				var id = 0;
				for (var i = 0; i < 4; i++) {
						id += dataHolder.next() * Math.pow(256, i);
				}
				// console.debug("    id = " + id);

				var type = 0;
				for (var i = 0; i < 4; i++) {
						type += dataHolder.next() * Math.pow(256, i);
				}
				// console.debug("    type = " + type + " (0:diffuse 1:metal 2:glass 3:emissive)");

				var weight = 0;
				for (var i = 0; i < 4; i++) {
						weight += dataHolder.next() * Math.pow(256, i);
				}
				// console.debug("    weight = " + parseFloat(weight));

				var propertyBits = 0;
				for (var i = 0; i < 4; i++) {
						propertyBits += dataHolder.next() * Math.pow(256, i);
				}
				// console.debug("    property bits = " + propertyBits.toString(2));
				var plastic = !!(propertyBits & 1);
				var roughness = !!(propertyBits & 2);
				var specular = !!(propertyBits & 4);
				var ior = !!(propertyBits & 8);
				var attenuation = !!(propertyBits & 16);
				var power = !!(propertyBits & 32);
				var glow = !!(propertyBits & 64);
				var isTotalPower = !!(propertyBits & 128);
				// console.debug("      Plastic = " + plastic);
				// console.debug("      Roughness = " + roughness);
				// console.debug("      Specular = " + specular);
				// console.debug("      IOR = " + ior);
				// console.debug("      Attenuation = " + attenuation);
				// console.debug("      Power = " + power);
				// console.debug("      Glow = " + glow);
				// console.debug("      isTotalPower = " + isTotalPower);

				var valueNum = 0;
				if (plastic) valueNum += 1;
				if (roughness) valueNum += 1;
				if (specular) valueNum += 1;
				if (ior) valueNum += 1;
				if (attenuation) valueNum += 1;
				if (power) valueNum += 1;
				if (glow) valueNum += 1;
				// isTotalPower is no value

				var values = [];
				for (var j = 0; j < valueNum; j++) {
						values[j] = 0;
						for (var i = 0; i < 4; i++) {
								values[j] += dataHolder.next() * Math.pow(256, i);
						}
						// console.debug("    normalized property value = " + parseFloat(values[j]));
				}
		};

		var parseFloat = function(bytes) {
				var bin = bytes.toString(2);
				while(bin.length < 32) {
						bin = "0" + bin;
				}
				var sign = bin[0] == "0" ? 1 : -1;
				var exponent = Number.parseInt(bin.substring(1, 9), 2) - 127;
				var fraction = Number.parseFloat("1." + Number.parseInt(bin.substring(9), 2));
				return sign * Math.pow(2, exponent) * fraction;
		};

})();

(function() {

		/**
		 * @constructor
		 *
		 * @param {vox.VoxelData} voxelData
		 * @param {Object=} param
		 * @param {number=} param.voxelSize ボクセルの大きさ. default = 1.0.
		 * @param {boolean=} param.vertexColor 頂点色を使用する. default = false.
		 * @param {boolean=} param.optimizeFaces 隠れた頂点／面を削除する. dafalue = true.
		 * @param {boolean=} param.originToBottom 地面の高さを形状の中心にする. dafalue = true.
		 * @property {THREE.Geometry} geometry
		 * @property {THREE.Material} material
		 */
		vox.MeshBuilder = function(voxelData, param) {
				if (vox.MeshBuilder.textureFactory === null) vox.MeshBuilder.textureFactory = new vox.TextureFactory();

				param = param || {};
				this.voxelData = voxelData;
				this.voxelSize = param.voxelSize || vox.MeshBuilder.DEFAULT_PARAM.voxelSize;
				this.vertexColor = (param.vertexColor === undefined) ? vox.MeshBuilder.DEFAULT_PARAM.vertexColor : param.vertexColor;
				this.optimizeFaces = (param.optimizeFaces === undefined) ? vox.MeshBuilder.DEFAULT_PARAM.optimizeFaces : param.optimizeFaces;
				this.originToBottom = (param.originToBottom === undefined) ? vox.MeshBuilder.DEFAULT_PARAM.originToBottom : param.originToBottom;

				this.geometry = null;
				this.material = null;

				this.build();
		};

		vox.MeshBuilder.DEFAULT_PARAM = {
				voxelSize: 1.0,
				vertexColor: false,
				optimizeFaces: true,
				originToBottom: true,
		};

		/**
		 * Voxelデータからジオメトリとマテリアルを作成する.
		 */
		vox.MeshBuilder.prototype.build = function() {
				this.geometry = new Geometry();
				this.material = new MeshPhongMaterial({ specular: 0x333333, shininess: 5 });

				// 隣接ボクセル検索用ハッシュテーブル
				this.hashTable = createHashTable(this.voxelData.voxels);

				var offsetX = (this.voxelData.size.x - 1) * -0.5;
				var offsetY = (this.voxelData.size.y - 1) * -0.5;
				var offsetZ = (this.originToBottom) ? 0 : (this.voxelData.size.z - 1) * -0.5;
				var matrix = new Matrix4();
				this.voxelData.voxels.forEach(function(voxel) {
						var voxGeometry = this._createVoxGeometry(voxel);
						if (voxGeometry) {
								matrix.makeTranslation((voxel.x + offsetX) * this.voxelSize, (voxel.z + offsetZ) * this.voxelSize, -(voxel.y + offsetY) * this.voxelSize);
								this.geometry.merge(voxGeometry, matrix);
						}
				}.bind(this));

				if (this.optimizeFaces) {
						this.geometry.mergeVertices();
				}
				this.geometry.computeFaceNormals();

				if (this.vertexColor) {
						this.material.vertexColors = FaceColors;
				} else {
						this.material.map = vox.MeshBuilder.textureFactory.getTexture(this.voxelData);
				}
		};

		/**
		 * @return {THREE.Texture}
		 */
		vox.MeshBuilder.prototype.getTexture = function() {
				return vox.MeshBuilder.textureFactory.getTexture(this.voxelData);
		};

		vox.MeshBuilder.prototype._createVoxGeometry = function(voxel) {

				// 隣接するボクセルを検索し、存在する場合は面を無視する
				var ignoreFaces = [];
				if (this.optimizeFaces) {
						six.forEach(function(s) {
								if (this.hashTable.has(voxel.x + s.x, voxel.y + s.y, voxel.z + s.z)) {
										ignoreFaces.push(s.ignoreFace);
								}
						}.bind(this));
				}

				// 6方向すべて隣接されていたらnullを返す
				if (ignoreFaces.length ===  6) return null;

				// 頂点データ
				var voxVertices = voxVerticesSource.map(function(voxel) {
						return new Vector3(voxel.x * this.voxelSize * 0.5, voxel.y * this.voxelSize * 0.5, voxel.z * this.voxelSize * 0.5);
				}.bind(this));

				// 面データ
				var voxFaces = voxFacesSource.map(function(f) {
						return {
								faceA: new Face3(f.faceA.a, f.faceA.b, f.faceA.c),
								faceB: new Face3(f.faceB.a, f.faceB.b, f.faceB.c),
						};
				});

				// 頂点色
				if (this.vertexColor) {
						var c = this.voxelData.palette[voxel.colorIndex];
						var color = new Color(c.r / 255, c.g / 255, c.b / 255);
				}

				var vox = new Geometry();
				vox.faceVertexUvs[0] = [];

				// 面を作る
				voxFaces.forEach(function(faces, i) {
						if (ignoreFaces.indexOf(i) >= 0) return;

						if (this.vertexColor) {
								faces.faceA.color = color;
								faces.faceB.color = color;
						} else {
								var uv = new Vector2((voxel.colorIndex + 0.5) / 256, 0.5);
								vox.faceVertexUvs[0].push([uv, uv, uv], [uv, uv, uv]);
						}
						vox.faces.push(faces.faceA, faces.faceB);
				}.bind(this));

				// 使っている頂点を抽出
				var usingVertices = {};
				vox.faces.forEach(function(face) {
						usingVertices[face.a] = true;
						usingVertices[face.b] = true;
						usingVertices[face.c] = true;
				});

				// 面の頂点インデックスを詰める処理
				var splice = function(index) {
						vox.faces.forEach(function(face) {
								if (face.a > index) face.a -= 1;
								if (face.b > index) face.b -= 1;
								if (face.c > index) face.c -= 1;
						});
				};

				// 使っている頂点のみ追加する
				var j = 0;
				voxVertices.forEach(function(vertex, i) {
						if (usingVertices[i]) {
								vox.vertices.push(vertex);
						} else {
								splice(i - j);
								j += 1;
						}
				});

				return vox;
		};

		/**
		 * @return {THREE.Mesh}
		 */
		vox.MeshBuilder.prototype.createMesh = function() {
				return new Mesh(this.geometry, this.material);
		};

		/**
		 * 外側に面したボクセルか
		 * @return {boolean}
		 */
		vox.MeshBuilder.prototype.isOuterVoxel = function(voxel) {
				return six.filter(function(s) {
						return this.hashTable.has(voxel.x + s.x, voxel.y + s.y, voxel.z + s.z);
				}.bind(this)).length < 6;
		};

		/**
		 * @static
		 * @type {vox.TextureFactory}
		 */
		vox.MeshBuilder.textureFactory = null;

		// 隣接方向と無視する面の対応表
		var six = [
				{ x: -1, y: 0, z: 0, ignoreFace: 0 },
				{ x:  1, y: 0, z: 0, ignoreFace: 1 },
				{ x:  0, y:-1, z: 0, ignoreFace: 5 },
				{ x:  0, y: 1, z: 0, ignoreFace: 4 },
				{ x:  0, y: 0, z:-1, ignoreFace: 2 },
				{ x:  0, y: 0, z: 1, ignoreFace: 3 },
		];

		// 頂点データソース
		var voxVerticesSource = [
				{ x: -1, y: 1, z:-1 },
				{ x:  1, y: 1, z:-1 },
				{ x: -1, y: 1, z: 1 },
				{ x:  1, y: 1, z: 1 },
				{ x: -1, y:-1, z:-1 },
				{ x:  1, y:-1, z:-1 },
				{ x: -1, y:-1, z: 1 },
				{ x:  1, y:-1, z: 1 },
		];

		// 面データソース
		var voxFacesSource = [
				{ faceA: { a:6, b:2, c:0 }, faceB: { a:6, b:0, c:4 } },
				{ faceA: { a:5, b:1, c:3 }, faceB: { a:5, b:3, c:7 } },
				{ faceA: { a:5, b:7, c:6 }, faceB: { a:5, b:6, c:4 } },
				{ faceA: { a:2, b:3, c:1 }, faceB: { a:2, b:1, c:0 } },
				{ faceA: { a:4, b:0, c:1 }, faceB: { a:4, b:1, c:5 } },
				{ faceA: { a:7, b:3, c:2 }, faceB: { a:7, b:2, c:6 } },
		];

		var hash = function(x, y, z) {
				return "x" + x + "y" + y + "z" + z;
		};

		var createHashTable = function(voxels) {
				var hashTable = {};
				voxels.forEach(function(v) {
						hashTable[hash(v.x, v.y, v.z)] = true;
				});

				hashTable.has = function(x, y, z) {
						return hash(x, y, z) in this;
				}
				return hashTable;
		};

})();

(function() {
		/**
		 * @constructor
		 */
		vox.TextureFactory = function() {};

		/**
		 * @param {vox.VoxelData} voxelData
		 * @return {HTMLCanvasElement}
		 */
		vox.TextureFactory.prototype.createCanvas = function(voxelData) {
				var canvas = document.createElement("canvas");
				canvas.width = 256;
				canvas.height= 1;
				var context = canvas.getContext("2d");
				for (var i = 0, len = voxelData.palette.length; i < len; i++) {
						var p = voxelData.palette[i];
						context.fillStyle = "rgb(" + p.r + "," + p.g + "," + p.b + ")";
						context.fillRect(i * 1, 0, 1, 1);
				}

				return canvas;
		};

		/**
		 * パレット情報を元に作成したテクスチャを返す.
		 * 生成されたテクスチャはキャッシュされ、同一のパレットからは同じテクスチャオブジェクトが返される.
		 * @param {vox.VoxelData} voxelData
		 * @return {THREE.Texture}
		 */
		vox.TextureFactory.prototype.getTexture = function(voxelData) {
				var palette = voxelData.palette;
				var canvas = this.createCanvas(voxelData);
				var texture = new Texture(canvas);
				texture.needsUpdate = true;
				return texture;
		};

		var hex = function(num) {
				var r = num.toString(16);
				return (r.length === 1) ? "0" + r : r;
		};

})();

(function() {

		/**
		 * MagicaVoxelのデフォルトパレット
		 * @static
		 */
		vox.defaultPalette = [
				{r:255,g:255,b:255,a:255},
				{r:255,g:255,b:255,a:255},
				{r:255,g:255,b:204,a:255},
				{r:255,g:255,b:153,a:255},
				{r:255,g:255,b:102,a:255},
				{r:255,g:255,b:51,a:255},
				{r:255,g:255,b:0,a:255},
				{r:255,g:204,b:255,a:255},
				{r:255,g:204,b:204,a:255},
				{r:255,g:204,b:153,a:255},
				{r:255,g:204,b:102,a:255},
				{r:255,g:204,b:51,a:255},
				{r:255,g:204,b:0,a:255},
				{r:255,g:153,b:255,a:255},
				{r:255,g:153,b:204,a:255},
				{r:255,g:153,b:153,a:255},
				{r:255,g:153,b:102,a:255},
				{r:255,g:153,b:51,a:255},
				{r:255,g:153,b:0,a:255},
				{r:255,g:102,b:255,a:255},
				{r:255,g:102,b:204,a:255},
				{r:255,g:102,b:153,a:255},
				{r:255,g:102,b:102,a:255},
				{r:255,g:102,b:51,a:255},
				{r:255,g:102,b:0,a:255},
				{r:255,g:51,b:255,a:255},
				{r:255,g:51,b:204,a:255},
				{r:255,g:51,b:153,a:255},
				{r:255,g:51,b:102,a:255},
				{r:255,g:51,b:51,a:255},
				{r:255,g:51,b:0,a:255},
				{r:255,g:0,b:255,a:255},
				{r:255,g:0,b:204,a:255},
				{r:255,g:0,b:153,a:255},
				{r:255,g:0,b:102,a:255},
				{r:255,g:0,b:51,a:255},
				{r:255,g:0,b:0,a:255},
				{r:204,g:255,b:255,a:255},
				{r:204,g:255,b:204,a:255},
				{r:204,g:255,b:153,a:255},
				{r:204,g:255,b:102,a:255},
				{r:204,g:255,b:51,a:255},
				{r:204,g:255,b:0,a:255},
				{r:204,g:204,b:255,a:255},
				{r:204,g:204,b:204,a:255},
				{r:204,g:204,b:153,a:255},
				{r:204,g:204,b:102,a:255},
				{r:204,g:204,b:51,a:255},
				{r:204,g:204,b:0,a:255},
				{r:204,g:153,b:255,a:255},
				{r:204,g:153,b:204,a:255},
				{r:204,g:153,b:153,a:255},
				{r:204,g:153,b:102,a:255},
				{r:204,g:153,b:51,a:255},
				{r:204,g:153,b:0,a:255},
				{r:204,g:102,b:255,a:255},
				{r:204,g:102,b:204,a:255},
				{r:204,g:102,b:153,a:255},
				{r:204,g:102,b:102,a:255},
				{r:204,g:102,b:51,a:255},
				{r:204,g:102,b:0,a:255},
				{r:204,g:51,b:255,a:255},
				{r:204,g:51,b:204,a:255},
				{r:204,g:51,b:153,a:255},
				{r:204,g:51,b:102,a:255},
				{r:204,g:51,b:51,a:255},
				{r:204,g:51,b:0,a:255},
				{r:204,g:0,b:255,a:255},
				{r:204,g:0,b:204,a:255},
				{r:204,g:0,b:153,a:255},
				{r:204,g:0,b:102,a:255},
				{r:204,g:0,b:51,a:255},
				{r:204,g:0,b:0,a:255},
				{r:153,g:255,b:255,a:255},
				{r:153,g:255,b:204,a:255},
				{r:153,g:255,b:153,a:255},
				{r:153,g:255,b:102,a:255},
				{r:153,g:255,b:51,a:255},
				{r:153,g:255,b:0,a:255},
				{r:153,g:204,b:255,a:255},
				{r:153,g:204,b:204,a:255},
				{r:153,g:204,b:153,a:255},
				{r:153,g:204,b:102,a:255},
				{r:153,g:204,b:51,a:255},
				{r:153,g:204,b:0,a:255},
				{r:153,g:153,b:255,a:255},
				{r:153,g:153,b:204,a:255},
				{r:153,g:153,b:153,a:255},
				{r:153,g:153,b:102,a:255},
				{r:153,g:153,b:51,a:255},
				{r:153,g:153,b:0,a:255},
				{r:153,g:102,b:255,a:255},
				{r:153,g:102,b:204,a:255},
				{r:153,g:102,b:153,a:255},
				{r:153,g:102,b:102,a:255},
				{r:153,g:102,b:51,a:255},
				{r:153,g:102,b:0,a:255},
				{r:153,g:51,b:255,a:255},
				{r:153,g:51,b:204,a:255},
				{r:153,g:51,b:153,a:255},
				{r:153,g:51,b:102,a:255},
				{r:153,g:51,b:51,a:255},
				{r:153,g:51,b:0,a:255},
				{r:153,g:0,b:255,a:255},
				{r:153,g:0,b:204,a:255},
				{r:153,g:0,b:153,a:255},
				{r:153,g:0,b:102,a:255},
				{r:153,g:0,b:51,a:255},
				{r:153,g:0,b:0,a:255},
				{r:102,g:255,b:255,a:255},
				{r:102,g:255,b:204,a:255},
				{r:102,g:255,b:153,a:255},
				{r:102,g:255,b:102,a:255},
				{r:102,g:255,b:51,a:255},
				{r:102,g:255,b:0,a:255},
				{r:102,g:204,b:255,a:255},
				{r:102,g:204,b:204,a:255},
				{r:102,g:204,b:153,a:255},
				{r:102,g:204,b:102,a:255},
				{r:102,g:204,b:51,a:255},
				{r:102,g:204,b:0,a:255},
				{r:102,g:153,b:255,a:255},
				{r:102,g:153,b:204,a:255},
				{r:102,g:153,b:153,a:255},
				{r:102,g:153,b:102,a:255},
				{r:102,g:153,b:51,a:255},
				{r:102,g:153,b:0,a:255},
				{r:102,g:102,b:255,a:255},
				{r:102,g:102,b:204,a:255},
				{r:102,g:102,b:153,a:255},
				{r:102,g:102,b:102,a:255},
				{r:102,g:102,b:51,a:255},
				{r:102,g:102,b:0,a:255},
				{r:102,g:51,b:255,a:255},
				{r:102,g:51,b:204,a:255},
				{r:102,g:51,b:153,a:255},
				{r:102,g:51,b:102,a:255},
				{r:102,g:51,b:51,a:255},
				{r:102,g:51,b:0,a:255},
				{r:102,g:0,b:255,a:255},
				{r:102,g:0,b:204,a:255},
				{r:102,g:0,b:153,a:255},
				{r:102,g:0,b:102,a:255},
				{r:102,g:0,b:51,a:255},
				{r:102,g:0,b:0,a:255},
				{r:51,g:255,b:255,a:255},
				{r:51,g:255,b:204,a:255},
				{r:51,g:255,b:153,a:255},
				{r:51,g:255,b:102,a:255},
				{r:51,g:255,b:51,a:255},
				{r:51,g:255,b:0,a:255},
				{r:51,g:204,b:255,a:255},
				{r:51,g:204,b:204,a:255},
				{r:51,g:204,b:153,a:255},
				{r:51,g:204,b:102,a:255},
				{r:51,g:204,b:51,a:255},
				{r:51,g:204,b:0,a:255},
				{r:51,g:153,b:255,a:255},
				{r:51,g:153,b:204,a:255},
				{r:51,g:153,b:153,a:255},
				{r:51,g:153,b:102,a:255},
				{r:51,g:153,b:51,a:255},
				{r:51,g:153,b:0,a:255},
				{r:51,g:102,b:255,a:255},
				{r:51,g:102,b:204,a:255},
				{r:51,g:102,b:153,a:255},
				{r:51,g:102,b:102,a:255},
				{r:51,g:102,b:51,a:255},
				{r:51,g:102,b:0,a:255},
				{r:51,g:51,b:255,a:255},
				{r:51,g:51,b:204,a:255},
				{r:51,g:51,b:153,a:255},
				{r:51,g:51,b:102,a:255},
				{r:51,g:51,b:51,a:255},
				{r:51,g:51,b:0,a:255},
				{r:51,g:0,b:255,a:255},
				{r:51,g:0,b:204,a:255},
				{r:51,g:0,b:153,a:255},
				{r:51,g:0,b:102,a:255},
				{r:51,g:0,b:51,a:255},
				{r:51,g:0,b:0,a:255},
				{r:0,g:255,b:255,a:255},
				{r:0,g:255,b:204,a:255},
				{r:0,g:255,b:153,a:255},
				{r:0,g:255,b:102,a:255},
				{r:0,g:255,b:51,a:255},
				{r:0,g:255,b:0,a:255},
				{r:0,g:204,b:255,a:255},
				{r:0,g:204,b:204,a:255},
				{r:0,g:204,b:153,a:255},
				{r:0,g:204,b:102,a:255},
				{r:0,g:204,b:51,a:255},
				{r:0,g:204,b:0,a:255},
				{r:0,g:153,b:255,a:255},
				{r:0,g:153,b:204,a:255},
				{r:0,g:153,b:153,a:255},
				{r:0,g:153,b:102,a:255},
				{r:0,g:153,b:51,a:255},
				{r:0,g:153,b:0,a:255},
				{r:0,g:102,b:255,a:255},
				{r:0,g:102,b:204,a:255},
				{r:0,g:102,b:153,a:255},
				{r:0,g:102,b:102,a:255},
				{r:0,g:102,b:51,a:255},
				{r:0,g:102,b:0,a:255},
				{r:0,g:51,b:255,a:255},
				{r:0,g:51,b:204,a:255},
				{r:0,g:51,b:153,a:255},
				{r:0,g:51,b:102,a:255},
				{r:0,g:51,b:51,a:255},
				{r:0,g:51,b:0,a:255},
				{r:0,g:0,b:255,a:255},
				{r:0,g:0,b:204,a:255},
				{r:0,g:0,b:153,a:255},
				{r:0,g:0,b:102,a:255},
				{r:0,g:0,b:51,a:255},
				{r:238,g:0,b:0,a:255},
				{r:221,g:0,b:0,a:255},
				{r:187,g:0,b:0,a:255},
				{r:170,g:0,b:0,a:255},
				{r:136,g:0,b:0,a:255},
				{r:119,g:0,b:0,a:255},
				{r:85,g:0,b:0,a:255},
				{r:68,g:0,b:0,a:255},
				{r:34,g:0,b:0,a:255},
				{r:17,g:0,b:0,a:255},
				{r:0,g:238,b:0,a:255},
				{r:0,g:221,b:0,a:255},
				{r:0,g:187,b:0,a:255},
				{r:0,g:170,b:0,a:255},
				{r:0,g:136,b:0,a:255},
				{r:0,g:119,b:0,a:255},
				{r:0,g:85,b:0,a:255},
				{r:0,g:68,b:0,a:255},
				{r:0,g:34,b:0,a:255},
				{r:0,g:17,b:0,a:255},
				{r:0,g:0,b:238,a:255},
				{r:0,g:0,b:221,a:255},
				{r:0,g:0,b:187,a:255},
				{r:0,g:0,b:170,a:255},
				{r:0,g:0,b:136,a:255},
				{r:0,g:0,b:119,a:255},
				{r:0,g:0,b:85,a:255},
				{r:0,g:0,b:68,a:255},
				{r:0,g:0,b:34,a:255},
				{r:0,g:0,b:17,a:255},

				{r:238,g:238,b:238,a:255},

				{r:221,g:221,b:221,a:255},
				{r:187,g:187,b:187,a:255},
				{r:170,g:170,b:170,a:255},
				{r:136,g:136,b:136,a:255},
				{r:119,g:119,b:119,a:255},
				{r:85,g:85,b:85,a:255},
				{r:68,g:68,b:68,a:255},
				{r:34,g:34,b:34,a:255},
				{r:17,g:17,b:17,a:255},
				// {r:0,g:0,b:0,a:255},
		];

})();
