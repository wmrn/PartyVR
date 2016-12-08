var vr_mode = true;//2眼にするかしないか。
var camera, scene, renderer;
var effect, controls;
var element, container;

var text = String("Let's Party").split('');

var r = 60;
var num = text.length;
var mesh = [];
var textGeometry = [];
//var add = [];
var degree = 0;

var numLights = 10;
var lights = [];

init();
render();

function init() {
    for(var i=0;i<num/2;i++){
        var put=text[i];
        text[i]=text[num-1-i];
        text[num-1-i]=put;
        //add[i]=1;
    }
    
    // レンダラの作成
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x111111, 1); // 背景色の設定
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Webページへの埋め込み設定
    element = renderer.domElement;
    container = document.getElementById('example');
    container.appendChild(element);

    // エフェクトの作成
    effect = new THREE.StereoEffect(renderer);

    // シーンの作成
    scene = new THREE.Scene();

    // カメラの作成
    camera = new THREE.PerspectiveCamera(90, 1, 0.001, 1000);
    camera.position.set(0, 20, 0);
    scene.add(camera);

    // マウスによる視点操作の設定
    controls = new THREE.OrbitControls(camera, element);
    controls.target.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
    );
    controls.noZoom = true;
    controls.noPan = true;

    // 視点コントロール
    function setOrientationControls(e) {
        if (!e.alpha) {
            return;
        }
        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();
        element.addEventListener('click', fullscreen, false);
        window.removeEventListener('deviceorientation', setOrientationControls, true);
    }

    window.addEventListener('deviceorientation', setOrientationControls, true); // デバイスの傾きが変化した時の処理を設定
    window.addEventListener('resize', resize, false); // ウィンドウのリサイズが発生した時の処理を設定
    setTimeout(resize, 1); // 1秒後にリサイズ処理を実行

    // 照明の作成
    var light = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 0.6);
    scene.add(light);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 10).normalize();
    scene.add(dirLight);

    /*var pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);*/
    
    var distance = 20;

    var c = new THREE.Vector3();
    var geometry = new THREE.SphereGeometry(1, 1, 1);

    for (var i = 0; i < numLights; i++) {

        var light = new THREE.PointLight(0xffffff, 2.0, distance);
        c.set(Math.random(), Math.random(), Math.random()).normalize();
        light.color.setRGB(c.x, c.y, c.z);
        scene.add(light);
        lights.push(light);

        var material = new THREE.MeshBasicMaterial({ color: light.color });
        var emitter = new THREE.Mesh(geometry, material);
        light.add(emitter);

    }

    var directionalLight = new THREE.DirectionalLight(0x101010);
    directionalLight.position.set(-1, 1, 1).normalize();
    scene.add(directionalLight);

    var spotLight = new THREE.SpotLight(0x404040);
    spotLight.position.set(0, 50, 0);
    scene.add(spotLight);

    //TEXT
    for (var i = 0; i < num; i++) {
        createText(i);
    }
}

function render() {
    update();
    controls.update();
    
     for (var i = 0; i < num; i++) {
        /* y座標を正弦波のy軸に対応させる */
        degree = degree + 0.3;
        var radian = degree * Math.PI / 180;
        if(i%2==0){
        var positionY = Math.sin(radian) * 10;
        }else{
            var positionY = -1*Math.sin(radian) * 10;
        }
        /* 球体の位置プロパティに値を設定 */
        mesh[i].position.y = positionY;
    }
    /*for (var i = 0; i < num; i++) {
        var Mesh = mesh[i];
        if (i % 2 == 0) {
            Mesh.position.y += add[i];
        } else {
            mesh[i].position.y += add[i];
        }
        var posy=mesh[i].position.y;
        if (posy > 50) {
            add[i] = -add[i];
        }
        if (posy < -10) {
            add[i] = -add[i];
        }
        
    }*/
    
    requestAnimationFrame(render); // 再描画のリクエスト
    if (vr_mode) {
        effect.render(scene, camera);  // ステレオエフェクトまたはカードボードエフェクトでレンダリング
    } else {
        renderer.render(scene, camera); // 通常のレンダリング
    }
}


function update() {
    var time = Date.now() * 0.0005;

    for (var i = 0, il = lights.length; i < il; i++) {
        var light = lights[i];
        var x = Math.floor(Math.random() * 200) - 100;
        var y = Math.floor(Math.random() * 200) - 100;
        var z = Math.floor(Math.random() * 200) - 100;

        /*var x = Math.sin(time + i * 7.0) * 45;
        var y = Math.cos(time + i * 5.0) * 45 + 20;
        var z = Math.cos(time + i * 3.0) * 45;*/
        light.position.set(x, y, z);

    }

}

function createText(i) {
    var loader = new THREE.FontLoader();
    loader.load('libs/optimer_bold.typeface.json', function (font) {
        var textGeometry = new THREE.TextGeometry(text[i], {
            font: font,
            size: 3,
            height: 1,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.1,
            weight: "normal",
            style: "normal"
        });

        var textMaterial = new THREE.MeshPhongMaterial(
            { color: 0xff0000, specular: 0xfffffff }
        );

        var mesh = new THREE.Mesh(textGeometry, textMaterial);
        var theta = Math.PI * 2 * i / num;
        var z = Math.cos(theta) * r;
        var x = Math.sin(theta) * r;
        mesh.position.z = z;
        mesh.position.y = 20;
        mesh.position.x = x;
        mesh.rotation.y = theta + Math.PI;
        //console.log(mesh.position);
        //console.log(mesh.rotation);
        mesh.scale.set(10, 10, 10);
        scene.add(mesh);
    });
}

// 描画領域のリサイズ
function resize() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    effect.setSize(width, height);
}


// フルスクリーン化
function fullscreen() {
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    }
}
