<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <header>
      <div style="height: 60px; background: lightgrey">
        <img :src="currentPeerUser.URL" width="40px" class="br-50 header-image" />
        <div class="header-image">
          <h6 class="mt-2" style="font-weight: 600">{{currentPeerUser.name}}</h6>
        </div>
      </div>
    </header>
    <div style="background: #efe9e2; flex: 1; overflow-y: auto">
      <h2 class="welcome">Welcome to Chatbox</h2>
      <div class="text-outer">
        <div
          :class="item.idFrom === currentUserId ? 'textFrom' : 'textTo'"
          class="text-inner"
          v-for="item in listMessage"
          :key="item.id"
        >
          <h6>{{item.content}}</h6>
        </div>
      </div>
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
            style="width: 85%; border: 1px solid transparent; border-radius: 4px;
            padding: 5px 10px;
            "
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
      listMessage: [],
      viewMessages: []
    };
  },
  watch: {
    currentPeerUser: function(newVal, oldVal) {
      console.log("prop changed", newVal.id, oldVal.id);
      if (newVal !== oldVal) {
        this.getListHistory();
      }
    }
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
        id: timestamp,
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
      // firebase
      //   .firestore()
      //   .collection("users")
      //   .doc(this.currentPeerUser.documentKey)
      //   .update({
      //     messages: notificationMessages
      //   })
      //   .then(data => {})
      //   .catch(err => console.log("update error", err));
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
      console.log("call", this.currentPeerUser.id);
      this.listMessage = [];

      let groupChatId = `${this.currentPeerUser.id} + ${this.currentUserId}`;
      firebase
        .firestore()
        .collection("Messages")
        .doc(groupChatId)
        .collection(groupChatId)
        .onSnapshot(Snapshot => {
          if (Snapshot.docChanges().length > 0) {
            console.log("call 2", groupChatId);
            this.groupChatId = groupChatId;
            Snapshot.docChanges().forEach(change => {
              this.listMessage.push(change.doc.data());
            });
          } else {
            console.log("call 1", this.groupChatId);
            this.groupChatId = `${this.currentUserId} + ${this.currentPeerUser.id}`;
            this.removeListener = firebase
              .firestore()
              .collection("Messages")
              .doc(this.groupChatId)
              .collection(this.groupChatId)
              .onSnapshot(Snapshot => {
                Snapshot.docChanges().forEach(change => {
                  console.log("change", change.doc.data());
                  if (change.type === "added") {
                    this.listMessage.push(change.doc.data());
                  }
                });
              });
          }
        });
    }
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
.welcome {
  color: #635a5a;
  font-weight: 600;
  margin: 10px 0px 32px;
}
.br-50 {
  border-radius: 50%;
}
.header-image {
  float: left;
  margin-left: 10px;
  margin-top: 10px;
}
.text-outer {
  display: flex;
  flex-direction: column;
}
.text-inner {
  padding: 10px 10px 2px;
  border-radius: 0.5rem;
  width: 20%;
}
.textFrom {
  background: teal;
  color: white;
  margin: 0% 0% 20px 70%;
}
.textTo {
  background: lightcoral;
  color: black;
  margin: 0% 0% 20px 5%;
}
</style>