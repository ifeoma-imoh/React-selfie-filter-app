import "./App.css";
import { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import { Effect } from "@cloudinary/url-gen/actions/effect";

//Add your cloud name
let cloudName = "ADD-YOUR-CLOUD-NAME-HERE";
const cld = new Cloudinary({
  cloud: {
    cloudName,
  },
});

function applyFilter(filter, image) {
  switch (filter) {
    case "artistic":
      return image.effect(Effect.artisticFilter("fes"));
    case "sepia":
      return image.effect(Effect.sepia());

    case "cartoonify":
      return image.effect(Effect.cartoonify());

    case "vignette":
      return image.effect(Effect.vignette());
    case "oilpaint":
      return image.effect(Effect.oilPaint());
    case "grayscale":
      return image.effect(Effect.grayscale());
    case "vectorize":
      return image.effect(Effect.vectorize());
    case "pixelate":
      return image.effect(Effect.pixelate());
    default:
      return image;
  }
}
const filters = [
  "none",
  "artistic",
  "sepia",
  "cartoonify",
  "vignette",
  "oilpaint",
  "grayscale",
  "vectorize",
  "pixelate",
];

function ImagePreviewer({ url, deleteImage }) {
  return url ? (
    <div className="img_box">
      <img src={url} alt="my_image" />
      <button className="close_btn" onClick={deleteImage}>
        Delete
      </button>
    </div>
  ) : null;
}

function FilterBox({ imgId, setPrevURL, filterName }) {
  let image = cld.image(imgId);
  image = applyFilter(filterName, image);
  const imgURL = image.toURL();
  return (
    <div className="filter_item" onClick={() => setPrevURL(imgURL)}>
      <img src={imgURL} alt="" />
      <span className="filter_des">{filterName}</span>
    </div>
  );
}

const App = () => {
  const constraints = {
    width: 700,
    height: 550,
    facingMode: "user",
    aspectRatio: 9 / 16,
  };
  const camRef = useRef();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");
  const [prevURL, setPrevURL] = useState("");
  const capture = async () => {
    // get screenshot
    const data = camRef.current.getScreenshot();

    // upload to cloudinary and get public_id

    try {
      setLoading(true);
      const imageData = new FormData();
      imageData.append("file", data);
      // Add your upload preset here
      imageData.append("upload_preset", "ADD-YOUR-UPLOAD-PRESET-HERE");
      const res = await axios.post(
        ` https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        imageData
      );
      const imageDetails = res.data;
      setId(imageDetails.public_id);
      setPrevURL(imageDetails.url);
      // console.log({ imageDetails });
      // const img = cld.image(imageDetails.public_id);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    //set publicID
  };

  const deleteImage = () => {
    setPrevURL("");
    setId("");
  };

  return (
    <section className="main">
      <article className="media_box">
        <div className="camera">
          {/* web cam */}

          <Webcam
            ref={camRef}
            v
            ideoConstraints={constraints}
            screenshotFormat="image/jpeg"
          />

          <button
            disabled={loading}
            onClick={capture}
            className="capture_btn"
          ></button>
        </div>
        <ImagePreviewer url={prevURL} deleteImage={deleteImage} />
      </article>
      <article className="filter_container">
        {id && (
          <>
            {filters.map((filter, index) => (
              <FilterBox
                imgId={id}
                filterName={filter}
                setPrevURL={setPrevURL}
                key={index}
              />
            ))}
          </>
        )}
      </article>
    </section>
  );
};

export default App;
