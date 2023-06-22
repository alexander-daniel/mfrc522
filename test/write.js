const Mfrc522 = require("./../index");
const { SPI } = require("spi");

// chip select pin is active LOW
const CS_PIN = 17;
pinMode(CS_PIN, OUTPUT);
digitalWrite(CS_PIN, HIGH);

const spi = new SPI(0);
const mfrc522 = new Mfrc522(spi, CS_PIN);

let hasRun = false;

setInterval(function () {
  //# reset card
  mfrc522.reset();

  if (hasRun) return;

  //# Scan for cards
  let response = mfrc522.findCard();
  if (!response.status) {
    console.log("No Card");
    return;
  }
  console.log("Card detected, CardType: " + response.bitSize);
  hasRun = true;

  //# Get the UID of the card
  response = mfrc522.getUid();
  if (!response.status) {
    console.log("UID Scan Error");
    return;
  }
  //# If we have the UID, continue
  const uid = response.data;
  console.log(
    "Card read UID: %s %s %s %s",
    uid[0].toString(16),
    uid[1].toString(16),
    uid[2].toString(16),
    uid[3].toString(16)
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

  //# Variable for the data to write
  let data = [
    0x01, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff,
  ];

  console.log("Block 8 looked like this:");
  console.log(mfrc522.getDataForBlock(8));

  console.log("Block 8 will be filled with 0xFF:");
  mfrc522.writeDataToBlock(8, data);

  console.log("Now Block 8 looks like this:");
  console.log(mfrc522.getDataForBlock(8));

  data = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00,
  ];

  console.log("Now we fill it with 16 x 0");
  // mfrc522.writeDataToBlock(8, data);

  console.log("It is now empty:");
  console.log(mfrc522.getDataForBlock(8));

  mfrc522.stopCrypto();

  console.log("finished successfully!");
}, 500);
