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

	models: {
		harshit_model: {
			name: "harshit",
			obj: null,
			position: null,
			file: 'assets/img/Pink-lookaround.fbx',
			mixers: [],
			sitting: false
		},
		emily_model: {
			name: "emily",
			obj: null,
			position: null,
			file: 'assets/img/Emilt.fbx',
			mixers: [],
			sitting: false
		},
		alberto_model: {
			name: "alberto",
			obj: null,
			position: null,
			file: 'assets/img/Alberto.fbx',
			mixers: [],
			sitting: false
		},
		ghoshan_model: {
			name: "ghoshan",
			obj: null,
			position: null,
			file: 'assets/img/Typing.fbx',
			mixers: [],
			sitting: true
		},
		xavier_model: {
			name: "xavier",
			obj: null,
			position: null,
			file: 'assets/img/Xavier.fbx',
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
		this.ms_Canvas = $('#' + inIdCanvas);

		// Initialize Renderer, Camera, Projector and Scene
		this.ms_Renderer = this.enable ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();

		this.super_models = new THREE.Group();
		this.ms_Scene.add(this.super_models);


		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 30000);
		this.ms_Camera.position.set(0, Math.max(inParameters.width * 1.5, inParameters.height) / 20, -inParameters.height / 2);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.ms_Raycaster = new THREE.Raycaster();

		var axes = new THREE.AxisHelper(30000); //xyz red green blue
		this.ms_Scene.add(axes);

		// Initialize Orbit control		
		// this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
		// this.ms_Controls.userPan = false;
		// this.ms_Controls.userPanSpeed = 0.0;
		// this.ms_Controls.maxDistance = 5000.0;
		// this.ms_Controls.maxPolarAngle = Math.PI * 0.495;

		this.ms_Controls = new THREE.FlyControls(this.ms_Camera);
		this.ms_Controls.movementSpeed = 1000;
		this.ms_Controls.domElement = this.ms_Renderer.domElement;
		this.ms_Controls.rollSpeed = Math.PI / 4;
		this.ms_Controls.autoForward = false;
		this.ms_Controls.dragToLook = false;

		// Add sun
		var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
		directionalLight.position.set(-600, 300, 600);
		this.ms_Scene.add(directionalLight);




		//SUN===========================================================================
		var sphere = new THREE.SphereGeometry(1000, 120, 120);
		var sun = new THREE.PointLight(0xff0000, 10, 4000);
		sun.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff123f })));
		sun.position.set(0, 500, 3000);
		this.ms_Scene.add(sun);

		var spriteMaterial = new THREE.SpriteMaterial(
			{
				map: new THREE.ImageUtils.loadTexture('../assets/glow.png'),
				useScreenCoordinates: false,
				color: 0xff123f, transparent: false, blending: THREE.AdditiveBlending
			});
		var sprite = new THREE.Sprite(spriteMaterial);
		sprite.scale.set(140, 140, 1.0);
		sun.add(sprite);

		// Create terrain
		this.loadTerrain(inParameters);

		// Load textures		
		var waterNormals = new THREE.ImageUtils.loadTexture('../assets/img/waternormals.jpg');
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;


		// Create the water effect
		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 1024,
			textureHeight: 1024,
			waterNormals: waterNormals,
			alpha: 1.0,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 50.0
		});
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(inParameters.width * 500, inParameters.height * 500, 10, 10),
			this.ms_Water.material
		);
		aMeshMirror.add(this.ms_Water);
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		this.ms_Scene.add(aMeshMirror);

		this.loadSkyBox();

		//Find positions for the models
		this.set_model_position(inParameters, this.models);

		// Create the models
		// this.loadModels(inParameters, this.models.ghoshan_model);
		// this.loadModels(inParameters, this.models.harshit_model);
		// this.loadModels(inParameters, this.models.emily_model);
	},

	loadSkyBox: function loadSkyBox() {
		var aCubeMap = THREE.ImageUtils.loadTextureCube([
			'assets/img/px.jpg',
			'assets/img/nx.jpg',
			'assets/img/py.jpg',
			'assets/img/ny.jpg',
			'assets/img/pz.jpg',
			'assets/img/nz.jpg'
		]);
		aCubeMap.format = THREE.RGBFormat;

		var aShader = THREE.ShaderLib['cube'];
		aShader.uniforms['tCube'].value = aCubeMap;

		var aSkyBoxMaterial = new THREE.ShaderMaterial({
			fragmentShader: aShader.fragmentShader,
			vertexShader: aShader.vertexShader,
			uniforms: aShader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		});

		var aSkybox = new THREE.Mesh(
			new THREE.BoxGeometry(1000000, 1000000, 1000000),
			aSkyBoxMaterial
		);

		this.ms_Scene.add(aSkybox);
	},

	set_model_position: function set_model_position(inParameters, models) {
		var number_of_models = Object.keys(models).length;
		console.log(number_of_models);
		var id;
		for (var key in models) {
			console.log(models[key]);
			do {
				id = Math.floor(Math.random() * 60000) + 1;
				models[key].position = new THREE.Vector3(DEMO.terrain.geometry.vertices[id].x, DEMO.terrain.geometry.vertices[id].y - inParameters.depth * 0.4, DEMO.terrain.geometry.vertices[id].z);
				// console.log(DEMO.models.ghoshan_model.position.y);
			}
			while (models[key].position.y < 50);
			console.log(models[key].name,"location added");

			DEMO.loadModels(inParameters, models[key]);
		}
	},

	loadModels: function loadModels(inParameters, model) {
		console.log(model.position);
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
			// object.scale.set(0.3, 0.3, 0.3);
			object.position.set(0, 0, 0);
			// this.ms_Scene.add(object);
			// object.rotation.x = (Math.PI / 2);



			// DEMO.super_models.add(object);
			DEMO.ms_Scene.add(object);
			model.obj = object;
			console.log(model.obj);
			// var id = 28128;
			// console.log(DEMO.terrain.geometry.vertices[id]);
			// DEMO.ghoshan.position.set(DEMO.terrain.geometry.vertices[id].x, DEMO.terrain.geometry.vertices[id].y - inParameters.depth * 0.4, DEMO.terrain.geometry.vertices[id].z);
			if (model.sitting)
				model.position.y -= 5;
			model.obj.position.copy(model.position);
			
			// console.log(model.obj.position);
			// DEMO.ghoshan.callback = function () { window.open("http://www.filesdnd.com"); }
			// DEMO.ms_Clickable.push(DEMO.ghoshan);
			// console.log(DEMO.ms_Clickable);
		});


	},


	loadTerrain: function loadTerrain(inParameters) {
		var terrainGeo = TERRAINGEN.Get(inParameters);
		var terrainMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, shading: THREE.FlatShading, side: THREE.DoubleSide });

		this.terrain = new THREE.Mesh(terrainGeo, terrainMaterial);
		this.terrain.position.y = - inParameters.depth * 0.4;
		this.ms_Scene.add(this.terrain);

		// var material = new THREE.MeshPhongMaterial({ color: 0xff1200, side: THREE.DoubleSide });
		// var plane = new THREE.Mesh(terrainGeo, material);
		// this.ms_Scene.add(plane);
	},

	display: function display() {
		this.ms_Water.render();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
		this.ms_Controls.update(this.clock.getDelta());
		if (this.mixers.length > 0) {
			for (var i = 0; i < this.mixers.length; i++) {
				console.log(i);
				this.mixers[i].update(this.clock.getDelta());

			}
		}
	},

	update: function update() {
		// if (this.ms_FilesDND != null) {
		// 	this.ms_FilesDND.rotation.y += 0.01;
		// }
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
		// this.ms_Controls.update();
		this.display();
		// if (this.models.ghoshan_model.mixers.length > 0) {
		// 	for (var i = 0; i < this.models.ghoshan_model.mixers.length; i++) {
		// 		this.models.ghoshan_model.mixers[i].update(this.clock.getDelta());

		// 	}
		// }
		// if (this.models.harshit_model.mixers.length > 0) {
		// 	console.log("meow");
		// 	for (var i = 0; i < this.models.harshit_model.mixers.length; i++) {
		// 		this.models.harshit_model.mixers[i].update(this.clock.getDelta());

		// 	}
		// }
		console.log(DEMO.mixers);
		if (this.mixers.length > 0) {
			for (var i = 0; i < this.mixers.length; i++) {
				console.log(i);
				this.mixers[i].update(this.clock.getDelta());

			}
		}
		

		// this.mixers[1].update(this.clock.getDelta());
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
		this.display();
	}
};