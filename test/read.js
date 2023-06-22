const Mfrc522 = require("./../index");
const { SPI } = require("spi");

// chip select pin is active LOW
const CS_PIN = 17;
pinMode(CS_PIN, OUTPUT);
digitalWrite(CS_PIN, HIGH);

const spi = new SPI(0);
const mfrc522 = new Mfrc522(spi, CS_PIN);

setInterval(function () {
  //# reset device
  mfrc522.reset();

  //# Scan for cards
  let response = mfrc522.findCard();

  // none found
  if (!response.status) {
    console.log("No Card");
    return;
  }

  console.log(`Card detected, CardType: ${response.bitSize}`);

  //# Get the UID of the card
  response = mfrc522.getUid();
  if (!response.status) {
    console.log("UID Scan Error");
    return;
  }

  //# If we have the UID, continue
  const uid = response.data;
  const [a, b, c, d] = uid;

  console.log(
    `Card read UID: 
    ${a.toString(16)} ${b.toString(16)} ${c.toString(16)} ${d.toString(16)}`
  );

  //# Select the scanned card
  const memoryCapacity = mfrc522.selectCard(uid);
  console.log("Card Memory Capacity: " + memoryCapacity);

  //# This is the default key for authentication
  const key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];

  //# Authenticate on Block 8 with key and uid
  if (!mfrc522.authenticate(8, key, uid)) {
    console.log("Authentication Error");
    return;
  }

  //# Dump Block 8
  console.log("Block: 8 Data: " + mfrc522.getDataForBlock(8));

  //# Stop
  mfrc522.stopCrypto();
}, 500);
