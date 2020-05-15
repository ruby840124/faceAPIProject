import React from 'react';
import * as faceapi from 'face-api.js';
import Swal from 'sweetalert2';
import './App.css';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {uploadImg:false, imagePreviewUrl:'',imgOnCanvas:false, loading:false , imageWidth:'',imageHeight:''};
  }

  componentDidMount () {
    this.loadModel();
    //this.loadImg();
  }

  componentDidUpdate () {
    //console.log("update123");
  }

  //load faceAPI所需要的model
  async loadModel() {
    const MODEL_URL = '/models';
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
  }

  //偵測人臉
  async detectFace () {
    const {uploadImg, imageWidth, imageHeight} = this.state;
    if(!uploadImg){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'please upload your image first,fuck u!',
        heightAuto: false
      })
    }else{
      this.setState({loading: true});
      const input = document.getElementById('detectImg')
      const canvas = document.querySelector('#imgCanvas');
      let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors();
      fullFaceDescriptions = faceapi.resizeResults(fullFaceDescriptions,{ width: imageWidth, height: imageHeight});
      this.setState({loading: false});
      if(fullFaceDescriptions.length === 0){
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'detect no faceQQ',
          heightAuto: false
        })
      }
      faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
      faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions);
      faceapi.draw.drawFaceExpressions(canvas, fullFaceDescriptions);
    }
  }


  //將圖片轉到canvas上
  imgOnCanvas = () => {
    const detectImg = document.querySelector('#detectImg');
    const canvas = document.querySelector('#imgCanvas');
    detectImg.onload = () =>{
      canvas.width = detectImg.clientWidth;
      canvas.height = detectImg.clientHeight;
      canvas.getContext('2d').drawImage(detectImg, 0, 0, detectImg.clientWidth, detectImg.clientHeight);
      this.setState({imgOnCanvas: true,imageWidth:detectImg.clientWidth,imageHeight:detectImg.clientHeight});
    }
  }

  //上傳圖片
  handleImageChange = (e) => {
    let reader = new FileReader();
    let file = e.target.files[0];
    if ((file.type).indexOf("image/") === -1){
      this.setState({uploadImg: false, imagePreviewUrl: ''});
    }else {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.setState({uploadImg: true, imagePreviewUrl: reader.result, imgOnCanvas: false});
        this.imgOnCanvas();
      }
    }
  }

  render() {
    const {uploadImg, imagePreviewUrl, imgOnCanvas, loading} = this.state;
  return (
    <div className="App">
      <div className="topBlock">
          <div className="topText">faceAPI demo</div>
      </div>
      <div className="cotentBlock">
        <div className="uploadBlock">
          {!uploadImg &&
            <div className="uploadIcon" >
              <img style={{height:'85px'}} src={require('./assets/upload.png')} alt=""/>
              <span>please upload your image....</span>
            </div>}
            {uploadImg && <canvas style={{display:!imgOnCanvas? 'none' : 'inline'}} id="imgCanvas"></canvas>}
            <img id="detectImg" className="detectImg" 
              style={{display:imgOnCanvas? 'none' : 'inline'}} src={imagePreviewUrl} alt=""/>
        </div>
        <div className="upload-btn-wrapper">
          <button className="button" onClick = {() => this.upload()}>
            <span>upload image</span>
          </button>
          <input type="file" accept="image/*" onChange={this.handleImageChange}/>
        </div>
        <button className="button" onClick = {() => this.detectFace()}>
          {loading === false ? <span>detect face</span>:
            <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
              <img style={{height:'24px'}} src={require('./assets/loading2.gif')} alt=""/>
              <span>&nbsp;&nbsp;loading...</span>
            </div>}
       </button>
      </div>
    </div>
  );
  }
}

export default App;