function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
}
// Event listener for the submit button in the prompt field
document.getElementById("submit").addEventListener("click", generateImage);

function generateImage() {
    const prompt = document.getElementById("promptInput").value;
    const style = document.querySelector("#field1 .icon-btn.active")?.id || "";
    const quality = document.querySelector("#field2 .icon-btn.active")?.id || "";
    const size = document.querySelector("#field3 .icon-btn.active")?.id || "";

    if (prompt.trim() === "") {
        alert("Please enter an image description.");
        return;
    }

    const imageContainer = document.querySelector("#card1 .card1-image-container");
    const loadingSpinner = document.createElement("div");
    loadingSpinner.className = "loading-spinner";
    imageContainer.innerHTML = "";
    imageContainer.appendChild(loadingSpinner);

    fetch("https://dall-t.azurewebsites.net/api/httpTriggerts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, style, quality, size }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.imageUrls) {
            data.imageUrls.forEach(url => {
                const img = new Image();
                img.src = url;
                img.alt = prompt;
                img.classList.add("card1-image");
                img.onload = () => {
                    loadingSpinner.remove();
                    // Enable buttons
                    recycleButton.disabled = false;
                    deleteButton.disabled = false;
                    currentImageUrl = img.src; // Store the current image URL for download
                };

                if (size === "Desktop" || size === "Website") {
                    const [width, height] = size === "Desktop" ? [1600, 900] : [1920, 1080];
                    resizeImage(url, width, height).then(resizedUrl => {
                        img.src = resizedUrl;
                        imageContainer.innerHTML = "";  // Clear loading spinner
                        imageContainer.appendChild(img);
                        // Append buttons to ensure they are on top
                        appendButtons();
                    });
                } else {
                    imageContainer.innerHTML = "";  // Clear loading spinner
                    imageContainer.appendChild(img);
                    // Append buttons to ensure they are on top
                    appendButtons();
                }
            });
        } else {
            loadingSpinner.remove();
            imageContainer.innerHTML = `
    <span style="
        color: #45474B; 
        font-weight: bold; 
        font-size: 60px; 
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); 
        background: -webkit-linear-gradient(#45474B, #6B6E73); 
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent;
    ">
        Failed to generate image. Please try again...
    </span>`;
        }
    })
    .catch(error => {
        console.error("Error generating image:", error);
        loadingSpinner.remove();
        imageContainer.innerHTML = `
    <span style="
        color: #45474B; 
        font-weight: bold; 
        font-size: 60px; 
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); 
        background: -webkit-linear-gradient(#45474B, #6B6E73); 
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent;
    ">
        Failed to generate image. Please try again...
    </span>`;
    });
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

            canvas.toBlob(blob => {
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

// Select the buttons
const recycleButton = document.getElementById('recycleButtonCard1');
const deleteButton = document.getElementById('deleteButtonCard1');
const downloadButton = document.getElementById('downloadButtonCard1');
const generate = document.getElementById('submit');

const leftArrowButtonCard3 = document.getElementById('leftArrowButtonCard2');
const rightArrowButtonCard3 = document.getElementById('rightArrowButtonCard2');
const copyButtonCard3 = document.getElementById('copyButtonCard2');
const deleteButtonCard3 = document.getElementById('deleteButtonCard2');
const downloadButtonCard3 = document.getElementById('downloadButtonCard2');

const card3ImageContainer = document.querySelector('.card2-image-container');
let card3Images = [];
let currentCard3ImageIndex = 0;

// Initially disable the recycle and delete buttons
recycleButton.disabled = true;
deleteButton.disabled = true;

let currentImageUrl = ""; // Store the current generated image URL

// Ensure buttons are positioned on top of the image
function appendButtons() {
    const imageContainer = document.querySelector("#card1 .card1-image-container");
    imageContainer.appendChild(recycleButton);
    imageContainer.appendChild(deleteButton);
    imageContainer.appendChild(downloadButton);
}

// Ensure buttons are positioned on top of the image in Card 3
function appendCard3Buttons() {
    const card3ImageContainer = document.querySelector(".card2-image-container");
    card3ImageContainer.appendChild(leftArrowButtonCard3);
    card3ImageContainer.appendChild(rightArrowButtonCard3);
    card3ImageContainer.appendChild(copyButtonCard3);
    card3ImageContainer.appendChild(deleteButtonCard3);
    card3ImageContainer.appendChild(downloadButtonCard3);
}

// Event listener for the icon buttons to toggle active class
document.querySelectorAll(".icon-btn").forEach(button => {
    button.addEventListener("click", function() {
        const buttons = this.closest(".field").querySelectorAll(".icon-btn");
        buttons.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
    });
});

// Event listener for the download button in Card 2
downloadButton.addEventListener('click', () => {
    if (currentImageUrl) {
        const link = document.createElement('a');
        link.href = currentImageUrl;
        link.download = 'generated_image.png'; // You can change the default download name
        link.target = '_blank'; // Open in a new tab
        link.click();
    } else {
        alert("No image to download.");
    }
});

// Event listener for the delete button in Card 2
deleteButton.addEventListener('click', () => {
    const imageContainer = document.querySelector("#card1 .card1-image-container");
    imageContainer.innerHTML = ""; // Clear the current image
    const sampleImage = new Image();
    sampleImage.src = "image1.png"; // Path to the sample image
    sampleImage.alt = "Sample Image";
    sampleImage.classList.add("card2-image");
    imageContainer.appendChild(sampleImage);
    appendButtons(); // Re-append the buttons
    currentImageUrl = ""; // Clear the current image URL
});

// Event listener for the recycle button in Card 2
recycleButton.addEventListener('click', () => {
    // Move the current image to Card 3
    if (currentImageUrl) {
        const card3Image = new Image();
        card3Image.src = currentImageUrl;
        card3Image.alt = "Previously Generated Image";
        card3Image.classList.add("card2-image");
        card3Images.push(card3Image);

        // Display the current image from card3Images array
        displayCard3Image(currentCard3ImageIndex);

        // Generate a new image using the same prompt
        generateImage();

        // Scroll to the bottom of Card 3 to show newly added images
        card3ImageContainer.scrollTop = card3ImageContainer.scrollHeight;
    } else {
        alert("No image to regenerate.");
    }
});

// main generate button stacking to the carousel

generate.addEventListener('click', () => {
    // Move the current image to Card 3
    if (currentImageUrl) {
        const card2Image = new Image();
        card2Image.src = currentImageUrl;
        card2Image.alt = "Previously Generated Image";
        card2Image.classList.add("card2-image");
        card3Images.push(card2Image);

        // Display the current image from card3Images array
        displayCard3Image(currentCard3ImageIndex);

        // Generate a new image using the same prompt
        generateImage();

        // Scroll to the bottom of Card 3 to show newly added images
        card3ImageContainer.scrollTop = card3ImageContainer.scrollHeight;
    } 
});

// Event listener for the left arrow button in Card 3
leftArrowButtonCard3.addEventListener('click', () => {
    if (card3Images.length > 0) {
        currentCard3ImageIndex = (currentCard3ImageIndex - 1 + card3Images.length) % card3Images.length;
        displayCard3Image(currentCard3ImageIndex);
    }
});

// Event listener for the right arrow button in Card 3
rightArrowButtonCard3.addEventListener('click', () => {
    if (card3Images.length > 0) {
        currentCard3ImageIndex = (currentCard3ImageIndex + 1) % card3Images.length;
        displayCard3Image(currentCard3ImageIndex);
    }
});


// Function to display image in Card 3 based on the index
function displayCard3Image(index) {
    card3ImageContainer.innerHTML = "";
    if (card3Images.length > 0) {
        const img = card3Images[index];
        card3ImageContainer.appendChild(img);
        appendCard3Buttons(); // Append buttons on top of the image
    } else {
        const sampleImage = new Image();
        sampleImage.src = "image2.png"; // Path to the default image
        sampleImage.alt = "Sample Image";
        sampleImage.classList.add("card2-image");
        card3ImageContainer.appendChild(sampleImage);
        appendCard3Buttons(); // Append buttons on top of the default image
    }
}

// Event listener for the download button in Card 3
downloadButtonCard3.addEventListener('click', () => {
    if (card3Images.length > 0 && currentCard3ImageIndex >= 0 && currentCard3ImageIndex < card3Images.length) {
        const link = document.createElement('a');
        link.href = card3Images[currentCard3ImageIndex].src;
        link.download = 'generated_image.png'; // You can change the default download name
        link.target = '_blank'; // Open in a new tab
        link.click();
    } else {
        alert("No image to download.");
    }
});

// Event listener for the delete button in Card 3
deleteButtonCard3.addEventListener('click', () => {
    if (card3Images.length > 0 && currentCard3ImageIndex >= 0 && currentCard3ImageIndex < card3Images.length) {
        card3Images.splice(currentCard3ImageIndex, 1); // Remove current image from the array
        currentCard3ImageIndex = Math.min(currentCard3ImageIndex, card3Images.length - 1); // Adjust current index

        // Display the updated image in Card 3
        displayCard3Image(currentCard3ImageIndex);
    } else {
        alert("No image to delete.");
    }
});

// Event listener for the copy prompt button in Card 3
copyButtonCard3.addEventListener('click', () => {
    const promptText = document.getElementById('promptInput').value;
    if (promptText.trim() !== "") {
        navigator.clipboard.writeText(promptText)
            .then(() => alert("Prompt copied to clipboard successfully!"))
            .catch(err => console.error("Error copying prompt:", err));
    } else {
        alert("No prompt text to copy.");
    }
});

// ------

// random

function toggleActive(button, group) {
    const buttons = document.querySelectorAll(`#field${group == 'style' ? 1 : group == 'quality' ? 2 : 3} .icon-btn`);
    buttons.forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
        }
    });

    if (button.classList.contains('active')) {
        button.classList.remove('active');
    } else {
        button.classList.add('active');
    }
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
}
