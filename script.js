document.addEventListener('DOMContentLoaded', () => {  
    const sidebar = document.getElementById("sidebar");  
    const submitButton = document.getElementById("submit");  
    const promptInput = document.getElementById("promptInput");  
    const imageContainerCard1 = document.querySelector("#card1 .card1-image-container");  
    const recycleButton = document.getElementById('downloadButtonCard1');  
    const deleteButton = document.getElementById('deleteButtonCard1');  
    const downloadButton = document.getElementById('recycleButtonCard1');  
    const card3ImageContainer = document.querySelector('.card2-image-container');  
    const leftArrowButtonCard3 = document.getElementById('leftArrowButtonCard2');  
    const rightArrowButtonCard3 = document.getElementById('rightArrowButtonCard2');  
    const copyButtonCard3 = document.getElementById('downloadButtonCard2');  
    const deleteButtonCard3 = document.getElementById('deleteButtonCard2');  
    const downloadButtonCard3 = document.getElementById('copyButtonCard2');  
  
    let isGenerating = false;  
    let currentImageUrl = "";  
    let card3Images = [];  
    let currentCard3ImageIndex = 0;  
  
    const toggleSidebar = () => sidebar.classList.toggle("active");  
  
    const fetchImageWithRetry = async (prompt, style, quality, size, retryCount = 3, initialDelay = 1000) => {  
        isGenerating = true;  
        try {  
            const response = await fetch("https://dall-ts.azurewebsites.net/api/httpTriggerts", {  
                method: "POST",  
                headers: { "Content-Type": "application/json" },  
                body: JSON.stringify({ prompt, style, quality, size })  
            });  
  
            if (!response.ok) throw new Error("Network response was not ok");  
  
            const data = await response.json();  
            if (data.imageUrls) {  
                const url = data.imageUrls[0];  
                await handleImageLoad(url, prompt, style, quality, size);  
                isGenerating = false;  
            } else {  
                handleImageError();  
                isGenerating = false;  
            }  
        } catch (error) {  
            console.error("Error generating image:", error);  
            if (retryCount > 0) {  
                const delay = initialDelay * Math.pow(2, 3 - retryCount);  
                setTimeout(() => fetchImageWithRetry(prompt, style, quality, size, retryCount - 1), delay);  
            } else {  
                handleImageError(true);  
                isGenerating = false;  
            }  
        }  
    };  
  
    const generateImage = async () => {  
        const prompt = promptInput.value.trim();  
        const style = document.querySelector("#field1 .icon-btn.active")?.id || "";  
        const quality = document.querySelector("#field2 .icon-btn.active")?.id || "";  
        const size = document.querySelector("#field3 .icon-btn.active")?.id || "";  
  
        if (!prompt) {  
            alert("Please enter an image description.");  
            return;  
        }  
  
        imageContainerCard1.innerHTML = `<div class="unique-loading-spinner"></div>`;  
        await fetchImageWithRetry(prompt, style, quality, size);  
    };  
  
    const handleImageLoad = async (url, prompt, style, quality, size) => {  
        const imgCard1 = new Image();  
        imgCard1.src = url;  
        imgCard1.alt = prompt;  
        imgCard1.classList.add("card1-image");  
  
        imgCard1.onload = () => {  
            imageContainerCard1.innerHTML = "";  
            imageContainerCard1.appendChild(imgCard1);  
            appendButtons();  
            recycleButton.disabled = false;  
            deleteButton.disabled = false;  
            currentImageUrl = imgCard1.src;  
            updateCarouselImages(url, style, quality, size);  
        };  
  
        imgCard1.onerror = handleImageError;  
    };  
  
    const handleImageError = (isRetryExceeded = false) => {  
        imageContainerCard1.innerHTML = `  
            <span style="  
                color: #45474B;  
                font-weight: bold;  
                font-size: 60px;  
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);  
                background: -webkit-linear-gradient(#45474B, #6B6E73);  
                -webkit-background-clip: text;  
                -webkit-text-fill-color: transparent;">  
                ${isRetryExceeded ? 'Failed to generate image after retries. Please try again later...' : 'Failed to generate image. Please try again...'}  
            </span>`;  
    };  
  
    const getImageDimensions = (size) => {  
        const dimensions = {  
            "Desktop": { width: 1600, height: 900 },  
            "Website": { width: 1800, height: 600 },  
            "Portrait": { width: 1080, height: 1920 },  
            "Landscape": { width: 1920, height: 1080 }  
        };  
        return dimensions[size] || { width: 0, height: 0 };  
    };  
  
    const resizeImage = async (url, width, height) => {  
        return new Promise((resolve, reject) => {  
            const img = new Image();  
            img.crossOrigin = "anonymous";  
            img.onload = () => {  
                const canvas = document.createElement("canvas");  
                const ctx = canvas.getContext("2d");  
  
                canvas.width = width;  
                canvas.height = height;  
  
                ctx.drawImage(img, 0, 0, width, height);  
  
                canvas.toBlob(blob => {  
                    const reader = new FileReader();  
                    reader.onload = () => resolve(reader.result);  
                    reader.readAsDataURL(blob);  
                }, "image/png");  
            };  
            img.onerror = reject;  
            img.src = url;  
        });  
    };  
  
    const appendButtons = () => {  
        imageContainerCard1.appendChild(recycleButton);  
        imageContainerCard1.appendChild(deleteButton);  
        imageContainerCard1.appendChild(downloadButton);  
    };  
  
    const updateCarouselImages = (url, style, quality, size) => {  
        const card3Image = new Image();  
        card3Image.src = url;  
        card3Image.alt = "Generated Image";  
        card3Image.classList.add("card2-image");  
        card3Image.dataset.style = style || "default_style";  
        card3Image.dataset.quality = quality || "default_quality";  
        card3Image.dataset.size = size || "Square";  
  
        card3Images.unshift(card3Image);  
        currentCard3ImageIndex = 0;  
        displayCard3Image(currentCard3ImageIndex);  
    };  
  
    const displayCard3Image = (index) => {  
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
    };  
  
    const appendCard3Buttons = () => {  
        card3ImageContainer.appendChild(leftArrowButtonCard3);  
        card3ImageContainer.appendChild(rightArrowButtonCard3);  
        card3ImageContainer.appendChild(copyButtonCard3);  
        card3ImageContainer.appendChild(deleteButtonCard3);  
        card3ImageContainer.appendChild(downloadButtonCard3);  
    };  
  
    submitButton.addEventListener("click", () => {  
        if (!isGenerating) generateImage();  
    });  
  
    promptInput.addEventListener('keydown', (event) => {  
        if (event.key === 'Enter' && !isGenerating) submitButton.click();  
    });  
  
    downloadButton.addEventListener('click', async () => {  
        const imgElement = document.querySelector("#card1 .card1-image");  
        const size = document.querySelector("#field3 .icon-btn.active")?.id || "Square";  
        const style = document.querySelector("#field1 .icon-btn.active")?.id || "default";  
        const quality = document.querySelector("#field2 .icon-btn.active")?.id || "default";  
        const dimensions = getImageDimensions(size);  
  
        if (imgElement && imgElement.src) {  
            try {  
                const resizedUrl = await resizeImage(imgElement.src, dimensions.width || imgElement.width, dimensions.height || imgElement.height);  
                const link = document.createElement('a');  
                link.href = resizedUrl;  
                link.download = `image_${style}_${quality}_${size}.png`;  
                link.click();  
            } catch (error) {  
                console.error("Error resizing image:", error);  
                alert("Failed to download the image.");  
            }  
        } else {  
            alert("No image available to download.");  
        }  
    });  
  
    deleteButton.addEventListener('click', () => {  
        imageContainerCard1.innerHTML = "";  
        const sampleImage = new Image();  
        sampleImage.src = "image1.png";  
        sampleImage.alt = "Sample Image";  
        sampleImage.classList.add("card2-image");  
        imageContainerCard1.appendChild(sampleImage);  
        appendButtons();  
        currentImageUrl = "";  
    });  
  
    recycleButton.addEventListener('click', () => {  
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
  
    leftArrowButtonCard3.addEventListener('click', () => {  
        if (card3Images.length > 0) {  
            currentCard3ImageIndex = (currentCard3ImageIndex - 1 + card3Images.length) % card3Images.length;  
            displayCard3Image(currentCard3ImageIndex);  
        }  
    });  
  
    rightArrowButtonCard3.addEventListener('click', () => {  
        if (card3Images.length > 0) {  
            currentCard3ImageIndex = (currentCard3ImageIndex + 1) % card3Images.length;  
            displayCard3Image(currentCard3ImageIndex);  
        }  
    });  
  
    downloadButtonCard3.addEventListener('click', async () => {  
        if (card3Images.length > 0 && currentCard3ImageIndex >= 0 && currentCard3ImageIndex < card3Images.length) {  
            const currentImage = card3Images[currentCard3ImageIndex];  
            const style = currentImage.dataset.style;  
            const quality = currentImage.dataset.quality;  
            const size = currentImage.dataset.size;  
            const dimensions = getImageDimensions(size);  
  
            if (currentImage.src) {  
                try {  
                    const resizedUrl = await resizeImage(currentImage.src, dimensions.width, dimensions.height);  
                    const link = document.createElement('a');  
                    link.href = resizedUrl;  
                    link.download = `image_${style}_${quality}_${size}.png`;  
                    link.click();  
                } catch (error) {  
                    console.error("Error resizing image:", error);  
                    alert("Failed to download the image.");  
                }  
            } else {  
                alert("No image to download.");  
            }  
        } else {  
            alert("No image to download.");  
        }  
    });  
  
    deleteButtonCard3.addEventListener('click', () => {  
        if (card3Images.length > 0 && currentCard3ImageIndex >= 0 && currentCard3ImageIndex < card3Images.length) {  
            card3Images.splice(currentCard3ImageIndex, 1);  
            currentCard3ImageIndex = Math.min(currentCard3ImageIndex, card3Images.length - 1);  
            displayCard3Image(currentCard3ImageIndex);  
        } else {  
            alert("No image to delete.");  
        }  
    });  
  
    copyButtonCard3.addEventListener('click', () => {  
        const promptText = promptInput.value.trim();  
        if (promptText !== "") {  
            navigator.clipboard.writeText(promptText)  
                .then(() => alert("Prompt copied to clipboard successfully!"))  
                .catch(err => console.error("Error copying prompt:", err));  
        } else {  
            alert("No prompt text to copy.");  
        }  
    });  
  
    document.querySelectorAll(".icon-btn").forEach(button => {  
        button.addEventListener("click", function () {  
            const buttons = this.closest(".field").querySelectorAll(".icon-btn");  
            buttons.forEach(btn => btn.classList.remove("active"));  
            this.classList.add("active");  
        });  
    });  
});  
