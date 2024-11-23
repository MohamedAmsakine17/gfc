// Get references to DOM elements
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("image-canvas");
const ctx = canvas.getContext("2d");
const addTextButton = document.getElementById("add-text-button");
const resetButton = document.getElementById("reset-button");
const textInput = document.getElementById("text-input");
const increaseFontButton = document.getElementById("increase-font");
const decreaseFontButton = document.getElementById("decrease-font");
const fontSizeDisplay = document.getElementById("font-size");
const textControls = document.getElementById("text-controls");

let img = null; // Holds the uploaded image
let textList = []; // Array of text objects
let selectedText = null; // The currently selected text object
let isDragging = false; // Track drag state
let dragOffsetX = 0; // Offset between mouse and text's x position
let dragOffsetY = 0; // Offset between mouse and text's y position
let resizeHandleSize = 16; // Size of the corner dots
let isResizing = false; // Track resize state
let activeHandle = null; // The handle being dragged
let activeResizingDot = null;
let rotationAngle = 0;
let isRotating = false;

let stickerList = []; // Array of sticker objects
let selectedSticker = null; // The currently selected sticker

let canUpload = true;

canvas.style.pointerEvents = "none";

document.addEventListener("keydown", (e) => {
  if (e.key === "Delete" || e.key === "Backspace") {
    if (selectedSticker) {
      const index = stickerList.indexOf(selectedSticker);
      if (index > -1) {
        stickerList.splice(index, 1);
        selectedSticker = null;
        drawCanvas();
      }
    }
  }

  if (e.key === "Delete") {
    if (selectedText) {
      const index = textList.indexOf(selectedText);
      if (index > -1) {
        textList.splice(index, 1);
        selectedText = null;
        textControls.style.display = "none";
        drawCanvas();
      }
    }
  }
});

const stickerImages = document.querySelectorAll(".sticker");
stickerImages.forEach((stickerImage) => {
  stickerImage.addEventListener("click", (e) => {
    if (canUpload) return;
    addStickerToCanvas(e.target.src, e.target.width, e.target.height);
  });
});

function addStickerToCanvas(src, w, h) {
  const newSticker = {
    image: new Image(),
    x: canvas.width / 2 - 50,
    y: canvas.height / 2 - 50,
    width: w,
    height: h,
  };
  newSticker.image.src = src;
  newSticker.image.onload = () => {
    stickerList.push(newSticker);
    selectedSticker = newSticker;
    drawCanvas();
  };
}

// Initialize the canvas size
canvas.width = 600;
canvas.height = 400;

// Move #about div inside aboutButton if screen width <= 768px
if (window.matchMedia("(max-width: 768px)").matches) {
  canvas.width = 350;
  canvas.height = 300;
}

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

dropArea.addEventListener("drop", handleFile);

// Handle file upload (via click or drag-and-drop)
dropArea.addEventListener("click", () => {
  if (canUpload) fileInput.click();
});

fileInput.addEventListener("change", handleFile);

function handleFile(e) {
  e.preventDefault(); // Prevent default behavior for drop event
  document.querySelector("#text-canvas").style.display = "none";

  // Determine the file source (drag-and-drop vs. file input)
  const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

  if (!file || !file.type.startsWith("image/")) {
    alert("Please upload a valid image.");
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    img = new Image();
    img.src = reader.result;
    img.onload = () => {
      canUpload = false; // Disable further uploads
      canvas.style.pointerEvents = "auto";

      drawCanvas();
    };
  };
}

// Reset functionality
resetButton.addEventListener("click", () => {
  document.querySelector("#text-canvas").style.display = "block";
  canvas.style.pointerEvents = "none";
  img = null;
  textList = [];
  stickerList = [];
  selectedSticker = null;
  selectedText = null;
  textControls.style.display = "none";
  canUpload = true; // Allow uploading a new image
  drawCanvas();
});

// Draw image and text on canvas
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  if (img) {
    const scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    );
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale); // Draw the image
  }

  // Draw all text objects
  textList.forEach(drawText);

  stickerList.forEach((sticker) => {
    ctx.drawImage(
      sticker.image,
      sticker.x,
      sticker.y,
      sticker.width,
      sticker.height
    );
  });

  // Draw the selection box for the selected text
  if (selectedText) drawSelectionBox(selectedText);
  if (selectedSticker) drawStickerHandles(selectedSticker);
}

// Draw text
function drawText(text) {
  const fontSize = parseInt(text.font.match(/\d+/)[0], 10); // Extract the font size
  const textWidth = ctx.measureText(text.content).width;

  const centerX = text.x + textWidth / 2;
  const centerY = text.y - fontSize / 2;

  ctx.font = text.font;
  ctx.fillStyle = text.color;
  ctx.strokeStyle = text.outline;

  const outlineWidth = Math.max(fontSize * 0.2, 1); // Set the outline width relative to font size
  ctx.lineWidth = outlineWidth; // Apply the lineWidth just for the current text being drawn

  ctx.save();
  ctx.strokeText(text.content, text.x, text.y); // Draw the outline
  ctx.fillText(text.content, text.x, text.y); // Draw the fill

  ctx.translate(centerX, centerY);
  ctx.rotate(rotationAngle);
  ctx.translate(-centerX, -centerY);

  ctx.restore();
}

// Add a new text object
addTextButton.addEventListener("click", () => {
  if (canUpload) return;

  const newText = {
    content: "Edit me",
    x: canvas.width / 2 - 50,
    y: canvas.height / 2,
    color: "white",
    outline: "black",
    font: "40px Arial",
    lineWidth: 2,
  };
  textList.push(newText);
  selectedText = newText;
  textControls.style.display = "flex";
  textInput.value = newText.content;
  updateFontSizeDisplay();
  drawCanvas();
});

// Handle text input changes
textInput.addEventListener("input", (e) => {
  if (selectedText) {
    selectedText.content = e.target.value;
    drawCanvas();
  }
});

// Update font size display
function updateFontSizeDisplay() {
  if (selectedText) {
    const size = parseInt(selectedText.font.match(/\d+/)[0], 10);
    fontSizeDisplay.textContent = `${size}px`;
  }
}

// Draw selection box
function drawSelectionBox(text) {
  const fontSize = parseInt(text.font.match(/\d+/)[0], 10);
  //const textWidth = ctx.measureText(text.content).width;
  const textWidth =
    (Number(text.font.substring(0, 2)) * text.content.length) / 2;

  console.log(text.content.length + " Text Width " + textWidth);

  // Draw selection box
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    text.x - 5,
    text.y - fontSize - 5,
    textWidth + 10,
    fontSize + 10
  );

  // Draw resize handles (dots at corners)
  //drawResizeHandle(text.x - 5, text.y - fontSize - 5); // Top-left
  drawResizeHandle(text.x + textWidth + 5, text.y - fontSize - 5); // Top-right
  //drawResizeHandle(text.x - 5, text.y + 5); // Bottom-left
  //drawResizeHandle(text.x + textWidth + 5, text.y + 5); // Bottom-right

  // Draw rotation handle
  const rotationHandleX = text.x + textWidth / 2;
  const rotationHandleY = text.y - fontSize - 20;

  // Line connecting to rotation handle
  //ctx.beginPath();
  //ctx.moveTo(rotationHandleX, text.y - fontSize - 5);
  //ctx.lineTo(rotationHandleX, rotationHandleY);
  //ctx.stroke();

  // Draw the rotation handle (dot)
  //drawResizeHandle(rotationHandleX, rotationHandleY);
}

function drawStickerHandles(sticker) {
  const stickerWidth = sticker.width;
  const stickerHeight = sticker.height;

  // Draw selection box (line) around the sticker
  ctx.strokeStyle = "blue"; // Line color
  ctx.lineWidth = 3; // Line width
  ctx.strokeRect(sticker.x, sticker.y, stickerWidth, stickerHeight);

  // Top-left, top-right, bottom-left, bottom-right
  //drawResizeHandle(sticker.x - 5, sticker.y - 5); // Top-left
  //drawResizeHandle(sticker.x + sticker.width, sticker.y); // Top-right
  //drawResizeHandle(sticker.x - 5, sticker.y + sticker.height + 5); // Bottom-left
  drawResizeHandle(sticker.x + sticker.width, sticker.y + sticker.height); // Bottom-right

  const rotationHandleX = sticker.x + stickerWidth / 2;
  const rotationHandleY = sticker.y - resizeHandleSize;

  //drawResizeHandle(rotationHandleX, rotationHandleY);
}

// Helper to draw a single resize handle
function drawResizeHandle(x, y) {
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(x, y, resizeHandleSize / 2, 0, Math.PI * 2);
  ctx.fill();
}

// Detect if mouse is over a resize handle
function getHandleUnderMouse(x, y) {
  const fontSize = parseInt(selectedText.font.match(/\d+/)[0], 10);
  const textWidth = ctx.measureText(selectedText.content).width;

  const handles = [
    {
      x: selectedText.x - 5,
      y: selectedText.y - fontSize - 5,
      position: "top-left",
    },
    {
      x: selectedText.x + textWidth + 5,
      y: selectedText.y - fontSize - 5,
      position: "top-right",
    },
    { x: selectedText.x - 5, y: selectedText.y + 5, position: "bottom-left" },
    {
      x: selectedText.x + textWidth + 5,
      y: selectedText.y + 5,
      position: "bottom-right",
    },
  ];

  return handles.find(
    (handle) =>
      x >= handle.x - resizeHandleSize / 2 &&
      x <= handle.x + resizeHandleSize / 2 &&
      y >= handle.y - resizeHandleSize / 2 &&
      y <= handle.y + resizeHandleSize / 2
  );
}

// Increase font size
increaseFontButton.addEventListener("click", () => {
  if (selectedText) {
    const size = parseInt(selectedText.font.match(/\d+/)[0], 10);
    selectedText.font = `${size + 2}px Arial`;
    updateFontSizeDisplay();
    drawCanvas(); // Redraw canvas to reflect the font size change
  }
});

// Decrease font size
decreaseFontButton.addEventListener("click", () => {
  if (selectedText) {
    const size = parseInt(selectedText.font.match(/\d+/)[0], 10);
    selectedText.font = `${Math.max(size - 2, 10)}px Arial`; // Minimum font size is 10px
    updateFontSizeDisplay();
    drawCanvas(); // Redraw canvas to reflect the font size change
  }
});

// Detect if mouse is over the rotation handle
function isMouseOverRotationHandle(x, y, text) {
  const fontSize = parseInt(text.font.match(/\d+/)[0], 10);
  const textWidth = ctx.measureText(text.content).width;

  const rotationHandleX = text.x + textWidth / 2;
  const rotationHandleY = text.y - fontSize - 20;

  return (
    x >= rotationHandleX - resizeHandleSize / 2 &&
    x <= rotationHandleX + resizeHandleSize / 2 &&
    y >= rotationHandleY - resizeHandleSize / 2 &&
    y <= rotationHandleY + resizeHandleSize / 2
  );
}

function getStickerHandleUnderMouse(x, y, sticker) {
  const handleSize = 10; // Size of the resize handles

  // Define all four corners for the resize handles
  const handles = [
    { x: sticker.x + sticker.width, y: sticker.y }, // Top-right
    { x: sticker.x + sticker.width, y: sticker.y + sticker.height }, // Bottom-right
    { x: sticker.x, y: sticker.y + sticker.height }, // Bottom-left
    { x: sticker.x, y: sticker.y }, // Top-left
  ];

  // Check if the mouse is over any of the four corners
  for (let handle of handles) {
    if (
      x >= handle.x - handleSize / 2 &&
      x <= handle.x + handleSize / 2 &&
      y >= handle.y - handleSize / 2 &&
      y <= handle.y + handleSize / 2
    ) {
      return handle;
    }
  }

  return null; // No handle clicked
}

// Move text on canvas
canvas.addEventListener("mousedown", (e) => {
  const { offsetX, offsetY } = e;

  if (selectedText) {
    // Check if rotation handle is clicked
    if (isMouseOverRotationHandle(offsetX, offsetY, selectedText)) {
      isRotating = true;
      return;
    }

    const handle = getHandleUnderMouse(offsetX, offsetY);
    if (handle) {
      isResizing = true;
      activeHandle = handle;
      return;
    }

    //drawSelectionBox(selectedText);
  }

  if (selectedSticker) {
    const handle = getStickerHandleUnderMouse(
      offsetX,
      offsetY,
      selectedSticker
    );
    if (handle) {
      isResizing = true;
      activeHandle = handle; // Track which handle is being resized
      return;
    }
  }

  // Otherwise, check if text is clicked for dragging
  const clickedText = textList.find(
    (text) =>
      offsetX >= text.x &&
      offsetX <= text.x + ctx.measureText(text.content).width &&
      offsetY >= text.y - parseInt(text.font.match(/\d+/)[0]) &&
      offsetY <= text.y
  );

  if (clickedText) {
    selectedText = clickedText;
    dragOffsetX = offsetX - selectedText.x;
    dragOffsetY = offsetY - selectedText.y;

    textControls.style.display = "flex";
    textInput.value = selectedText.content;
    updateFontSizeDisplay();
    isDragging = true;
    drawCanvas();
  } else {
    selectedText = null;
    textControls.style.display = "none";
    drawCanvas();
  }

  // Check if a sticker is clicked
  const clickedSticker = stickerList.find(
    (sticker) =>
      offsetX >= sticker.x &&
      offsetX <= sticker.x + sticker.width &&
      offsetY >= sticker.y &&
      offsetY <= sticker.y + sticker.height
  );

  if (clickedSticker) {
    selectedSticker = clickedSticker;
    dragOffsetX = offsetX - selectedSticker.x;
    dragOffsetY = offsetY - selectedSticker.y;
    isDragging = true;
    drawCanvas();
  } else {
    selectedSticker = null;
    drawCanvas();
  }
});

// Handle mouse move for resizing or dragging
canvas.addEventListener("mousemove", (e) => {
  const { offsetX, offsetY } = e;

  if (selectedText) {
    const handle = getHandleUnderMouse(offsetX, offsetY);

    if (handle) {
      // Change cursor to a pointer when over a handle
      canvas.style.cursor = "nesw-resize";
    } else {
      // Change cursor back to default when not over a handle
      canvas.style.cursor = "default";
    }
  } else {
    canvas.style.cursor = "default";
  }

  if (selectedSticker) {
    const handle = getStickerHandleUnderMouse(
      offsetX,
      offsetY,
      selectedSticker
    );
    if (handle) {
      canvas.style.cursor = "nwse-resize"; // For diagonal resizing
    } else {
      canvas.style.cursor = "default"; // Default cursor
    }
  }

  if (isResizing && selectedText) {
    const fontSize = parseInt(selectedText.font.match(/\d+/)[0], 10);

    // Resize logic for top or bottom handles
    if (activeHandle.position.includes("top")) {
      const newFontSize = Math.max(
        fontSize - (offsetY - selectedText.y + fontSize + 5),
        10
      );
      selectedText.font = `${newFontSize}px Arial`;
    } else if (activeHandle.position.includes("bottom")) {
      const newFontSize = Math.max(
        fontSize + (offsetY - selectedText.y - 5),
        10
      );
      selectedText.font = `${newFontSize}px Arial`;
    }

    drawCanvas();
  } else if (isDragging && selectedText) {
    // Dragging logic
    selectedText.x = offsetX - dragOffsetX;
    selectedText.y = offsetY - dragOffsetY;
    drawCanvas();
  }

  if (isResizing && selectedSticker) {
    const deltaX = offsetX - selectedSticker.x; // Horizontal distance from left corner
    const deltaY = offsetY - selectedSticker.y; // Vertical distance from top corner

    // Ensure the sticker size doesn't go negative and resize based on the direction of the mouse
    // Increase the sticker size when moving towards bottom-right (positive deltaX and deltaY)
    selectedSticker.width = Math.max(deltaX, 0);
    selectedSticker.height = Math.max(deltaY, 0);

    // Redraw the canvas to reflect the new size
    drawCanvas();
  }

  if (isDragging && selectedSticker) {
    // Update the sticker's position when dragging
    selectedSticker.x = offsetX - dragOffsetX;
    selectedSticker.y = offsetY - dragOffsetY;
    drawCanvas();
  }
});

// Handle mouse up to stop resizing or dragging
canvas.addEventListener("mouseup", () => {
  isDragging = false;
  isResizing = false;
  isRotating = false;
  activeHandle = null;
});

// Touch start event listener for dragging and resizing
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault(); // Prevent default behavior (scrolling, etc.)
  const { clientX, clientY } = e.touches[0]; // Get the touch position

  const offsetX = clientX - canvas.getBoundingClientRect().left;
  const offsetY = clientY - canvas.getBoundingClientRect().top;

  if (selectedText) {
    // Check if rotation handle is clicked
    if (isMouseOverRotationHandle(offsetX, offsetY, selectedText)) {
      isRotating = true;
      return;
    }

    const handle = getHandleUnderMouse(offsetX, offsetY);
    if (handle) {
      isResizing = true;
      activeHandle = handle;
      return;
    }
  }

  if (selectedSticker) {
    const handle = getStickerHandleUnderMouse(
      offsetX,
      offsetY,
      selectedSticker
    );
    if (handle) {
      isResizing = true;
      activeHandle = handle;
      return;
    }
  }

  // Otherwise, check if text is clicked for dragging
  const clickedText = textList.find(
    (text) =>
      offsetX >= text.x &&
      offsetX <= text.x + ctx.measureText(text.content).width &&
      offsetY >= text.y - parseInt(text.font.match(/\d+/)[0]) &&
      offsetY <= text.y
  );

  if (clickedText) {
    selectedText = clickedText;
    dragOffsetX = offsetX - selectedText.x;
    dragOffsetY = offsetY - selectedText.y;

    textControls.style.display = "flex";
    textInput.value = selectedText.content;
    updateFontSizeDisplay();
    isDragging = true;
    drawCanvas();
  } else {
    selectedText = null;
    textControls.style.display = "none";
    drawCanvas();
  }

  // Check if a sticker is clicked
  const clickedSticker = stickerList.find(
    (sticker) =>
      offsetX >= sticker.x &&
      offsetX <= sticker.x + sticker.width &&
      offsetY >= sticker.y &&
      offsetY <= sticker.y + sticker.height
  );

  if (clickedSticker) {
    selectedSticker = clickedSticker;
    dragOffsetX = offsetX - selectedSticker.x;
    dragOffsetY = offsetY - selectedSticker.y;
    isDragging = true;
    drawCanvas();
  } else {
    selectedSticker = null;
    drawCanvas();
  }
});

// Touch move event listener for resizing or dragging
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault(); // Prevent default behavior (scrolling, etc.)
  const { clientX, clientY } = e.touches[0]; // Get the touch position

  const offsetX = clientX - canvas.getBoundingClientRect().left;
  const offsetY = clientY - canvas.getBoundingClientRect().top;

  if (selectedText) {
    const handle = getHandleUnderMouse(offsetX, offsetY);

    if (handle) {
      // Change cursor to a pointer when over a handle
      canvas.style.cursor = "nesw-resize";
    } else {
      // Change cursor back to default when not over a handle
      canvas.style.cursor = "default";
    }
  } else {
    canvas.style.cursor = "default";
  }

  if (selectedSticker) {
    const handle = getStickerHandleUnderMouse(
      offsetX,
      offsetY,
      selectedSticker
    );
    if (handle) {
      canvas.style.cursor = "nwse-resize"; // For diagonal resizing
    } else {
      canvas.style.cursor = "default"; // Default cursor
    }
  }

  if (isResizing && selectedText) {
    const fontSize = parseInt(selectedText.font.match(/\d+/)[0], 10);

    // Resize logic for top or bottom handles
    if (activeHandle.position.includes("top")) {
      const newFontSize = Math.max(
        fontSize - (offsetY - selectedText.y + fontSize + 5),
        10
      );
      selectedText.font = `${newFontSize}px Arial`;
    } else if (activeHandle.position.includes("bottom")) {
      const newFontSize = Math.max(
        fontSize + (offsetY - selectedText.y - 5),
        10
      );
      selectedText.font = `${newFontSize}px Arial`;
    }

    drawCanvas();
  } else if (isDragging && selectedText) {
    // Dragging logic
    selectedText.x = offsetX - dragOffsetX;
    selectedText.y = offsetY - dragOffsetY;
    drawCanvas();
  }

  if (isResizing && selectedSticker) {
    const deltaX = offsetX - selectedSticker.x; // Horizontal distance from left corner
    const deltaY = offsetY - selectedSticker.y; // Vertical distance from top corner

    // Ensure the sticker size doesn't go negative and resize based on the direction of the touch
    selectedSticker.width = Math.max(deltaX, 0);
    selectedSticker.height = Math.max(deltaY, 0);

    // Redraw the canvas to reflect the new size
    drawCanvas();
  }

  if (isDragging && selectedSticker) {
    // Update the sticker's position when dragging
    selectedSticker.x = offsetX - dragOffsetX;
    selectedSticker.y = offsetY - dragOffsetY;
    drawCanvas();
  }
});

// Touch end event listener to stop resizing or dragging
canvas.addEventListener("touchend", () => {
  isDragging = false;
  isResizing = false;
  isRotating = false;
  activeHandle = null;
});

const downloadButton = document.getElementById("download-button");

downloadButton.addEventListener("click", () => {
  // // Convert the canvas content to a data URL (image)
  const dataUrl = canvas.toDataURL("image/png"); // You can change the format (e.g., 'image/jpeg') if needed

  // // Create an anchor link element to trigger the download
  const link = document.createElement("a");
  link.href = dataUrl; // Set the href to the data URL
  link.download = "canvas-image.png"; // Set the filename for the downloaded image

  // // Trigger a click on the link to start the download
  link.click();
});

// Remove sticker from the list and delete the button
function removeSticker(sticker) {
  // Remove the sticker from the list
  stickerList = stickerList.filter((s) => s !== sticker);

  // Remove the delete button from the DOM
  document.body.removeChild(sticker.deleteButton);

  // If the deleted sticker was selected, deselect it
  if (selectedSticker === sticker) {
    selectedSticker = null;
  }

  drawCanvas(); // Redraw canvas to reflect changes
}
