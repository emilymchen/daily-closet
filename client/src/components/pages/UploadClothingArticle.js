import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// import "./NewClothingArticle.css";
import { post } from "../../utilities";
import BackButton from "../modules/BackButton.js";
import EditClothingArticle from "./EditClothingArticle.js";

const UploadClothingArticle = (props) => {
  const navigate = useNavigate();

  const defaultClothingInput = {
    userId: props.userId,
    image: "",
    name: "",
    type: "top",
    color: "",
    max_wears: NaN,
    tags: [],
    min_temp: NaN,
    max_temp: NaN,
    current_wears: 0,
  };

  const defaultImage = {
    preview: "",
    raw: "",
  };

  const [clothingInputs, setClothingInputs] = useState([defaultClothingInput]);
  const [images, setImages] = useState([]);
  const [clothingIds, setClothingIds] = useState([]);

  const handleImageChange = (e) => {
    const { files } = e.target;

    if (files) {
      const newImages = Array.from(files).map((file) => ({
        preview: URL.createObjectURL(file),
        raw: file,
      }));

      setImages(newImages);

      // Create an array of default clothing inputs corresponding to the images
      const defaultInputs = newImages.map(() => ({ ...defaultClothingInput }));
      setClothingInputs(defaultInputs);
    }
  };

  const handleImageSubmit = async () => {
    try {
      const imagePromises = images.map(async (image) => {
        const formData = new FormData();
        formData.append("userId", props.userId);
        formData.append("image", image.raw);

        const response = await axios.post(`http://localhost:3000/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return response.data[0];
      });

      const imageUrls = await Promise.all(imagePromises);

      // Update clothingInputs with corresponding image URLs
      const updatedClothingInputs = imageUrls.map((imageUrl, index) => ({
        ...clothingInputs[index],
        userId: props.userId,
        image: imageUrl,
      }));

      setClothingInputs(updatedClothingInputs);

      console.log(updatedClothingInputs);

      // Save the clothing articles to the database and capture their IDs
      const savedClothingArticles = await Promise.all(
        updatedClothingInputs.map(async (clothingInput) => {
          console.log("posting", clothingInput);
          const savedArticle = await post("/api/clothingarticle", {
            ...clothingInput,
            current_wears: 0,
          });

          return savedArticle; // Capture the ID of the saved article
        })
      );

      console.log("uploaded to database: ", savedClothingArticles);

      // Reset clothing input to default
      setClothingInputs([defaultClothingInput]);
      setImages([]);
      setClothingIds(savedClothingArticles);

      // Navigate to EditClothingArticle page
      const editLink = `/edit/${savedClothingArticles.join(",")}`;
      navigate(editLink);
      console.log("navigated?", editLink);
    } catch (error) {
      console.error("Error submitting photos:", error);
    }
  };

  if (clothingIds.length === 0) {
    return (
      <div>
        <BackButton redirect="closet" />
        <h1 className="u-textCenter">Add new clothing articles</h1>
        <div className="u-flex">
          <input name="images" type="file" id="upload-button" onChange={handleImageChange} multiple />

          <label htmlFor="upload-button">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.preview}
                alt={`Image ${index}`}
                width="100"
                className="my-10 mx-5"
              />
            ))}
          </label>

          <button
            type="button"
            onClick={handleImageSubmit}
            className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] rounded-full cursor-pointer"
          >
            Submit Photos
          </button>
        </div>
      </div>
    );
  } else {
    // Render something else or nothing if clothingIds is empty
    return (
      <div>
        {/* <EditClothingArticle clothingIds={clothingIds} /> */}
      </div>
    );
  }};

export default UploadClothingArticle;