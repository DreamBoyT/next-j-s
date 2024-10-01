let isGenerating = false;

// Function to toggle the sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("active");
}

// Event listener for the submit button in the prompt field
document.getElementById("submit").addEventListener("click", () => {
  if (!isGenerating) {
    generateImage();
  }
});

function generateImage() {
  const prompt = document.getElementById("promptInput").value;
  const style = document.querySelector("#field1 .icon-btn.active")?.id || "";
  const quality = document.querySelector("#field2 .icon-btn.active")?.id || "";
  const size = document.querySelector("#field3 .icon-btn.active")?.id || "";
  const guide = document.querySelector("#field4 .icon-btn.active")?.id || "";

  if (prompt.trim() === "") {
    alert("Please enter an image description.");
    return;
  }

  const imageContainerCard1 = document.querySelector(
    "#card1 .card1-image-container"
  );
  const loadingSpinnerCard1 = document.createElement("div");
  loadingSpinnerCard1.className = "unique-loading-spinner";
  imageContainerCard1.innerHTML = "";
  imageContainerCard1.appendChild(loadingSpinnerCard1);

  const imageContainerCard2 = document.querySelector(
    "#card2 .card2-image-container"
  );
  const retryCount = 3;
  const initialDelay = 1000;
  let currentRetry = 0;

  function fetchImageWithRetry() {
    isGenerating = true;
    fetch("https://dall-t-2.azurewebsites.net/api/httpTriggerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, style, quality, size }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.imageUrls) {
          const url = data.imageUrls[0];
          const imgCard1 = new Image();
          const imgCard2 = new Image();
          imgCard1.src = url;
          imgCard2.src = url;
          imgCard1.alt = prompt;
          imgCard2.alt = prompt;
          imgCard1.classList.add("card1-image");
          imgCard2.classList.add("card2-image");

          imgCard1.onload = () => {
            loadingSpinnerCard1.remove();
            imageContainerCard1.innerHTML = "";
            imageContainerCard1.appendChild(imgCard1);
            appendButtons();
            recycleButton.disabled = false;
            deleteButton.disabled = false;
            currentImageUrl = imgCard1.src;
            isGenerating = false;

            imageContainerCard2.innerHTML = "";
            imageContainerCard2.appendChild(imgCard2);
            appendCard3Buttons();
            updateCarouselImages(url);
          };

          if (
            size === "Desktop" ||
            size === "Website" ||
            size === "Portrait" ||
            size === "Landscape"
          ) {
            let width, height;
            switch (size) {
              case "Desktop":
                [width, height] = [1600, 900];
                break;
              case "Website":
                [width, height] = [1800, 600];
                break;
              case "Portrait":
                [width, height] = [1080, 1920];
                break;
              case "Landscape":
                [width, height] = [1920, 1080];
                break;
            }
            resizeImage(url, width, height).then((resizedUrl) => {
              imgCard1.src = resizedUrl;
              imgCard2.src = resizedUrl;
              updateCarouselImages(resizedUrl);
            });
          }
        } else {
          displayError("Failed to generate image. Please try again...");
        }
      })
      .catch((error) => {
        console.error("Error generating image:", error);
        if (currentRetry < retryCount) {
          const delay = initialDelay * Math.pow(2, currentRetry);
          currentRetry++;
          setTimeout(fetchImageWithRetry, delay);
        } else {
          displayError(
            "Failed to generate image after retries. Please try again later..."
          );
        }
      });
  }

  function displayError(message) {
    loadingSpinnerCard1.remove();
    imageContainerCard1.innerHTML = `  
            <span style="  
                color: #45474B;  
                font-weight: bold;  
                font-size: 60px;  
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);  
                background: -webkit-linear-gradient(#45474B, #6B6E73);  
                -webkit-background-clip: text;  
                -webkit-text-fill-color: transparent;  
            ">  
                ${message}  
            </span>`;
    isGenerating = false;
  }

  fetchImageWithRetry();
}

function resizeImage(url, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      }, "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}

const recycleButton = document.getElementById("downloadButtonCard1");
const deleteButton = document.getElementById("deleteButtonCard1");
const downloadButton = document.getElementById("recycleButtonCard1");
const generate = document.getElementById("submit");
const leftArrowButtonCard3 = document.getElementById("leftArrowButtonCard2");
const rightArrowButtonCard3 = document.getElementById("rightArrowButtonCard2");
const copyButtonCard3 = document.getElementById("downloadButtonCard2");
const deleteButtonCard3 = document.getElementById("deleteButtonCard2");
const downloadButtonCard3 = document.getElementById("copyButtonCard2");
const card3ImageContainer = document.querySelector(".card2-image-container");
let card3Images = [];
let currentCard3ImageIndex = 0;

recycleButton.disabled = true;
deleteButton.disabled = true;
let currentImageUrl = "";

function appendButtons() {
  const imageContainer = document.querySelector(
    "#card1 .card1-image-container"
  );
  imageContainer.appendChild(recycleButton);
  imageContainer.appendChild(deleteButton);
  imageContainer.appendChild(downloadButton);
}

function appendCard3Buttons() {
  const card3ImageContainer = document.querySelector(".card2-image-container");
  card3ImageContainer.appendChild(leftArrowButtonCard3);
  card3ImageContainer.appendChild(rightArrowButtonCard3);
  card3ImageContainer.appendChild(copyButtonCard3);
  card3ImageContainer.appendChild(deleteButtonCard3);
  card3ImageContainer.appendChild(downloadButtonCard3);
}

document.querySelectorAll(".icon-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const buttons = this.closest(".field").querySelectorAll(".icon-btn");
    buttons.forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
  });
});

downloadButton.addEventListener("click", () => {
  if (currentImageUrl) {
    const link = document.createElement("a");
    link.href = currentImageUrl;
    link.download = "generated_image.png";
    link.target = "_blank";
    link.click();
  } else {
    alert("No image to download.");
  }
});

deleteButton.addEventListener("click", () => {
  const imageContainer = document.querySelector(
    "#card1 .card1-image-container"
  );
  imageContainer.innerHTML = "";
  const sampleImage = new Image();
  sampleImage.src = "image1.png";
  sampleImage.alt = "Sample Image";
  sampleImage.classList.add("card2-image");
  imageContainer.appendChild(sampleImage);
  appendButtons();
  currentImageUrl = "";
});

recycleButton.addEventListener("click", () => {
  if (currentImageUrl && !isGenerating) {
    const card3Image = new Image();
    card3Image.src = currentImageUrl;
    card3Image.alt = "Previously Generated Image";
    card3Image.classList.add("card2-image");
    card3Images.unshift(card3Image);
    displayCard3Image(0);
    generateImage();
    card3ImageContainer.scrollTop = 0;
  } else if (!currentImageUrl) {
    alert("No image to regenerate.");
  }
});

generate.addEventListener("click", () => {
  if (currentImageUrl && !isGenerating) {
    const card2Image = new Image();
    card2Image.src = currentImageUrl;
    card2Image.alt = "Previously Generated Image";
    card2Image.classList.add("card2-image");
    card3Images.unshift(card2Image);
    displayCard3Image(0);
  }
  if (!isGenerating) {
    generateImage();
  }
  card3ImageContainer.scrollTop = 0;
});

leftArrowButtonCard3.addEventListener("click", () => {
  if (card3Images.length > 0) {
    currentCard3ImageIndex =
      (currentCard3ImageIndex - 1 + card3Images.length) % card3Images.length;
    displayCard3Image(currentCard3ImageIndex);
  }
});

rightArrowButtonCard3.addEventListener("click", () => {
  if (card3Images.length > 0) {
    currentCard3ImageIndex = (currentCard3ImageIndex + 1) % card3Images.length;
    displayCard3Image(currentCard3ImageIndex);
  }
});

function displayCard3Image(index) {
  card3ImageContainer.innerHTML = "";
  if (card3Images.length > 0) {
    const img = card3Images[index];
    card3ImageContainer.appendChild(img);
    appendCard3Buttons();
  } else {
    const sampleImage = new Image();
    sampleImage.src = "image2.png";
    sampleImage.alt = "Sample Image";
    sampleImage.classList.add("card2-image");
    card3ImageContainer.appendChild(sampleImage);
    appendCard3Buttons();
  }
}

downloadButtonCard3.addEventListener("click", () => {
  if (
    card3Images.length > 0 &&
    currentCard3ImageIndex >= 0 &&
    currentCard3ImageIndex < card3Images.length
  ) {
    const link = document.createElement("a");
    link.href = card3Images[currentCard3ImageIndex].src;
    link.download = "generated_image.png";
    link.target = "_blank";
    link.click();
  } else {
    alert("No image to download.");
  }
});

deleteButtonCard3.addEventListener("click", () => {
  if (
    card3Images.length > 0 &&
    currentCard3ImageIndex >= 0 &&
    currentCard3ImageIndex < card3Images.length
  ) {
    card3Images.splice(currentCard3ImageIndex, 1);
    currentCard3ImageIndex = Math.min(
      currentCard3ImageIndex,
      card3Images.length - 1
    );
    displayCard3Image(currentCard3ImageIndex);
  } else {
    alert("No image to delete.");
  }
});

copyButtonCard3.addEventListener("click", () => {
  const promptText = document.getElementById("promptInput").value;
  if (promptText.trim() !== "") {
    navigator.clipboard
      .writeText(promptText)
      .then(() => alert("Prompt copied to clipboard successfully!"))
      .catch((err) => console.error("Error copying prompt:", err));
  } else {
    alert("No prompt text to copy.");
  }
});

function toggleActive(button, group) {
  const groupMap = {
    style: 1,
    quality: 2,
    size: 3,
    guide: 4,
  };
  const buttons = document.querySelectorAll(
    `#field${groupMap[group]} .icon-btn`
  );
  buttons.forEach((btn) => {
    if (btn !== button) {
      btn.classList.remove("active");
    }
  });
  button.classList.toggle("active");
}

document
  .getElementById("promptInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !isGenerating) {
      document.getElementById("submit").click();
    }
  });

function updateCarouselImages(url) {
  const card3Image = new Image();
  card3Image.src = url;
  card3Image.alt = "Generated Image";
  card3Image.classList.add("card2-image");
  card3Images.unshift(card3Image);
  currentCard3ImageIndex = 0;
  displayCard3Image(currentCard3ImageIndex);
}
