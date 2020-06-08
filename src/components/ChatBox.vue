<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <header>
      <div style="height: 60px; background: lightgrey">
        <img :src="currentPeerUser.URL" width="40px" class="br-50 header-image" />
        <div class="header-image">
          <h6 class="mt-2">{{currentPeerUser.name}}</h6>
        </div>
      </div>
    </header>
    <div style="background: royalblue; flex: 1">
      <h2 style="color: black">Welcome to Chatbox</h2>
      <span>{{currentPeerUser}}</span>
    </div>
    <div v-show="showSticker">
      <img src="../assets/happy.jpeg" width="70px" v-on:click="sendMessage('happy', 2)" />
      <img src="../assets/funny.gif" width="70px" v-on:click="sendMessage('funny', 2)" />
      <img src="../assets/angry.jpeg" width="70px" v-on:click="sendMessage('angry', 2)" />
      <img src="../assets/silence.jpeg" width="70px" v-on:click="sendMessage('silence', 2)" />
      <img src="../assets/brokenteeth.jpeg" width="70px" v-on:click="sendMessage('brokenteeth', 2)" />
      <img src="../assets/sorry.jpeg" width="70px" v-on:click="sendMessage('sorry', 2)" />
      <img src="../assets/tea.jpeg" width="70px" v-on:click="sendMessage('tea', 2)" />
    </div>
    <footer>
      <div style="min-height: 60px; background: lightgrey">
        <div style="display: flex; padding: 15px">
          <img
            class="mr-3"
            src="../assets/picture.png"
            alt="select picture"
            width="30px"
            height="30px"
            v-on:click="choosePhoto"
          />
          <img
            class="mr-3"
            src="../assets/sticker.png"
            alt="select sticker"
            width="30px"
            height="30px"
            v-on:click="openStickersList"
          />
          <input
            type="text"
            style="width: 85%; border: 1px solid transparent; border-radius: 4px"
            class="mr-3"
            v-model="inputValue"
            v-on:keyup.enter="sendMessage(inputValue, 0)"
          />
          <img
            class="mr-2"
            src="../assets/send.png"
            alt="select sticker"
            width="30px"
            height="30px"
            v-on:click="sendMessage(inputValue, 0)"
          />
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
/* eslint-disable */
import firebase from "../services/firebase";
import moment from "moment";

export default {
  app: "ChatBox",
  props: ["currentPeerUser"],
  data() {
    return {
      showSticker: false,
      currentUserName: localStorage.getItem("name"),
      currentUserId: localStorage.getItem("id"),
      currentUserPhoto: localStorage.getItem("photoURL"),
      currentUserDocumentId: localStorage.getItem("FirebaseDocumentId"),
      inputValue: "",
      groupChatId: null,
      currentPeerUserMessages: [],
      removeListener: null,
      currentPhotoFile: null,
      listMessage: []
    };
  },
  methods: {
    sendMessage(content, type) {
      let notificationMessages = [];
      if (this.showSticker && type === 2) {
        this.showSticker = false;
      }
      if (content.trim() === "") {
        return;
      }
      const timestamp = moment()
        .valueOf()
        .toString();
      const itemMessage = {
        idFrom: this.currentUserId,
        idTo: this.currentPeerUser.id,
        timestamp: timestamp,
        content: content.trim(),
        type: type
      };
      firebase
        .firestore()
        .collection("Messages")
        .doc(this.groupChatId)
        .collection(this.groupChatId)
        .doc(timestamp)
        .set(itemMessage)
        .then(() => {
          this.inputValue = "";
        });
      this.currentPeerUserMessages.map(el => {
        console.log("el", el);
        if (el.notificationId != this.currentUserId) {
          notificationMessages.push({
            notificationId: el.notificationId,
            number: el.number
          });
        }
      });
      firebase
        .firestore()
        .collection("users")
        .doc(this.currentPeerUser.documentKey)
        .update({
          messages: notificationMessages
        })
        .then(data => {})
        .catch(err => console.log("update error", err));
    },
    choosePhoto() {},
    openStickersList() {
      this.showSticker = !this.showSticker;
    },
    scrollToBottom() {
      if (this.messageEnd) {
        this.messageEnd.scrollIntoView({});
      }
    },
    getListHistory() {
      this.listMessage.length = 0;
      if (
        this.hashString(this.currentUserId) <
        this.hashString(this.currentPeerUser.id)
      ) {
        this.groupChatId = `${this.currentUserId} + ${this.currentPeerUser.id}`;
      } else {
        this.groupChatId = `${this.currentPeerUser.id} + ${this.currentUserId}`;
      }
      (this.removeListener = firebase
        .firestore()
        .collection("Messages")
        .doc(this.groupChatId)
        .collection(this.groupChatId)
        .onSnapshot(Snapshot => {
          Snapshot.docChanges().forEach(change => {
            if (change.type === "added") {
              this.listMessage.push(change.doc.data());
            }
          });
        })),
        err => {
          console.log("list history error", err);
        };
    },
    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
        hash = hash & hash; //convert to 32 bit integer
      }
      return hash;
    }
  },
  created() {
    firebase
      .firestore()
      .collection("users")
      .doc(this.currentPeerUser.documentKey)
      .get()
      .then(docRef => {
        console.log("res", docRef.data());
        this.currentPeerUserMessages = docRef.data().messages;
      });
  },
  mounted() {
    this.getListHistory();
  },
  updated() {
    this.scrollToBottom();
  }
};
</script>

<style scoped>
.br-50 {
  border-radius: 50%;
}
.header-image {
  float: left;
  margin-left: 10px;
  margin-top: 10px;
}
</style>