const Mfrc522 = require("./../index");
const { SPI } = require("spi");

// chip select pin is active LOW
const CS_PIN = 17;
pinMode(CS_PIN, OUTPUT);
digitalWrite(CS_PIN, HIGH);

const spi = new SPI(0);
const mfrc522 = new Mfrc522(spi, CS_PIN);

setInterval(function () {
  //# reset card
  mfrc522.reset();

  //# Scan for cards
  let response = mfrc522.findCard();
  if (!response.status) {
    return;
  }
  console.log("Card detected, CardType: " + response.bitSize);

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
  const keyA = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
  const keyB = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

  //# dump 64 bit fifo buffer
  for (let i = 0; i < 64; i++) {
    if (mfrc522.authenticate(i, keyA, uid)) {
      console.log("Block: " + i + " Data: " + mfrc522.getDataForBlock(i));
    } else {
      console.log("Authentication Error");
      break;
    }
  }

  //# Stop
  mfrc522.stopCrypto();
}, 500);
