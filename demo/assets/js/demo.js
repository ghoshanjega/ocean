var DEMO = {
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null,
	ms_Scene: null,
	ms_Controls: null,
	ms_Water: null,
	ms_FilesDND: null,
	ms_Raycaster: null,
	ms_Clickable: [],
	mixers: [],
	loader: null,
	ghoshan: null,
	super_models: null,
	clock: new THREE.Clock(),
	terrain: null,
	all_models_loaded: false,
	ms_objects: [],
	inParameters: null,
	directionalLight: null,


	models: {
		harshit_model: {
			name: "harshit",
			obj: null,
			position: null,
			file: 'assets/img/Pink-lookaround.fbx',
			mixers: [],
			sitting: false
		},
		zombie_model: {
			name: "zombie",
			obj: null,
			position: null,
			file: 'assets/img/.fbx',
			mixers: [],
			sitting: false
		},
		zombie2_model: {
			name: "zombie2",
			obj: null,
			position: null,
			file: 'assets/img/zombies/Agony.fbx',
			mixers: [],
			sitting: false
		},
		zombie3_model: {
			name: "zombie3",
			obj: null,
			position: null,
			file: 'assets/img/zombies/Bellydancing.fbx',
			mixers: [],
			sitting: false
		},
		zombie3_model: {
			name: "zombie3",
			obj: null,
			position: null,
			file: 'assets/img/zombies/Dribble.fbx',
			mixers: [],
			sitting: false
		},
		zombie4_model: {
			name: "zombie4",
			obj: null,
			position: null,
			file: 'assets/img/zombies/Hit Reaction.fbx',
			mixers: [],
			sitting: false
		},
		zombie5_model: {
			name: "zombie5",
			obj: null,
			position: null,
			file: 'assets/img/zombies/Punching.fbx',
			mixers: [],
			sitting: false
		},
		zombie6_model: {
			name: "zombie6",
			obj: null,
			position: null,
			file: 'assets/img/zombies/Reaction.fbx',
			mixers: [],
			sitting: false
		},
		zombie7_model: {
			name: "zombie7",
			obj: null,
			position: null,
			file: 'assets/img/zombies/Strafe.fbx',
			mixers: [],
			sitting: false
		},
		zombie8_model: {
			name: "zombie8",
			obj: null,
			position: null,
			file: 'assets/img/zombies/Taunt.fbx',
			mixers: [],
			sitting: false
		},
		zombie9_model: {
			name: "zombie9",
			obj: null,
			position: null,
			file: 'assets/img/zombies/Zombie Headbutt.fbx',
			mixers: [],
			sitting: false
		},
	},

	enable: (function enable() {
		try {
			var aCanvas = document.createElement('canvas');
			return !!window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
		}
		catch (e) {
			return false;
		}
	})(),

	initialize: function initialize(inIdCanvas, inParameters) {
		this.inParameters = inParameters
		this.ms_Canvas = $('#' + inIdCanvas);

		// Initialize Renderer, Camera, Projector and Scene
		this.ms_Renderer = this.enable ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();

		this.super_models = new THREE.Group();
		this.ms_Scene.add(this.super_models);


		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 30000);
		this.ms_Camera.position.set(0, Math.max(this.inParameters.width * 1.5, this.inParameters.height) / 20, -this.inParameters.height / 2);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.ms_Raycaster = new THREE.Raycaster()

		var axes = new THREE.AxesHelper(30000); //xyz red green blue
		this.ms_Scene.add(axes);



		//OBJECTS 

		// Real sun
		this.directionalLight = new THREE.DirectionalLight(0xffff55, 1);
		this.directionalLight.position.set(-600, 300, 600);
		this.ms_Scene.add(this.directionalLight);




		//SUN===========================================================================
		var sphere = new THREE.SphereGeometry(1000, 120, 120);
		var sun = new THREE.PointLight(0xff0000, 10, 4000);
		sun.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff123f })));
		sun.position.set(0, 500, 3000);
		this.ms_Scene.add(sun);
		this.ms_objects.push(sun)

		// Create terrain
		this.ms_objects.push(this.loadTerrain())

		// Create water
		this.ms_objects.push(this.loadWater())

		// Create Sky	
		this.ms_objects.push(this.loadSkyBox())

		//Find positions for the models
		this.set_model_position(this.models);

	
	},

	addControls: function addControls() {
		// Initialize Orbit control		
		// this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
		// this.ms_Controls.userPan = false;
		// this.ms_Controls.userPanSpeed = 0.0;
		// this.ms_Controls.maxDistance = 5000.0;
		// this.ms_Controls.maxPolarAngle = Math.PI * 0.495;

		this.ms_Controls = new THREE.FlyControls(this.ms_Camera, this.inParameters);
		this.ms_Controls.domElement = this.ms_Renderer.domElement;
	},

	loadWater: function () {
		var waterNormals = new THREE.ImageUtils.loadTexture('assets/img/waternormals.jpg');
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;


		// Create the water effect
		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 1024,
			textureHeight: 1024,
			waterNormals: waterNormals,
			alpha: 1.0,
			sunDirection: this.directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 50.0
		});
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(this.inParameters.width * 500, this.inParameters.height * 500, 10, 10),
			this.ms_Water.material
		);
		aMeshMirror.add(this.ms_Water);
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		this.ms_Scene.add(aMeshMirror);
		return aMeshMirror
	},

	loadSkyBox: function loadSkyBox() {
		// var aCubeMap = THREE.ImageUtils.loadTextureCube([
		// 	'assets/img/px.jpg',
		// 	'assets/img/nx.jpg',
		// 	'assets/img/py.jpg',
		// 	'assets/img/ny.jpg',
		// 	'assets/img/pz.jpg',
		// 	'assets/img/nz.jpg'
		// ]);
		// var aCubeMap = THREE.ImageUtils.loadTextureCube([
		// 	'assets/img/night/nightsky_ft.png',
		// 	'assets/img/night/nightsky_bk.png',
		// 	'assets/img/night/nightsky_up.png',
		// 	'assets/img/night/nightsky_dn.png',
		// 	'assets/img/night/nightsky_rt.png',
		// 	'assets/img/night/nightsky_lf.png'
		// ]);
		// // aCubeMap.format = THREE.RGBFormat;

		// var aShader = THREE.ShaderLib['cube'];
		// aShader.uniforms['tCube'].value = aCubeMap;

		// var aSkyBoxMaterial = new THREE.ShaderMaterial({
		// 	fragmentShader: aShader.fragmentShader,
		// 	vertexShader: aShader.vertexShader,
		// 	uniforms: aShader.uniforms,
		// 	depthWrite: false,
		// 	side: THREE.BackSide
		// });

		// var aSkybox = new THREE.Mesh(
		// 	new THREE.BoxGeometry(1000000, 1000000, 1000000),
		// 	aSkyBoxMaterial
		// );
		var geometry = new THREE.CubeGeometry(8000, 8000, 8000);
		var cubeMaterials = [
			new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("assets/img/night/nightsky_ft.png"), side: THREE.DoubleSide }), //front side
			new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('assets/img/night/nightsky_bk.png'), side: THREE.DoubleSide }), //back side
			new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('assets/img/night/nightsky_up.png'), side: THREE.DoubleSide }), //up side
			new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('assets/img/night/nightsky_dn.png'), side: THREE.DoubleSide }), //down side
			new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('assets/img/night/nightsky_rt.png'), side: THREE.DoubleSide }), //right side
			new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('assets/img/night/nightsky_lf.png'), side: THREE.DoubleSide }) //left side
		];

		var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
		var cube = new THREE.Mesh(geometry, cubeMaterial);
		// scene.add( cube );

		// this.ms_Scene.add(aSkybox);
		this.ms_Scene.add(cube);

		return cube
	},

	set_model_position: function set_model_position(models) {
		var number_of_models = Object.keys(models).length;
		console.log(number_of_models);
		var id;
		for (var key in models) {
			console.log(models[key]);
			do {
				id = Math.floor(Math.random() * 60000) + 1;
				models[key].position = new THREE.Vector3(DEMO.terrain.geometry.vertices[id].x, DEMO.terrain.geometry.vertices[id].y - this.inParameters.depth * 0.4, DEMO.terrain.geometry.vertices[id].z);
				// console.log(DEMO.models.ghoshan_model.position.y);
			}
			while (models[key].position.y < 50);
			console.log(models[key].name, "location added");

			// this.ms_objects.push(this.loadModels( models[key]))
			this.loadModels(models[key])
		}
	},

	loadModels: function loadModels(model) {
		// console.log("TCL: loadModels -> this.inParameters", this.inParameters)
		// console.log(model.position);
		var loader = new THREE.FBXLoader();
		loader.load(model.file, function (object) {
			object.mixer = new THREE.AnimationMixer(object);
			DEMO.mixers.push(object.mixer);
			// model.mixers.push(object.mixer);
			var action = object.mixer.clipAction(object.animations[0]);
			action.play();
			object.traverse(function (child) {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
			object.scale.set(0.1, 0.1, 0.1);
			// object.position.set(0, 0, 0);
			// this.ms_Scene.add(object);
			object.rotation.y = (Math.PI / Math.random());



			// DEMO.super_models.add(object);
			DEMO.ms_Scene.add(object);
			model.obj = object;
			console.log(model.obj);
			// var id = 28128;
			// console.log(DEMO.terrain.geometry.vertices[id]);
			// DEMO.ghoshan.position.set(DEMO.terrain.geometry.vertices[id].x, DEMO.terrain.geometry.vertices[id].y - this.inParameters.depth * 0.4, DEMO.terrain.geometry.vertices[id].z);
			if (model.sitting)
				model.position.y -= 5;
			model.obj.position.copy(model.position);

			return model

			// console.log(model.obj.position);
			// DEMO.ghoshan.callback = function () { window.open("http://www.filesdnd.com"); }
			// DEMO.ms_Clickable.push(DEMO.ghoshan);
			// console.log(DEMO.ms_Clickable);
		});


	},


	loadTerrain: function loadTerrain() {
		var terrainGeo = TERRAINGEN.Get(this.inParameters);
		var terrainMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, shading: THREE.FlatShading, side: THREE.DoubleSide });

		this.terrain = new THREE.Mesh(terrainGeo, terrainMaterial);
		this.terrain.position.y = - this.inParameters.depth * 0.4;
		this.ms_Scene.add(this.terrain);

		return this.terrain

		// var material = new THREE.MeshPhongMaterial({ color: 0xff1200, side: THREE.DoubleSide });
		// var plane = new THREE.Mesh(terrainGeo, material);
		// this.ms_Scene.add(plane);
	},


	delta: null,
	update: function update() {
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
		this.ms_Water.render();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
		this.ms_Raycaster.ray.origin.copy(this.ms_Controls.getObject().position);
		// this.ms_Raycaster.ray.origin.z -= 10; 	
		var intersections = this.ms_Raycaster.intersectObjects(this.ms_objects);
		// console.log("TCL: update -> this.ms_objects", this.ms_objects)
		var onObject = intersections.length > 0;
		console.log("TCL: update ->  intersections.length",  intersections.length)

		// if (onObject) {
		// 	console.log(intersections.length)
		// }

		delta = this.clock.getDelta();
		this.ms_Controls.update(delta);
		if (this.mixers.length > 0) {
			for (var i = 0; i < this.mixers.length; i++) {
				if (delta == 0)
					delta = 0.00009999999747378752;

				this.mixers[i].update(delta);
			}
		}
		// this,animate()


		// this.mixers[1].update(this.clock.getDelta());
		// console.log(this.clock.getDelta());
		// this.mixers[0].update(this.clock.getDelta());

	},

	// animate: function animate() {
	//     requestAnimationFrame( animate );
	//     thisrender.render( scene, camera );
	// },


	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect = inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.update()
	}
};