/* Photo-real try-on models (640 × 1024). Each has a skin mask so ink only lands on skin.
   Areas: quick-placement spots {id,label,x,y,size,rot} in canvas pixels. */
window.REAL_MODELS = {
  male: {
    front: { img: "/assets/img/model-male-front.jpg", mask: "/assets/img/model-male-front-skin.png", areas: [
      { id: "chest", label: "Chest", x: 310, y: 262, size: 180, rot: 0 },
      { id: "pec", label: "Pec", x: 368, y: 262, size: 88, rot: 0 },
      { id: "shoulder", label: "Shoulder", x: 410, y: 216, size: 70, rot: -10 },
      { id: "upper-arm", label: "Upper arm", x: 436, y: 322, size: 66, rot: -5 },
      { id: "forearm", label: "Forearm", x: 448, y: 452, size: 56, rot: -8 },
      { id: "hand", label: "Hand", x: 444, y: 538, size: 34, rot: -6 },
      { id: "ribs", label: "Ribs", x: 382, y: 352, size: 58, rot: -8 },
      { id: "stomach", label: "Stomach", x: 312, y: 372, size: 100, rot: 0 },
      { id: "thigh", label: "Thigh", x: 366, y: 640, size: 84, rot: 0 },
      { id: "shin", label: "Shin", x: 380, y: 820, size: 52, rot: -2 }
    ] },
    back: { img: "/assets/img/model-male-back.jpg", mask: "/assets/img/model-male-back-skin.png", areas: [
      { id: "upper-back", label: "Upper back", x: 324, y: 246, size: 200, rot: 0 },
      { id: "full-back", label: "Full back", x: 324, y: 300, size: 230, rot: 0 },
      { id: "shoulder-blade", label: "Shoulder blade", x: 262, y: 262, size: 88, rot: 0 },
      { id: "spine", label: "Spine", x: 324, y: 330, size: 80, rot: 0 },
      { id: "lower-back", label: "Lower back", x: 324, y: 392, size: 130, rot: 0 },
      { id: "neck", label: "Back of neck", x: 324, y: 150, size: 40, rot: 0 },
      { id: "back-arm", label: "Back of arm", x: 444, y: 322, size: 62, rot: -5 },
      { id: "back-forearm", label: "Back forearm", x: 460, y: 452, size: 52, rot: -8 },
      { id: "back-thigh", label: "Back of thigh", x: 272, y: 640, size: 82, rot: 0 },
      { id: "calf", label: "Calf", x: 254, y: 790, size: 58, rot: 2 }
    ] }
  },
  female: {
    front: { img: "/assets/img/model-female-front.jpg", mask: "/assets/img/model-female-front-skin.png", areas: [
      { id: "chest", label: "Chest / sternum", x: 310, y: 222, size: 72, rot: 0 },
      { id: "collarbone", label: "Collarbone", x: 352, y: 222, size: 54, rot: -12 },
      { id: "shoulder", label: "Shoulder", x: 394, y: 258, size: 48, rot: -8 },
      { id: "upper-arm", label: "Upper arm", x: 404, y: 350, size: 48, rot: -4 },
      { id: "forearm", label: "Forearm", x: 414, y: 470, size: 42, rot: -6 },
      { id: "hand", label: "Hand", x: 420, y: 556, size: 26, rot: -4 },
      { id: "ribs", label: "Ribs", x: 360, y: 392, size: 44, rot: -10 },
      { id: "stomach", label: "Stomach", x: 310, y: 410, size: 68, rot: 0 },
      { id: "hip-thigh", label: "Hip / thigh", x: 360, y: 586, size: 80, rot: 0 },
      { id: "shin", label: "Shin", x: 364, y: 800, size: 42, rot: -2 }
    ] },
    back: { img: "/assets/img/model-female-back.jpg", mask: "/assets/img/model-female-back-skin.png", areas: [
      { id: "upper-back", label: "Upper back", x: 320, y: 262, size: 100, rot: 0 },
      { id: "shoulder-blade", label: "Shoulder blade", x: 268, y: 270, size: 50, rot: 0 },
      { id: "spine", label: "Spine", x: 320, y: 390, size: 56, rot: 0 },
      { id: "lower-back", label: "Lower back", x: 320, y: 410, size: 90, rot: 0 },
      { id: "neck", label: "Back of neck", x: 320, y: 186, size: 28, rot: 0 },
      { id: "back-arm", label: "Back of arm", x: 410, y: 332, size: 42, rot: -4 },
      { id: "back-forearm", label: "Back forearm", x: 424, y: 452, size: 36, rot: -6 },
      { id: "back-thigh", label: "Back of thigh", x: 280, y: 600, size: 68, rot: 0 },
      { id: "calf", label: "Calf", x: 266, y: 780, size: 48, rot: 2 }
    ] }
  }
};
